/**
 * Données fictives pour le développement local.
 * À remplacer par les appels Supabase une fois la base configurée.
 */

import type { ProductWithCategory, OrderWithItems } from '@/lib/supabase/query-types'
import type { OrderStatus } from '@/lib/supabase/types'

// ─── Catégories ──────────────────────────────────────────────────────────────

export const mockCategories = [
  { id: 'cat-1', name: 'Ordinateurs portables', slug: 'ordinateurs-portables', is_active: true, sort_order: 1 },
  { id: 'cat-2', name: 'Moniteurs', slug: 'moniteurs', is_active: true, sort_order: 2 },
  { id: 'cat-3', name: 'Périphériques', slug: 'peripheriques', is_active: true, sort_order: 3 },
  { id: 'cat-4', name: 'Réseaux', slug: 'reseaux', is_active: true, sort_order: 4 },
  { id: 'cat-5', name: 'Stockage', slug: 'stockage', is_active: true, sort_order: 5 },
  { id: 'cat-6', name: 'Composants', slug: 'composants', is_active: true, sort_order: 6 },
]

// ─── Produits ─────────────────────────────────────────────────────────────────

export const mockProducts: ProductWithCategory[] = [
  {
    id: 'prod-1',
    name: 'MacBook Pro 14" M3 Pro',
    slug: 'macbook-pro-14-m3-pro',
    description:
      'Le MacBook Pro 14" avec puce M3 Pro offre des performances exceptionnelles pour les professionnels. Écran Liquid Retina XDR, jusqu\'à 18h d\'autonomie, 18 Go de RAM unifiée.',
    price: 2499.99,
    compare_price: 2799.99,
    stock: 8,
    category_id: 'cat-1',
    images: [],
    is_active: true,
    created_at: '2025-11-01T10:00:00Z',
    updated_at: '2025-11-01T10:00:00Z',
    categories: { name: 'Ordinateurs portables', slug: 'ordinateurs-portables' },
  },
  {
    id: 'prod-2',
    name: 'Dell Latitude 5540 15"',
    slug: 'dell-latitude-5540',
    description:
      'Ultrabook professionnel Dell Latitude 5540. Processeur Intel Core i7-1365U, 16 Go DDR5, SSD 512 Go NVMe, écran FHD IPS 15.6". Idéal pour les déplacements fréquents.',
    price: 1299.99,
    compare_price: 1499.99,
    stock: 12,
    category_id: 'cat-1',
    images: [],
    is_active: true,
    created_at: '2025-11-05T10:00:00Z',
    updated_at: '2025-11-05T10:00:00Z',
    categories: { name: 'Ordinateurs portables', slug: 'ordinateurs-portables' },
  },
  {
    id: 'prod-3',
    name: 'Lenovo ThinkPad X1 Carbon Gen 11',
    slug: 'thinkpad-x1-carbon-gen11',
    description:
      'Référence ultime en mobilité professionnelle. Châssis en fibre de carbone, 14" 2.8K OLED, Intel Core i7-1365U, 16 Go LPDDR5, 512 Go SSD. Poids : 1,12 kg.',
    price: 1799.99,
    compare_price: null,
    stock: 5,
    category_id: 'cat-1',
    images: [],
    is_active: true,
    created_at: '2025-11-10T10:00:00Z',
    updated_at: '2025-11-10T10:00:00Z',
    categories: { name: 'Ordinateurs portables', slug: 'ordinateurs-portables' },
  },
  {
    id: 'prod-4',
    name: 'Dell UltraSharp U2722D 27"',
    slug: 'dell-ultrasharp-u2722d',
    description:
      'Moniteur 4K IPS 27" avec USB-C 90W, hub USB intégré. Résolution 3840×2160, couverture 95% DCI-P3, certifié TÜV Eye Comfort. Parfait pour les créatifs et développeurs.',
    price: 589.99,
    compare_price: 649.99,
    stock: 15,
    category_id: 'cat-2',
    images: [],
    is_active: true,
    created_at: '2025-11-12T10:00:00Z',
    updated_at: '2025-11-12T10:00:00Z',
    categories: { name: 'Moniteurs', slug: 'moniteurs' },
  },
  {
    id: 'prod-5',
    name: 'BenQ PD2725U 27" 4K',
    slug: 'benq-pd2725u',
    description:
      'Moniteur de design 4K Thunderbolt 4. Couverture 100% sRGB et 95% P3, calibration d\'usine Delta E≤2, M-Book Mode pour les utilisateurs Mac.',
    price: 799.99,
    compare_price: 899.99,
    stock: 7,
    category_id: 'cat-2',
    images: [],
    is_active: true,
    created_at: '2025-11-15T10:00:00Z',
    updated_at: '2025-11-15T10:00:00Z',
    categories: { name: 'Moniteurs', slug: 'moniteurs' },
  },
  {
    id: 'prod-6',
    name: 'Logitech MX Keys S',
    slug: 'logitech-mx-keys-s',
    description:
      'Clavier sans fil avancé avec rétroéclairage adaptatif. Connectivité Bluetooth multi-appareils (3 profils), touches concaves pour une frappe précise, autonomie 10 jours.',
    price: 119.99,
    compare_price: null,
    stock: 25,
    category_id: 'cat-3',
    images: [],
    is_active: true,
    created_at: '2025-11-18T10:00:00Z',
    updated_at: '2025-11-18T10:00:00Z',
    categories: { name: 'Périphériques', slug: 'peripheriques' },
  },
  {
    id: 'prod-7',
    name: 'Logitech MX Master 3S',
    slug: 'logitech-mx-master-3s',
    description:
      'Souris sans fil ergonomique haut de gamme. Capteur 8000 DPI, molette MagSpeed électromagnétique, clic silencieux, charge USB-C, compatible Easy-Switch pour 3 appareils.',
    price: 99.99,
    compare_price: 119.99,
    stock: 30,
    category_id: 'cat-3',
    images: [],
    is_active: true,
    created_at: '2025-11-20T10:00:00Z',
    updated_at: '2025-11-20T10:00:00Z',
    categories: { name: 'Périphériques', slug: 'peripheriques' },
  },
  {
    id: 'prod-8',
    name: 'Cisco SG350-24 Switch 24 ports',
    slug: 'cisco-sg350-24-switch',
    description:
      'Switch manageable 24 ports Gigabit avec 4 ports SFP combo. Gestion via interface web, CLI et SNMP. Idéal pour PME exigeant fiabilité et segmentation VLAN.',
    price: 459.99,
    compare_price: null,
    stock: 4,
    category_id: 'cat-4',
    images: [],
    is_active: true,
    created_at: '2025-11-22T10:00:00Z',
    updated_at: '2025-11-22T10:00:00Z',
    categories: { name: 'Réseaux', slug: 'reseaux' },
  },
  {
    id: 'prod-9',
    name: 'Samsung 990 Pro SSD 2 To',
    slug: 'samsung-990-pro-2to',
    description:
      'SSD NVMe PCIe 4.0 M.2 2280 ultra-rapide. Vitesse séquentielle en lecture : 7 450 Mo/s, en écriture : 6 900 Mo/s. Idéal pour les stations de travail et postes créatifs.',
    price: 189.99,
    compare_price: 219.99,
    stock: 18,
    category_id: 'cat-5',
    images: [],
    is_active: true,
    created_at: '2025-11-25T10:00:00Z',
    updated_at: '2025-11-25T10:00:00Z',
    categories: { name: 'Stockage', slug: 'stockage' },
  },
  {
    id: 'prod-10',
    name: 'WD My Cloud EX2 Ultra NAS 8 To',
    slug: 'wd-mycloud-ex2-ultra-8to',
    description:
      'NAS 2 baies avec 8 To pré-installés (2×4 To WD Red). Processeur Marvell dual-core 1.3 GHz, 1 Go RAM, 2× USB 3.0, compatible Time Machine et Plex Media Server.',
    price: 349.99,
    compare_price: null,
    stock: 3,
    category_id: 'cat-5',
    images: [],
    is_active: true,
    created_at: '2025-11-28T10:00:00Z',
    updated_at: '2025-11-28T10:00:00Z',
    categories: { name: 'Stockage', slug: 'stockage' },
  },
  {
    id: 'prod-11',
    name: 'Corsair Vengeance 32 Go DDR5',
    slug: 'corsair-vengeance-32go-ddr5',
    description:
      'Kit mémoire DDR5 32 Go (2×16 Go) à 5600 MHz CL36. Compatibilité Intel XMP 3.0, dissipateur thermique aluminium basse-profil. Compatible avec les plateformes Intel et AMD.',
    price: 159.99,
    compare_price: 189.99,
    stock: 20,
    category_id: 'cat-6',
    images: [],
    is_active: true,
    created_at: '2025-12-01T10:00:00Z',
    updated_at: '2025-12-01T10:00:00Z',
    categories: { name: 'Composants', slug: 'composants' },
  },
  {
    id: 'prod-12',
    name: 'APC Back-UPS Pro 1500VA',
    slug: 'apc-back-ups-pro-1500va',
    description:
      'Onduleur 1500VA / 865W avec 10 prises protégées, 8 prises secourues. Gestion via PowerChute, écran LCD de suivi, protection contre les surtensions et interférences.',
    price: 219.99,
    compare_price: null,
    stock: 2,
    category_id: 'cat-6',
    images: [],
    is_active: true,
    created_at: '2025-12-05T10:00:00Z',
    updated_at: '2025-12-05T10:00:00Z',
    categories: { name: 'Composants', slug: 'composants' },
  },
]

