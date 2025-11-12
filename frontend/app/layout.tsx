import type { Metadata } from 'next'
import Link from 'next/link'
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
      <body className="bg-cream text-deep-coffee">
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-mist-gray/40 bg-cream/65 backdrop-blur-md">
          <div className="editorial-container flex items-center justify-between py-4">
            <Link
              href="/"
              className="editorial-caption tracking-[0.4em] text-deep-coffee/80 transition-colors duration-300 hover:text-deep-coffee"
            >
              LATTELINK
            </Link>
            <nav className="flex items-center gap-8">
              <Link
                href="/"
                className="editorial-caption tracking-[0.3em] text-deep-coffee/70 transition-colors duration-300 hover:text-deep-coffee"
              >
                HOME
              </Link>
              <Link
                href="/about"
                className="editorial-caption tracking-[0.3em] text-deep-coffee/70 transition-colors duration-300 hover:text-deep-coffee"
              >
                ABOUT
              </Link>
            </nav>
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  )
}

