import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Lattelink - Find Your Perfect Work Café',
  description: 'Discover cafés with reliable Wi-Fi, outlets, and the perfect atmosphere for work or study.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

