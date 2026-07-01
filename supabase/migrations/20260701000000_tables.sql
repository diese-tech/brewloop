create table public.tables (
  id uuid primary key default gen_random_uuid(),
  cafe_id uuid not null references public.cafes(id) on delete cascade,
  label text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create unique index tables_cafe_label_idx on public.tables (cafe_id, lower(label));
create index tables_cafe_id_idx on public.tables (cafe_id);

alter table public.tables enable row level security;

create policy "staff read tables"
on public.tables for select
to authenticated
using ((select private.is_cafe_member(cafe_id)));

create policy "owners and managers manage tables"
on public.tables for all
to authenticated
using ((select private.has_cafe_role(cafe_id, array['owner', 'manager'])))
with check ((select private.has_cafe_role(cafe_id, array['owner', 'manager'])));

grant select, insert, update, delete on public.tables to authenticated;
