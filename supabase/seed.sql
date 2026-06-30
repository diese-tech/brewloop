insert into public.cafes (
  id, name, slug, primary_color, tagline, address, hours, external_label
)
values (
  '00000000-0000-0000-0000-000000000001',
  'The Black Rabbit Bookbar',
  'black-rabbit',
  '#7a1b2b',
  'Books, brews & a little bit of magic.',
  'Clermont, Florida',
  'Open today · 7am–10pm',
  'Browse book club nights'
)
on conflict (id) do update set
  name = excluded.name,
  slug = excluded.slug,
  primary_color = excluded.primary_color,
  tagline = excluded.tagline,
  address = excluded.address,
  hours = excluded.hours,
  external_label = excluded.external_label;

insert into public.menu_categories (id, cafe_id, name, sort_order)
values
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Signature Potions', 1),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Books & Bites', 2)
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
  ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Be My Frankenstein', 'Espresso · bruised plum · oat', 650),
  ('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Ghost Malone', 'White mocha · vanilla · ghost-pepper dust', 600),
  ('20000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'The Plague', 'Charcoal cold brew · black honey · citrus', 625),
  ('20000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Count Chocula', 'Dark mocha · hazelnut · malted cream', 575),
  ('20000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Frankenberry', 'Strawberry matcha · vanilla cold foam', 625),
  ('20000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'Familiar''s Biscuit', 'Rosemary biscuit · blackberry preserves', 725)
on conflict (id) do nothing;
