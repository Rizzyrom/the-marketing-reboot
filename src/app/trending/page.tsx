'use client'
import { useState, useEffect } from 'react'
import ExclusiveHeader from '@/components/ExclusiveHeader'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Post, Profile } from '@/lib/supabase'
import { 
  TrendingUp, Users, Clock, Eye, MessageCircle, Heart,
  Flame, ArrowUpRight, Award, Activity, BarChart3,
  Sparkles, Zap, Target, Trophy, Calendar
} from 'lucide-react'

type TimeFilter = 'week' | 'month' | 'all'

interface TrendingPost extends Post {
  trending_score: number
  author_profile?: Profile
}

interface TrendingTopic {
  name: string
  count: number
  growth: number
  icon: React.ReactNode
}

interface RisingContributor extends Profile {
  posts_count: number
  total_likes: number
  growth_rate: number
}

export default function TrendingPage() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('week')
  const [hotPosts, setHotPosts] = useState<TrendingPost[]>([])
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([])
  const [risingContributors, setRisingContributors] = useState<RisingContributor[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTrendingData()
  }, [timeFilter])

  const loadTrendingData = async () => {
    setLoading(true)
    try {
      await Promise.all([
        loadHotPosts(),
        loadTrendingTopics(),
        loadRisingContributors()
      ])
    } catch (error) {
      console.error('Error loading trending data:', error)
    }
    setLoading(false)
  }

  const loadHotPosts = async () => {
    // Calculate date range based on filter
    const now = new Date()
    let startDate = new Date()
    
    if (timeFilter === 'week') {
      startDate.setDate(now.getDate() - 7)
    } else if (timeFilter === 'month') {
      startDate.setMonth(now.getMonth() - 1)
    } else {
      startDate.setFullYear(2020) // All time
    }

    // Fetch posts with engagement metrics
    const { data: posts, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles:author_id (
          id,
          username,
          full_name,
          avatar_url,
          company,
          job_title
        )
      `)
      .eq('published', true)
      .gte('created_at', startDate.toISOString())
      .order('likes_count', { ascending: false })
      .limit(20)

    if (error) {
      console.error('Error loading posts:', error)
      return
    }

    // Calculate trending score (likes + comments + recency factor)
    const scoredPosts = posts?.map(post => {
      const ageInHours = (Date.now() - new Date(post.created_at).getTime()) / (1000 * 60 * 60)
      const recencyFactor = Math.max(1, 24 / (ageInHours + 1)) // Boost recent posts
      const engagementScore = (post.likes_count * 2) + (post.comments_count * 3) + (post.views_count * 0.1)
      const trending_score = engagementScore * recencyFactor

      return {
        ...post,
        trending_score,
        author_profile: post.profiles
      }
    }) || []

    // Sort by trending score
    scoredPosts.sort((a, b) => b.trending_score - a.trending_score)

    setHotPosts(scoredPosts.slice(0, 10))
  }

  const loadTrendingTopics = async () => {
    // In a real app, you'd calculate this from posts data
    // For now, using mock data with realistic trends
    const topics: TrendingTopic[] = [
      { name: 'AI & Automation', count: 234, growth: 45, icon: <Zap className="w-6 h-6" /> },
      { name: 'Performance Marketing', count: 189, growth: 32, icon: <BarChart3 className="w-6 h-6" /> },
      { name: 'Brand Strategy', count: 156, growth: 28, icon: <Award className="w-6 h-6" /> },
      { name: 'Content Marketing', count: 143, growth: 22, icon: <MessageCircle className="w-6 h-6" /> },
      { name: 'Social Media', count: 128, growth: 18, icon: <Users className="w-6 h-6" /> },
    ]
    setTrendingTopics(topics)
  }

  const loadRisingContributors = async () => {
    // Fetch contributors with recent activity
    const { data: contributors, error } = await supabase
      .from('profiles')
      .select(`
        *,
        posts:posts(count)
      `)
      .eq('profile_public', true)
      .limit(5)

    if (error) {
      console.error('Error loading contributors:', error)
      return
    }

    // Mock growth rates for demo
    const risingUsers = contributors?.map(contributor => ({
      ...contributor,
      posts_count: contributor.posts?.[0]?.count || 0,
      total_likes: Math.floor(Math.random() * 1000) + 100,
      growth_rate: Math.floor(Math.random() * 80) + 20
    })) || []

    setRisingContributors(risingUsers)
  }

  const formatTimeAgo = (date: string) => {
    const hours = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60))
    if (hours < 1) return 'just now'
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days}d ago`
    return new Date(date).toLocaleDateString()
  }

  return (
    <main className="min-h-screen bg-midnight">
      <ExclusiveHeader />
      
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="font-space text-3xl sm:text-4xl font-bold mb-4">
            <span className="gradient-text animate-gradient">Trending</span>
          </h1>
          <p className="text-text-secondary text-lg">
            Discover what's hot in the marketing world right now
          </p>
        </div>

        {/* Time Filter */}
        <div className="flex gap-2 mb-8">
          {(['week', 'month', 'all'] as TimeFilter[]).map(filter => (
            <button
              key={filter}
              onClick={() => setTimeFilter(filter)}
              className={`px-4 py-2 rounded-full font-semibold transition-all ${
                timeFilter === filter
                  ? 'btn-glow'
                  : 'glass-bg text-text-secondary hover:text-white hover:border-cyber-lime/40'
              }`}
            >
              {filter === 'week' ? 'This Week' : filter === 'month' ? 'This Month' : 'All Time'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyber-lime"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Hot Posts - Left Column (2/3 width) */}
            <div className="lg:col-span-2 space-y-6">
              <div className="glass-bg rounded-2xl p-6 border border-glass-border">
                <h2 className="font-space text-xl font-bold mb-6 flex items-center gap-2">
                  <Flame className="w-6 h-6 text-orange-400" />
                  Hot Posts
                </h2>
                
                <div className="space-y-4">
                  {hotPosts.map((post, index) => (
                    <Link key={post.id} href={`/post/${post.slug || post.id}`}>
                      <article className="group hover:bg-white/5 rounded-xl p-4 transition-all cursor-pointer hover-lift">
                        <div className="flex items-start gap-4">
                          {/* Rank */}
                          <div className="font-mono text-2xl font-bold text-cyber-lime min-w-[40px]">
                            #{index + 1}
                          </div>
                          
                          {/* Content */}
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-2 group-hover:text-electric-blue transition-colors">
                              {post.title}
                            </h3>
                            
                            {/* Author */}
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-neon-purple to-electric-blue flex items-center justify-center text-sm font-bold group-hover:shadow-glow transition-all">
                                {post.author_profile?.full_name?.charAt(0) || 'A'}
                              </div>
                              <div className="text-sm">
                                <div className="font-semibold">{post.author_profile?.full_name || 'Anonymous'}</div>
                                <div className="text-text-secondary">
                                  {post.author_profile?.job_title} {post.author_profile?.company && `@ ${post.author_profile.company}`}
                                </div>
                              </div>
                              <span className="text-sm text-text-secondary ml-auto">
                                {formatTimeAgo(post.created_at)}
                              </span>
                            </div>
                            
                            {/* Excerpt */}
                            <p className="text-text-secondary text-sm mb-3 line-clamp-2">
                              {post.excerpt}
                            </p>
                            
                            {/* Engagement */}
                            <div className="flex items-center gap-6 text-sm text-text-secondary">
                              <span className="flex items-center gap-1 hover:text-cyber-lime transition-colors">
                                <Heart className="w-4 h-4" />
                                {post.likes_count} likes
                              </span>
                              <span className="flex items-center gap-1 hover:text-electric-blue transition-colors">
                                <MessageCircle className="w-4 h-4" />
                                {post.comments_count} comments
                              </span>
                              <span className="flex items-center gap-1 hover:text-neon-purple transition-colors">
                                <Eye className="w-4 h-4" />
                                {post.views_count} views
                              </span>
                              <div className="ml-auto flex items-center gap-1 text-cyber-lime font-semibold">
                                <TrendingUp className="w-4 h-4" />
                                {Math.round(post.trending_score)} pts
                              </div>
                            </div>
                          </div>
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Trending Topics */}
              <div className="glass-bg rounded-2xl p-6 border border-glass-border">
                <h2 className="font-space text-xl font-bold mb-6 flex items-center gap-2">
                  <Activity className="w-6 h-6 text-electric-blue" />
                  Trending Topics
                </h2>
                
                <div className="space-y-3">
                  {trendingTopics.map((topic, index) => (
                    <Link key={topic.name} href={`/topic/${topic.name.toLowerCase().replace(/\s+/g, '-')}`}>
                      <div className="group hover:bg-white/5 rounded-lg p-3 transition-all cursor-pointer hover-lift">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-electric-blue">{topic.icon}</span>
                            <span className="font-semibold group-hover:text-electric-blue transition-colors">
                              {topic.name}
                            </span>
                          </div>
                          <span className="text-sm text-cyber-lime font-mono">
                            +{topic.growth}%
                          </span>
                        </div>
                        <div className="text-sm text-text-secondary">
                          {topic.count} posts this {timeFilter}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Rising Contributors */}
              <div className="glass-bg rounded-2xl p-6 border border-glass-border">
                <h2 className="font-space text-xl font-bold mb-6 flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-neon-purple" />
                  Rising Contributors
                </h2>
                
                <div className="space-y-4">
                  {risingContributors.map((contributor) => (
                    <Link key={contributor.id} href={`/profile/${contributor.username}`}>
                      <div className="group hover:bg-white/5 rounded-lg p-3 transition-all cursor-pointer hover-lift">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-neon-purple to-electric-blue flex items-center justify-center font-bold group-hover:shadow-glow transition-all">
                            {contributor.full_name?.charAt(0) || 'U'}
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold group-hover:text-electric-blue transition-colors">
                              {contributor.full_name}
                            </div>
                            <div className="text-sm text-text-secondary">
                              {contributor.job_title} {contributor.company && `@ ${contributor.company}`}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold text-cyber-lime font-mono">
                              +{contributor.growth_rate}%
                            </div>
                            <div className="text-xs text-text-secondary">
                              growth
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-xs text-text-secondary">
                          <span>{contributor.posts_count} posts</span>
                          <span>{contributor.total_likes} likes</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Live Activity Widget */}
      <div className="fixed bottom-8 right-8 glass-bg rounded-2xl p-4 border border-glass-border z-40 hidden lg:block hover:scale-105 transition-transform hover:border-cyber-lime/50 cursor-pointer group hover:shadow-glow">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 bg-cyber-lime rounded-full animate-pulse"></div>
          <span className="text-sm font-semibold">Trending Now</span>
          <Zap className="w-3 h-3 text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <div className="space-y-2 text-xs text-text-secondary">
          <div className="flex items-center gap-2 hover:text-cyber-lime transition-colors">
            <TrendingUp className="w-3 h-3 text-cyber-lime" />
            <span>{hotPosts.length} hot posts</span>
          </div>
          <div className="flex items-center gap-2 hover:text-electric-blue transition-colors">
            <Award className="w-3 h-3 text-electric-blue" />
            <span>{trendingTopics[0]?.name} trending</span>
          </div>
          <div className="flex items-center gap-2 hover:text-neon-purple transition-colors">
            <Users className="w-3 h-3 text-neon-purple" />
            <span>{risingContributors.length} rising stars</span>
          </div>
        </div>
      </div>
    </main>
  )
}