'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import ExclusiveHeader from '@/components/ExclusiveHeader'
import ParticleSystem from '@/components/brand/ParticleSystem'
import { 
  Search, TrendingUp, Users, Eye, Clock, 
  ArrowRight, Filter, Grid, List,
  Palette, PenTool, Cpu, Globe, Target, Rocket,
  BarChart3, Hash
} from 'lucide-react'

interface TopicStats {
  posts: number
  contributors: number
  weeklyPosts: number
  totalViews: number
}

export default function TopicsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [topicStats, setTopicStats] = useState<Record<string, TopicStats>>({})
  const [sortBy, setSortBy] = useState<'popular' | 'recent' | 'alphabetical'>('popular')

  const topics = [
    {
      id: 'brand-creative',
      icon: Palette,
      title: 'Brand & Creative',
      description: 'Transform your brand identity, design systems, and creative storytelling',
      subtopics: ['Branding Strategy', 'Design & UX', 'Storytelling', 'Visual Identity'],
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      id: 'growth-performance',
      icon: TrendingUp,
      title: 'Growth & Performance',
      description: 'Scale your business with data-driven growth strategies and optimization',
      subtopics: ['Paid Media (Meta, Google)', 'Conversion Rate Optimization', 'Funnels & Landing Pages', 'Analytics & Attribution'],
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'content-communications',
      icon: PenTool,
      title: 'Content & Communications',
      description: 'Master content strategy, copywriting, and multi-channel communications',
      subtopics: ['Content Strategy', 'Copywriting & Messaging', 'Email Marketing & CRM', 'Influencer & Affiliate'],
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      id: 'seo-organic',
      icon: Search,
      title: 'SEO & Organic Discovery',
      description: 'Dominate search results and organic channels with proven SEO tactics',
      subtopics: ['Technical SEO', 'On-Page & Off-Page SEO', 'Keyword Strategy', 'Local & Voice Search'],
      gradient: 'from-orange-500 to-red-500'
    },
    {
      id: 'ai-automation',
      icon: Cpu,
      title: 'AI & Automation',
      description: 'Leverage AI and automation to revolutionize your marketing operations',
      subtopics: ['AI Tools & Use Cases', 'Marketing Automation', 'Predictive Analytics', 'Personalization at Scale'],
      gradient: 'from-indigo-500 to-purple-500'
    },
    {
      id: 'web-tech',
      icon: Globe,
      title: 'Web & Tech',
      description: 'Build powerful web experiences and master marketing technology',
      subtopics: ['Web Design & Dev', 'Martech Stack Reviews', 'Platforms (CDPs, ESPs, CMS)', 'Tracking & Tagging'],
      gradient: 'from-teal-500 to-blue-500'
    },
    {
      id: 'social-community',
      icon: Users,
      title: 'Social & Community',
      description: 'Build engaged communities and master social media marketing',
      subtopics: ['Social Strategy (TikTok, IG, LinkedIn)', 'Trends & Memes', 'UGC & Community Building', 'Platform Best Practices'],
      gradient: 'from-pink-500 to-rose-500'
    },
    {
      id: 'sales-strategy',
      icon: Target,
      title: 'Sales & Strategy',
      description: 'Align sales and marketing for explosive business growth',
      subtopics: ['Sales Enablement', 'Demand Generation', 'Go-to-Market Planning', 'B2B/B2C Strategy'],
      gradient: 'from-violet-500 to-purple-500'
    },
    {
      id: 'careers-culture',
      icon: Rocket,
      title: 'Careers & Culture',
      description: 'Navigate your marketing career and build high-performing teams',
      subtopics: ['Behind-the-Scenes', 'Interviews with Pros', 'Career Paths & Leadership', 'Remote Work & Burnout'],
      gradient: 'from-cyan-500 to-blue-500'
    }
  ]

  useEffect(() => {
    loadTopicStats()
  }, [])

  const loadTopicStats = () => {
    // In production, this would be an API call
    // For now, we'll generate some mock stats
    const mockStats: Record<string, TopicStats> = {}
    
    topics.forEach(topic => {
      mockStats[topic.id] = {
        posts: Math.floor(Math.random() * 200) + 50,
        contributors: Math.floor(Math.random() * 50) + 10,
        weeklyPosts: Math.floor(Math.random() * 20) + 5,
        totalViews: Math.floor(Math.random() * 50000) + 10000
      }
    })
    
    setTopicStats(mockStats)
  }

  // Filter topics based on search
  const filteredTopics = topics.filter(topic => {
    const search = searchTerm.toLowerCase()
    return (
      topic.title.toLowerCase().includes(search) ||
      topic.description.toLowerCase().includes(search) ||
      topic.subtopics.some(subtopic => subtopic.toLowerCase().includes(search))
    )
  })

  // Sort topics
  const sortedTopics = [...filteredTopics].sort((a, b) => {
    const statsA = topicStats[a.id] || { posts: 0, totalViews: 0 }
    const statsB = topicStats[b.id] || { posts: 0, totalViews: 0 }
    
    switch (sortBy) {
      case 'popular':
        return statsB.totalViews - statsA.totalViews
      case 'recent':
        return statsB.posts - statsA.posts
      case 'alphabetical':
        return a.title.localeCompare(b.title)
      default:
        return 0
    }
  })

  const totalStats = {
    posts: Object.values(topicStats).reduce((sum, stats) => sum + stats.posts, 0),
    contributors: Object.values(topicStats).reduce((sum, stats) => sum + stats.contributors, 0),
    weeklyPosts: Object.values(topicStats).reduce((sum, stats) => sum + stats.weeklyPosts, 0),
    totalViews: Object.values(topicStats).reduce((sum, stats) => sum + stats.totalViews, 0)
  }

  return (
    <main className="min-h-screen bg-primary">
      <ParticleSystem />
      <ExclusiveHeader />
      
      {/* Hero Section */}
      <section className="pt-32 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-8">
            <h1 className="font-orbitron text-4xl sm:text-5xl font-bold mb-4 gradient-text">
              Explore Marketing Topics
            </h1>
            <p className="text-xl text-secondary max-w-3xl mx-auto">
              Deep dive into the marketing disciplines that matter most. Find breakthrough strategies, 
              connect with experts, and share your own reboots.
            </p>
          </div>
          
          {/* Global Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="glass-card text-center">
              <div className="font-orbitron text-2xl font-bold text-brand-tertiary">
                {totalStats.posts.toLocaleString()}
              </div>
              <div className="text-sm text-muted">Total Posts</div>
            </div>
            <div className="glass-card text-center">
              <div className="font-orbitron text-2xl font-bold text-brand-secondary">
                {totalStats.contributors.toLocaleString()}
              </div>
              <div className="text-sm text-muted">Contributors</div>
            </div>
            <div className="glass-card text-center">
              <div className="font-orbitron text-2xl font-bold text-brand-purple">
                +{totalStats.weeklyPosts}
              </div>
              <div className="text-sm text-muted">This Week</div>
            </div>
            <div className="glass-card text-center">
              <div className="font-orbitron text-2xl font-bold text-brand-tertiary">
                {(totalStats.totalViews / 1000).toFixed(1)}K
              </div>
              <div className="text-sm text-muted">Total Views</div>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Controls */}
      <section className="sticky top-20 z-30 bg-primary/95 backdrop-blur-lg border-b surface-border px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted" />
              <input
                type="text"
                placeholder="Search topics, subtopics..."
                className="w-full pl-10 pr-4 py-2 bg-secondary border surface-border rounded-lg text-primary placeholder-muted focus:border-brand-primary focus:outline-none transition-colors"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 bg-secondary border surface-border rounded-lg text-primary focus:border-brand-primary focus:outline-none transition-colors"
              >
                <option value="popular">Most Popular</option>
                <option value="recent">Most Active</option>
                <option value="alphabetical">A-Z</option>
              </select>
              
              <div className="flex bg-secondary rounded-lg border surface-border">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-tertiary text-primary' : 'text-muted'} transition-colors rounded-l-lg`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-tertiary text-primary' : 'text-muted'} transition-colors rounded-r-lg`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Topics Grid/List */}
      <section className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto relative z-10">
          {sortedTopics.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted text-lg">No topics match your search.</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedTopics.map((topic) => {
                const stats = topicStats[topic.id] || { posts: 0, contributors: 0, weeklyPosts: 0, totalViews: 0 }
                const Icon = topic.icon
                return (
                  <Link key={topic.id} href={`/topic/${topic.id}`}>
                    <div className="glass-card hover:scale-105 transition-all duration-300 group cursor-pointer h-full hover:border-brand-primary">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${topic.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                          <Icon className="w-7 h-7 text-white" />
                        </div>
                        <ArrowRight className="w-5 h-5 text-muted group-hover:text-brand-primary group-hover:translate-x-1 transition-all" />
                      </div>
                      
                      <h3 className={`font-orbitron text-xl font-bold mb-2 bg-gradient-to-r ${topic.gradient} bg-clip-text text-transparent`}>
                        {topic.title}
                      </h3>
                      
                      <p className="text-sm text-secondary mb-4 line-clamp-2">
                        {topic.description}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        <div className="text-center p-2 bg-secondary rounded-lg">
                          <div className="font-semibold text-primary">{stats.posts}</div>
                          <div className="text-xs text-muted">Posts</div>
                        </div>
                        <div className="text-center p-2 bg-secondary rounded-lg">
                          <div className="font-semibold text-primary">{stats.contributors}</div>
                          <div className="text-xs text-muted">Contributors</div>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        {topic.subtopics.slice(0, 3).map((subtopic, idx) => (
                          <div key={idx} className="text-xs text-muted flex items-center">
                            <span className="text-brand-primary mr-2">→</span>
                            {subtopic}
                          </div>
                        ))}
                        {topic.subtopics.length > 3 && (
                          <div className="text-xs text-muted">
                            +{topic.subtopics.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="space-y-4">
              {sortedTopics.map((topic) => {
                const stats = topicStats[topic.id] || { posts: 0, contributors: 0, weeklyPosts: 0, totalViews: 0 }
                const Icon = topic.icon
                return (
                  <Link key={topic.id} href={`/topic/${topic.id}`}>
                    <div className="glass-card hover:border-brand-primary transition-all duration-300 group cursor-pointer">
                      <div className="flex items-start gap-6">
                        <div className={`w-20 h-20 rounded-xl bg-gradient-to-br ${topic.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                          <Icon className="w-10 h-10 text-white" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className={`font-orbitron text-2xl font-bold mb-1 bg-gradient-to-r ${topic.gradient} bg-clip-text text-transparent`}>
                                {topic.title}
                              </h3>
                              <p className="text-secondary">
                                {topic.description}
                              </p>
                            </div>
                            <ArrowRight className="w-6 h-6 text-muted group-hover:text-brand-primary group-hover:translate-x-1 transition-all" />
                          </div>
                          
                          <div className="flex items-center gap-6 mb-4 text-sm">
                            <span className="flex items-center gap-2 text-muted">
                              <TrendingUp className="w-4 h-4" />
                              {stats.posts} posts
                            </span>
                            <span className="flex items-center gap-2 text-muted">
                              <Users className="w-4 h-4" />
                              {stats.contributors} contributors
                            </span>
                            <span className="flex items-center gap-2 text-muted">
                              <Eye className="w-4 h-4" />
                              {(stats.totalViews / 1000).toFixed(1)}k views
                            </span>
                            <span className="flex items-center gap-2 text-brand-tertiary">
                              <Clock className="w-4 h-4" />
                              +{stats.weeklyPosts} this week
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap gap-2">
                            {topic.subtopics.map((subtopic, idx) => (
                              <span key={idx} className="px-3 py-1 bg-secondary rounded-full text-xs text-secondary">
                                {subtopic}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="glass-card">
            <h2 className="font-orbitron text-2xl font-bold mb-4 text-primary">
              Don't See Your Topic?
            </h2>
            <p className="text-secondary mb-6">
              We're always looking to expand our topics based on community needs. 
              Have a specific area of marketing you'd like to explore?
            </p>
            <button className="btn-primary">
              Suggest a New Topic
            </button>
          </div>
        </div>
      </section>
    </main>
  )
}