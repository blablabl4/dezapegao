import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  title: 'Dezapegão - Marketplace de Desapego em Heliópolis',
  description: 'Compre e venda produtos usados na sua comunidade. Anúncios por 24h, tipo stories.',
  keywords: 'desapego, marketplace, heliópolis, são paulo, compra, venda',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body className="antialiased font-sans overflow-hidden touch-manipulation">
        {children}
      </body>
    </html>
  )
}
