'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import ExclusiveHeader from '@/components/ExclusiveHeader'
import ParticleSystem from '@/components/brand/ParticleSystem'
import { 
  TrendingUp, Eye, Heart, MessageCircle, Users, FileText,
  BarChart3, Calendar, Bell, Settings, Plus, Edit2, Trash2,
  Clock, ArrowUp, ArrowDown, Award, Zap, Target, 
  BookOpen, Share2, Star, CheckCircle, AlertCircle,
  PieChart, Activity, Bookmark, Mail, ArrowRight
} from 'lucide-react'

interface DashboardStats {
  totalPosts: number
  totalViews: number
  totalLikes: number
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
  likesCount: number
  commentsCount: number
  topicCategory: string
  readingTime: number
}

interface Activity {
  id: string
  type: 'like' | 'comment' | 'follow' | 'mention'
  userName: string
  userAvatar: string
  postTitle?: string
  timestamp: string
}

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  unlockedAt?: string
  progress?: number
  target?: number
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'posts' | 'analytics' | 'activity'>('overview')
  const [stats, setStats] = useState<DashboardStats>({
    totalPosts: 24,
    totalViews: 48392,
    totalLikes: 2847,
    totalComments: 523,
    followers: 1249,
    following: 387,
    drafts: 3,
    bookmarks: 67
  })
  const [posts, setPosts] = useState<Post[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
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
          likesCount: 892,
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
          likesCount: 674,
          commentsCount: 89,
          topicCategory: 'growth-performance',
          readingTime: 12
        },
        {
          id: '3',
          title: 'Building a Brand That Resonates: Our Journey',
          status: 'draft',
          viewsCount: 0,
          likesCount: 0,
          commentsCount: 0,
          topicCategory: 'brand-creative',
          readingTime: 10
        }
      ])

      // Load activities
      setActivities([
        {
          id: '1',
          type: 'like',
          userName: 'Sarah Chen',
          userAvatar: 'SC',
          postTitle: 'How We Increased Conversion Rates by 247% Using AI',
          timestamp: '2 hours ago'
        },
        {
          id: '2',
          type: 'comment',
          userName: 'Alex Rivera',
          userAvatar: 'AR',
          postTitle: 'The Complete Guide to Growth Marketing in 2024',
          timestamp: '5 hours ago'
        },
        {
          id: '3',
          type: 'follow',
          userName: 'Jordan Taylor',
          userAvatar: 'JT',
          timestamp: '1 day ago'
        },
        {
          id: '4',
          type: 'mention',
          userName: 'Morgan Lee',
          userAvatar: 'ML',
          postTitle: 'Best Marketing Tools of 2024',
          timestamp: '2 days ago'
        }
      ])

      // Load achievements
      setAchievements([
        {
          id: '1',
          name: 'First Post',
          description: 'Published your first reboot',
          icon: '🚀',
          unlockedAt: '2024-01-15'
        },
        {
          id: '2',
          name: 'Viral Post',
          description: 'Get 10,000+ views on a single post',
          icon: '🔥',
          unlockedAt: '2024-03-15'
        },
        {
          id: '3',
          name: 'Community Leader',
          description: 'Reach 1,000 followers',
          icon: '👑',
          unlockedAt: '2024-03-20'
        },
        {
          id: '4',
          name: 'Consistent Creator',
          description: 'Post every week for a month',
          icon: '⚡',
          progress: 3,
          target: 4
        },
        {
          id: '5',
          name: 'Expert Contributor',
          description: 'Publish 50 posts',
          icon: '🎯',
          progress: 24,
          target: 50
        }
      ])

      setLoading(false)
    }, 1000)
  }, [])

  const getTopicIcon = (topicId: string) => {
    const topics: Record<string, string> = {
      'brand-creative': '🎨',
      'growth-performance': '📈',
      'content-communications': '✍️',
      'seo-organic': '🔍',
      'ai-automation': '🤖',
      'web-tech': '💻',
      'social-community': '📱',
      'sales-strategy': '🎯',
      'careers-culture': '🚀'
    }
    return topics[topicId] || '📝'
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
            <Heart className="w-8 h-8 text-red-400" />
            <span className="text-xs text-green-400 flex items-center gap-1">
              <ArrowUp className="w-3 h-3" />
              +8.3%
            </span>
          </div>
          <div className="font-orbitron text-3xl font-bold mb-1 text-primary">
            {stats.totalLikes.toLocaleString()}
          </div>
          <div className="text-sm text-muted">Total Likes</div>
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
            <Link href="/post/ai-conversion-rates" className="font-semibold hover:text-brand-primary transition-colors text-primary">
              How We Increased Conversion Rates by 247% Using AI
            </Link>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted">
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                12.8K
              </span>
              <span className="flex items-center gap-1">
                <Heart className="w-3 h-3" />
                892
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

      {/* Achievements */}
      <div className="glass-card rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-primary">
          <Award className="w-5 h-5" />
          Achievements
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {achievements.map(achievement => (
            <div
              key={achievement.id}
              className={`text-center p-4 rounded-lg transition-all ${
                achievement.unlockedAt
                  ? 'bg-tertiary hover:surface-hover'
                  : 'bg-tertiary opacity-50'
              }`}
            >
              <div className="text-3xl mb-2">{achievement.icon}</div>
              <div className="text-sm font-semibold text-primary">{achievement.name}</div>
              {achievement.progress && achievement.target && (
                <div className="mt-2">
                  <div className="w-full bg-surface-border rounded-full h-2">
                    <div
                      className="bg-green-400 h-2 rounded-full"
                      style={{ width: `${(achievement.progress / achievement.target) * 100}%` }}
                    />
                  </div>
                  <div className="text-xs text-muted mt-1">
                    {achievement.progress}/{achievement.target}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/post/new" className="glass-card rounded-xl p-6 hover:border-brand-primary transition-all group">
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
          href="/post/new"
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Post
        </Link>
      </div>

      <div className="space-y-4">
        {posts.map(post => (
          <div key={post.id} className="glass-card rounded-xl p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{getTopicIcon(post.topicCategory)}</span>
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
                      <Heart className="w-4 h-4" />
                      {post.likesCount}
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
                  href={`/post/${post.id}/edit`}
                  className="p-2 hover:surface-hover rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4 text-secondary" />
                </Link>
                <button className="p-2 hover:surface-hover rounded-lg transition-colors text-red-400">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
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
              {activity.type === 'like' && (
                <p className="text-primary">
                  <Link href={`/profile/${activity.userName}`} className="font-semibold hover:text-brand-primary">
                    {activity.userName}
                  </Link>
                  <span className="text-secondary"> liked your post </span>
                  <Link href="/post/1" className="text-brand-primary hover:text-blue-300">
                    "{activity.postTitle}"
                  </Link>
                </p>
              )}
              
              {activity.type === 'comment' && (
                <p className="text-primary">
                  <Link href={`/profile/${activity.userName}`} className="font-semibold hover:text-brand-primary">
                    {activity.userName}
                  </Link>
                  <span className="text-secondary"> commented on </span>
                  <Link href="/post/2" className="text-brand-primary hover:text-blue-300">
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
                  <Link href="/post/3" className="text-brand-primary hover:text-blue-300">
                    "{activity.postTitle}"
                  </Link>
                </p>
              )}
              
              <p className="text-sm text-muted mt-1">{activity.timestamp}</p>
            </div>
            
            <div className="text-2xl">
              {activity.type === 'like' && '❤️'}
              {activity.type === 'comment' && '💬'}
              {activity.type === 'follow' && '👤'}
              {activity.type === 'mention' && '🔔'}
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="text-secondary">Loading dashboard...</div>
      </div>
    )
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