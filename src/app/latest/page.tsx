'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import ExclusiveHeader from '@/components/ExclusiveHeader'
import ParticleSystem from '@/components/brand/ParticleSystem'
import { 
  Clock, TrendingUp, Eye, Heart, MessageCircle, Bookmark,
  Filter, RefreshCw, Bell, Zap, Sparkles, ChevronDown,
  Calendar, Hash, User, ArrowUp
} from 'lucide-react'

interface Post {
  id: string
  title: string
  excerpt: string
  content: string
  slug: string
  postType: string
  topicCategory: string
  authorId: string
  authorName: string
  authorTitle: string
  authorAvatar: string
  publishedAt: string
  tags: string[]
  viewsCount: number
  likesCount: number
  commentsCount: number
  readingTime: number
  isNew?: boolean
}

export default function LatestPostsPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [filterTopic, setFilterTopic] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Set<string>>(new Set())
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set())
  const [showNewPostsAlert, setShowNewPostsAlert] = useState(false)
  const [newPostsCount, setNewPostsCount] = useState(0)
  const [page, setPage] = useState(1)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const lastPostRef = useRef<HTMLDivElement | null>(null)

  const topics = [
    { id: 'brand-creative', name: 'Brand & Creative', icon: '🎨' },
    { id: 'growth-performance', name: 'Growth & Performance', icon: '📈' },
    { id: 'content-communications', name: 'Content & Communications', icon: '✍️' },
    { id: 'seo-organic', name: 'SEO & Organic', icon: '🔍' },
    { id: 'ai-automation', name: 'AI & Automation', icon: '🤖' },
    { id: 'web-tech', name: 'Web & Tech', icon: '💻' },
    { id: 'social-community', name: 'Social & Community', icon: '📱' },
    { id: 'sales-strategy', name: 'Sales & Strategy', icon: '🎯' },
    { id: 'careers-culture', name: 'Careers & Culture', icon: '🚀' }
  ]

  const postTypes = [
    { id: 'strategy-reboot', name: 'Strategy Reboot', icon: '🎯' },
    { id: 'tool-reboot', name: 'Tool Reboot', icon: '⚡' },
    { id: 'career-reboot', name: 'Career Reboot', icon: '📈' },
    { id: 'campaign-reboot', name: 'Campaign Reboot', icon: '✨' },
    { id: 'team-reboot', name: 'Team Reboot', icon: '👥' },
    { id: 'mindset-reboot', name: 'Mindset Reboot', icon: '🧠' }
  ]

  // Generate mock posts
  const generateMockPosts = (count: number, startId: number): Post[] => {
    const mockPosts: Post[] = []
    const titles = [
      'How We Increased Conversion Rates by 247% Using AI',
      'The Death of Traditional Marketing: What Comes Next',
      'Building a $10M ARR Business with Zero Paid Ads',
      'Why We Fired Our Agency and Built Everything In-House',
      'The 4-Day Work Week Increased Our Marketing Output by 40%',
      'From 0 to 100K TikTok Followers in 30 Days',
      'The SEO Strategy That Broke Google (In a Good Way)',
      'Why Brand Strategy Beats Growth Hacking Every Time'
    ]

    for (let i = 0; i < count; i++) {
      const topicIndex = Math.floor(Math.random() * topics.length)
      const typeIndex = Math.floor(Math.random() * postTypes.length)
      const hoursAgo = Math.floor(Math.random() * 72) + 1
      
      mockPosts.push({
        id: `post-${startId + i}`,
        title: titles[Math.floor(Math.random() * titles.length)],
        excerpt: 'Discover the groundbreaking strategies that transformed our marketing approach and delivered unprecedented results.',
        content: 'Full content here...',
        slug: `post-${startId + i}-slug`,
        postType: postTypes[typeIndex].id,
        topicCategory: topics[topicIndex].id,
        authorId: `author-${Math.floor(Math.random() * 20)}`,
        authorName: ['Sarah Chen', 'Alex Rivera', 'Jordan Taylor', 'Morgan Lee'][Math.floor(Math.random() * 4)],
        authorTitle: ['VP Marketing', 'Growth Lead', 'CMO', 'Brand Director'][Math.floor(Math.random() * 4)],
        authorAvatar: ['SC', 'AR', 'JT', 'ML'][Math.floor(Math.random() * 4)],
        publishedAt: new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString(),
        tags: ['strategy', 'growth', 'branding', 'analytics', 'ai'].sort(() => 0.5 - Math.random()).slice(0, 3),
        viewsCount: Math.floor(Math.random() * 5000) + 100,
        likesCount: Math.floor(Math.random() * 300) + 10,
        commentsCount: Math.floor(Math.random() * 50) + 1,
        readingTime: Math.floor(Math.random() * 10) + 3,
        isNew: hoursAgo < 2
      })
    }
    
    return mockPosts.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
  }

  // Load initial posts
  useEffect(() => {
    setTimeout(() => {
      const initialPosts = generateMockPosts(10, 0)
      setPosts(initialPosts)
      setFilteredPosts(initialPosts)
      setLoading(false)
    }, 1000)

    // Simulate new posts appearing
    const interval = setInterval(() => {
      setNewPostsCount(prev => prev + Math.floor(Math.random() * 3) + 1)
      setShowNewPostsAlert(true)
    }, 30000) // Every 30 seconds

    return () => clearInterval(interval)
  }, [])

  // Filter posts
  useEffect(() => {
    let filtered = [...posts]
    
    if (filterTopic !== 'all') {
      filtered = filtered.filter(post => post.topicCategory === filterTopic)
    }
    
    if (filterType !== 'all') {
      filtered = filtered.filter(post => post.postType === filterType)
    }
    
    setFilteredPosts(filtered)
  }, [posts, filterTopic, filterType])

  // Infinite scroll
  const loadMorePosts = useCallback(() => {
    if (loadingMore || !hasMore) return
    
    setLoadingMore(true)
    setTimeout(() => {
      const morePosts = generateMockPosts(10, posts.length)
      setPosts(prev => [...prev, ...morePosts])
      setPage(prev => prev + 1)
      setLoadingMore(false)
      
      if (page >= 5) {
        setHasMore(false)
      }
    }, 1000)
  }, [loadingMore, hasMore, posts.length, page])

  // Set up intersection observer
  useEffect(() => {
    if (loading) return

    if (observerRef.current) observerRef.current.disconnect()

    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMorePosts()
      }
    })

    if (lastPostRef.current) {
      observerRef.current.observe(lastPostRef.current)
    }

    return () => {
      if (observerRef.current) observerRef.current.disconnect()
    }
  }, [loading, loadMorePosts, hasMore])

  const handleBookmark = (postId: string) => {
    setBookmarkedPosts(prev => {
      const newSet = new Set(prev)
      if (newSet.has(postId)) {
        newSet.delete(postId)
      } else {
        newSet.add(postId)
      }
      return newSet
    })
  }

  const handleLike = (postId: string) => {
    setLikedPosts(prev => {
      const newSet = new Set(prev)
      if (newSet.has(postId)) {
        newSet.delete(postId)
      } else {
        newSet.add(postId)
      }
      return newSet
    })
  }

  const loadNewPosts = () => {
    const newPosts = generateMockPosts(newPostsCount, -newPostsCount)
    newPosts.forEach(post => post.isNew = true)
    setPosts(prev => [...newPosts, ...prev])
    setNewPostsCount(0)
    setShowNewPostsAlert(false)
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
    
    if (diffHours < 1) return 'Just now'
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffHours < 48) return 'Yesterday'
    return `${Math.floor(diffHours / 24)}d ago`
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <main className="min-h-screen bg-primary">
      <ParticleSystem />
      <ExclusiveHeader />

      {/* Header */}
      <section className="pt-32 pb-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-6 h-6 text-brand-primary animate-pulse" />
            <h1 className="font-orbitron text-3xl sm:text-4xl font-bold gradient-text">
              Latest Marketing Reboots
            </h1>
            <Sparkles className="w-6 h-6 text-brand-primary animate-pulse" />
          </div>
          <p className="text-lg text-secondary">
            Fresh insights and breakthrough strategies from the community
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="sticky top-20 z-40 bg-primary/95 backdrop-blur-lg border-b surface-border px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-secondary hover:surface-hover rounded-lg transition-colors text-primary"
              >
                <Filter className="w-4 h-4" />
                Filters
                <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
              
              <div className="flex items-center gap-2 text-sm text-muted">
                <Clock className="w-4 h-4" />
                <span>Real-time feed</span>
              </div>
            </div>

            <button
              onClick={() => window.location.reload()}
              className="p-2 hover:surface-hover rounded-lg transition-colors text-secondary"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">Topic</label>
                <select
                  value={filterTopic}
                  onChange={(e) => setFilterTopic(e.target.value)}
                  className="w-full p-2 bg-secondary border surface-border rounded-lg text-primary focus:border-brand-primary focus:outline-none"
                >
                  <option value="all">All Topics</option>
                  {topics.map(topic => (
                    <option key={topic.id} value={topic.id}>
                      {topic.icon} {topic.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">Post Type</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full p-2 bg-secondary border surface-border rounded-lg text-primary focus:border-brand-primary focus:outline-none"
                >
                  <option value="all">All Types</option>
                  {postTypes.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.icon} {type.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* New Posts Alert */}
      {showNewPostsAlert && (
        <div className="fixed top-32 left-1/2 transform -translate-x-1/2 z-50">
          <button
            onClick={loadNewPosts}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-400 to-green-500 text-white rounded-full font-semibold hover:from-green-500 hover:to-green-600 transition-all duration-300 animate-bounce shadow-lg"
          >
            <Bell className="w-4 h-4" />
            {newPostsCount} new post{newPostsCount > 1 ? 's' : ''} available
          </button>
        </div>
      )}

      {/* Posts Feed */}
      <section className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          {loading ? (
            <div className="text-center py-12">
              <div className="text-muted">Loading latest posts...</div>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted text-lg">No posts match your filters.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredPosts.map((post, index) => {
                const topic = topics.find(t => t.id === post.topicCategory)
                const type = postTypes.find(t => t.id === post.postType)
                const isLastPost = index === filteredPosts.length - 1
                
                return (
                  <div
                    key={post.id}
                    ref={isLastPost ? lastPostRef : null}
                    className={`post-card p-6 transition-all duration-300 ${
                      post.isNew ? 'border-green-500/50 animate-pulse' : 'hover:border-brand-primary'
                    }`}
                  >
                    {post.isNew && (
                      <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold mb-3">
                        <Zap className="w-3 h-3" />
                        NEW
                      </div>
                    )}
                    
                    <div className="flex items-start gap-4">
                      <Link href={`/profile/${post.authorId}`} className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                          {post.authorAvatar}
                        </div>
                      </Link>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <Link href={`/profile/${post.authorId}`} className="font-semibold text-primary hover:text-brand-primary transition-colors">
                              {post.authorName}
                            </Link>
                            <span className="text-muted text-sm"> · {post.authorTitle}</span>
                            <span className="text-muted text-sm"> · {formatTimeAgo(post.publishedAt)}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {topic && (
                              <Link href={`/topic/${topic.id}`} className="text-sm">
                                {topic.icon}
                              </Link>
                            )}
                            {type && (
                              <span className="text-xs px-2 py-1 bg-secondary rounded-full text-muted">
                                {type.icon} {type.name}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <Link href={`/post/${post.slug}`}>
                          <h2 className="text-xl font-bold mb-2 text-primary hover:text-brand-primary transition-colors">
                            {post.title}
                          </h2>
                        </Link>
                        
                        <p className="text-secondary mb-3">
                          {post.excerpt}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-muted">
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {post.readingTime} min read
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              {post.viewsCount.toLocaleString()}
                            </span>
                            <button
                              onClick={() => handleLike(post.id)}
                              className={`flex items-center gap-1 hover:text-red-400 transition-colors ${
                                likedPosts.has(post.id) ? 'text-red-400' : ''
                              }`}
                            >
                              <Heart className={`w-4 h-4 ${likedPosts.has(post.id) ? 'fill-current' : ''}`} />
                              {post.likesCount + (likedPosts.has(post.id) ? 1 : 0)}
                            </button>
                            <span className="flex items-center gap-1">
                              <MessageCircle className="w-4 h-4" />
                              {post.commentsCount}
                            </span>
                          </div>
                          
                          <button
                            onClick={() => handleBookmark(post.id)}
                            className={`p-2 hover:surface-hover rounded-lg transition-colors ${
                              bookmarkedPosts.has(post.id) ? 'text-yellow-400' : 'text-muted'
                            }`}
                          >
                            <Bookmark className={`w-5 h-5 ${bookmarkedPosts.has(post.id) ? 'fill-current' : ''}`} />
                          </button>
                        </div>
                        
                        {post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {post.tags.map((tag, idx) => (
                              <span key={idx} className="text-xs text-muted">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
              
              {loadingMore && (
                <div className="text-center py-8">
                  <div className="text-muted">Loading more posts...</div>
                </div>
              )}
              
              {!hasMore && (
                <div className="text-center py-8">
                  <p className="text-muted mb-4">You've reached the end!</p>
                  <button
                    onClick={scrollToTop}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-secondary hover:surface-hover rounded-lg transition-colors text-primary"
                  >
                    <ArrowUp className="w-4 h-4" />
                    Back to top
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Scroll to Top */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 p-3 bg-brand-primary text-white rounded-full hover:bg-brand-secondary transition-colors shadow-lg z-40"
      >
        <ArrowUp className="w-5 h-5" />
      </button>
    </main>
  )
}