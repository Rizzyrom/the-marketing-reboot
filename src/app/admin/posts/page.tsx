'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useRole } from '@/contexts/RoleContext'
import { useAuth } from '@/contexts/AuthContext'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import ExclusiveHeader from '@/components/ExclusiveHeader'
import ParticleSystem from '@/components/ParticleSystem'
import { Search, Filter, Eye, CheckCircle, XCircle, Edit, Trash2, ArrowLeft, Clock, TrendingUp } from 'lucide-react'
import Link from 'next/link'

interface Post {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  published: boolean
  featured: boolean
  post_type: string
  topic_category: string
  likes_count: number
  comments_count: number
  views_count: number
  created_at: string
  updated_at: string
  author_id: string
  profiles?: {
    full_name: string
    email_contact: string
  }
}

export default function AdminPostsPage() {
  const router = useRouter()
  const { isAdmin, isLoading: roleLoading } = useRole()
  const { user } = useAuth()
  const supabase = createClientComponentClient()
  
  const [posts, setPosts] = useState<Post[]>([])
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterType, setFilterType] = useState('all')

  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      router.push('/')
    }
  }, [isAdmin, roleLoading, router])

  useEffect(() => {
    const fetchPosts = async () => {
      if (!isAdmin || !user) return
      
      try {
        setIsLoading(true)
        
        const { data, error } = await supabase
          .from('posts')
          .select('*, profiles!author_id(full_name, email_contact)')
          .order('created_at', { ascending: false })
        
        if (error) throw error
        
        setPosts(data || [])
        setFilteredPosts(data || [])
      } catch (error) {
        console.error('Error fetching posts:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPosts()
  }, [isAdmin, user, supabase])

  useEffect(() => {
    let filtered = posts

    // Filter by status
    if (filterStatus === 'published') {
      filtered = filtered.filter(p => p.published)
    } else if (filterStatus === 'pending') {
      filtered = filtered.filter(p => !p.published)
    } else if (filterStatus === 'featured') {
      filtered = filtered.filter(p => p.featured)
    }

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(p => p.post_type === filterType)
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredPosts(filtered)
  }, [posts, filterStatus, filterType, searchTerm])

  const togglePublished = async (postId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('posts')
        .update({ published: !currentStatus })
        .eq('id', postId)

      if (error) throw error

      // Update local state
      setPosts(prev => prev.map(p => 
        p.id === postId 
          ? { ...p, published: !currentStatus }
          : p
      ))
    } catch (error) {
      console.error('Error updating post status:', error)
    }
  }

  const toggleFeatured = async (postId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('posts')
        .update({ featured: !currentStatus })
        .eq('id', postId)

      if (error) throw error

      // Update local state
      setPosts(prev => prev.map(p => 
        p.id === postId 
          ? { ...p, featured: !currentStatus }
          : p
      ))
    } catch (error) {
      console.error('Error updating featured status:', error)
    }
  }

  const deletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)

      if (error) throw error

      // Update local state
      setPosts(prev => prev.filter(p => p.id !== postId))
    } catch (error) {
      console.error('Error deleting post:', error)
    }
  }

  if (roleLoading || isLoading) {
    return (
      <div className="min-h-screen bg-primary">
        <ExclusiveHeader />
        <ParticleSystem />
        <div className="container mx-auto px-4 py-24">
          <div className="glass-card p-8 text-center">
            <div className="animate-pulse">
              <div className="h-8 w-64 bg-gray-700 rounded mx-auto mb-4"></div>
              <div className="h-4 w-48 bg-gray-700 rounded mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!isAdmin) return null

  // Get unique post types
  const postTypes = [...new Set(posts.map(p => p.post_type).filter(Boolean))]

  return (
    <div className="min-h-screen bg-primary">
      <ExclusiveHeader />
      <ParticleSystem />
      
      <div className="container mx-auto px-4 py-24">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/admin"
            className="inline-flex items-center gap-2 text-secondary hover:text-primary mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Admin Dashboard
          </Link>
          
          <h1 className="text-4xl font-bold gradient-text mb-2">Posts Management</h1>
          <p className="text-secondary">Review, edit, and manage all posts</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="glass-card p-6">
            <h3 className="text-sm text-secondary mb-2">Total Posts</h3>
            <p className="text-3xl font-bold text-primary">{posts.length}</p>
          </div>
          <div className="glass-card p-6">
            <h3 className="text-sm text-secondary mb-2">Published</h3>
            <p className="text-3xl font-bold text-green-500">{posts.filter(p => p.published).length}</p>
          </div>
          <div className="glass-card p-6">
            <h3 className="text-sm text-secondary mb-2">Pending Review</h3>
            <p className="text-3xl font-bold text-orange-500">{posts.filter(p => !p.published).length}</p>
          </div>
          <div className="glass-card p-6">
            <h3 className="text-sm text-secondary mb-2">Featured</h3>
            <p className="text-3xl font-bold text-purple-500">{posts.filter(p => p.featured).length}</p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="glass-card p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary" />
              <input
                type="text"
                placeholder="Search posts by title, excerpt, or author..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-surface-secondary border border-surface-border rounded-lg focus:outline-none focus:border-brand-primary text-primary"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-surface-secondary border border-surface-border rounded-lg text-primary"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="pending">Pending</option>
              <option value="featured">Featured</option>
            </select>

            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 bg-surface-secondary border border-surface-border rounded-lg text-primary"
            >
              <option value="all">All Types</option>
              {postTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Posts List */}
        <div className="space-y-4">
          {filteredPosts.map(post => (
            <div key={post.id} className="glass-card p-6 hover:border-brand-primary transition-all">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-4 mb-3">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-primary mb-1">{post.title}</h3>
                      <p className="text-sm text-secondary mb-2">
                        By {post.profiles?.full_name || 'Unknown'} • {new Date(post.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {post.published ? (
                        <span className="px-3 py-1 bg-green-500/20 text-green-500 text-xs rounded-full font-medium">
                          Published
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-orange-500/20 text-orange-500 text-xs rounded-full font-medium">
                          Pending
                        </span>
                      )}
                      {post.featured && (
                        <span className="px-3 py-1 bg-purple-500/20 text-purple-500 text-xs rounded-full font-medium">
                          Featured
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {post.excerpt && (
                    <p className="text-secondary mb-3 line-clamp-2">{post.excerpt}</p>
                  )}
                  
                  <div className="flex items-center gap-6 text-sm text-secondary">
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {post.views_count || 0} views
                    </span>
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      {post.likes_count || 0} likes
                    </span>
                    <span>
                      {post.comments_count || 0} comments
                    </span>
                    {post.post_type && (
                      <span className="text-brand-primary">{post.post_type}</span>
                    )}
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => router.push(`/posts/${post.slug || post.id}`)}
                    className="p-2 bg-surface-secondary hover:bg-surface-hover rounded-lg transition-colors"
                    title="View Post"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => togglePublished(post.id, post.published)}
                    className={`p-2 rounded-lg transition-colors ${
                      post.published 
                        ? 'bg-green-500/20 text-green-500 hover:bg-green-500/30' 
                        : 'bg-surface-secondary text-secondary hover:bg-surface-hover'
                    }`}
                    title={post.published ? 'Unpublish' : 'Publish'}
                  >
                    {post.published ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => toggleFeatured(post.id, post.featured)}
                    className={`p-2 rounded-lg transition-colors ${
                      post.featured 
                        ? 'bg-purple-500/20 text-purple-500 hover:bg-purple-500/30' 
                        : 'bg-surface-secondary text-secondary hover:bg-surface-hover'
                    }`}
                    title={post.featured ? 'Unfeature' : 'Feature'}
                  >
                    <TrendingUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => router.push(`/admin/posts/${post.id}/edit`)}
                    className="p-2 bg-surface-secondary hover:bg-surface-hover rounded-lg transition-colors"
                    title="Edit Post"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deletePost(post.id)}
                    className="p-2 bg-surface-secondary hover:bg-red-500/20 hover:text-red-500 rounded-lg transition-colors"
                    title="Delete Post"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {filteredPosts.length === 0 && (
          <div className="glass-card p-12 text-center text-secondary">
            No posts found matching your criteria
          </div>
        )}
      </div>
    </div>
  )
}