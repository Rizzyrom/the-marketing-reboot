'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/supabase'
import { BarChart3, Users, Bookmark, Eye } from 'lucide-react'

interface DashboardStats {
  totalPosts: number
  totalViews: number
  totalFollowers: number
  totalSaves: number
}

export default function CMSDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalPosts: 0,
    totalViews: 0,
    totalFollowers: 0,
    totalSaves: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return

        // Fetch total posts
        const { count: totalPosts } = await supabase
          .from('posts')
          .select('*', { count: 'exact', head: true })
          .eq('author_id', session.user.id)

        // Fetch total views (placeholder for future analytics)
        const totalViews = 0

        // Fetch total followers
        const { count: totalFollowers } = await supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('followed_id', session.user.id)

        // Fetch total saves
        const { count: totalSaves } = await supabase
          .from('saved_posts')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', session.user.id)

        setStats({
          totalPosts: totalPosts || 0,
          totalViews,
          totalFollowers: totalFollowers || 0,
          totalSaves: totalSaves || 0
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (isLoading) {
    return (
      <div className="glass-card p-8 text-center">
        Loading stats...
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <h1 className="gradient-text text-3xl font-bold">
        Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Posts Card */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-[var(--bg-secondary)]">
              <BarChart3 className="w-6 h-6 text-[var(--accent-primary)]" />
            </div>
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Total Posts</p>
              <p className="text-2xl font-bold">{stats.totalPosts}</p>
            </div>
          </div>
        </div>

        {/* Views Card */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-[var(--bg-secondary)]">
              <Eye className="w-6 h-6 text-[var(--accent-primary)]" />
            </div>
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Total Views</p>
              <p className="text-2xl font-bold">{stats.totalViews}</p>
            </div>
          </div>
        </div>

        {/* Followers Card */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-[var(--bg-secondary)]">
              <Users className="w-6 h-6 text-[var(--accent-primary)]" />
            </div>
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Followers</p>
              <p className="text-2xl font-bold">{stats.totalFollowers}</p>
            </div>
          </div>
        </div>

        {/* Saves Card */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-[var(--bg-secondary)]">
              <Bookmark className="w-6 h-6 text-[var(--accent-primary)]" />
            </div>
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Total Saves</p>
              <p className="text-2xl font-bold">{stats.totalSaves}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="glass-card p-6">
        <h2 className="gradient-text text-xl font-bold mb-4">
          Recent Activity
        </h2>
        <p className="text-[var(--text-secondary)]">
          Activity tracking coming soon...
        </p>
      </div>
    </div>
  )
} 