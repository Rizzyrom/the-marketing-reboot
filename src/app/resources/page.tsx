'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import ExclusiveHeader from '@/components/ExclusiveHeader'
import ParticleSystem from '@/components/brand/ParticleSystem'
import { 
  Search, Filter, Download, ExternalLink, Star, 
  BookOpen, FileText, Video, Mic, Package,
  TrendingUp, Clock, Grid, List, ChevronRight,
  Zap, Users, BarChart3, CheckCircle
} from 'lucide-react'

interface Resource {
  id: string
  title: string
  description: string
  type: 'guide' | 'tool' | 'template' | 'course' | 'podcast' | 'ebook'
  category: string
  author: string
  authorRole: string
  downloads: number
  rating: number
  featured: boolean
  url?: string
  fileSize?: string
  duration?: string
  lastUpdated: string
  tags: string[]
  preview?: string
}

export default function ResourcesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<'popular' | 'recent' | 'rating'>('popular')
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)

  const resourceTypes = [
    { id: 'all', label: 'All Resources', icon: Package },
    { id: 'guide', label: 'Guides', icon: BookOpen },
    { id: 'tool', label: 'Tools', icon: Zap },
    { id: 'template', label: 'Templates', icon: FileText },
    { id: 'course', label: 'Courses', icon: Video },
    { id: 'podcast', label: 'Podcasts', icon: Mic },
    { id: 'ebook', label: 'eBooks', icon: BookOpen }
  ]

  const categories = [
    'all',
    'Growth & Performance',
    'Brand & Creative',
    'Content Strategy',
    'SEO & SEM',
    'Social Media',
    'Email Marketing',
    'Analytics',
    'AI & Automation',
    'Career Development'
  ]

  useEffect(() => {
    loadResources()
  }, [])

  const loadResources = async () => {
    // In production, this would be an API call
    const mockResources: Resource[] = [
      {
        id: '1',
        title: 'The Complete Marketing Attribution Playbook',
        description: 'Stop wasting budget on channels that don\'t convert. Our battle-tested attribution framework shows you exactly where revenue comes from.',
        type: 'guide',
        category: 'Analytics',
        author: 'Sarah Zhang',
        authorRole: 'Growth Lead @ Stripe',
        downloads: 2847,
        rating: 4.9,
        featured: true,
        fileSize: '12.4 MB',
        lastUpdated: '2 days ago',
        tags: ['attribution', 'analytics', 'revenue', 'data'],
        preview: '/previews/attribution-guide.pdf'
      },
      {
        id: '2',
        title: 'AI Marketing Automation Toolkit',
        description: 'Cut your workload by 70% with these AI-powered automation templates. Includes prompts, workflows, and integration guides.',
        type: 'tool',
        category: 'AI & Automation',
        author: 'Alex Chen',
        authorRole: 'VP Marketing @ Notion',
        downloads: 3421,
        rating: 4.8,
        featured: true,
        url: 'https://toolkit.marketingreboot.com',
        lastUpdated: '1 week ago',
        tags: ['AI', 'automation', 'efficiency', 'tools']
      },
      {
        id: '3',
        title: 'Performance Marketing Dashboard Template',
        description: 'Track what matters with our plug-and-play dashboard. Connect your data sources and get instant insights.',
        type: 'template',
        category: 'Growth & Performance',
        author: 'Maria Rodriguez',
        authorRole: 'Performance Director @ Shopify',
        downloads: 1892,
        rating: 4.7,
        featured: false,
        fileSize: '2.1 MB',
        lastUpdated: '3 days ago',
        tags: ['dashboard', 'analytics', 'performance', 'metrics']
      },
      {
        id: '4',
        title: 'Brand Positioning Masterclass',
        description: '6-week intensive course on building category-defining brands. Real case studies from unicorn companies.',
        type: 'course',
        category: 'Brand & Creative',
        author: 'David Kim',
        authorRole: 'Brand Director @ Tesla',
        downloads: 892,
        rating: 5.0,
        featured: true,
        duration: '12 hours',
        lastUpdated: '1 month ago',
        tags: ['branding', 'positioning', 'strategy', 'course']
      },
      {
        id: '5',
        title: 'The Reboot Podcast: CMO Interviews',
        description: 'Weekly conversations with marketing leaders who transformed their companies. Raw, unfiltered insights.',
        type: 'podcast',
        category: 'Career Development',
        author: 'The Marketing Reboot',
        authorRole: 'Original Series',
        downloads: 5234,
        rating: 4.9,
        featured: true,
        duration: '45 episodes',
        lastUpdated: 'Weekly',
        tags: ['podcast', 'interviews', 'leadership', 'career']
      }
    ]
    
    setResources(mockResources)
    setLoading(false)
  }

  const getIconForType = (type: string) => {
    const typeConfig = resourceTypes.find(t => t.id === type)
    return typeConfig?.icon || Package
  }

  const filteredResources = resources.filter(resource => {
    const matchesSearch = searchTerm === '' || 
      resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesType = selectedType === 'all' || resource.type === selectedType
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory
    
    return matchesSearch && matchesType && matchesCategory
  })

  const sortedResources = [...filteredResources].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return b.downloads - a.downloads
      case 'recent':
        return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
      case 'rating':
        return b.rating - a.rating
      default:
        return 0
    }
  })

  const totalDownloads = resources.reduce((sum, resource) => sum + resource.downloads, 0)
  const averageRating = resources.reduce((sum, resource) => sum + resource.rating, 0) / resources.length

  return (
    <main className="min-h-screen bg-primary">
      <ParticleSystem />
      <ExclusiveHeader />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-4xl font-bold mb-4 gradient-text leading-relaxed">
              Marketing Resources
            </h1>
            <p className="text-xl text-secondary max-w-3xl mx-auto">
              Tools, guides, and insights to elevate your marketing game
            </p>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="glass-card text-center">
              <div className="font-orbitron text-2xl font-bold text-brand-tertiary">
                {resources.length}
              </div>
              <div className="text-sm text-muted">Resources</div>
            </div>
            <div className="glass-card text-center">
              <div className="font-orbitron text-2xl font-bold text-brand-secondary">
                {totalDownloads.toLocaleString()}
              </div>
              <div className="text-sm text-muted">Downloads</div>
            </div>
            <div className="glass-card text-center">
              <div className="font-orbitron text-2xl font-bold text-brand-purple">
                {averageRating.toFixed(1)}
              </div>
              <div className="text-sm text-muted">Avg Rating</div>
            </div>
            <div className="glass-card text-center">
              <div className="font-orbitron text-2xl font-bold text-brand-tertiary">
                {resources.filter(r => r.featured).length}
              </div>
              <div className="text-sm text-muted">Featured</div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="sticky top-20 z-30 bg-primary/95 backdrop-blur-lg border-b surface-border px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto">
          {/* Resource Type Tabs */}
          <div className="flex flex-wrap gap-2 mb-4">
            {resourceTypes.map((type) => {
              const Icon = type.icon
              return (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                    selectedType === type.id
                      ? 'bg-gradient-to-r from-brand-primary to-brand-secondary text-white'
                      : 'bg-secondary text-secondary hover:text-primary'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {type.label}
                </button>
              )
            })}
          </div>
          
          {/* Search and Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted" />
              <input
                type="text"
                placeholder="Search resources, tags..."
                className="w-full pl-10 pr-4 py-2 bg-secondary border surface-border rounded-lg text-primary placeholder-muted focus:border-brand-primary focus:outline-none transition-colors"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 bg-secondary border surface-border rounded-lg text-primary focus:border-brand-primary focus:outline-none transition-colors"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 bg-secondary border surface-border rounded-lg text-primary focus:border-brand-primary focus:outline-none transition-colors"
              >
                <option value="popular">Most Popular</option>
                <option value="recent">Recently Updated</option>
                <option value="rating">Highest Rated</option>
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

      {/* Resources Grid/List */}
      <section className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto relative z-10">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
            </div>
          ) : sortedResources.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted text-lg">No resources match your filters.</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedResources.map((resource) => {
                const Icon = getIconForType(resource.type)
                return (
                  <div key={resource.id} className="glass-card group hover:scale-105 transition-all duration-300 hover:border-brand-primary">
                    {resource.featured && (
                      <div className="absolute -top-2 -right-2 bg-gradient-to-r from-brand-primary to-brand-secondary text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                        FEATURED
                      </div>
                    )}
                    
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${
                        resource.type === 'guide' ? 'from-blue-500 to-cyan-500' :
                        resource.type === 'tool' ? 'from-purple-500 to-pink-500' :
                        resource.type === 'template' ? 'from-green-500 to-emerald-500' :
                        resource.type === 'course' ? 'from-orange-500 to-red-500' :
                        resource.type === 'podcast' ? 'from-indigo-500 to-purple-500' :
                        'from-teal-500 to-blue-500'
                      } flex items-center justify-center shadow-lg`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-xs text-muted capitalize">{resource.type}</span>
                    </div>
                    
                    <h3 className="font-orbitron text-lg font-bold mb-2 text-primary group-hover:text-brand-primary transition-colors">
                      {resource.title}
                    </h3>
                    
                    <p className="text-sm text-secondary mb-4 line-clamp-2">
                      {resource.description}
                    </p>
                    
                    <div className="flex items-center gap-3 mb-4 text-xs text-muted">
                      <span>{resource.author}</span>
                      <span>•</span>
                      <span>{resource.authorRole}</span>
                    </div>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3 text-sm">
                        <span className="flex items-center gap-1">
                          <Download className="w-4 h-4" />
                          {resource.downloads.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          {resource.rating}
                        </span>
                      </div>
                      <span className="text-xs text-muted">{resource.lastUpdated}</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mb-4">
                      {resource.tags.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="px-2 py-1 bg-secondary rounded text-xs text-secondary">
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    <button className="w-full btn-primary text-sm">
                      {resource.url ? (
                        <>
                          <ExternalLink className="w-4 h-4" />
                          Visit Resource
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          Download {resource.fileSize && `(${resource.fileSize})`}
                        </>
                      )}
                    </button>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="space-y-4">
              {sortedResources.map((resource) => {
                const Icon = getIconForType(resource.type)
                return (
                  <div key={resource.id} className="glass-card group hover:border-brand-primary transition-all duration-300">
                    <div className="flex items-start gap-6">
                      <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${
                        resource.type === 'guide' ? 'from-blue-500 to-cyan-500' :
                        resource.type === 'tool' ? 'from-purple-500 to-pink-500' :
                        resource.type === 'template' ? 'from-green-500 to-emerald-500' :
                        resource.type === 'course' ? 'from-orange-500 to-red-500' :
                        resource.type === 'podcast' ? 'from-indigo-500 to-purple-500' :
                        'from-teal-500 to-blue-500'
                      } flex items-center justify-center shadow-lg flex-shrink-0`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="font-orbitron text-xl font-bold text-primary group-hover:text-brand-primary transition-colors">
                                {resource.title}
                              </h3>
                              {resource.featured && (
                                <span className="bg-gradient-to-r from-brand-primary to-brand-secondary text-white px-2 py-0.5 rounded-full text-xs font-bold">
                                  FEATURED
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-muted mb-2">
                              <span className="capitalize">{resource.type}</span>
                              <span>•</span>
                              <span>{resource.category}</span>
                              <span>•</span>
                              <span>{resource.lastUpdated}</span>
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-secondary mb-3">
                          {resource.description}
                        </p>
                        
                        <div className="flex items-center gap-4 mb-3 text-sm">
                          <span className="text-muted">
                            By <span className="text-primary font-semibold">{resource.author}</span>, {resource.authorRole}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-1 text-muted">
                              <Download className="w-4 h-4" />
                              {resource.downloads.toLocaleString()} downloads
                            </span>
                            <span className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-500" />
                              <span className="text-muted">{resource.rating}/5.0</span>
                            </span>
                            {resource.duration && (
                              <span className="flex items-center gap-1 text-muted">
                                <Clock className="w-4 h-4" />
                                {resource.duration}
                              </span>
                            )}
                          </div>
                          
                          <button className="btn-primary text-sm">
                            {resource.url ? (
                              <>
                                <ExternalLink className="w-4 h-4" />
                                Visit Resource
                              </>
                            ) : (
                              <>
                                <Download className="w-4 h-4" />
                                Download {resource.fileSize && `(${resource.fileSize})`}
                              </>
                            )}
                          </button>
                        </div>
                        
                        <div className="flex flex-wrap gap-1 mt-3">
                          {resource.tags.map((tag, idx) => (
                            <span key={idx} className="px-2 py-1 bg-secondary rounded text-xs text-secondary">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
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
              Have a Resource to Share?
            </h2>
            <p className="text-secondary mb-6">
              We're always looking for battle-tested resources from marketing practitioners. 
              Share your templates, guides, or tools with the community.
            </p>
            <button className="btn-primary">
              Submit a Resource
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>
    </main>
  )
}