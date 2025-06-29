import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { Toaster } from '@/components/ui/toaster'
import { SnapHappyWidget } from '@/components/snap-happy'
import '@/components/snap-happy/snap-happy.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Prism Intelligence - Property Management AI',
  description: 'AI-powered property management intelligence platform',
  keywords: ['property management', 'AI', 'analytics', 'real estate'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster />
          <SnapHappyWidget />
        </Providers>
      </body>
    </html>
  )
}