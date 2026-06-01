'use client'

import { useState } from 'react'
import { Eye, EyeOff, CheckCircle, AlertCircle, Loader2, Save, RotateCcw } from 'lucide-react'
import { settingsApi, SETTING_LABELS, SETTING_PLACEHOLDERS, IS_SECRET } from '@/lib/api/settings'
import type { PaymentSetting } from '@/lib/api/settings'

interface Props {
  initialSettings: PaymentSetting[]
  type?: 'payment' | 'email'
}

interface FieldState {
  editing: boolean
  value: string
  showValue: boolean
}

export default function PaymentSettingsForm({ initialSettings, type = 'payment' }: Props) {
  const [settings, setSettings] = useState<PaymentSetting[]>(initialSettings)
  const [fields, setFields] = useState<Record<string, FieldState>>(() =>
    Object.fromEntries(
      initialSettings.map((s) => [s.key, { editing: false, value: '', showValue: false }])
    )
  )
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null)

  function toggleEdit(key: string) {
    setFields((prev) => ({
      ...prev,
      [key]: { ...prev[key], editing: !prev[key].editing, value: '', showValue: false },
    }))
    setResult(null)
  }

  function toggleShow(key: string) {
    setFields((prev) => ({
      ...prev,
      [key]: { ...prev[key], showValue: !prev[key].showValue },
    }))
  }

  function handleChange(key: string, value: string) {
    setFields((prev) => ({ ...prev, [key]: { ...prev[key], value } }))
    setResult(null)
  }

  async function handleSave() {
    const toSave = Object.entries(fields)
      .filter(([, f]) => f.editing && f.value.trim() !== '')
      .map(([key, f]) => ({ key, value: f.value.trim() }))

    if (toSave.length === 0) {
      setResult({ ok: false, message: 'Aucune modification à enregistrer.' })
      return
    }

    setSaving(true)
    setResult(null)
    try {
      const saveFn = type === 'email'
        ? settingsApi.updateEmailSettings
        : settingsApi.updatePaymentSettings
      const getFn = type === 'email'
        ? settingsApi.getEmailSettings
        : settingsApi.getPaymentSettings

      const res = await saveFn(toSave)
      const updated = res.data.updatedKeys

      // Recharger les métadonnées depuis l'API
      const refreshed = await getFn()
      setSettings(refreshed.data)

      // Fermer les champs modifiés
      setFields((prev) => {
        const next = { ...prev }
        for (const key of updated) {
          next[key] = { editing: false, value: '', showValue: false }
        }
        return next
      })

      setResult({
        ok: true,
        message: `${updated.length} clé${updated.length > 1 ? 's' : ''} enregistrée${updated.length > 1 ? 's' : ''} : ${updated.join(', ')}`,
      })
    } catch {
      setResult({ ok: false, message: 'Erreur lors de la sauvegarde. Vérifiez votre connexion.' })
    } finally {
      setSaving(false)
    }
  }

  const hasChanges = Object.values(fields).some((f) => f.editing && f.value.trim() !== '')

  return (
    <div className="space-y-1 p-6">
      {settings.map((setting) => {
        const f = fields[setting.key] ?? { editing: false, value: '', showValue: false }
        const label = SETTING_LABELS[setting.key] ?? setting.key
        const placeholder = SETTING_PLACEHOLDERS[setting.key] ?? ''
        const isSecret = IS_SECRET[setting.key] ?? false

        return (
          <div key={setting.key} className="rounded-lg border bg-muted/20 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{label}</span>
                  {setting.isSet ? (
                    <span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                      <CheckCircle className="h-2.5 w-2.5" /> Configuré
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                      <AlertCircle className="h-2.5 w-2.5" /> Non défini
                    </span>
                  )}
                </div>
                {setting.description && (
                  <p className="mt-0.5 text-xs text-muted-foreground">{setting.description}</p>
                )}

                {/* Valeur actuelle masquée */}
                {setting.isSet && !f.editing && (
                  <p className="mt-2 font-mono text-xs text-muted-foreground">{setting.masked}</p>
                )}

                {/* Champ d'édition */}
                {f.editing && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        type={isSecret && !f.showValue ? 'password' : 'text'}
                        value={f.value}
                        onChange={(e) => handleChange(setting.key, e.target.value)}
                        placeholder={placeholder}
                        autoFocus
                        className="w-full rounded-md border bg-white px-3 py-2 pr-9 font-mono text-xs focus:border-primary focus:outline-none"
                      />
                      {isSecret && (
                        <button
                          type="button"
                          onClick={() => toggleShow(setting.key)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          tabIndex={-1}
                        >
                          {f.showValue ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Bouton modifier / annuler */}
              <button
                type="button"
                onClick={() => toggleEdit(setting.key)}
                className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  f.editing
                    ? 'border border-muted bg-muted text-muted-foreground hover:bg-muted/70'
                    : 'border border-primary/30 bg-primary/5 text-primary hover:bg-primary/10'
                }`}
              >
                {f.editing ? (
                  <span className="flex items-center gap-1"><RotateCcw className="h-3 w-3" /> Annuler</span>
                ) : (
                  'Modifier'
                )}
              </button>
            </div>
          </div>
        )
      })}

      {/* Feedback */}
      {result && (
        <div className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm ${
          result.ok
            ? 'border border-green-200 bg-green-50 text-green-800'
            : 'border border-red-200 bg-red-50 text-red-800'
        }`}>
          {result.ok
            ? <CheckCircle className="h-4 w-4 shrink-0" />
            : <AlertCircle className="h-4 w-4 shrink-0" />}
          {result.message}
        </div>
      )}

      {/* Bouton Enregistrer */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !hasChanges}
          className="flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? 'Enregistrement…' : 'Enregistrer les modifications'}
        </button>
        {!hasChanges && !saving && (
          <p className="mt-1.5 text-xs text-muted-foreground">
            Cliquez sur « Modifier » à côté d'un champ pour le mettre à jour.
          </p>
        )}
      </div>
    </div>
  )
}
