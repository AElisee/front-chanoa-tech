import { apiClient } from './client'

export interface PaymentSetting {
  key: string
  masked: string
  isSet: boolean
  description: string | null
}

export const PAYMENT_SETTING_LABELS: Record<string, string> = {
  geniuspay_api_key:        'Clé API (X-API-Key)',
  geniuspay_api_secret:     'Secret API (X-API-Secret)',
  geniuspay_api_url:        'URL de l\'API GeniusPay',
  geniuspay_webhook_secret: 'Secret webhook (HMAC)',
  frontend_url:             'URL publique du frontend',
}

export const PAYMENT_SETTING_PLACEHOLDERS: Record<string, string> = {
  geniuspay_api_key:        'gp_live_xxxxxxxxxxxxxxxx',
  geniuspay_api_secret:     'sk_live_xxxxxxxxxxxxxxxx',
  geniuspay_api_url:        'https://api.geniuspay.com/v1',
  geniuspay_webhook_secret: 'whsec_xxxxxxxxxxxxxxxx',
  frontend_url:             'http://148.230.112.175:3201',
}

export const IS_SECRET: Record<string, boolean> = {
  geniuspay_api_key:        true,
  geniuspay_api_secret:     true,
  geniuspay_api_url:        false,
  geniuspay_webhook_secret: true,
  frontend_url:             false,
}

export const settingsApi = {
  getPaymentSettings: (authHeader?: Record<string, string>) =>
    apiClient.get<PaymentSetting[]>('/settings/payment', authHeader ? { headers: authHeader } : undefined),

  updatePaymentSettings: (
    settings: { key: string; value: string }[],
    authHeader?: Record<string, string>,
  ) =>
    apiClient.post<{ success: boolean; updatedKeys: string[] }>(
      '/settings/payment',
      { settings },
      authHeader ? { headers: authHeader } : undefined,
    ),
}
