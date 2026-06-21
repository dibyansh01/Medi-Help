import './globals.css'
import { Providers } from './providers'

/**
 * Root Layout for the application.
 * Wraps the entire application with necessary providers and global styles.
 * Layout-specific chrome (sidebar, navigation) is handled by route group layouts:
 *   - (public)/layout.tsx — minimal layout for login, signup, etc.
 *   - (authenticated)/layout.tsx — layout with sidebar for dashboard, patients, etc.
 */
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'MediHelp',
  description: 'Doctor Practice Management System',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
