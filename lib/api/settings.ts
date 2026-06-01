import { apiClient } from './client'

export interface PaymentSetting {
  key: string
  masked: string
  isSet: boolean
  description: string | null
}

// ── Libellés (toutes les clés) ───────────────────────────────────────────────

export const SETTING_LABELS: Record<string, string> = {
  // GeniusPay
  geniuspay_api_key:        'Clé API (X-API-Key)',
  geniuspay_api_secret:     'Secret API (X-API-Secret)',
  geniuspay_api_url:        'URL de l\'API GeniusPay',
  geniuspay_webhook_secret: 'Secret webhook (HMAC)',
  frontend_url:             'URL publique du frontend',
  // Email
  mail_host:                'Serveur SMTP',
  mail_port:                'Port SMTP',
  mail_user:                'Adresse expéditeur',
  mail_pass:                'Mot de passe SMTP',
}

export const SETTING_PLACEHOLDERS: Record<string, string> = {
  // GeniusPay
  geniuspay_api_key:        'gp_live_xxxxxxxxxxxxxxxx',
  geniuspay_api_secret:     'sk_live_xxxxxxxxxxxxxxxx',
  geniuspay_api_url:        'https://api.geniuspay.com/v1',
  geniuspay_webhook_secret: 'whsec_xxxxxxxxxxxxxxxx',
  frontend_url:             'http://148.230.112.175:3201',
  // Email
  mail_host:                'smtp.gmail.com',
  mail_port:                '587',
  mail_user:                'noreply@chanoa-tech.com',
  mail_pass:                '••••••••',
}

export const IS_SECRET: Record<string, boolean> = {
  // GeniusPay
  geniuspay_api_key:        true,
  geniuspay_api_secret:     true,
  geniuspay_api_url:        false,
  geniuspay_webhook_secret: true,
  frontend_url:             false,
  // Email
  mail_host:                false,
  mail_port:                false,
  mail_user:                false,
  mail_pass:                true,
}

// Rétrocompatibilité (anciens noms exportés)
export const PAYMENT_SETTING_LABELS  = SETTING_LABELS
export const PAYMENT_SETTING_PLACEHOLDERS = SETTING_PLACEHOLDERS

// ── API ───────────────────────────────────────────────────────────────────────

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

  getEmailSettings: (authHeader?: Record<string, string>) =>
    apiClient.get<PaymentSetting[]>('/settings/email', authHeader ? { headers: authHeader } : undefined),

  updateEmailSettings: (
    settings: { key: string; value: string }[],
    authHeader?: Record<string, string>,
  ) =>
    apiClient.post<{ success: boolean; updatedKeys: string[] }>(
      '/settings/email',
      { settings },
      authHeader ? { headers: authHeader } : undefined,
    ),
}
