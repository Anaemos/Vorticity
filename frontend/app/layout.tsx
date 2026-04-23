import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default:  'Vorticity',
    template: '%s — Vorticity',
  },
  description: 'Daily volatility regime intelligence for Indian equities and ETFs.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}