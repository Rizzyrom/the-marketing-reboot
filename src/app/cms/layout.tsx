'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useRole } from '@/contexts/RoleContext'
import ExclusiveHeader from '@/components/ExclusiveHeader'
import ParticleSystem from '@/components/ParticleSystem'
import { LayoutDashboard, FileText, Settings } from 'lucide-react'

export default function CMSLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { role, isVerified, isLoading } = useRole()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && (!role || role !== 'contributor' || !isVerified)) {
      router.push('/')
    }
  }, [role, isVerified, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)]">
        <ExclusiveHeader />
        <ParticleSystem />
        <div className="container mx-auto px-4 py-8">
          <div className="glass-card p-8 text-center">
            Loading...
          </div>
        </div>
      </div>
    )
  }

  if (!role || role !== 'contributor' || !isVerified) {
    return null
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <ExclusiveHeader />
      <ParticleSystem />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="w-64 flex-shrink-0">
            <nav className="glass-card rounded-xl p-4 space-y-2">
              <a
                href="/cms"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors"
              >
                <LayoutDashboard className="w-5 h-5" />
                <span>Dashboard</span>
              </a>
              <a
                href="/cms/posts"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors"
              >
                <FileText className="w-5 h-5" />
                <span>Posts</span>
              </a>
              <a
                href="/cms/settings"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors"
              >
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </a>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
} 