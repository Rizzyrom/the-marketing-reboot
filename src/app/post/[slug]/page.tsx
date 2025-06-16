'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import ExclusiveHeader from '@/components/ExclusiveHeader'
import ParticleSystem from '@/components/brand/ParticleSystem'
import { 
  ArrowLeft, Heart, MessageCircle, Bookmark, Share2, Eye,
  MoreHorizontal, Flag, Edit2, Trash2, ThumbsUp, Send,
  Calendar, Clock, TrendingUp, Award, CheckCircle,
  Twitter, Linkedin, Copy, ExternalLink
} from 'lucide-react'

export default function PostViewPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  
  const [post, setPost] = useState<any>(null)
  const [author, setAuthor] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [showMoreMenu, setShowMoreMenu] = useState(false)
  const [comment, setComment] = useState('')
  const [comments, setComments] = useState<any[]>([])
  const [relatedPosts, setRelatedPosts] = useState<any[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)

  // Post types configuration
  const postTypes: Record<string, any> = {
    'strategy-reboot': { name: 'Strategy Reboot', color: 'from-brand-primary to-purple-500' },
    'tool-reboot': { name: 'Tool Reboot', color: 'from-green-400 to-brand-primary' },
    'career-reboot': { name: 'Career Reboot', color: 'from-purple-500 to-pink-500' },
    'campaign-reboot': { name: 'Campaign Reboot', color: 'from-yellow-400 to-orange-500' },
    'team-reboot': { name: 'Team Reboot', color: 'from-cyan-400 to-brand-primary' },
    'mindset-reboot': { name: 'Mindset Reboot', color: 'from-pink-400 to-purple-500' }
  }

  // Topic categories
  const topicCategories: Record<string, any> = {
    'brand-creative': { name: 'Brand & Creative', icon: '🎨' },
    'growth-performance': { name: 'Growth & Performance', icon: '📈' },
    'content-communications': { name: 'Content & Communications', icon: '✍️' },
    'seo-organic': { name: 'SEO & Organic Discovery', icon: '🔍' },
    'ai-automation': { name: 'AI & Automation', icon: '🤖' },
    'web-tech': { name: 'Web & Tech', icon: '💻' },
    'social-community': { name: 'Social & Community', icon: '📱' },
    'sales-strategy': { name: 'Sales & Strategy', icon: '🎯' },
    'careers-culture': { name: 'Careers & Culture', icon: '🚀' }
  }

  useEffect(() => {
    // Get current user
    const authUser = localStorage.getItem('auth-user')
    if (authUser) {
      setCurrentUser(JSON.parse(authUser))
    }

    // Load post data
    loadPost()
    loadComments()
    loadRelatedPosts()
  }, [slug])

  const loadPost = () => {
    // In production, this would fetch from database
    const posts = JSON.parse(localStorage.getItem('published-posts') || '[]')
    const foundPost = posts.find((p: any) => p.slug === slug)
    
    if (foundPost) {
      setPost(foundPost)
      
      // Update view count
      foundPost.viewsCount = (foundPost.viewsCount || 0) + 1
      localStorage.setItem('published-posts', JSON.stringify(posts))
      
      // Load author profile
      const savedProfile = localStorage.getItem('user-profile')
      if (savedProfile) {
        const profileData = JSON.parse(savedProfile)
        setAuthor(profileData.profile)
      } else {
        // Mock author data
        setAuthor({
          fullName: foundPost.authorName || 'Anonymous Author',
          username: 'author',
          avatar: null,
          jobTitle: 'Marketing Professional',
          company: 'TechCo'
        })
      }
    }
    
    setLoading(false)
  }

  const loadComments = () => {
    // Mock comments
    setComments([
      {
        id: '1',
        author: {
          name: 'Sarah Chen',
          avatar: 'SC',
          title: 'Growth Lead @ Stripe'
        },
        content: 'This is exactly what we needed to hear! We\'ve been struggling with similar attribution issues. Can you share more details about the simple system you built?',
        timestamp: '2 hours ago',
        likes: 12
      },
      {
        id: '2',
        author: {
          name: 'Marcus Johnson',
          avatar: 'MJ',
          title: 'VP Marketing @ Notion'
        },
        content: 'Brilliant approach. We made a similar move last quarter and saw immediate improvements in decision-making speed.',
        timestamp: '4 hours ago',
        likes: 8
      }
    ])
  }

  const loadRelatedPosts = () => {
    // Mock related posts
    setRelatedPosts([
      {
        id: '1',
        title: 'Why Marketing Attribution is Broken',
        excerpt: 'The uncomfortable truth about multi-touch attribution...',
        type: 'strategy-reboot',
        author: 'Tom Wilson',
        views: 1842
      },
      {
        id: '2',
        title: 'Building a Single Source of Truth',
        excerpt: 'How we consolidated 7 different data sources...',
        type: 'tool-reboot',
        author: 'Lisa Park',
        views: 923
      },
      {
        id: '3',
        title: 'The Revenue-First Marketing Model',
        excerpt: 'Aligning every marketing activity to revenue impact...',
        type: 'strategy-reboot',
        author: 'David Kim',
        views: 1567
      }
    ])
  }

  const handleLike = () => {
    setLiked(!liked)
    const posts = JSON.parse(localStorage.getItem('published-posts') || '[]')
    const postIndex = posts.findIndex((p: any) => p.slug === slug)
    if (postIndex >= 0) {
      posts[postIndex].likesCount = liked 
        ? posts[postIndex].likesCount - 1 
        : posts[postIndex].likesCount + 1
      localStorage.setItem('published-posts', JSON.stringify(posts))
      setPost({ ...post, likesCount: posts[postIndex].likesCount })
    }
  }

  const handleBookmark = () => {
    setBookmarked(!bookmarked)
  }

  const handleShare = (platform?: string) => {
    const url = window.location.href
    const title = post?.title || ''
    
    if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`, '_blank')
    } else if (platform === 'linkedin') {
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank')
    } else if (platform === 'copy') {
      navigator.clipboard.writeText(url)
      alert('Link copied to clipboard!')
    } else if (navigator.share) {
      navigator.share({ title, url })
    }
    
    setShowShareMenu(false)
  }

  const handleComment = () => {
    if (!comment.trim()) return
    
    const newComment = {
      id: Date.now().toString(),
      author: {
        name: currentUser?.name || 'Anonymous',
        avatar: currentUser?.name?.charAt(0).toUpperCase() || 'A',
        title: 'Community Member'
      },
      content: comment,
      timestamp: 'Just now',
      likes: 0
    }
    
    setComments([newComment, ...comments])
    setComment('')
    
    // Update comment count
    const posts = JSON.parse(localStorage.getItem('published-posts') || '[]')
    const postIndex = posts.findIndex((p: any) => p.slug === slug)
    if (postIndex >= 0) {
      posts[postIndex].commentsCount = (posts[postIndex].commentsCount || 0) + 1
      localStorage.setItem('published-posts', JSON.stringify(posts))
      setPost({ ...post, commentsCount: posts[postIndex].commentsCount })
    }
  }

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this post?')) {
      const posts = JSON.parse(localStorage.getItem('published-posts') || '[]')
      const filteredPosts = posts.filter((p: any) => p.slug !== slug)
      localStorage.setItem('published-posts', JSON.stringify(filteredPosts))
      router.push('/')
    }
  }

  const formatContent = (content: string) => {
    // Basic markdown parsing
    return content
      .split('\n')
      .map((line, idx) => {
        // Headers
        if (line.startsWith('## ')) {
          return <h2 key={idx} className="text-2xl font-bold mt-6 mb-3 text-primary">{line.substring(3)}</h2>
        }
        if (line.startsWith('# ')) {
          return <h1 key={idx} className="text-3xl font-bold mt-6 mb-3 text-primary">{line.substring(2)}</h1>
        }
        
        // Lists
        if (line.startsWith('- ')) {
          return <li key={idx} className="ml-6 list-disc text-secondary">{line.substring(2)}</li>
        }
        
        // Quotes
        if (line.startsWith('> ')) {
          return (
            <blockquote key={idx} className="border-l-4 border-brand-primary pl-4 italic my-4 text-secondary">
              {line.substring(2)}
            </blockquote>
          )
        }
        
        // Bold and italic
        let formatted = line
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>')
          .replace(/`(.*?)`/g, '<code class="bg-tertiary px-1 py-0.5 rounded text-sm">$1</code>')
        
        // Regular paragraph
        return line.trim() ? (
          <p key={idx} className="mb-4 leading-relaxed text-secondary" dangerouslySetInnerHTML={{ __html: formatted }} />
        ) : null
      })
      .filter(Boolean)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="text-primary">Loading post...</div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary mb-4">Post not found</h1>
          <Link href="/" className="text-brand-primary hover:text-blue-300">
            ← Back to home
          </Link>
        </div>
      </div>
    )
  }

  const postType = postTypes[post.postType]
  const category = topicCategories[post.topicCategory]
  const isAuthor = currentUser?.email === post.authorId

  return (
    <div className="min-h-screen bg-primary transition-colors duration-500">
      <ParticleSystem />
      <ExclusiveHeader />

      {/* Header */}
      <header className="sticky top-20 z-40 bg-secondary backdrop-blur border-b surface-border">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-secondary hover:text-primary transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleLike}
              className={`p-2 rounded-lg transition-colors ${
                liked ? 'text-red-500 bg-red-500/10' : 'text-secondary hover:text-primary'
              }`}
            >
              <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
            </button>
            
            <button
              onClick={handleBookmark}
              className={`p-2 rounded-lg transition-colors ${
                bookmarked ? 'text-brand-primary bg-brand-primary/10' : 'text-secondary hover:text-primary'
              }`}
            >
              <Bookmark className={`w-5 h-5 ${bookmarked ? 'fill-current' : ''}`} />
            </button>
            
            <div className="relative">
              <button
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="p-2 rounded-lg text-secondary hover:text-primary transition-colors"
              >
                <Share2 className="w-5 h-5" />
              </button>
              
              {showShareMenu && (
                <div className="absolute right-0 top-12 w-48 bg-secondary rounded-lg shadow-xl border surface-border p-2">
                  <button
                    onClick={() => handleShare('twitter')}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:surface-hover rounded transition-colors text-primary"
                  >
                    <Twitter className="w-4 h-4" />
                    Share on Twitter
                  </button>
                  <button
                    onClick={() => handleShare('linkedin')}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:surface-hover rounded transition-colors text-primary"
                  >
                    <Linkedin className="w-4 h-4" />
                    Share on LinkedIn
                  </button>
                  <button
                    onClick={() => handleShare('copy')}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:surface-hover rounded transition-colors text-primary"
                  >
                    <Copy className="w-4 h-4" />
                    Copy Link
                  </button>
                </div>
              )}
            </div>
            
            {isAuthor && (
              <div className="relative">
                <button
                  onClick={() => setShowMoreMenu(!showMoreMenu)}
                  className="p-2 rounded-lg text-secondary hover:text-primary transition-colors"
                >
                  <MoreHorizontal className="w-5 h-5" />
                </button>
                
                {showMoreMenu && (
                  <div className="absolute right-0 top-12 w-48 bg-secondary rounded-lg shadow-xl border surface-border p-2">
                    <Link
                      href={`/post/edit/${post.slug}`}
                      className="w-full flex items-center gap-3 px-3 py-2 hover:surface-hover rounded transition-colors text-primary"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit Post
                    </Link>
                    <button
                      onClick={handleDelete}
                      className="w-full flex items-center gap-3 px-3 py-2 hover:surface-hover rounded transition-colors text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Post
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <article className="max-w-4xl mx-auto px-4 py-8">
        {/* Post Header */}
        <div className="mb-8">
          {postType && (
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-4 bg-gradient-to-r ${postType.color} text-white`}>
              {postType.name}
            </div>
          )}
          
          <h1 className="text-4xl font-bold mb-4 text-primary">{post.title}</h1>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted">
            <Link href={`/profile/${author?.username || 'author'}`} className="flex items-center gap-2 hover:text-primary transition-colors">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-brand-primary to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                {author?.fullName?.charAt(0) || 'A'}
              </div>
              <span className="font-medium">{author?.fullName || post.authorName}</span>
            </Link>
            
            <span>•</span>
            
            <Link href={`/topic/${post.topicCategory}`} className="hover:text-primary transition-colors">
              {category?.icon} {category?.name}
            </Link>
            
            <span>•</span>
            
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(post.publishedAt).toLocaleDateString()}
            </span>
            
            <span>•</span>
            
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {Math.ceil(post.content.split(' ').length / 200)} min read
            </span>
          </div>
        </div>

        {/* Post Excerpt */}
        {post.excerpt && (
          <p className="text-xl text-secondary mb-8 leading-relaxed">
            {post.excerpt}
          </p>
        )}

        {/* Post Content */}
        <div className="prose prose-invert prose-lg max-w-none mb-8">
          {formatContent(post.content)}
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {post.tags.map((tag: string) => (
              <Link
                key={tag}
                href={`/tag/${tag}`}
                className="px-3 py-1 bg-secondary hover:surface-hover rounded-full text-sm transition-colors text-secondary"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}

        {/* Post Stats */}
        <div className="flex items-center gap-6 py-4 border-t border-b surface-border mb-8 text-sm text-muted">
          <span className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            {post.viewsCount || 0} views
          </span>
          <span className="flex items-center gap-2">
            <Heart className="w-4 h-4" />
            {post.likesCount || 0} likes
          </span>
          <span className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            {post.commentsCount || 0} comments
          </span>
        </div>

        {/* Author Bio */}
        <div className="glass-card rounded-lg p-6 mb-8">
          <Link href={`/profile/${author?.username || 'author'}`} className="flex items-start gap-4 group">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-brand-primary to-purple-500 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
              {author?.fullName?.charAt(0) || 'A'}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg group-hover:text-brand-primary transition-colors text-primary">
                {author?.fullName || post.authorName}
              </h3>
              <p className="text-muted mb-2">
                {author?.jobTitle} {author?.company && `at ${author.company}`}
              </p>
              <p className="text-secondary">
                {author?.bio || 'Marketing professional sharing insights and strategies.'}
              </p>
            </div>
          </Link>
        </div>

        {/* Comments Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6 text-primary">
            Comments ({comments.length})
          </h2>

          {/* Comment Form */}
          {currentUser ? (
            <div className="glass-card rounded-lg p-4 mb-6">
              <textarea
                className="w-full p-3 bg-tertiary border surface-border rounded-lg text-primary focus:border-brand-primary focus:outline-none transition-colors"
                rows={3}
                placeholder="Share your thoughts..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <div className="flex justify-end mt-3">
                <button
                  onClick={handleComment}
                  className="btn-primary flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Post Comment
                </button>
              </div>
            </div>
          ) : (
            <div className="glass-card rounded-lg p-6 text-center mb-6">
              <p className="text-muted mb-3">Join the conversation</p>
              <Link href="/auth/login" className="text-brand-primary hover:text-blue-300 font-medium">
                Sign in to comment
              </Link>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-4">
            {comments.map(comment => (
              <div key={comment.id} className="glass-card rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-400 to-brand-primary flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {comment.author.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-primary">{comment.author.name}</h4>
                        <p className="text-sm text-muted">{comment.author.title}</p>
                      </div>
                      <span className="text-sm text-muted">{comment.timestamp}</span>
                    </div>
                    <p className="text-secondary mb-3">{comment.content}</p>
                    <button className="flex items-center gap-2 text-sm text-muted hover:text-primary transition-colors">
                      <ThumbsUp className="w-4 h-4" />
                      {comment.likes}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Related Posts */}
        <div>
          <h2 className="text-2xl font-bold mb-6 text-primary">Related Reboots</h2>
          <div className="grid gap-4">
            {relatedPosts.map(relatedPost => {
              const relatedType = postTypes[relatedPost.type]
              return (
                <Link
                  key={relatedPost.id}
                  href={`/post/${relatedPost.id}`}
                  className="glass-card rounded-lg p-4 hover:border-brand-primary transition-colors group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold mb-2 bg-gradient-to-r ${relatedType?.color || 'from-gray-500 to-gray-600'} text-white`}>
                        {relatedType?.name || 'Post'}
                      </div>
                      <h3 className="font-semibold mb-1 group-hover:text-brand-primary transition-colors text-primary">
                        {relatedPost.title}
                      </h3>
                      <p className="text-sm text-muted mb-2">{relatedPost.excerpt}</p>
                      <p className="text-xs text-muted">
                        By {relatedPost.author} • {relatedPost.views} views
                      </p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-muted flex-shrink-0 mt-1" />
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </article>
    </div>
  )
}