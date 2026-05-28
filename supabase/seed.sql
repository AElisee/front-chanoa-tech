-- ============================================================
-- Chanoa Tech — Seed Data
-- ============================================================

-- Categories
insert into categories (name, slug, description, sort_order) values
  ('Smartphones',        'smartphones',         'Téléphones mobiles et accessoires',            1),
  ('Ordinateurs portables', 'ordinateurs-portables', 'Laptops et ultrabooks professionnels',   2),
  ('Casques & Écouteurs','casques-ecouteurs',   'Audio et écoute professionnelle',              3),
  ('Tablettes',          'tablettes',           'Tablettes et iPads',                           4),
  ('Périphériques',      'peripheriques',       'Souris, claviers, écrans et accessoires',     5),
  ('Serveurs',           'serveurs',            'Infrastructure IT et serveurs',                6),
  ('Accessoires Workplace', 'accessoires-workplace', 'Équipements bureau et collaboration',    7)
on conflict (slug) do nothing;

-- Products (10 initial products from existing site)
insert into products (name, slug, description, price, stock, category_id, images) values
  ('AirPods 2',
   'airpods-2',
   'Écouteurs sans fil Apple AirPods 2ème génération. Son remarquable, autonomie jusqu''à 5h, boîtier de charge inclus.',
   74.00, 50,
   (select id from categories where slug = 'casques-ecouteurs'),
   '{}'),

  ('AirPods 3',
   'airpods-3',
   'AirPods 3ème génération avec design spatial audio. Résistants à l''eau, autonomie jusqu''à 6h.',
   92.00, 40,
   (select id from categories where slug = 'casques-ecouteurs'),
   '{}'),

  ('AirPods Pro',
   'airpods-pro',
   'AirPods Pro avec réduction de bruit active. Transparence, son adaptatif, résistant à l''eau.',
   92.00, 35,
   (select id from categories where slug = 'casques-ecouteurs'),
   '{}'),

  ('Apple MacBook Air 13.6',
   'macbook-air-13-6',
   'MacBook Air 13.6" puce Apple M2. Ultra-fin, silencieux, autonomie toute la journée. Idéal pour les professionnels mobiles.',
   1000.00, 15,
   (select id from categories where slug = 'ordinateurs-portables'),
   '{}'),

  ('DELL PRO 14 PC14250 CORE ULTRA (v1)',
   'dell-pro-14-pc14250-v1',
   'Dell Pro 14 avec Intel Core Ultra. Écran 14" FHD, performances professionnelles, chassis léger.',
   980.00, 12,
   (select id from categories where slug = 'ordinateurs-portables'),
   '{}'),

  ('DELL PRO 14 PC14250 CORE ULTRA (v2)',
   'dell-pro-14-pc14250-v2',
   'Dell Pro 14 v2 avec Intel Core Ultra. Configuration optimisée rapport qualité-prix.',
   898.00, 10,
   (select id from categories where slug = 'ordinateurs-portables'),
   '{}'),

  ('iPhone 12',
   'iphone-12',
   'Apple iPhone 12 reconditionné Grade A. Écran Super Retina XDR 6.1", puce A14 Bionic, 5G.',
   250.00, 25,
   (select id from categories where slug = 'smartphones'),
   '{}'),

  ('iPhone 12 Mini',
   'iphone-12-mini',
   'Apple iPhone 12 Mini reconditionné Grade A. Compact 5.4", puce A14 Bionic, 5G.',
   222.00, 20,
   (select id from categories where slug = 'smartphones'),
   '{}'),

  ('iPhone 13',
   'iphone-13',
   'Apple iPhone 13 reconditionné Grade A. Écran Super Retina XDR 6.1", puce A15 Bionic, double capteur photo.',
   314.00, 30,
   (select id from categories where slug = 'smartphones'),
   '{}'),

  ('iPhone 13 Mini',
   'iphone-13-mini',
   'Apple iPhone 13 Mini reconditionné Grade A. Compact 5.4", puce A15 Bionic.',
   260.00, 18,
   (select id from categories where slug = 'smartphones'),
   '{}')

on conflict (slug) do nothing;