// ─── Utilisateur mock ─────────────────────────────────────────────────────────

export const mockUser = {
  id: 'mock-user-id',
  email: 'demo@chanoa-tech.fr',
}

export const mockProfile = {
  full_name: 'Sophie Martin',
  email: 'demo@chanoa-tech.fr',
  phone: '+33 6 12 34 56 78',
  role: 'user',
}

// ─── Commandes mock ───────────────────────────────────────────────────────────

export const mockOrders: OrderWithItems[] = [
  {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    status: 'delivered' as OrderStatus,
    total: 1419.98,
    created_at: '2026-01-15T14:30:00Z',
    shipping_address: { rue: '12 rue de la Paix', ville: 'Paris', code_postal: '75001' },
    order_items: [
      {
        id: 'item-1',
        quantity: 1,
        unit_price: 1299.99,
        product_snapshot: { name: 'Dell Latitude 5540 15"', price: 1299.99, slug: 'dell-latitude-5540' },
      },
      {
        id: 'item-2',
        quantity: 1,
        unit_price: 119.99,
        product_snapshot: { name: 'Logitech MX Keys S', price: 119.99, slug: 'logitech-mx-keys-s' },
      },
    ],
    deliveries: {
      tracking_number: 'FR123456789',
      carrier: 'Colissimo',
      status: 'delivered',
    },
  },
  {
    id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    status: 'shipped' as OrderStatus,
    total: 589.99,
    created_at: '2026-02-20T09:15:00Z',
    shipping_address: { rue: '5 avenue Montaigne', ville: 'Lyon', code_postal: '69002' },
    order_items: [
      {
        id: 'item-3',
        quantity: 1,
        unit_price: 589.99,
        product_snapshot: { name: 'Dell UltraSharp U2722D 27"', price: 589.99, slug: 'dell-ultrasharp-u2722d' },
      },
    ],
    deliveries: {
      tracking_number: 'FR987654321',
      carrier: 'DHL',
      status: 'shipped',
    },
  },
  {
    id: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
    status: 'processing' as OrderStatus,
    total: 349.98,
    created_at: '2026-03-10T16:45:00Z',
    shipping_address: { rue: '8 boulevard Haussmann', ville: 'Bordeaux', code_postal: '33000' },
    order_items: [
      {
        id: 'item-4',
        quantity: 1,
        unit_price: 189.99,
        product_snapshot: { name: 'Samsung 990 Pro SSD 2 To', price: 189.99, slug: 'samsung-990-pro-2to' },
      },
      {
        id: 'item-5',
        quantity: 1,
        unit_price: 159.99,
        product_snapshot: { name: 'Corsair Vengeance 32 Go DDR5', price: 159.99, slug: 'corsair-vengeance-32go-ddr5' },
      },
    ],
    deliveries: null,
  },
]

