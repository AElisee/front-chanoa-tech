import type { OrderStatus } from '@/lib/api/orders'

const config: Record<OrderStatus, { label: string; bg: string; text: string; dot: string }> = {
  pending:    { label: 'En attente',      bg: 'bg-amber-50',   text: 'text-amber-700',  dot: 'bg-amber-500' },
  confirmed:  { label: 'Confirmée',       bg: 'bg-blue-50',    text: 'text-blue-700',   dot: 'bg-blue-500' },
  processing: { label: 'En préparation',  bg: 'bg-purple-50',  text: 'text-purple-700', dot: 'bg-purple-500' },
  shipped:    { label: 'Expédiée',        bg: 'bg-indigo-50',  text: 'text-indigo-700', dot: 'bg-indigo-500' },
  delivered:  { label: 'Livrée',          bg: 'bg-green-50',   text: 'text-green-700',  dot: 'bg-green-600' },
  cancelled:  { label: 'Annulée',         bg: 'bg-red-50',     text: 'text-red-700',    dot: 'bg-red-500' },
  refunded:   { label: 'Remboursée',      bg: 'bg-gray-50',    text: 'text-gray-700',   dot: 'bg-gray-500' },
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const c = config[status] ?? config.pending
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${c.bg} ${c.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  )
}
