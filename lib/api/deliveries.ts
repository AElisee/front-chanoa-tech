import { apiClient } from './client'

// ── DTOs ──────────────────────────────────────────────────────────────────────

export interface DeliveryDto {
  id: string
  order_id: string
  carrier: string | null
  tracking_number: string | null
  status: string | null
  shipped_at: string | null
  delivered_at: string | null
  created_at: string
  updated_at: string
}

export interface CreateDeliveryDto {
  order_id: string
  carrier?: string | null
  tracking_number?: string | null
  status?: string | null
}

export interface UpdateDeliveryDto {
  carrier?: string | null
  tracking_number?: string | null
  status?: string | null
  shipped_at?: string | null
  delivered_at?: string | null
}

// ── API ───────────────────────────────────────────────────────────────────────

export const deliveriesApi = {
  getByCommande: (commandeId: string) =>
    apiClient.get<DeliveryDto[]>(`/deliveries/commande/${commandeId}`),

  update: (id: string, data: UpdateDeliveryDto) =>
    apiClient.patch<DeliveryDto>(`/deliveries/${id}`, data),

  create: (data: CreateDeliveryDto) =>
    apiClient.post<DeliveryDto>('/deliveries', data),
}
