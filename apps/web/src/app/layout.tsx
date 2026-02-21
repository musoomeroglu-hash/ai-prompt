import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { ExtensionSync } from '@/components/ExtensionSync'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI Prompt App',
  description: 'Generate and improve AI prompts',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <ExtensionSync />
          <main className="min-h-screen bg-transparent text-text-primary">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  )
}
