const RESEND_API_URL = 'https://api.resend.com/emails'

interface SendEmailOptions {
  to: string | string[]
  subject: string
  html: string
  from?: string
  attachments?: Array<{ filename: string; content: string }> // base64 content
}

export async function sendEmail(opts: SendEmailOptions): Promise<{ id?: string; error?: string }> {
  const apiKey = Deno.env.get('RESEND_API_KEY')
  const fromEmail = opts.from ?? Deno.env.get('FROM_EMAIL') ?? 'noreply@chanoatech.com'

  if (!apiKey) return { error: 'RESEND_API_KEY not configured' }

  const body: Record<string, unknown> = {
    from: `Chanoa Tech <${fromEmail}>`,
    to: Array.isArray(opts.to) ? opts.to : [opts.to],
    subject: opts.subject,
    html: opts.html,
  }
  if (opts.attachments?.length) body.attachments = opts.attachments

  const res = await fetch(RESEND_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  const data = await res.json()
  if (!res.ok) return { error: data.message ?? 'Resend API error' }
  return { id: data.id }
}
