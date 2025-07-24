'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useRole } from '@/contexts/RoleContext'
import { useAuth } from '@/contexts/AuthContext'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import ExclusiveHeader from '@/components/ExclusiveHeader'
import ParticleSystem from '@/components/ParticleSystem'
import Link from 'next/link'
import {
  CheckCircle, XCircle, Eye, Clock, TrendingUp, User, Calendar,
  ArrowLeft, Filter, Search, MessageSquare, Heart, BarChart,
  AlertCircle, Mail, FileText, Edit, Trash2, Send
} from 'lucide-react'

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  status: 'draft' | 'pending_approval' | 'published' | 'rejected';
  published: boolean;
  featured: boolean;
  post_type: string;
  topic_category: string;
  likes_count: number;
  comments_count: number;
  views_count: number;
  created_at: string;
  updated_at: string;
  submitted_at: string;
  author_id: string;
  reviewer_id?: string;
  reviewer_notes?: string; // Changed from string | null to string | undefined
  reviewed_at?: string;
  profiles?: {
    full_name: string;
    email_contact: string;
    avatar_url?: string;
    username?: string;
  }
}

export default function AdminPostsApprovalPage() {
  const router = useRouter()
  const { isAdmin, isLoading: roleLoading } = useRole()
  const { user } = useAuth()
  const supabase = createClientComponentClient()
  
  const [posts, setPosts] = useState<Post[]>([])
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([])
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [reviewerNotes, setReviewerNotes] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('pending_approval')
  const [showRejected, setShowRejected] = useState(false)
  const [processing, setProcessing] = useState(false)

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
          .select(`
            *,
            profiles!author_id(
              full_name, 
              email_contact,
              avatar_url,
              username
            )
          `)
          .order('submitted_at', { ascending: false })
        
        if (error) throw error
        
        setPosts(data || [])
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
    if (filterStatus !== 'all') {
      filtered = filtered.filter(p => p.status === filterStatus)
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.profiles?.username?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredPosts(filtered)
  }, [posts, filterStatus, searchTerm])

  const handleViewPost = (post: Post) => {
    setSelectedPost(post)
    setReviewerNotes(post.reviewer_notes || '')
  }

  const handleClosePostView = () => {
    setSelectedPost(null)
    setReviewerNotes('')
  }

  const handleApprovePost = async (): Promise<void> => {
    if (!selectedPost || !user) return
    
    try {
      setProcessing(true)
      
      const { error } = await supabase
        .from('posts')
        .update({
          status: 'published',
          published: true,
          reviewer_id: user.id,
          reviewer_notes: reviewerNotes.trim() || undefined,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', selectedPost.id)
      
      if (error) throw error
      
      // Notify author via email if possible
      try {
        if (selectedPost.profiles?.email_contact) {
          await supabase.functions.invoke('send-post-approval-notification', {
            body: {
              to: selectedPost.profiles.email_contact,
              authorName: selectedPost.profiles.full_name,
              postTitle: selectedPost.title,
              postUrl: `${window.location.origin}/post/${selectedPost.slug || selectedPost.id}`,
              reviewerNotes: reviewerNotes.trim(),
              approved: true
            }
          })
        }
      } catch (emailError) {
        console.error('Email notification failed, but post was approved:', emailError)
      }
      
      // Update local state
      setPosts(posts.map(p => 
        p.id === selectedPost.id 
          ? { 
              ...p, 
              status: 'published', 
              published: true,
              reviewer_id: user.id,
              reviewer_notes: reviewerNotes.trim() || undefined,
              reviewed_at: new Date().toISOString()
            } 
          : p
      ))
      
      setSelectedPost(null)
      setReviewerNotes('')
      
    } catch (error) {
      console.error('Error approving post:', error)
      alert('Failed to approve post. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  const handleRejectPost = async (): Promise<void> => {
    if (!selectedPost || !user) return
    
    if (!reviewerNotes.trim()) {
      alert('Please provide feedback for the rejection')
      return
    }
    
    try {
      setProcessing(true)
      
      const { error } = await supabase
        .from('posts')
        .update({
          status: 'rejected',
          published: false,
          reviewer_id: user.id,
          reviewer_notes: reviewerNotes,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', selectedPost.id)
      
      if (error) throw error
      
      // Notify author via email if possible
      try {
        if (selectedPost.profiles?.email_contact) {
          await supabase.functions.invoke('send-post-approval-notification', {
            body: {
              to: selectedPost.profiles.email_contact,
              authorName: selectedPost.profiles.full_name,
              postTitle: selectedPost.title,
              postUrl: `${window.location.origin}/dashboard/posts/edit/${selectedPost.id}`,
              reviewerNotes: reviewerNotes,
              approved: false
            }
          })
        }
      } catch (emailError) {
        console.error('Email notification failed, but post was rejected:', emailError)
      }
      
      // Update local state
      setPosts(posts.map(p => 
        p.id === selectedPost.id 
          ? { 
              ...p, 
              status: 'rejected', 
              published: false,
              reviewer_id: user.id,
              reviewer_notes: reviewerNotes,
              reviewed_at: new Date().toISOString()
            } 
          : p
      ))
      
      setSelectedPost(null)
      setReviewerNotes('')
      
    } catch (error) {
      console.error('Error rejecting post:', error)
      alert('Failed to reject post. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_approval':
        return (
          <span className="flex items-center px-3 py-1 bg-yellow-500/20 text-yellow-500 rounded-full text-sm">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </span>
        )
      case 'published':
        return (
          <span className="flex items-center px-3 py-1 bg-green-500/20 text-green-500 rounded-full text-sm">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </span>
        )
      case 'rejected':
        return (
          <span className="flex items-center px-3 py-1 bg-red-500/20 text-red-500 rounded-full text-sm">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </span>
        )
      default:
        return (
          <span className="flex items-center px-3 py-1 bg-gray-500/20 text-gray-500 rounded-full text-sm">
            <FileText className="w-3 h-3 mr-1" />
            Draft
          </span>
        )
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

  const pendingCount = posts.filter(p => p.status === 'pending_approval').length
  const approvedCount = posts.filter(p => p.status === 'published').length
  const rejectedCount = posts.filter(p => p.status === 'rejected').length

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
          
          <h1 className="text-4xl font-bold gradient-text mb-2">Content Approval</h1>
          <p className="text-secondary">Review and manage posts submitted by contributors</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div 
            className={`glass-card p-6 ${filterStatus === 'pending_approval' ? 'border-2 border-yellow-500/50' : ''}`}
            onClick={() => setFilterStatus('pending_approval')}
            role="button"
          >
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-6 h-6 text-yellow-500" />
              {pendingCount > 0 && (
                <span className="bg-yellow-500 text-black text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
            </div>
            <h3 className="text-sm text-secondary mb-1">Pending Approval</h3>
            <p className="text-3xl font-bold text-primary">{pendingCount}</p>
          </div>
          
          <div 
            className={`glass-card p-6 ${filterStatus === 'published' ? 'border-2 border-green-500/50' : ''}`}
            onClick={() => setFilterStatus('published')}
            role="button"
          >
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
            <h3 className="text-sm text-secondary mb-1">Approved Posts</h3>
            <p className="text-3xl font-bold text-primary">{approvedCount}</p>
          </div>
          
          <div 
            className={`glass-card p-6 ${filterStatus === 'rejected' ? 'border-2 border-red-500/50' : ''}`}
            onClick={() => setFilterStatus('rejected')}
            role="button"
          >
            <div className="flex items-center justify-between mb-2">
              <XCircle className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-sm text-secondary mb-1">Rejected Posts</h3>
            <p className="text-3xl font-bold text-primary">{rejectedCount}</p>
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
              <option value="pending_approval">Pending Approval</option>
              <option value="published">Approved</option>
              <option value="rejected">Rejected</option>
            </select>

            {/* View All Posts Link */}
            <Link
              href="/admin/posts"
              className="px-4 py-2 bg-surface-secondary hover:bg-surface-hover border border-surface-border rounded-lg text-primary transition-colors"
            >
              View All Posts
            </Link>
          </div>
        </div>

        {/* Posts List */}
        {filteredPosts.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <FileText className="w-12 h-12 text-secondary mx-auto mb-4" />
            <p className="text-xl font-semibold mb-2">No posts found</p>
            <p className="text-secondary mb-6">
              {filterStatus === 'pending_approval' 
                ? 'There are no posts waiting for approval.' 
                : filterStatus === 'published'
                ? 'No approved posts found.'
                : filterStatus === 'rejected'
                ? 'No rejected posts found.'
                : 'No posts match your search criteria.'}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="btn-secondary"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="glass-card rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-secondary/50 border-b surface-border">
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Author</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Submitted</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-secondary uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y surface-border">
                {filteredPosts.map(post => (
                  <tr key={post.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-primary font-medium">{post.title}</div>
                      <div className="text-xs text-secondary">
                        {post.topic_category && (
                          <span className="inline-block mr-2">
                            {post.topic_category.replace(/-/g, ' ')}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-brand-primary/20 rounded-full flex items-center justify-center mr-3 text-xs font-bold">
                          {post.profiles?.full_name ? post.profiles.full_name.substring(0, 2).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <div className="text-primary">{post.profiles?.full_name || 'Unknown User'}</div>
                          <div className="text-xs text-secondary">@{post.profiles?.username || 'unknown'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-secondary">
                      {post.submitted_at ? formatDate(post.submitted_at) : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(post.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleViewPost(post)}
                        className="btn-secondary inline-flex items-center"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Post Review Modal */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="glass-card rounded-2xl max-w-4xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-primary">{selectedPost.title}</h2>
                  {getStatusBadge(selectedPost.status)}
                </div>
                <div className="flex items-center flex-wrap text-secondary text-sm gap-x-4">
                  <span className="flex items-center">
                    <User className="w-4 h-4 mr-1" />
                    {selectedPost.profiles?.full_name || 'Unknown Author'}
                  </span>
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Submitted: {formatDate(selectedPost.submitted_at)}
                  </span>
                  {selectedPost.status !== 'pending_approval' && selectedPost.reviewed_at && (
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      Reviewed: {formatDate(selectedPost.reviewed_at)}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={handleClosePostView}
                className="text-secondary hover:text-primary transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            {/* Post Preview */}
            <div className="mb-6 border surface-border rounded-lg p-6 overflow-auto max-h-[50vh]">
              {selectedPost.excerpt && (
                <p className="text-xl text-secondary mb-4">{selectedPost.excerpt}</p>
              )}
              
              <div className="prose prose-invert max-w-none">
                {selectedPost.content && (
                  typeof selectedPost.content === 'string' && selectedPost.content.startsWith('[') ?
                    // Handle content as array of blocks
                    JSON.parse(selectedPost.content).map((block: any) => {
                      if (block.type === 'paragraph' && block.content?.text) {
                        return <div key={block.id} dangerouslySetInnerHTML={{ __html: block.content.text }} className="mb-4" />
                      }
                      
                      if (block.type === 'heading' && block.content?.text) {
                        const HeadingTag = block.content?.level || 'h2'
                        return <HeadingTag key={block.id} dangerouslySetInnerHTML={{ __html: block.content.text }} className="font-bold mb-4" />
                      }
                      
                      if (block.type === 'image' && block.content?.url) {
                        return (
                          <figure key={block.id} className="mb-4">
                            <img 
                              src={block.content.url} 
                              alt={block.content.caption || 'Image'} 
                              className="max-w-full h-auto rounded"
                            />
                            {block.content.caption && (
                              <figcaption className="text-sm text-center mt-2 text-secondary">
                                {block.content.caption}
                              </figcaption>
                            )}
                          </figure>
                        )
                      }
                      
                      return null
                    })
                  :
                    // Handle content as string
                    <div dangerouslySetInnerHTML={{ __html: selectedPost.content }} />
                )}
              </div>
            </div>
            
            {/* Post Stats */}
            <div className="flex flex-wrap gap-6 mb-6 text-sm text-secondary">
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {selectedPost.views_count || 0} views
              </span>
              <span className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                {selectedPost.likes_count || 0} likes
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare className="w-4 h-4" />
                {selectedPost.comments_count || 0} comments
              </span>
              {selectedPost.post_type && (
                <span className="flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  {selectedPost.post_type}
                </span>
              )}
              {selectedPost.topic_category && (
                <span className="flex items-center gap-1">
                  <BarChart className="w-4 h-4" />
                  {selectedPost.topic_category.replace(/-/g, ' ')}
                </span>
              )}
            </div>
            
            {/* Review Section */}
            <div className="border surface-border rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4 text-primary">Review Notes</h3>
              
              {selectedPost.status !== 'pending_approval' && selectedPost.reviewer_notes ? (
                <div className="mb-4">
                  <p className="text-secondary">
                    <strong className="text-primary">Admin Feedback:</strong>
                  </p>
                  <p className="text-secondary bg-surface-secondary p-4 rounded-lg mt-2">
                    {selectedPost.reviewer_notes}
                  </p>
                </div>
              ) : (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2 text-secondary">
                    Feedback for Author
                    {selectedPost.status === 'pending_approval' && (
                      <span className="text-xs text-red-500 ml-1">
                        (Required for rejections)
                      </span>
                    )}
                  </label>
                  <textarea
                    value={reviewerNotes}
                    onChange={(e) => setReviewerNotes(e.target.value)}
                    rows={4}
                    placeholder="Enter feedback or suggestions for the author..."
                    className="w-full px-4 py-2 bg-surface-secondary border border-surface-border rounded-lg focus:outline-none focus:border-brand-primary text-primary"
                    disabled={selectedPost.status !== 'pending_approval'}
                  />
                </div>
              )}
              
              {selectedPost.status === 'pending_approval' && (
                <div className="flex justify-end gap-4">
                  <button
                    onClick={handleRejectPost}
                    disabled={processing}
                    className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {processing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4" />
                        Reject
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleApprovePost}
                    disabled={processing}
                    className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {processing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Approve
                      </>
                    )}
                  </button>
                </div>
              )}
              
              {selectedPost.status === 'rejected' && (
                <div className="flex justify-end gap-4">
                  <button
                    onClick={() => router.push(`/dashboard/posts/edit/${selectedPost.id}`)}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Post
                  </button>
                </div>
              )}
              
              {selectedPost.status === 'published' && (
                <div className="flex justify-end gap-4">
                  <Link
                    href={`/posts/${selectedPost.slug || selectedPost.id}`}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    View Published Post
                  </Link>
                </div>
              )}
            </div>
            
            {/* Email Notification */}
            {selectedPost.status === 'pending_approval' && (
              <div className="flex items-start gap-3 text-sm text-secondary">
                <Mail className="w-5 h-5 text-brand-primary flex-shrink-0 mt-0.5" />
                <p>
                  An email will automatically be sent to <strong>{selectedPost.profiles?.email_contact || 'the author'}</strong> when you approve or reject this post.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}