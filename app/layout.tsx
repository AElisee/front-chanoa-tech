import type { Metadata } from 'next'
import { Poppins, Montserrat } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'

const poppins = Poppins({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
})

const montserrat = Montserrat({
  variable: '--font-display',
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Chanoa Tech — Store IT Professionnel',
    template: '%s | Chanoa Tech',
  },
  description:
    'Votre store IT professionnel pour équiper efficacement vos bureaux, projets et équipes.',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://chanoatech.com'
  ),
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={`${poppins.variable} ${montserrat.variable} font-sans antialiased`} suppressHydrationWarning>
        {children}
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  )
}
