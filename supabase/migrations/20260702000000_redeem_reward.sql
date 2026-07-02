-- Atomic reward redemption: spend one full punch card and record the redeem
-- transaction in one database transaction, so a transient failure can never
-- deduct visits without leaving the audit row (or vice versa). The row lock
-- also prevents two concurrent redemptions from spending the same card.

create or replace function public.redeem_loyalty_reward(p_account_id uuid)
returns table (new_visits int, new_points int)
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_account public.loyalty_accounts;
  visit_threshold constant int := 10;
  points_per_visit constant int := 10;
  updated_visits int;
  updated_points int;
begin
  select * into target_account
  from public.loyalty_accounts
  where id = p_account_id
  for update;

  if target_account.id is null then
    raise exception 'Loyalty account not found';
  end if;

  if not (select private.has_cafe_role(target_account.cafe_id, array['owner', 'manager'])) then
    raise exception 'Only an owner or manager can redeem rewards';
  end if;

  if target_account.visits < visit_threshold then
    raise exception 'Not enough visits to redeem a reward';
  end if;

  updated_visits := target_account.visits - visit_threshold;
  updated_points := greatest(0, target_account.points - visit_threshold * points_per_visit);

  update public.loyalty_accounts
  set visits = updated_visits,
      points = updated_points
  where id = p_account_id;

  insert into public.loyalty_transactions(account_id, type, points, reason)
  values (
    p_account_id,
    'redeem',
    updated_points - target_account.points,
    'Reward redeemed: free drink'
  );

  return query select updated_visits, updated_points;
end;
$$;

revoke all on function public.redeem_loyalty_reward(uuid) from public, anon;
grant execute on function public.redeem_loyalty_reward(uuid)
  to authenticated, service_role;
