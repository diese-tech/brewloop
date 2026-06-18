insert into public.cafes (id, name, slug, primary_color)
values (
  '00000000-0000-0000-0000-000000000001',
  'Demo Coffee',
  'demo-coffee',
  '#6f4e37'
)
on conflict (id) do nothing;

insert into public.menu_categories (id, cafe_id, name, sort_order)
values
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Coffee', 1),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Tea', 2),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Pastries', 3)
on conflict (id) do nothing;

insert into public.menu_items (
  id,
  cafe_id,
  category_id,
  name,
  description,
  price_cents
)
values
  ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Latte', 'Double espresso with silky steamed milk.', 550),
  ('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Cold Brew', 'Slow-steeped for a smooth chocolate finish.', 475),
  ('20000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'Matcha Latte', 'Ceremonial matcha whisked with milk.', 575),
  ('20000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 'Croissant', 'Flaky, buttery, and baked fresh each morning.', 395),
  ('20000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 'Blueberry Muffin', 'Tender crumb with lemon and blueberries.', 425)
on conflict (id) do nothing;
