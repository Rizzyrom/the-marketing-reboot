'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRole } from '@/hooks/useRole'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Edit, Trash2, Eye, BarChart2, Heart } from 'lucide-react'
import ExclusiveHeader from '@/components/ExclusiveHeader'
import ParticleSystem from '@/components/brand/ParticleSystem'

interface Post {
  id: string
  title: string
  excerpt: string
  featured_image: string
  status: 'draft' | 'pending_review' | 'approved' | 'published' | 'rejected'
  created_at: string
  views: number
  likes: number
  topic: {
    name: string
  }
}

export default function MyPosts() {
  const { user } = useAuth()
  const { isContributor } = useRole()
  const router = useRouter()
  const supabase = createClientComponentClient()
  
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState<Post['status'] | 'all'>('all')

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    if (!isContributor) {
      router.push('/')
      return
    }

    fetchPosts()
  }, [user])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      setError('')

      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          topic:topics (
            name
          )
        `)
        .eq('author_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Get likes count for each post
      const postsWithLikes = await Promise.all(
        data.map(async (post) => {
          const { count } = await supabase
            .from('post_likes')
            .select('*', { count: 'exact' })
            .eq('post_id', post.id)

          return {
            ...post,
            likes: count || 0
          }
        })
      )

      setPosts(postsWithLikes)
    } catch (error) {
      console.error('Error fetching posts:', error)
      setError('Failed to load posts. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) {
      return
    }

    try {
      setLoading(true)
      setError('')

      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)

      if (error) throw error

      fetchPosts()
    } catch (error) {
      console.error('Error deleting post:', error)
      setError('Failed to delete post. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const filteredPosts = posts.filter(post => 
    statusFilter === 'all' ? true : post.status === statusFilter
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-primary">
      <ParticleSystem />
      <ExclusiveHeader />
      
      <section className="relative pt-32 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold gradient-text">My Posts</h1>
            <button
              onClick={() => router.push('/posts/new')}
              className="btn-primary"
            >
              Create New Post
            </button>
          </div>

          {error && (
            <div className="bg-red-500/20 text-red-500 p-4 rounded-lg mb-8">
              {error}
            </div>
          )}

          <div className="glass-card p-6">
            {/* Status Filter */}
            <div className="flex gap-4 mb-8 overflow-x-auto">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-4 py-2 rounded-lg ${
                  statusFilter === 'all'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                    : 'glass-card'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter('draft')}
                className={`px-4 py-2 rounded-lg ${
                  statusFilter === 'draft'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                    : 'glass-card'
                }`}
              >
                Drafts
              </button>
              <button
                onClick={() => setStatusFilter('pending_review')}
                className={`px-4 py-2 rounded-lg ${
                  statusFilter === 'pending_review'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                    : 'glass-card'
                }`}
              >
                Pending Review
              </button>
              <button
                onClick={() => setStatusFilter('published')}
                className={`px-4 py-2 rounded-lg ${
                  statusFilter === 'published'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                    : 'glass-card'
                }`}
              >
                Published
              </button>
              <button
                onClick={() => setStatusFilter('rejected')}
                className={`px-4 py-2 rounded-lg ${
                  statusFilter === 'rejected'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                    : 'glass-card'
                }`}
              >
                Rejected
              </button>
            </div>

            {/* Posts List */}
            <div className="space-y-6">
              {filteredPosts.map(post => (
                <div key={post.id} className="glass-card p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-6">
                      {post.featured_image && (
                        <img
                          src={post.featured_image}
                          alt={post.title}
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                      )}
                      <div>
                        <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
                        <p className="text-secondary mb-4">{post.excerpt}</p>
                        <div className="flex items-center gap-4 text-sm text-secondary">
                          <span>{post.topic.name}</span>
                          <span>•</span>
                          <span>{new Date(post.created_at).toLocaleDateString()}</span>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <BarChart2 className="w-4 h-4" />
                            <span>{post.views} views</span>
                          </div>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <Heart className="w-4 h-4" />
                            <span>{post.likes} likes</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        post.status === 'published'
                          ? 'bg-green-500/20 text-green-500'
                          : post.status === 'rejected'
                          ? 'bg-red-500/20 text-red-500'
                          : post.status === 'pending_review'
                          ? 'bg-yellow-500/20 text-yellow-500'
                          : 'bg-gray-500/20 text-gray-500'
                      }`}>
                        {post.status.replace('_', ' ')}
                      </span>
                      <button
                        onClick={() => router.push(`/posts/${post.id}`)}
                        className="glass-card p-2"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => router.push(`/posts/${post.id}/edit`)}
                        className="glass-card p-2"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="glass-card p-2 text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {filteredPosts.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-secondary">No posts found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
} 