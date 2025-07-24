import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { RoleProvider } from '@/contexts/RoleContext'
import ParticleSystem from '@/components/ParticleSystem'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'The Marketing Reboot - Where Elite Marketers Share Breakthrough Strategies',
  description: 'Join the premium marketing community for verified industry leaders. Share insights, learn from peers, and elevate your marketing game.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme');
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                    if (!theme) {
                      localStorage.setItem('theme', 'light');
                    }
                  }
                } catch (e) {
                  document.documentElement.classList.remove('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.className} min-h-screen bg-primary overflow-x-hidden`}>
        <ThemeProvider>
          <AuthProvider>
            <RoleProvider>
              <ParticleSystem />
              {children}
            </RoleProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}