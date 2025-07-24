'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import ExclusiveHeader from '@/components/ExclusiveHeader'
import ParticleSystem from '@/components/brand/ParticleSystem'
import { 
  TrendingUp, Eye, MessageCircle, Users, FileText,
  BarChart3, Calendar, Bell, Settings, Plus, Edit2, Trash2,
  Clock, ArrowUp, ArrowDown, Target, 
  BookOpen, Share2, Star, CheckCircle, AlertCircle,
  PieChart, Activity, Bookmark, Mail, ArrowRight, PlusCircle,
  Palette, Search, Cpu, Code, Rocket
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useRole } from '@/contexts/RoleContext'
import { useAuth } from '@/contexts/AuthContext'

interface DashboardStats {
  totalPosts: number
  totalViews: number
  totalComments: number
  followers: number
  following: number
  drafts: number
  bookmarks: number
}

interface Post {
  id: string
  title: string
  status: 'published' | 'draft'
  publishedAt?: string
  viewsCount: number
  commentsCount: number
  topicCategory: string
  readingTime: number
}

interface Activity {
  id: string
  type: 'comment' | 'follow' | 'mention'
  userName: string
  userAvatar: string
  postTitle?: string
  timestamp: string
}

export default function DashboardPage() {
  const router = useRouter()
  const { role, isContributor, isLoading: roleLoading } = useRole()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'overview' | 'posts' | 'analytics' | 'activity'>('overview')
  const [stats, setStats] = useState<DashboardStats>({
    totalPosts: 24,
    totalViews: 48392,
    totalComments: 523,
    followers: 1249,
    following: 387,
    drafts: 3,
    bookmarks: 67
  })
  const [posts, setPosts] = useState<Post[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('Dashboard Auth Check:', { user, role, isContributor, roleLoading })
    
    // Wait for role to load before checking
    if (roleLoading) {
      console.log('Role still loading, waiting...')
      return
    }

    if (!user) {
      console.log('No user, redirecting to login')
      router.push('/auth/login')
      return
    }

    // Only redirect if we've loaded the role and they're not a contributor
    if (!roleLoading && !isContributor) {
      console.log('Not a contributor, redirecting to home')
      router.push('/')
      return
    }

    // Load data if user is a contributor
    if (user && isContributor && !roleLoading) {
      console.log('User is contributor, loading dashboard data')
      // Simulate loading data
      setTimeout(() => {
        // Load posts
        setPosts([
          {
            id: '1',
            title: 'How We Increased Conversion Rates by 247% Using AI',
            status: 'published',
            publishedAt: '2024-03-15',
            viewsCount: 12847,
            commentsCount: 124,
            topicCategory: 'ai-automation',
            readingTime: 8
          },
          {
            id: '2',
            title: 'The Complete Guide to Growth Marketing in 2024',
            status: 'published',
            publishedAt: '2024-03-10',
            viewsCount: 9823,
            commentsCount: 89,
            topicCategory: 'growth-performance',
            readingTime: 12
          },
          {
            id: '3',
            title: 'Building a Brand That Resonates: Our Journey',
            status: 'draft',
            viewsCount: 0,
            commentsCount: 0,
            topicCategory: 'brand-creative',
            readingTime: 10
          }
        ])

        // Load activities
        setActivities([
          {
            id: '1',
            type: 'comment',
            userName: 'Alex Rivera',
            userAvatar: 'AR',
            postTitle: 'The Complete Guide to Growth Marketing in 2024',
            timestamp: '5 hours ago'
          },
          {
            id: '2',
            type: 'follow',
            userName: 'Jordan Taylor',
            userAvatar: 'JT',
            timestamp: '1 day ago'
          },
          {
            id: '3',
            type: 'mention',
            userName: 'Morgan Lee',
            userAvatar: 'ML',
            postTitle: 'Best Marketing Tools of 2024',
            timestamp: '2 days ago'
          }
        ])

        setLoading(false)
      }, 1000)
    }
  }, [user, isContributor, roleLoading, router, role])

  const getTopicIcon = (topicId: string) => {
    const topics: Record<string, React.ComponentType<any>> = {
      'brand-creative': Palette,
      'growth-performance': TrendingUp,
      'content-communications': FileText,
      'seo-organic': Search,
      'ai-automation': Cpu,
      'web-tech': Code,
      'social-community': Users,
      'sales-strategy': Target,
      'careers-culture': Rocket
    }
    return topics[topicId] || FileText
  }

  const renderOverviewTab = () => (
    <div className="space-y-8">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <Eye className="w-8 h-8 text-brand-primary" />
            <span className="text-xs text-green-400 flex items-center gap-1">
              <ArrowUp className="w-3 h-3" />
              +12.5%
            </span>
          </div>
          <div className="font-orbitron text-3xl font-bold mb-1 text-primary">
            {stats.totalViews.toLocaleString()}
          </div>
          <div className="text-sm text-muted">Total Views</div>
        </div>

        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <MessageCircle className="w-8 h-8 text-blue-400" />
            <span className="text-xs text-green-400 flex items-center gap-1">
              <ArrowUp className="w-3 h-3" />
              +8.3%
            </span>
          </div>
          <div className="font-orbitron text-3xl font-bold mb-1 text-primary">
            {stats.totalComments.toLocaleString()}
          </div>
          <div className="text-sm text-muted">Total Comments</div>
        </div>

        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <Users className="w-8 h-8 text-purple-400" />
            <span className="text-xs text-green-400 flex items-center gap-1">
              <ArrowUp className="w-3 h-3" />
              +24.7%
            </span>
          </div>
          <div className="font-orbitron text-3xl font-bold mb-1 text-primary">
            {stats.followers.toLocaleString()}
          </div>
          <div className="text-sm text-muted">Followers</div>
        </div>

        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <FileText className="w-8 h-8 text-green-400" />
            <span className="text-xs text-muted">This month</span>
          </div>
          <div className="font-orbitron text-3xl font-bold mb-1 text-primary">
            {stats.totalPosts}
          </div>
          <div className="text-sm text-muted">Published Posts</div>
        </div>
      </div>

      {/* Recent Performance */}
      <div className="glass-card rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-primary">
          <TrendingUp className="w-5 h-5" />
          Recent Performance
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="text-sm text-muted mb-2">Best Performing Post</div>
            <Link href="/dashboard/posts/1" className="font-semibold hover:text-brand-primary transition-colors text-primary">
              How We Increased Conversion Rates by 247% Using AI
            </Link>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted">
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                12.8K
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="w-3 h-3" />
                124
              </span>
            </div>
          </div>
          
          <div>
            <div className="text-sm text-muted mb-2">Engagement Rate</div>
            <div className="font-orbitron text-2xl font-bold text-green-400">7.2%</div>
            <div className="text-sm text-muted">+1.3% from last month</div>
          </div>
          
          <div>
            <div className="text-sm text-muted mb-2">Average Reading Time</div>
            <div className="font-orbitron text-2xl font-bold text-brand-primary">8:34</div>
            <div className="text-sm text-muted">Higher than community avg</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/dashboard/posts/new" className="glass-card rounded-xl p-6 hover:border-brand-primary transition-all group">
          <Plus className="w-8 h-8 text-green-400 mb-3" />
          <h3 className="font-semibold mb-1 group-hover:text-brand-primary transition-colors text-primary">Create New Post</h3>
          <p className="text-sm text-secondary">Share your latest marketing reboot</p>
        </Link>
        
        <Link href="/profile/edit" className="glass-card rounded-xl p-6 hover:border-brand-primary transition-all group">
          <Edit2 className="w-8 h-8 text-brand-primary mb-3" />
          <h3 className="font-semibold mb-1 group-hover:text-brand-primary transition-colors text-primary">Edit Profile</h3>
          <p className="text-sm text-secondary">Update your bio and expertise</p>
        </Link>
        
        <Link href="/analytics" className="glass-card rounded-xl p-6 hover:border-brand-primary transition-all group">
          <BarChart3 className="w-8 h-8 text-purple-400 mb-3" />
          <h3 className="font-semibold mb-1 group-hover:text-brand-primary transition-colors text-primary">View Analytics</h3>
          <p className="text-sm text-secondary">Deep dive into your performance</p>
        </Link>
      </div>
    </div>
  )

  const renderPostsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-primary">Your Posts</h3>
        <Link
          href="/dashboard/posts/new"
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Post
        </Link>
      </div>

      <div className="space-y-4">
        {posts.map(post => {
          const Icon = getTopicIcon(post.topicCategory)
          return (
            <div key={post.id} className="glass-card rounded-xl p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className="w-6 h-6 text-brand-primary" />
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      post.status === 'published'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {post.status === 'published' ? 'Published' : 'Draft'}
                    </span>
                    {post.publishedAt && (
                      <span className="text-sm text-muted">
                        {new Date(post.publishedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-lg font-semibold mb-2 text-primary">{post.title}</h3>
                  
                  {post.status === 'published' && (
                    <div className="flex items-center gap-6 text-sm text-muted">
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {post.viewsCount.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        {post.commentsCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {post.readingTime} min
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <Link
                    href={`/dashboard/posts/${post.id}/edit`}
                    className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4 text-secondary" />
                  </Link>
                  <button className="p-2 hover:bg-surface-hover rounded-lg transition-colors text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )

  const renderActivityTab = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold mb-6 text-primary">Recent Activity</h3>
      
      <div className="space-y-4">
        {activities.map(activity => (
          <div key={activity.id} className="glass-card rounded-xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-brand-primary to-purple-500 flex items-center justify-center text-white font-bold">
              {activity.userAvatar}
            </div>
            
            <div className="flex-1">
              {activity.type === 'comment' && (
                <p className="text-primary">
                  <Link href={`/profile/${activity.userName}`} className="font-semibold hover:text-brand-primary">
                    {activity.userName}
                  </Link>
                  <span className="text-secondary"> commented on </span>
                  <Link href="/dashboard/posts/2" className="text-brand-primary hover:text-blue-300">
                    "{activity.postTitle}"
                  </Link>
                </p>
              )}
              
              {activity.type === 'follow' && (
                <p className="text-primary">
                  <Link href={`/profile/${activity.userName}`} className="font-semibold hover:text-brand-primary">
                    {activity.userName}
                  </Link>
                  <span className="text-secondary"> started following you</span>
                </p>
              )}
              
              {activity.type === 'mention' && (
                <p className="text-primary">
                  <Link href={`/profile/${activity.userName}`} className="font-semibold hover:text-brand-primary">
                    {activity.userName}
                  </Link>
                  <span className="text-secondary"> mentioned you in </span>
                  <Link href="/dashboard/posts/3" className="text-brand-primary hover:text-blue-300">
                    "{activity.postTitle}"
                  </Link>
                </p>
              )}
              
              <p className="text-sm text-muted mt-1">{activity.timestamp}</p>
            </div>
            
            <div className="text-2xl">
              {activity.type === 'comment' && <MessageCircle className="w-6 h-6 text-blue-400" />}
              {activity.type === 'follow' && <Users className="w-6 h-6 text-purple-400" />}
              {activity.type === 'mention' && <Bell className="w-6 h-6 text-yellow-400" />}
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  // Show loading state while checking role or loading data
  if (roleLoading || loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)]">
        <ExclusiveHeader />
        <ParticleSystem />
        <div className="container mx-auto px-4 py-8">
          <div className="glass-card p-8 text-center">
            <div className="animate-pulse">
              <div className="h-8 w-3/4 bg-gray-700 rounded mx-auto mb-4"></div>
              <div className="h-4 w-1/2 bg-gray-700 rounded mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Don't render if not a contributor (will redirect)
  if (!isContributor) {
    return null
  }

  return (
    <main className="min-h-screen bg-primary transition-colors duration-500">
      <ParticleSystem />
      <ExclusiveHeader />

      {/* Header */}
      <section className="pt-32 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-orbitron text-3xl sm:text-4xl font-bold mb-2 text-primary">
                Your Dashboard
              </h1>
              <p className="text-lg text-secondary">
                Track your impact and manage your content
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="px-4 py-2 bg-secondary border surface-border rounded-lg text-primary"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-secondary rounded-lg p-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 px-4 py-2 rounded-md font-semibold transition-all ${
                activeTab === 'overview'
                  ? 'bg-tertiary text-primary'
                  : 'text-secondary hover:text-primary'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('posts')}
              className={`flex-1 px-4 py-2 rounded-md font-semibold transition-all ${
                activeTab === 'posts'
                  ? 'bg-tertiary text-primary'
                  : 'text-secondary hover:text-primary'
              }`}
            >
              Posts ({stats.totalPosts})
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex-1 px-4 py-2 rounded-md font-semibold transition-all ${
                activeTab === 'analytics'
                  ? 'bg-tertiary text-primary'
                  : 'text-secondary hover:text-primary'
              }`}
            >
              Analytics
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`flex-1 px-4 py-2 rounded-md font-semibold transition-all relative ${
                activeTab === 'activity'
                  ? 'bg-tertiary text-primary'
                  : 'text-secondary hover:text-primary'
              }`}
            >
              Activity
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="px-4 sm:px-6 lg:px-8 pb-8">
        <div className="max-w-7xl mx-auto">
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'posts' && renderPostsTab()}
          {activeTab === 'activity' && renderActivityTab()}
          {activeTab === 'analytics' && (
            <div className="text-center py-12">
              <BarChart3 className="w-16 h-16 text-muted mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-primary">Advanced Analytics Coming Soon</h3>
              <p className="text-secondary">Detailed insights and performance metrics will be available here</p>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}