create extension if not exists "pgcrypto";

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to anon, authenticated;

create table public.cafes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  logo_url text,
  primary_color text,
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  phone text,
  display_name text,
  created_at timestamptz not null default now()
);

create table public.cafe_users (
  id uuid primary key default gen_random_uuid(),
  cafe_id uuid not null references public.cafes(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('owner', 'manager', 'barista')),
  created_at timestamptz not null default now(),
  unique (cafe_id, user_id)
);

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  cafe_id uuid not null references public.cafes(id) on delete cascade,
  email text,
  phone text,
  name text,
  created_at timestamptz not null default now(),
  check (email is not null or phone is not null)
);

create table public.menu_categories (
  id uuid primary key default gen_random_uuid(),
  cafe_id uuid not null references public.cafes(id) on delete cascade,
  name text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.menu_items (
  id uuid primary key default gen_random_uuid(),
  cafe_id uuid not null references public.cafes(id) on delete cascade,
  category_id uuid references public.menu_categories(id) on delete set null,
  name text not null,
  description text,
  price_cents int not null default 0 check (price_cents >= 0),
  is_active boolean not null default true,
  image_url text,
  created_at timestamptz not null default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  cafe_id uuid not null references public.cafes(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  status text not null default 'new'
    check (status in ('new', 'making', 'ready', 'completed', 'cancelled')),
  order_type text not null check (order_type in ('pickup', 'table')),
  table_number text,
  customer_name text,
  customer_phone text,
  notes text,
  total_cents int not null default 0 check (total_cents >= 0),
  created_at timestamptz not null default now(),
  check (order_type = 'pickup' or table_number is not null)
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  menu_item_id uuid references public.menu_items(id) on delete set null,
  name_snapshot text not null,
  quantity int not null default 1 check (quantity > 0),
  unit_price_cents int not null default 0 check (unit_price_cents >= 0),
  created_at timestamptz not null default now()
);

create table public.loyalty_accounts (
  id uuid primary key default gen_random_uuid(),
  cafe_id uuid not null references public.cafes(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  points int not null default 0 check (points >= 0),
  visits int not null default 0 check (visits >= 0),
  created_at timestamptz not null default now(),
  unique (cafe_id, customer_id)
);

create table public.loyalty_transactions (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.loyalty_accounts(id) on delete cascade,
  type text not null check (type in ('earn', 'redeem', 'adjust')),
  points int not null,
  reason text,
  created_at timestamptz not null default now()
);

create table public.promotions (
  id uuid primary key default gen_random_uuid(),
  cafe_id uuid not null references public.cafes(id) on delete cascade,
  title text not null,
  message text not null,
  active boolean not null default false,
  created_at timestamptz not null default now()
);

create index cafe_users_user_id_idx on public.cafe_users(user_id);
create index customers_cafe_id_idx on public.customers(cafe_id);
create index menu_categories_cafe_id_idx on public.menu_categories(cafe_id);
create index menu_items_cafe_id_idx on public.menu_items(cafe_id);
create index menu_items_category_id_idx on public.menu_items(category_id);
create index orders_cafe_status_idx on public.orders(cafe_id, status);
create index orders_customer_id_idx on public.orders(customer_id);
create index order_items_order_id_idx on public.order_items(order_id);
create index order_items_menu_item_id_idx on public.order_items(menu_item_id);
create index loyalty_accounts_cafe_id_idx on public.loyalty_accounts(cafe_id);
create index loyalty_accounts_customer_id_idx on public.loyalty_accounts(customer_id);
create index loyalty_transactions_account_id_idx on public.loyalty_transactions(account_id);
create index promotions_cafe_id_idx on public.promotions(cafe_id);

create or replace function private.is_cafe_member(target_cafe_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.cafe_users
    where cafe_id = target_cafe_id
      and user_id = (select auth.uid())
  );
$$;

create or replace function private.has_cafe_role(
  target_cafe_id uuid,
  allowed_roles text[]
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.cafe_users
    where cafe_id = target_cafe_id
      and user_id = (select auth.uid())
      and role = any(allowed_roles)
  );
$$;

create or replace function private.order_exists(target_order_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.orders
    where id = target_order_id
  );
$$;

create or replace function private.customer_belongs_to_cafe(
  target_customer_id uuid,
  target_cafe_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.customers
    where id = target_customer_id
      and cafe_id = target_cafe_id
  );
$$;

revoke all on function private.is_cafe_member(uuid) from public;
revoke all on function private.has_cafe_role(uuid, text[]) from public;
revoke all on function private.order_exists(uuid) from public;
revoke all on function private.customer_belongs_to_cafe(uuid, uuid) from public;
grant execute on function private.is_cafe_member(uuid) to authenticated;
grant execute on function private.has_cafe_role(uuid, text[]) to anon, authenticated;
grant execute on function private.order_exists(uuid) to anon, authenticated;
grant execute on function private.customer_belongs_to_cafe(uuid, uuid) to anon, authenticated;

alter table public.cafes enable row level security;
alter table public.profiles enable row level security;
alter table public.cafe_users enable row level security;
alter table public.customers enable row level security;
alter table public.menu_categories enable row level security;
alter table public.menu_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.loyalty_accounts enable row level security;
alter table public.loyalty_transactions enable row level security;
alter table public.promotions enable row level security;

create policy "cafes are publicly readable"
on public.cafes for select
to anon, authenticated
using (true);

create policy "owners update cafe settings"
on public.cafes for update
to authenticated
using ((select private.has_cafe_role(id, array['owner'])))
with check ((select private.has_cafe_role(id, array['owner'])));

create policy "users read own profile"
on public.profiles for select
to authenticated
using (id = (select auth.uid()));

create policy "users update own profile"
on public.profiles for update
to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

create policy "members read cafe memberships"
on public.cafe_users for select
to authenticated
using (user_id = (select auth.uid()));

create policy "owners manage cafe memberships"
on public.cafe_users for all
to authenticated
using ((select private.has_cafe_role(cafe_id, array['owner'])))
with check ((select private.has_cafe_role(cafe_id, array['owner'])));

create policy "public creates customers"
on public.customers for insert
to anon, authenticated
with check (
  exists (select 1 from public.cafes where id = cafe_id)
);

create policy "staff reads customers"
on public.customers for select
to authenticated
using ((select private.is_cafe_member(cafe_id)));

create policy "public reads menu categories"
on public.menu_categories for select
to anon, authenticated
using (true);

create policy "owners and managers manage categories"
on public.menu_categories for all
to authenticated
using ((select private.has_cafe_role(cafe_id, array['owner', 'manager'])))
with check ((select private.has_cafe_role(cafe_id, array['owner', 'manager'])));

create policy "public reads active menu items"
on public.menu_items for select
to anon, authenticated
using (
  is_active or (select private.has_cafe_role(cafe_id, array['owner', 'manager']))
);

create policy "owners and managers manage items"
on public.menu_items for all
to authenticated
using ((select private.has_cafe_role(cafe_id, array['owner', 'manager'])))
with check ((select private.has_cafe_role(cafe_id, array['owner', 'manager'])));

create policy "public creates orders"
on public.orders for insert
to anon, authenticated
with check (
  status = 'new'
  and exists (select 1 from public.cafes where id = cafe_id)
);

create policy "staff reads orders"
on public.orders for select
to authenticated
using ((select private.is_cafe_member(cafe_id)));

create policy "staff updates orders"
on public.orders for update
to authenticated
using ((select private.is_cafe_member(cafe_id)))
with check ((select private.is_cafe_member(cafe_id)));

create policy "public creates order items"
on public.order_items for insert
to anon, authenticated
with check ((select private.order_exists(order_id)));

create policy "staff reads order items"
on public.order_items for select
to authenticated
using (
  exists (
    select 1 from public.orders
    where orders.id = order_id
      and (select private.is_cafe_member(orders.cafe_id))
  )
);

create policy "public creates loyalty accounts"
on public.loyalty_accounts for insert
to anon, authenticated
with check ((select private.customer_belongs_to_cafe(customer_id, cafe_id)));

create policy "staff reads loyalty accounts"
on public.loyalty_accounts for select
to authenticated
using ((select private.is_cafe_member(cafe_id)));

create policy "staff manages loyalty accounts"
on public.loyalty_accounts for update
to authenticated
using ((select private.is_cafe_member(cafe_id)))
with check ((select private.is_cafe_member(cafe_id)));

create policy "staff reads loyalty transactions"
on public.loyalty_transactions for select
to authenticated
using (
  exists (
    select 1 from public.loyalty_accounts
    where loyalty_accounts.id = account_id
      and (select private.is_cafe_member(loyalty_accounts.cafe_id))
  )
);

create policy "staff creates loyalty transactions"
on public.loyalty_transactions for insert
to authenticated
with check (
  exists (
    select 1 from public.loyalty_accounts
    where loyalty_accounts.id = account_id
      and (select private.is_cafe_member(loyalty_accounts.cafe_id))
  )
);

create policy "public reads active promotions"
on public.promotions for select
to anon, authenticated
using (active);

create policy "owners and managers manage promotions"
on public.promotions for all
to authenticated
using ((select private.has_cafe_role(cafe_id, array['owner', 'manager'])))
with check ((select private.has_cafe_role(cafe_id, array['owner', 'manager'])));

grant select on public.cafes, public.menu_categories, public.menu_items, public.promotions
to anon;
grant insert on public.customers, public.orders, public.order_items, public.loyalty_accounts
to anon;

grant select, update on public.cafes, public.profiles
to authenticated;
grant select, insert, update, delete on
  public.cafe_users,
  public.menu_categories,
  public.menu_items,
  public.promotions
to authenticated;
grant select, insert on public.customers, public.order_items, public.loyalty_transactions
to authenticated;
grant select, insert, update on public.orders, public.loyalty_accounts
to authenticated;

grant all on
  public.cafes,
  public.profiles,
  public.cafe_users,
  public.customers,
  public.menu_categories,
  public.menu_items,
  public.orders,
  public.order_items,
  public.loyalty_accounts,
  public.loyalty_transactions,
  public.promotions
to service_role;

alter publication supabase_realtime add table public.orders;