// Commandes pour l'admin (avec profil client)
export const mockAdminOrders = [
  {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    status: 'delivered' as OrderStatus,
    total: 1419.98,
    created_at: '2026-01-15T14:30:00Z',
    profiles: { full_name: 'Sophie Martin', email: 'sophie@example.fr' },
    order_items: [{ id: 'item-1' }, { id: 'item-2' }],
  },
  {
    id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    status: 'shipped' as OrderStatus,
    total: 589.99,
    created_at: '2026-02-20T09:15:00Z',
    profiles: { full_name: 'Marc Dupont', email: 'marc.dupont@corp.fr' },
    order_items: [{ id: 'item-3' }],
  },
  {
    id: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
    status: 'processing' as OrderStatus,
    total: 349.98,
    created_at: '2026-03-10T16:45:00Z',
    profiles: { full_name: 'Léa Rousseau', email: 'lea.r@startup.io' },
    order_items: [{ id: 'item-4' }, { id: 'item-5' }],
  },
  {
    id: 'd4e5f6a7-b8c9-0123-defa-234567890123',
    status: 'pending' as OrderStatus,
    total: 2499.99,
    created_at: '2026-03-14T11:00:00Z',
    profiles: { full_name: null, email: 'contact@pme-tech.fr' },
    order_items: [{ id: 'item-6' }],
  },
  {
    id: 'e5f6a7b8-c9d0-1234-efab-345678901234',
    status: 'confirmed' as OrderStatus,
    total: 799.99,
    created_at: '2026-03-15T08:30:00Z',
    profiles: { full_name: 'Thomas Bernard', email: 'tbernard@agence.fr' },
    order_items: [{ id: 'item-7' }],
  },
]

// KPIs admin
export const mockAdminKpis = {
  totalProducts: mockProducts.filter((p) => p.is_active).length,
  pendingOrders: mockAdminOrders.filter((o) => o.status === 'pending').length,
  totalClients: 47,
}

// Produits en stock faible (stock <= 5)
export const mockLowStock = mockProducts
  .filter((p) => p.stock <= 5)
  .sort((a, b) => a.stock - b.stock)
  .map((p) => ({ id: p.id, name: p.name, stock: p.stock }))
