alter table public.cafes
  add column tagline text,
  add column address text,
  add column hours text,
  add column external_label text,
  add column square_location_id text,
  add column square_tax_ids text[] not null default '{}';

alter table public.customers
  add column auth_user_id uuid references auth.users(id) on delete set null;

alter table public.customers
  add constraint customers_cafe_auth_user_unique
  unique (cafe_id, auth_user_id);

alter table public.orders
  add column subtotal_cents int not null default 0 check (subtotal_cents >= 0),
  add column tax_cents int not null default 0 check (tax_cents >= 0),
  add column tip_cents int not null default 0 check (tip_cents >= 0),
  add column payment_status text not null default 'pending'
    check (payment_status in ('pending', 'paid', 'failed', 'refunded')),
  add column square_order_id text,
  add column square_payment_id text,
  add column idempotency_key text not null default gen_random_uuid()::text,
  add column loyalty_awarded_at timestamptz;

create unique index orders_idempotency_key_idx on public.orders(idempotency_key);
create unique index orders_square_payment_id_idx
  on public.orders(square_payment_id)
  where square_payment_id is not null;

create table public.payment_events (
  id text primary key,
  event_type text not null,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.payment_events enable row level security;
grant all on public.payment_events to service_role;

drop policy if exists "public creates customers" on public.customers;
drop policy if exists "public creates orders" on public.orders;
drop policy if exists "public creates order items" on public.order_items;
drop policy if exists "public creates loyalty accounts" on public.loyalty_accounts;
revoke insert on public.customers, public.orders, public.order_items,
  public.loyalty_accounts from anon, authenticated;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles(id, email, phone, display_name)
  values (
    new.id,
    new.email,
    new.phone,
    coalesce(new.raw_user_meta_data ->> 'display_name', new.phone, new.email)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke all on function private.handle_new_user() from public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

insert into public.profiles(id, email, phone, display_name)
select id, email, phone, coalesce(raw_user_meta_data ->> 'display_name', phone, email)
from auth.users
on conflict (id) do nothing;

create or replace function public.create_pending_order(
  p_cafe_id uuid,
  p_items jsonb,
  p_customer_name text,
  p_customer_phone text,
  p_order_type text,
  p_table_number text,
  p_notes text,
  p_tip_cents int,
  p_idempotency_key text,
  p_auth_user_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  created_order public.orders;
  customer_uuid uuid;
  requested_count int;
  matched_count int;
  subtotal int;
begin
  if p_order_type not in ('pickup', 'table')
    or (p_order_type = 'table' and nullif(trim(p_table_number), '') is null)
    or p_tip_cents < 0 then
    raise exception 'Invalid order details';
  end if;

  select count(*) into requested_count from jsonb_array_elements(p_items);
  if requested_count = 0 then raise exception 'Order is empty'; end if;

  select count(*), coalesce(sum(mi.price_cents * requested.quantity), 0)
    into matched_count, subtotal
  from jsonb_to_recordset(p_items) as requested(menu_item_id uuid, quantity int)
  join public.menu_items mi
    on mi.id = requested.menu_item_id
   and mi.cafe_id = p_cafe_id
   and mi.is_active
  where requested.quantity > 0 and requested.quantity <= 50;

  if matched_count <> requested_count then
    raise exception 'Order contains invalid menu items';
  end if;
  if p_tip_cents > subtotal then raise exception 'Tip is too large'; end if;

  if nullif(trim(p_customer_phone), '') is not null then
    select id into customer_uuid
    from public.customers
    where cafe_id = p_cafe_id
      and (
        (p_auth_user_id is not null and auth_user_id = p_auth_user_id)
        or phone = trim(p_customer_phone)
      )
    limit 1;

    if customer_uuid is null then
      insert into public.customers(cafe_id, auth_user_id, phone, name)
      values (
        p_cafe_id,
        p_auth_user_id,
        trim(p_customer_phone),
        nullif(trim(p_customer_name), '')
      )
      returning id into customer_uuid;
    elsif p_auth_user_id is not null then
      update public.customers
      set auth_user_id = coalesce(auth_user_id, p_auth_user_id),
          name = coalesce(nullif(trim(p_customer_name), ''), name)
      where id = customer_uuid;
    end if;
  end if;

  insert into public.orders(
    cafe_id, customer_id, customer_name, customer_phone, status, order_type,
    table_number, notes, subtotal_cents, tip_cents, total_cents,
    payment_status, idempotency_key
  )
  values (
    p_cafe_id, customer_uuid, nullif(trim(p_customer_name), ''),
    nullif(trim(p_customer_phone), ''), 'new', p_order_type,
    case when p_order_type = 'table' then trim(p_table_number) end,
    nullif(trim(p_notes), ''), subtotal, p_tip_cents, subtotal + p_tip_cents,
    'pending', p_idempotency_key
  )
  on conflict (idempotency_key) do update
    set idempotency_key = excluded.idempotency_key
  returning * into created_order;

  if not exists (
    select 1 from public.order_items where order_id = created_order.id
  ) then
    insert into public.order_items(
      order_id, menu_item_id, name_snapshot, quantity, unit_price_cents
    )
    select created_order.id, mi.id, mi.name, requested.quantity, mi.price_cents
    from jsonb_to_recordset(p_items) as requested(menu_item_id uuid, quantity int)
    join public.menu_items mi on mi.id = requested.menu_item_id;
  end if;

  return jsonb_build_object(
    'id', created_order.id,
    'subtotal_cents', created_order.subtotal_cents,
    'tip_cents', created_order.tip_cents
  );
end;
$$;

revoke all on function public.create_pending_order(
  uuid, jsonb, text, text, text, text, text, int, text, uuid
) from public, anon, authenticated;
grant execute on function public.create_pending_order(
  uuid, jsonb, text, text, text, text, text, int, text, uuid
) to service_role;

create or replace function public.apply_paid_order(
  p_order_id uuid,
  p_square_order_id text,
  p_square_payment_id text,
  p_total_cents int,
  p_tax_cents int
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_order public.orders;
  loyalty_uuid uuid;
  award_loyalty boolean;
begin
  select * into target_order
  from public.orders
  where id = p_order_id
  for update;

  if target_order.id is null then raise exception 'Order not found'; end if;
  award_loyalty :=
    target_order.customer_id is not null
    and target_order.loyalty_awarded_at is null
    and exists (
      select 1 from public.customers
      where id = target_order.customer_id
        and auth_user_id is not null
    );

  update public.orders
  set payment_status = 'paid',
      square_order_id = p_square_order_id,
      square_payment_id = p_square_payment_id,
      tax_cents = greatest(p_tax_cents, 0),
      total_cents = greatest(p_total_cents, subtotal_cents + tip_cents),
      loyalty_awarded_at = case
        when award_loyalty then now()
        else loyalty_awarded_at
      end
  where id = p_order_id
  returning * into target_order;

  if award_loyalty then
    insert into public.loyalty_accounts(cafe_id, customer_id, points, visits)
    values (target_order.cafe_id, target_order.customer_id, 10, 1)
    on conflict (cafe_id, customer_id) do update
      set points = public.loyalty_accounts.points + 10,
          visits = public.loyalty_accounts.visits + 1
    returning id into loyalty_uuid;

    insert into public.loyalty_transactions(account_id, type, points, reason)
    values (loyalty_uuid, 'earn', 10, 'Paid BrewLoop order ' || target_order.id);

  end if;
end;
$$;

revoke all on function public.apply_paid_order(uuid, text, text, int, int)
  from public, anon, authenticated;
grant execute on function public.apply_paid_order(uuid, text, text, int, int)
  to service_role;

create policy "customers read own record"
on public.customers for select
to authenticated
using (auth_user_id = (select auth.uid()));

create policy "customers read own loyalty"
on public.loyalty_accounts for select
to authenticated
using (
  exists (
    select 1 from public.customers
    where customers.id = customer_id
      and customers.auth_user_id = (select auth.uid())
  )
);
