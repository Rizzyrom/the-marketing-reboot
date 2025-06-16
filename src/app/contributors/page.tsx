'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Profile } from '@/lib/supabase'
import ExclusiveHeader from '@/components/ExclusiveHeader'
import ParticleSystem from '@/components/brand/ParticleSystem'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { 
  Search, Filter, Grid, List, MapPin, Building2, Calendar,
  TrendingUp, Award, Star, Eye, Heart, MessageCircle,
  ChevronDown, X, UserPlus, Mail, Linkedin, Twitter,
  Github, Globe, CheckCircle, Zap, Trophy, Target,
  Users, ArrowUpRight, Sparkles, BarChart3, Activity
} from 'lucide-react'

interface Contributor extends Profile {
  stats?: {
    posts: number
    views: number
    likes: number
    followers: number
    following: number
    joinedDays: number
  }
  expertise?: string[]
  isVerified?: boolean
  isPremium?: boolean
  recentPosts?: {
    id: string
    title: string
    views: number
    likes: number
  }[]
}

export default function ContributorsPage() {
  const [contributors, setContributors] = useState<Contributor[]>([])
  const [filteredContributors, setFilteredContributors] = useState<Contributor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'popular' | 'recent' | 'active' | 'alphabetical'>('recent')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedExpertise, setSelectedExpertise] = useState<string>('all')
  const [selectedLocation, setSelectedLocation] = useState<string>('all')
  const [selectedCompany, setSelectedCompany] = useState<string>('all')
  const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set())
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    checkAuthAndLoadContributors()
  }, [])

  useEffect(() => {
    filterAndSortContributors()
  }, [contributors, searchTerm, sortBy, selectedExpertise, selectedLocation, selectedCompany])

  const checkAuthAndLoadContributors = async () => {
    try {
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user)
      console.log('Current auth user:', user)

      // Load contributors regardless of auth status
      await loadContributors()
    } catch (error) {
      console.error('Auth check error:', error)
      // Still try to load public profiles
      await loadContributors()
    }
  }

  const loadContributors = async () => {
    try {
      setError(null)
      
      // First, let's check what we can access
      console.log('Attempting to load contributors...')
      
      // Try to get all profiles first (this will respect RLS)
      let { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (profileError) {
        console.error('Error fetching profiles:', profileError)
        
        // If we get an RLS error, try to get only public profiles
        if (profileError.code === '42501') { // RLS violation
          console.log('RLS error, trying to fetch only public profiles...')
          const { data: publicProfiles, error: publicError } = await supabase
            .from('profiles')
            .select('*')
            .eq('profile_public', true)
            .order('created_at', { ascending: false })

          if (publicError) {
            throw publicError
          }
          profiles = publicProfiles
        } else {
          throw profileError
        }
      }

      console.log(`Found ${profiles?.length || 0} profiles`)

      if (!profiles || profiles.length === 0) {
        setError('No contributors found. Make sure profiles exist and are marked as public (profile_public = true).')
        setContributors([])
        return
      }

      // Process contributors with stats
      const contributorsWithStats = await Promise.all(
        profiles.map(async (profile) => {
          try {
            // Get post count
            const { count: postCount, error: postCountError } = await supabase
              .from('posts')
              .select('*', { count: 'exact', head: true })
              .eq('author_id', profile.id)
              .eq('published', true) // Only count published posts

            if (postCountError) {
              console.warn(`Error getting post count for ${profile.id}:`, postCountError)
            }

            // Get post stats
            const { data: posts, error: postsError } = await supabase
              .from('posts')
              .select('likes_count, views_count')
              .eq('author_id', profile.id)
              .eq('published', true)

            if (postsError) {
              console.warn(`Error getting posts for ${profile.id}:`, postsError)
            }

            const totalLikes = posts?.reduce((sum, post) => sum + (post.likes_count || 0), 0) || 0
            const totalViews = posts?.reduce((sum, post) => sum + (post.views_count || 0), 0) || 0
            const joinedDays = Math.floor((Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24))

            // Get recent posts
            const { data: recentPosts, error: recentPostsError } = await supabase
              .from('posts')
              .select('id, title, slug, views_count, likes_count')
              .eq('author_id', profile.id)
              .eq('published', true)
              .order('created_at', { ascending: false })
              .limit(2)

            if (recentPostsError) {
              console.warn(`Error getting recent posts for ${profile.id}:`, recentPostsError)
            }

            // Get follower/following counts
            const { count: followerCount } = await supabase
              .from('follows')
              .select('*', { count: 'exact', head: true })
              .eq('following_id', profile.id)

            const { count: followingCount } = await supabase
              .from('follows')
              .select('*', { count: 'exact', head: true })
              .eq('follower_id', profile.id)

            const contributor: Contributor = {
              ...profile,
              stats: {
                posts: postCount || 0,
                views: totalViews,
                likes: totalLikes,
                followers: followerCount || 0,
                following: followingCount || 0,
                joinedDays: joinedDays
              },
              expertise: profile.expertise || ['Marketing Professional'],
              isVerified: profile.profile_public,
              isPremium: false,
              recentPosts: recentPosts?.map(post => ({
                id: post.slug || post.id,
                title: post.title,
                views: post.views_count || 0,
                likes: post.likes_count || 0
              })) || []
            }
            return contributor
          } catch (error) {
            console.error(`Error processing contributor ${profile.id}:`, error)
            // Return basic contributor info even if stats fail
            return {
              ...profile,
              stats: {
                posts: 0,
                views: 0,
                likes: 0,
                followers: 0,
                following: 0,
                joinedDays: 0
              },
              expertise: ['Marketing Professional'],
              isVerified: profile.profile_public,
              isPremium: false,
              recentPosts: []
            }
          }
        })
      )

      setContributors(contributorsWithStats)
      console.log('Successfully loaded contributors:', contributorsWithStats.length)
    } catch (error: any) {
      console.error('Error loading contributors:', error)
      setError(error.message || 'Failed to load contributors')
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortContributors = () => {
    let filtered = [...contributors]

    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(contributor => 
        contributor.full_name?.toLowerCase().includes(search) ||
        contributor.username?.toLowerCase().includes(search) ||
        contributor.company?.toLowerCase().includes(search) ||
        contributor.job_title?.toLowerCase().includes(search) ||
        contributor.bio?.toLowerCase().includes(search)
      )
    }

    if (selectedLocation !== 'all') {
      filtered = filtered.filter(contributor => 
        contributor.location === selectedLocation
      )
    }

    if (selectedCompany !== 'all') {
      filtered = filtered.filter(contributor => 
        contributor.company === selectedCompany
      )
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return (b.stats?.likes || 0) - (a.stats?.likes || 0)
        case 'recent':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'active':
          return (b.stats?.posts || 0) - (a.stats?.posts || 0)
        case 'alphabetical':
          return (a.full_name || a.username || '').localeCompare(b.full_name || b.username || '')
        default:
          return 0
      }
    })

    setFilteredContributors(filtered)
  }

  const handleFollow = async (userId: string) => {
    if (!currentUser) {
      // Redirect to login if not authenticated
      window.location.href = '/auth/login'
      return
    }

    try {
      if (followedUsers.has(userId)) {
        // Unfollow
        await supabase
          .from('follows')
          .delete()
          .eq('follower_id', currentUser.id)
          .eq('following_id', userId)
      } else {
        // Follow
        await supabase
          .from('follows')
          .insert({
            follower_id: currentUser.id,
            following_id: userId
          })
      }

      setFollowedUsers(prev => {
        const newSet = new Set(prev)
        if (newSet.has(userId)) {
          newSet.delete(userId)
        } else {
          newSet.add(userId)
        }
        return newSet
      })
    } catch (error) {
      console.error('Error following/unfollowing:', error)
    }
  }

  const getUniqueValues = (key: keyof Profile): string[] => {
    const values = new Set(contributors.map(c => c[key] as string).filter(Boolean))
    return Array.from(values).sort()
  }

  const topContributors = [...contributors]
    .sort((a, b) => (b.stats?.views || 0) - (a.stats?.views || 0))
    .slice(0, 5)

  return (
    <main className="min-h-screen bg-primary transition-colors duration-500">
      <ParticleSystem />
      <ExclusiveHeader />

      {/* Hero Section */}
      <section className="pt-32 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="font-orbitron text-4xl sm:text-5xl font-bold mb-4 gradient-text" style={{ lineHeight: '1.2', paddingBottom: '8px' }}>
              Marketing Reboot Contributors
            </h1>
            <p className="text-xl text-secondary max-w-3xl mx-auto">
              Connect with the marketing leaders who are redefining the industry. 
              Learn from their experiences, follow their journey, and collaborate on groundbreaking strategies.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card variant="glass" className="text-center hover:border-brand-primary transition-all">
              <Users className="w-8 h-8 text-brand-tertiary mx-auto mb-2" />
              <div className="font-orbitron text-2xl font-bold text-brand-tertiary">
                {contributors.length}
              </div>
              <div className="text-sm text-muted">Active Contributors</div>
            </Card>
            <Card variant="glass" className="text-center hover:border-brand-primary transition-all">
              <CheckCircle className="w-8 h-8 text-brand-secondary mx-auto mb-2" />
              <div className="font-orbitron text-2xl font-bold text-brand-secondary">
                {contributors.filter(c => c.profile_public).length}
              </div>
              <div className="text-sm text-muted">Public Profiles</div>
            </Card>
            <Card variant="glass" className="text-center hover:border-brand-primary transition-all">
              <BarChart3 className="w-8 h-8 text-brand-purple mx-auto mb-2" />
              <div className="font-orbitron text-2xl font-bold text-brand-purple">
                {contributors.reduce((sum, c) => sum + (c.stats?.posts || 0), 0)}
              </div>
              <div className="text-sm text-muted">Total Posts</div>
            </Card>
            <Card variant="glass" className="text-center hover:border-brand-primary transition-all">
              <Building2 className="w-8 h-8 text-brand-primary mx-auto mb-2" />
              <div className="font-orbitron text-2xl font-bold text-brand-primary">
                {getUniqueValues('company').length}
              </div>
              <div className="text-sm text-muted">Companies</div>
            </Card>
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="sticky top-20 z-40 bg-primary/95 backdrop-blur-lg border-b surface-border px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary" />
              <input
                type="text"
                placeholder="Search contributors, companies, expertise..."
                className="w-full pl-10 pr-4 py-2 bg-secondary border surface-border rounded-lg text-primary focus:border-brand-primary focus:outline-none transition-colors"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 bg-secondary hover:surface-hover border surface-border rounded-lg transition-all flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filters
                <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 bg-secondary border surface-border rounded-lg text-primary focus:border-brand-primary focus:outline-none transition-colors"
              >
                <option value="recent">Recently Joined</option>
                <option value="popular">Most Popular</option>
                <option value="active">Most Active</option>
                <option value="alphabetical">A-Z</option>
              </select>
              <div className="flex bg-secondary rounded-lg border surface-border">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-brand-primary/20 text-brand-primary' : 'text-secondary'} transition-colors`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-brand-primary/20 text-brand-primary' : 'text-secondary'} transition-colors`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t surface-border grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">Location</label>
                <select
                  className="w-full p-2 bg-secondary border surface-border rounded-lg text-primary focus:border-brand-primary focus:outline-none transition-colors"
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                >
                  <option value="all">All Locations</option>
                  {getUniqueValues('location').map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">Company</label>
                <select
                  className="w-full p-2 bg-secondary border surface-border rounded-lg text-primary focus:border-brand-primary focus:outline-none transition-colors"
                  value={selectedCompany}
                  onChange={(e) => setSelectedCompany(e.target.value)}
                >
                  <option value="all">All Companies</option>
                  {getUniqueValues('company').map(company => (
                    <option key={company} value={company}>{company}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Main Content */}
      <section className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-tertiary mx-auto mb-4"></div>
              <div className="text-secondary">Loading contributors...</div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <Card variant="glass" className="max-w-2xl mx-auto p-8">
                <div className="text-red-500 mb-4">Error loading contributors</div>
                <p className="text-secondary mb-4">{error}</p>
                <div className="text-sm text-muted">
                  <p>Possible solutions:</p>
                  <ul className="list-disc list-inside mt-2 text-left">
                    <li>Check if profiles have profile_public = true in your database</li>
                    <li>Verify your Supabase RLS policies allow reading profiles</li>
                    <li>Ensure you're using the correct Supabase URL and anon key</li>
                  </ul>
                </div>
                <Button variant="primary" onClick={checkAuthAndLoadContributors} className="mt-4">
                  Try Again
                </Button>
              </Card>
            </div>
          ) : filteredContributors.length === 0 ? (
            <div className="text-center py-12">
              <Card variant="glass" className="max-w-2xl mx-auto p-8">
                <Users className="w-12 h-12 text-secondary mx-auto mb-4" />
                <p className="text-secondary text-lg mb-4">No contributors found matching your criteria.</p>
                {contributors.length === 0 ? (
                  <>
                    <p className="text-muted mb-4">No profiles are currently visible.</p>
                    <div className="text-sm text-muted">
                      <p>This could mean:</p>
                      <ul className="list-disc list-inside mt-2 text-left">
                        <li>No profiles exist in the database yet</li>
                        <li>All profiles have profile_public = false</li>
                        <li>RLS policies are blocking access</li>
                      </ul>
                    </div>
                  </>
                ) : (
                  <Button variant="secondary" onClick={() => {
                    setSearchTerm('')
                    setSelectedLocation('all')
                    setSelectedCompany('all')
                  }}>
                    Clear Filters
                  </Button>
                )}
              </Card>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Contributors Grid/List */}
              <div className="lg:col-span-3">
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredContributors.map((contributor) => (
                      <Card key={contributor.id} variant="glass" className="p-6 hover:border-brand-primary transition-all duration-300">
                        <div className="flex items-start justify-between mb-4">
                          <Link href={`/profile/${contributor.username || contributor.id}`} className="flex items-center gap-4 group">
                            <div className="relative">
                              {contributor.avatar_url ? (
                                <img 
                                  src={contributor.avatar_url} 
                                  alt={contributor.full_name || 'Profile'} 
                                  className="w-16 h-16 rounded-full object-cover hover:scale-110 transition-transform"
                                />
                              ) : (
                                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-brand-purple to-brand-secondary flex items-center justify-center text-white font-bold text-xl group-hover:shadow-lg transition-all">
                                  {contributor.full_name?.charAt(0) || contributor.email_contact?.charAt(0) || '?'}
                                </div>
                              )}
                              {contributor.profile_public && (
                                <CheckCircle className="absolute -bottom-1 -right-1 w-6 h-6 text-brand-secondary bg-primary rounded-full" />
                              )}
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg group-hover:text-brand-primary transition-colors">
                                {contributor.full_name || 'Unnamed User'}
                              </h3>
                              <p className="text-sm text-secondary">@{contributor.username || 'no-username'}</p>
                              <p className="text-sm text-secondary">
                                {contributor.job_title || 'Marketing Professional'} 
                                {contributor.company && ` at ${contributor.company}`}
                              </p>
                            </div>
                          </Link>
                          <Button
                            variant={followedUsers.has(contributor.id) ? 'secondary' : 'primary'}
                            onClick={() => handleFollow(contributor.id)}
                          >
                            {followedUsers.has(contributor.id) ? 'Following' : 'Follow'}
                          </Button>
                        </div>

                        {contributor.bio && (
                          <p className="text-sm text-secondary mb-4 line-clamp-2">
                            {contributor.bio}
                          </p>
                        )}

                        <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                          <div className="bg-secondary/50 rounded-lg p-2 hover:bg-secondary transition-colors">
                            <div className="font-semibold text-primary">{contributor.stats?.posts || 0}</div>
                            <div className="text-xs text-muted">Posts</div>
                          </div>
                          <div className="bg-secondary/50 rounded-lg p-2 hover:bg-secondary transition-colors">
                            <div className="font-semibold text-primary">
                              {contributor.stats?.views ? (contributor.stats.views / 1000).toFixed(1) + 'k' : '0'}
                            </div>
                            <div className="text-xs text-muted">Views</div>
                          </div>
                          <div className="bg-secondary/50 rounded-lg p-2 hover:bg-secondary transition-colors">
                            <div className="font-semibold text-primary">{contributor.stats?.likes || 0}</div>
                            <div className="text-xs text-muted">Likes</div>
                          </div>
                        </div>

                        {contributor.location && (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-secondary">
                              <MapPin className="w-4 h-4" />
                              {contributor.location}
                            </div>
                            <div className="flex gap-2">
                              {contributor.linkedin_url && (
                                <a href={contributor.linkedin_url} target="_blank" rel="noopener noreferrer">
                                  <Linkedin className="w-4 h-4 text-secondary hover:text-brand-secondary cursor-pointer transition-colors" />
                                </a>
                              )}
                              {contributor.twitter_url && (
                                <a href={contributor.twitter_url} target="_blank" rel="noopener noreferrer">
                                  <Twitter className="w-4 h-4 text-secondary hover:text-brand-secondary cursor-pointer transition-colors" />
                                </a>
                              )}
                              {contributor.website_url && (
                                <a href={contributor.website_url} target="_blank" rel="noopener noreferrer">
                                  <Globe className="w-4 h-4 text-secondary hover:text-brand-secondary cursor-pointer transition-colors" />
                                </a>
                              )}
                            </div>
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                ) : (
                  // List view
                  <div className="space-y-4">
                    {filteredContributors.map((contributor) => (
                      <Card key={contributor.id} variant="glass" className="p-6 hover:border-brand-primary transition-all duration-300">
                        <div className="flex items-start gap-6">
                          <Link href={`/profile/${contributor.username || contributor.id}`} className="flex-shrink-0">
                            <div className="relative">
                              {contributor.avatar_url ? (
                                <img 
                                  src={contributor.avatar_url} 
                                  alt={contributor.full_name || 'Profile'} 
                                  className="w-20 h-20 rounded-full object-cover hover:scale-110 transition-transform"
                                />
                              ) : (
                                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-brand-purple to-brand-secondary flex items-center justify-center text-white font-bold text-2xl hover:shadow-lg transition-all">
                                  {contributor.full_name?.charAt(0) || contributor.email_contact?.charAt(0) || '?'}
                                </div>
                              )}
                              {contributor.profile_public && (
                                <CheckCircle className="absolute -bottom-1 -right-1 w-6 h-6 text-brand-secondary bg-primary rounded-full" />
                              )}
                            </div>
                          </Link>

                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <Link href={`/profile/${contributor.username || contributor.id}`}>
                                  <h3 className="font-semibold text-xl hover:text-brand-primary transition-colors">
                                    {contributor.full_name || 'Unnamed User'}
                                  </h3>
                                </Link>
                                <p className="text-secondary">@{contributor.username || 'no-username'}</p>
                                <p className="text-secondary">
                                  {contributor.job_title || 'Marketing Professional'} 
                                  {contributor.company && ` at ${contributor.company}`}
                                  {contributor.location && ` • ${contributor.location}`}
                                </p>
                              </div>
                              <Button
                                variant={followedUsers.has(contributor.id) ? 'secondary' : 'primary'}
                                onClick={() => handleFollow(contributor.id)}
                              >
                                {followedUsers.has(contributor.id) ? 'Following' : 'Follow'}
                              </Button>
                            </div>

                            {contributor.bio && (
                              <p className="text-secondary mb-4">
                                {contributor.bio}
                              </p>
                            )}

                            <div className="flex items-center gap-6 mb-4">
                              <div className="flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-secondary" />
                                <span className="text-sm text-primary">
                                  <strong>{contributor.stats?.posts || 0}</strong> posts
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Eye className="w-4 h-4 text-secondary" />
                                <span className="text-sm text-primary">
                                  <strong>{contributor.stats?.views ? (contributor.stats.views / 1000).toFixed(1) + 'k' : '0'}</strong> views
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Heart className="w-4 h-4 text-secondary" />
                                <span className="text-sm text-primary">
                                  <strong>{contributor.stats?.likes || 0}</strong> likes
                                </span>
                              </div>
                            </div>

                            {contributor.recentPosts && contributor.recentPosts.length > 0 && (
                              <div className="border-t surface-border pt-4">
                                <h4 className="text-sm font-semibold mb-2 text-primary">Recent Posts</h4>
                                <div className="space-y-2">
                                  {contributor.recentPosts.map((post) => (
                                    <Link key={post.id} href={`/post/${post.id}`}>
                                      <div className="flex items-center justify-between text-sm text-secondary hover:text-brand-primary transition-colors">
                                        <span className="line-clamp-1">{post.title}</span>
                                        <span className="text-muted flex items-center gap-3">
                                          <span className="flex items-center gap-1">
                                            <Eye className="w-3 h-3" />
                                            {(post.views / 1000).toFixed(1)}k
                                          </span>
                                          <span className="flex items-center gap-1">
                                            <Heart className="w-3 h-3" />
                                            {post.likes}
                                          </span>
                                        </span>
                                      </div>
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Top Contributors */}
                {topContributors.length > 0 && (
                  <Card variant="glass">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-primary">
                      <Trophy className="w-5 h-5 text-yellow-400" />
                      Top Contributors
                    </h3>
                    <div className="space-y-4">
                      {topContributors.map((contributor, idx) => (
                        <Link key={contributor.id} href={`/profile/${contributor.username || contributor.id}`}>
                          <div className="flex items-center gap-3 group">
                            <div className="relative">
                              {contributor.avatar_url ? (
                                <img 
                                  src={contributor.avatar_url} 
                                  alt={contributor.full_name || 'Profile'} 
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-brand-purple to-brand-secondary flex items-center justify-center text-white font-bold text-sm group-hover:shadow-lg transition-all">
                                  {contributor.full_name?.charAt(0) || '?'}
                                </div>
                              )}
                              <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                                idx === 0 ? 'bg-yellow-400 text-yellow-900' :
                                idx === 1 ? 'bg-gray-300 text-gray-800' :
                                idx === 2 ? 'bg-orange-400 text-orange-900' :
                                'bg-secondary text-primary'
                              }`}>
                                {idx + 1}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium group-hover:text-brand-primary transition-colors truncate text-primary">
                                {contributor.full_name || 'Unnamed User'}
                              </div>
                              <div className="text-sm text-secondary">
                                {contributor.stats?.views ? (contributor.stats.views / 1000).toFixed(1) + 'k views' : 'No views yet'}
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Join CTA */}
                <Card variant="glass" className="text-center hover:border-brand-primary transition-all">
                  <Award className="w-12 h-12 text-brand-secondary mx-auto mb-3" />
                  <h3 className="text-lg font-semibold mb-2 text-primary">Join Our Community</h3>
                  <p className="text-sm text-secondary mb-4">
                    Share your marketing expertise and connect with industry leaders.
                  </p>
                  <Button variant="primary">
                    <Link href="/auth/signup">Apply to Contribute</Link>
                  </Button>
                </Card>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}