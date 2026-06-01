import { apiClient } from './client'

// ── DTOs ──────────────────────────────────────────────────────────────────────

export interface InitiatePaymentResponse {
  orderId: string
  paymentUrl: string
  reference: string
}

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'cancelled'

export interface PaymentStatusResponse {
  reference: string
  status: PaymentStatus
  orderId: string
}

// ── API ───────────────────────────────────────────────────────────────────────

export const paymentApi = {
  initiate: (orderId: string, authHeader?: Record<string, string>) =>
    apiClient.post<InitiatePaymentResponse>(
      '/payment/initiate',
      { orderId },
      authHeader ? { headers: authHeader } : undefined
    ),

  getStatus: (reference: string, authHeader?: Record<string, string>) =>
    apiClient.get<PaymentStatusResponse>(
      `/payment/status/${reference}`,
      authHeader ? { headers: authHeader } : undefined
    ),
}
