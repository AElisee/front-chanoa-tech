-- ============================================================
-- Chanoa Tech — Test Accounts
-- ============================================================
-- À exécuter dans Supabase Studio → SQL Editor
-- Ces comptes permettent de tester le dashboard admin et la boutique.
--
-- ⚠️  IMPORTANT : Ce fichier ne doit PAS être commité avec des
-- vrais mots de passe en production. Pour les tests locaux uniquement.
-- ============================================================

-- ============================================================
-- 1. CRÉER LES UTILISATEURS AUTH
-- ============================================================
-- Supabase ne permet pas de créer des users via SQL directement.
-- Utilisez l'une de ces méthodes :
--
-- MÉTHODE A — Supabase Dashboard (recommandé) :
--   1. Authentication → Users → Invite user
--   2. Ou : Authentication → Users → Add user
--
-- MÉTHODE B — API Admin (dans terminal) :
--   Voir les commandes curl ci-dessous
--
-- MÉTHODE C — Script Node.js (voir scripts/create-test-accounts.ts)
-- ============================================================

-- ============================================================
-- 2. APRÈS CRÉATION DES COMPTES — Promouvoir en admin
-- ============================================================
-- Remplacez les emails par ceux que vous avez créés.
-- Cette requête passe le rôle à 'admin' dans la table profiles.

update profiles
set role = 'admin'
where email in (
  'admin@chanoa-tech.com',
  'superadmin@chanoa-tech.com'
);

-- Vérification
select id, email, role, created_at
from profiles
order by created_at desc
limit 20;

-- ============================================================
-- 3. CRÉER QUELQUES COMMANDES DE TEST
-- ============================================================
-- (optionnel — utile pour tester le dashboard commandes)

-- Insérer des commandes de test (guest orders)
insert into orders (user_id, guest_email, total, shipping_address, status, notes) values
  (null, 'client1@test.com', 850000, '{"full_name": "Kofi Asante", "email": "client1@test.com", "phone": "+225 01 23 45 67", "address": "Cocody, Rue des Jardins", "city": "Abidjan"}', 'pending',    'Commande test #1'),
  (null, 'client2@test.com', 1200000, '{"full_name": "Aminata Diallo", "email": "client2@test.com", "phone": "+221 77 123 45 67", "address": "Plateau, Avenue Roume", "city": "Dakar"}',    'confirmed',  'Commande test #2'),
  (null, 'client3@test.com', 450000, '{"full_name": "Jean-Baptiste Kaboré", "email": "client3@test.com", "phone": "+226 70 123 456", "address": "Zogona, Secteur 15", "city": "Ouagadougou"}', 'processing', 'Commande test #3'),
  (null, 'client4@test.com', 2100000, '{"full_name": "Fatou Camara", "email": "client4@test.com", "phone": "+224 628 123 456", "address": "Kaloum, Rue Commerce", "city": "Conakry"}',     'shipped',    'Commande test #4'),
  (null, 'client5@test.com', 680000, '{"full_name": "Serge Dupont", "email": "client5@test.com", "phone": "+228 90 12 34 56", "address": "Bè Kpota, Avenue du Port", "city": "Lomé"}',     'delivered',  'Commande test #5')
on conflict do nothing;

-- Lier des produits existants aux commandes de test
-- (récupère les 5 premiers produits actifs)
with test_orders as (
  select id, total from orders where guest_email like '%@test.com' order by created_at desc limit 5
),
sample_products as (
  select id, price, name, slug from products where is_active = true limit 5
)
insert into order_items (order_id, product_id, quantity, unit_price, product_snapshot)
select
  o.id,
  p.id,
  1,
  p.price,
  jsonb_build_object('name', p.name, 'price', p.price, 'slug', p.slug)
from test_orders o
join sample_products p on true
where not exists (
  select 1 from order_items oi where oi.order_id = o.id and oi.product_id = p.id
)
limit 5;

-- ============================================================
-- 4. VÉRIFICATION FINALE
-- ============================================================

select
  p.email,
  p.role,
  p.full_name,
  p.created_at
from profiles p
order by p.role desc, p.created_at desc;

select
  o.id,
  o.guest_email,
  o.total,
  o.status,
  count(oi.id) as nb_items
from orders o
left join order_items oi on oi.order_id = o.id
group by o.id, o.guest_email, o.total, o.status
order by o.created_at desc
limit 10;
