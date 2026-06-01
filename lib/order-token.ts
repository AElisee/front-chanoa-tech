import crypto from 'crypto'

const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000 // 30 jours

function getSecret(): string {
  return process.env.JWT_SECRET ?? 'chanoa-fallback-secret'
}

function toB64url(str: string): string {
  return Buffer.from(str).toString('base64url')
}

function fromB64url(str: string): string {
  return Buffer.from(str, 'base64url').toString('utf8')
}

/**
 * Génère un token signé HMAC-SHA256 pour accès invité à une commande.
 * Format : base64url(orderId:timestamp).signature
 */
export function generateOrderToken(orderId: string): string {
  const payload = `${orderId}:${Date.now()}`
  const sig = crypto
    .createHmac('sha256', getSecret())
    .update(payload)
    .digest('base64url')
  return `${toB64url(payload)}.${sig}`
}

/**
 * Vérifie un token d'accès commande.
 * Retourne true si le token est valide, non expiré et correspond à l'orderId.
 */
export function verifyOrderToken(token: string, orderId: string): boolean {
  try {
    const dotIdx = token.lastIndexOf('.')
    if (dotIdx === -1) return false

    const payloadB64 = token.slice(0, dotIdx)
    const sig = token.slice(dotIdx + 1)

    const payload = fromB64url(payloadB64)
    const colonIdx = payload.lastIndexOf(':')
    if (colonIdx === -1) return false

    const id = payload.slice(0, colonIdx)
    const ts = Number(payload.slice(colonIdx + 1))

    if (id !== orderId) return false
    if (isNaN(ts) || Date.now() - ts > MAX_AGE_MS) return false

    const expectedSig = crypto
      .createHmac('sha256', getSecret())
      .update(payload)
      .digest('base64url')

    const sigBuf = Buffer.from(sig)
    const expBuf = Buffer.from(expectedSig)
    if (sigBuf.length !== expBuf.length) return false

    return crypto.timingSafeEqual(sigBuf, expBuf)
  } catch {
    return false
  }
}
