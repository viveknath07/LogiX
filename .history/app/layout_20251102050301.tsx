import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from './contexts/ThemeContext'

export const metadata: Metadata = {
  title: 'OnDrive - Secure Cloud Storage',
  description: 'Enterprise-grade cloud storage solution',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}