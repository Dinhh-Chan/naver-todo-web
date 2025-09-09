import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import './globals.css'

export const metadata: Metadata = {
  title: 'AnyF Time Manager - Smart Task Management for Students',
  description: 'AI-powered time management tool for Vietnamese university students. Manage classes, projects, and daily tasks with intelligent prioritization and productivity insights.',
  keywords: ['time management', 'task management', 'productivity', 'AI', 'students', 'Vietnam'],
  authors: [{ name: 'AnyF Team' }],
  creator: 'AnyF Team',
  publisher: 'AnyF',
  robots: 'index, follow',
  openGraph: {
    title: 'AnyF Time Manager',
    description: 'Smart time management for Vietnamese students',
    type: 'website',
    locale: 'vi_VN',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
