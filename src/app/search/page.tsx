'use client'
import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import ExclusiveHeader from '@/components/ExclusiveHeader'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Post, Profile } from '@/lib/supabase'
import debounce from 'lodash/debounce'
import { 
  Search, Filter, TrendingUp, Users, Hash, Clock,
  Calendar, Heart, MessageCircle, Eye, MapPin, Globe,
  FileText, User, Tag, X, ChevronDown, Sparkles
} from 'lucide-react'

type SearchType = 'all' | 'posts' | 'people' | 'topics'
type SortBy = 'relevance' | 'recent' | 'popular'

interface SearchResults {
  posts: Post[]
  profiles: Profile[]
  topics: { name: string; count: number }[]
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialQuery = searchParams.get('q') || ''
  
  const [query, setQuery] = useState(initialQuery)
  const [searchType, setSearchType] = useState<SearchType>('all')
  const [sortBy, setSortBy] = useState<SortBy>('relevance')
  const [results, setResults] = useState<SearchResults>({
    posts: [],
    profiles: [],
    topics: []
  })
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [filters, setFilters] = useState({
    dateRange: 'all',
    postType: 'all',
    topic: 'all'
  })

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches')
    if (saved) {
      setRecentSearches(JSON.parse(saved))
    }
  }, [])

  // Perform search when query or filters change
  useEffect(() => {
    if (query.trim()) {
      performSearch()
    }
  }, [searchType, sortBy, filters])

  // Debounced search for suggestions
  const debouncedSuggestions = useCallback(
    debounce(async (searchQuery: string) => {
      if (searchQuery.length < 2) {
        setSuggestions([])
        return
      }

      // Get search suggestions (in real app, this would be a dedicated endpoint)
      const { data: posts } = await supabase
        .from('posts')
        .select('title')
        .ilike('title', `%${searchQuery}%`)
        .limit(5)

      const { data: profiles } = await supabase
        .from('profiles')
        .select('full_name, username')
        .or(`full_name.ilike.%${searchQuery}%,username.ilike.%${searchQuery}%`)
        .limit(3)

      const suggestions: string[] = []
      
      posts?.forEach(post => {
        if (post.title.toLowerCase().includes(searchQuery.toLowerCase())) {
          suggestions.push(post.title)
        }
      })

      profiles?.forEach(profile => {
        if (profile.full_name) suggestions.push(profile.full_name)
      })

      setSuggestions(suggestions.slice(0, 8))
    }, 300),
    []
  )

  const handleQueryChange = (value: string) => {
    setQuery(value)
    setShowSuggestions(true)
    debouncedSuggestions(value)
  }

  const performSearch = async () => {
    if (!query.trim()) return

    setLoading(true)
    setShowSuggestions(false)

    // Update URL
    const params = new URLSearchParams()
    params.set('q', query)
    if (searchType !== 'all') params.set('type', searchType)
    if (sortBy !== 'relevance') params.set('sort', sortBy)
    router.push(`/search?${params.toString()}`)

    // Save to recent searches
    const updatedRecent = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5)
    setRecentSearches(updatedRecent)
    localStorage.setItem('recentSearches', JSON.stringify(updatedRecent))

    try {
      const searchPromises = []

      // Search posts
      if (searchType === 'all' || searchType === 'posts') {
        let postsQuery = supabase
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
          .or(`title.ilike.%${query}%,excerpt.ilike.%${query}%,content.ilike.%${query}%`)

        // Apply date filter
        if (filters.dateRange !== 'all') {
          const date = new Date()
          if (filters.dateRange === 'day') date.setDate(date.getDate() - 1)
          if (filters.dateRange === 'week') date.setDate(date.getDate() - 7)
          if (filters.dateRange === 'month') date.setMonth(date.getMonth() - 1)
          postsQuery = postsQuery.gte('created_at', date.toISOString())
        }

        // Apply sorting
        if (sortBy === 'recent') {
          postsQuery = postsQuery.order('created_at', { ascending: false })
        } else if (sortBy === 'popular') {
          postsQuery = postsQuery.order('likes_count', { ascending: false })
        }

        searchPromises.push(postsQuery.limit(20))
      }

      // Search profiles
      if (searchType === 'all' || searchType === 'people') {
        const profilesQuery = supabase
          .from('profiles')
          .select('*')
          .eq('profile_public', true)
          .or(`full_name.ilike.%${query}%,username.ilike.%${query}%,bio.ilike.%${query}%,job_title.ilike.%${query}%,company.ilike.%${query}%`)
          .limit(10)

        searchPromises.push(profilesQuery)
      }

      // Execute all searches
      const searchResults = await Promise.all(searchPromises)
      
      let newResults: SearchResults = {
        posts: [],
        profiles: [],
        topics: []
      }

      // Process results based on search type
      if (searchType === 'all') {
        newResults.posts = searchResults[0]?.data || []
        newResults.profiles = searchResults[1]?.data || []
      } else if (searchType === 'posts') {
        newResults.posts = searchResults[0]?.data || []
      } else if (searchType === 'people') {
        newResults.profiles = searchResults[0]?.data || []
      }

      // Mock topic results (in real app, would aggregate from posts)
      if (searchType === 'all' || searchType === 'topics') {
        newResults.topics = [
          { name: 'AI Marketing', count: 45 },
          { name: 'Growth Hacking', count: 32 },
          { name: 'Content Strategy', count: 28 }
        ].filter(topic => topic.name.toLowerCase().includes(query.toLowerCase()))
      }

      setResults(newResults)
    } catch (error) {
      console.error('Search error:', error)
    }

    setLoading(false)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    performSearch()
  }

  const clearRecentSearches = () => {
    setRecentSearches([])
    localStorage.removeItem('recentSearches')
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <main className="min-h-screen bg-midnight">
      <ExclusiveHeader />
      
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="font-space text-3xl sm:text-4xl font-bold mb-4">
            <span className="gradient-text animate-gradient">Search</span>
          </h1>
          <p className="text-text-secondary text-lg">
            Find posts, people, and topics across The Marketing Reboot
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="relative mb-8">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Search for posts, people, or topics..."
              className="w-full px-6 py-4 pr-12 bg-dark-slate border border-glass-border rounded-2xl text-lg focus:border-electric-blue focus:outline-none transition-all focus:shadow-input-glow"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-3 btn-glow rounded-xl"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>

          {/* Search Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 glass-bg rounded-xl p-2 z-20 border border-glass-border shadow-glow">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    setQuery(suggestion)
                    setShowSuggestions(false)
                    performSearch()
                  }}
                  className="block w-full text-left px-4 py-2 hover:bg-white/10 rounded-lg transition-colors hover-lift"
                >
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-text-secondary" />
                    <span className="text-text-primary">{suggestion}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </form>

        {/* Recent Searches */}
        {!query && recentSearches.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-text-secondary">Recent Searches</h3>
              <button
                onClick={clearRecentSearches}
                className="text-sm text-text-secondary hover:text-cyber-lime transition-colors"
              >
                Clear all
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setQuery(search)
                    performSearch()
                  }}
                  className="px-4 py-2 glass-bg rounded-full text-sm hover:border-cyber-lime/40 transition-all hover-lift"
                >
                  {search}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        {query && (
          <div className="mb-8 space-y-4">
            {/* Search Type Tabs */}
            <div className="flex gap-2 flex-wrap">
              {(['all', 'posts', 'people', 'topics'] as SearchType[]).map(type => (
                <button
                  key={type}
                  onClick={() => setSearchType(type)}
                  className={`px-4 py-2 rounded-full font-semibold transition-all ${
                    searchType === type
                      ? 'btn-glow'
                      : 'glass-bg text-text-secondary hover:text-white hover:border-cyber-lime/40'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>

            {/* Advanced Filters */}
            <div className="flex gap-4 flex-wrap items-center">
              {/* Sort By */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-text-secondary">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortBy)}
                  className="px-3 py-1 bg-dark-slate border border-glass-border rounded-lg text-sm focus:border-electric-blue focus:outline-none"
                >
                  <option value="relevance">Relevance</option>
                  <option value="recent">Most Recent</option>
                  <option value="popular">Most Popular</option>
                </select>
              </div>

              {/* Date Range */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-text-secondary">Date:</span>
                <select
                  value={filters.dateRange}
                  onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
                  className="px-3 py-1 bg-dark-slate border border-glass-border rounded-lg text-sm focus:border-electric-blue focus:outline-none"
                >
                  <option value="all">All Time</option>
                  <option value="day">Past 24 Hours</option>
                  <option value="week">Past Week</option>
                  <option value="month">Past Month</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Search Results */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyber-lime"></div>
          </div>
        ) : query ? (
          <div className="space-y-8">
            {/* Results Summary */}
            <div className="text-text-secondary">
              Found {results.posts.length + results.profiles.length + results.topics.length} results for "{query}"
            </div>

            {/* Posts Results */}
            {results.posts.length > 0 && (searchType === 'all' || searchType === 'posts') && (
              <div>
                <h2 className="font-space text-xl font-bold mb-4 flex items-center gap-2">
                  <FileText className="w-6 h-6 text-electric-blue" />
                  Posts ({results.posts.length})
                </h2>
                <div className="space-y-4">
                  {results.posts.map(post => (
                    <Link key={post.id} href={`/post/${post.slug || post.id}`}>
                      <article className="glass-bg rounded-xl p-6 hover:border-electric-blue/40 transition-all cursor-pointer hover-lift">
                        <h3 className="font-semibold text-lg mb-2 hover:text-electric-blue transition-colors">
                          {post.title}
                        </h3>
                        
                        {/* Author Info */}
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-neon-purple to-electric-blue flex items-center justify-center text-sm font-bold">
                            {post.profiles?.full_name?.charAt(0) || 'A'}
                          </div>
                          <div className="text-sm">
                            <span className="font-semibold">{post.profiles?.full_name || 'Anonymous'}</span>
                            <span className="text-text-secondary ml-2">
                              {post.profiles?.job_title} {post.profiles?.company && `@ ${post.profiles.company}`}
                            </span>
                          </div>
                          <span className="text-sm text-text-secondary ml-auto">
                            {formatDate(post.created_at)}
                          </span>
                        </div>
                        
                        {/* Excerpt */}
                        <p className="text-text-secondary mb-4 line-clamp-2">
                          {post.excerpt}
                        </p>
                        
                        {/* Engagement */}
                        <div className="flex items-center gap-6 text-sm text-text-secondary">
                          <span className="flex items-center gap-1 hover:text-cyber-lime transition-colors">
                            <Heart className="w-4 h-4" /> {post.likes_count} likes
                          </span>
                          <span className="flex items-center gap-1 hover:text-electric-blue transition-colors">
                            <MessageCircle className="w-4 h-4" /> {post.comments_count} comments
                          </span>
                          <span className="flex items-center gap-1 hover:text-neon-purple transition-colors">
                            <Eye className="w-4 h-4" /> {post.views_count} views
                          </span>
                          {post.tags && post.tags.length > 0 && (
                            <div className="flex gap-2 ml-auto">
                              {post.tags.slice(0, 3).map(tag => (
                                <span key={tag} className="px-2 py-1 bg-dark-slate rounded text-xs">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* People Results */}
            {results.profiles.length > 0 && (searchType === 'all' || searchType === 'people') && (
              <div>
                <h2 className="font-space text-xl font-bold mb-4 flex items-center gap-2">
                  <Users className="w-6 h-6 text-neon-purple" />
                  People ({results.profiles.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {results.profiles.map(profile => (
                    <Link key={profile.id} href={`/profile/${profile.username}`}>
                      <div className="glass-bg rounded-xl p-6 hover:border-neon-purple/40 transition-all cursor-pointer hover-lift">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-neon-purple to-electric-blue flex items-center justify-center text-lg font-bold hover:shadow-glow transition-all">
                            {profile.full_name?.charAt(0) || 'U'}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg hover:text-electric-blue transition-colors">
                              {profile.full_name}
                            </h3>
                            <p className="text-sm text-text-secondary mb-2">
                              {profile.job_title} {profile.company && `@ ${profile.company}`}
                            </p>
                            {profile.bio && (
                              <p className="text-sm text-text-secondary line-clamp-2">
                                {profile.bio}
                              </p>
                            )}
                            <div className="flex items-center gap-4 mt-3 text-xs text-text-secondary">
                              {profile.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" /> {profile.location}
                                </span>
                              )}
                              {profile.website_url && (
                                <span className="flex items-center gap-1">
                                  <Globe className="w-3 h-3" /> Website
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Topics Results */}
            {results.topics.length > 0 && (searchType === 'all' || searchType === 'topics') && (
              <div>
                <h2 className="font-space text-xl font-bold mb-4 flex items-center gap-2">
                  <Hash className="w-6 h-6 text-cyber-lime" />
                  Topics ({results.topics.length})
                </h2>
                <div className="flex flex-wrap gap-3">
                  {results.topics.map(topic => (
                    <Link 
                      key={topic.name} 
                      href={`/topic/${topic.name.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <div className="glass-bg rounded-xl px-6 py-3 hover:border-cyber-lime/40 transition-all cursor-pointer hover-lift">
                        <div className="font-semibold mb-1">{topic.name}</div>
                        <div className="text-sm text-text-secondary">{topic.count} posts</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* No Results */}
            {results.posts.length === 0 && results.profiles.length === 0 && results.topics.length === 0 && (
              <div className="text-center py-16">
                <Search className="w-16 h-16 text-text-secondary mx-auto mb-4" />
                <h3 className="font-space text-xl font-bold mb-2">No results found</h3>
                <p className="text-text-secondary">
                  Try adjusting your search terms or filters
                </p>
              </div>
            )}
          </div>
        ) : (
          // Empty State - Popular Searches
          <div className="text-center py-16">
            <Sparkles className="w-16 h-16 text-electric-blue mx-auto mb-4" />
            <h3 className="font-space text-xl font-bold mb-2">What are you looking for?</h3>
            <p className="text-text-secondary mb-8">
              Search for posts, people, or topics across The Marketing Reboot
            </p>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-text-secondary">Popular Searches</h4>
              <div className="flex flex-wrap gap-2 justify-center">
                {['AI Marketing', 'Growth Hacking', 'Brand Strategy', 'Content Marketing', 'Performance Marketing'].map(term => (
                  <button
                    key={term}
                    onClick={() => {
                      setQuery(term)
                      performSearch()
                    }}
                    className="px-4 py-2 glass-bg rounded-full text-sm hover:border-cyber-lime/40 transition-all hover-lift"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}