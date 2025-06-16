'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ExclusiveHeader from '@/components/ExclusiveHeader'
import ParticleSystem from '@/components/brand/ParticleSystem'
import { 
  ArrowLeft, Save, Eye, Send, X, Plus, Hash, Image, Link2,
  Code, Bold, Italic, List, Quote, Heading1, Heading2,
  AlertCircle, CheckCircle, Loader2, Sparkles, TrendingUp,
  Briefcase, Users, Brain, Lightbulb, Target, Zap
} from 'lucide-react'

export default function CreatePostPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  
  // Post data
  const [post, setPost] = useState({
    title: '',
    excerpt: '',
    content: '',
    postType: '',
    topicCategory: '',
    tags: [] as string[],
    featured: false,
    published: false,
    slug: ''
  })

  // Tag input
  const [tagInput, setTagInput] = useState('')

  // Post types
  const postTypes = [
    { id: 'strategy-reboot', name: 'Strategy Reboot', icon: Target, color: 'from-brand-primary to-purple-500' },
    { id: 'tool-reboot', name: 'Tool Reboot', icon: Zap, color: 'from-green-400 to-brand-primary' },
    { id: 'career-reboot', name: 'Career Reboot', icon: TrendingUp, color: 'from-purple-500 to-pink-500' },
    { id: 'campaign-reboot', name: 'Campaign Reboot', icon: Sparkles, color: 'from-yellow-400 to-orange-500' },
    { id: 'team-reboot', name: 'Team Reboot', icon: Users, color: 'from-cyan-400 to-brand-primary' },
    { id: 'mindset-reboot', name: 'Mindset Reboot', icon: Brain, color: 'from-pink-400 to-purple-500' }
  ]

  // Topic categories
  const topicCategories = [
    { id: 'brand-creative', name: 'Brand & Creative', icon: '🎨' },
    { id: 'growth-performance', name: 'Growth & Performance', icon: '📈' },
    { id: 'content-communications', name: 'Content & Communications', icon: '✍️' },
    { id: 'seo-organic', name: 'SEO & Organic Discovery', icon: '🔍' },
    { id: 'ai-automation', name: 'AI & Automation', icon: '🤖' },
    { id: 'web-tech', name: 'Web & Tech', icon: '💻' },
    { id: 'social-community', name: 'Social & Community', icon: '📱' },
    { id: 'sales-strategy', name: 'Sales & Strategy', icon: '🎯' },
    { id: 'careers-culture', name: 'Careers & Culture', icon: '🚀' }
  ]

  // Popular tags
  const popularTags = [
    'paid-media', 'seo', 'content-strategy', 'brand-building', 'growth-hacking',
    'email-marketing', 'social-media', 'analytics', 'conversion-optimization',
    'marketing-automation', 'ai-tools', 'team-building', 'leadership'
  ]

  useEffect(() => {
    const authUser = localStorage.getItem('auth-user')
    if (authUser) {
      setUser(JSON.parse(authUser))
    } else {
      router.push('/auth/login')
    }
  }, [router])

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleTitleChange = (value: string) => {
    setPost({
      ...post,
      title: value,
      slug: generateSlug(value)
    })
  }

  const addTag = (tag: string) => {
    const cleanTag = tag.trim().toLowerCase().replace(/[^a-z0-9-]/g, '')
    if (cleanTag && !post.tags.includes(cleanTag)) {
      setPost({ ...post, tags: [...post.tags, cleanTag] })
    }
    setTagInput('')
  }

  const removeTag = (tagToRemove: string) => {
    setPost({ ...post, tags: post.tags.filter(tag => tag !== tagToRemove) })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput) {
      e.preventDefault()
      addTag(tagInput)
    }
  }

  const insertFormatting = (format: string) => {
    const textarea = document.getElementById('content-editor') as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = post.content.substring(start, end)
    let newText = ''

    switch (format) {
      case 'bold':
        newText = `**${selectedText || 'bold text'}**`
        break
      case 'italic':
        newText = `*${selectedText || 'italic text'}*`
        break
      case 'h1':
        newText = `\n# ${selectedText || 'Heading 1'}\n`
        break
      case 'h2':
        newText = `\n## ${selectedText || 'Heading 2'}\n`
        break
      case 'list':
        newText = `\n- ${selectedText || 'List item'}\n`
        break
      case 'quote':
        newText = `\n> ${selectedText || 'Quote'}\n`
        break
      case 'code':
        newText = `\`${selectedText || 'code'}\``
        break
      case 'link':
        newText = `[${selectedText || 'link text'}](url)`
        break
      default:
        return
    }

    const newContent = post.content.substring(0, start) + newText + post.content.substring(end)
    setPost({ ...post, content: newContent })
    
    // Reset cursor position
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + newText.length, start + newText.length)
    }, 0)
  }

  const saveDraft = async () => {
    setSaving(true)
    
    // Save to localStorage (in production, this would go to database)
    const drafts = JSON.parse(localStorage.getItem('post-drafts') || '[]')
    const existingIndex = drafts.findIndex((d: any) => d.slug === post.slug)
    
    const draftData = {
      ...post,
      authorId: user?.email,
      authorName: user?.name,
      savedAt: new Date().toISOString(),
      published: false
    }

    if (existingIndex >= 0) {
      drafts[existingIndex] = draftData
    } else {
      drafts.push(draftData)
    }

    localStorage.setItem('post-drafts', JSON.stringify(drafts))
    
    setTimeout(() => {
      setSaving(false)
      alert('Draft saved!')
    }, 1000)
  }

  const publishPost = async () => {
    if (!post.title || !post.content || !post.postType || !post.topicCategory) {
      alert('Please fill in all required fields')
      return
    }

    setLoading(true)
    
    // Save to localStorage (in production, this would go to database)
    const posts = JSON.parse(localStorage.getItem('published-posts') || '[]')
    
    const postData = {
      ...post,
      id: Date.now().toString(),
      authorId: user?.email,
      authorName: user?.name,
      publishedAt: new Date().toISOString(),
      published: true,
      likesCount: 0,
      commentsCount: 0,
      viewsCount: 0
    }

    posts.unshift(postData) // Add to beginning
    localStorage.setItem('published-posts', JSON.stringify(posts))
    
    // Remove from drafts if exists
    const drafts = JSON.parse(localStorage.getItem('post-drafts') || '[]')
    const filteredDrafts = drafts.filter((d: any) => d.slug !== post.slug)
    localStorage.setItem('post-drafts', JSON.stringify(filteredDrafts))
    
    setTimeout(() => {
      setLoading(false)
      setShowSuccess(true)
      
      setTimeout(() => {
        router.push(`/post/${post.slug}`)
      }, 2000)
    }, 1500)
  }

  const renderPreview = () => {
    const selectedType = postTypes.find(t => t.id === post.postType)
    const selectedCategory = topicCategories.find(c => c.id === post.topicCategory)

    return (
      <div className="prose prose-invert max-w-none">
        <div className="mb-8">
          {selectedType && (
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-4 bg-gradient-to-r ${selectedType.color}`}>
              <selectedType.icon className="w-4 h-4" />
              {selectedType.name}
            </div>
          )}
          
          <h1 className="text-4xl font-bold mb-4 text-primary">{post.title || 'Untitled Post'}</h1>
          
          <div className="flex items-center gap-4 text-sm text-muted mb-6">
            <span>By {user?.name || 'Anonymous'}</span>
            <span>•</span>
            <span>{selectedCategory?.icon} {selectedCategory?.name}</span>
            <span>•</span>
            <span>Just now</span>
          </div>
          
          {post.excerpt && (
            <p className="text-xl text-secondary mb-8">{post.excerpt}</p>
          )}
        </div>
        
        <div className="whitespace-pre-wrap text-secondary">
          {post.content || 'Start writing your reboot story...'}
        </div>
        
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-8">
            {post.tags.map(tag => (
              <span key={tag} className="px-3 py-1 bg-tertiary rounded-full text-sm text-secondary">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    )
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center transition-colors duration-500">
        <ParticleSystem />
        <div className="text-center">
          <div className="mb-4">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto" />
          </div>
          <h1 className="text-3xl font-bold mb-2 text-primary">Post Published!</h1>
          <p className="text-muted mb-4">Redirecting to your post...</p>
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-brand-primary" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-primary transition-colors duration-500">
      <ParticleSystem />
      <ExclusiveHeader />

      {/* Header */}
      <header className="sticky top-20 z-40 bg-secondary border-b surface-border">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-secondary hover:text-primary transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-bold text-primary">Create New Reboot</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="px-4 py-2 text-secondary hover:text-primary transition-colors flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              {showPreview ? 'Editor' : 'Preview'}
            </button>
            <button
              onClick={saveDraft}
              disabled={saving}
              className="btn-secondary flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Draft'}
            </button>
            <button
              onClick={publishPost}
              disabled={loading}
              className="btn-primary flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Publish
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Editor/Preview */}
          <div className="lg:col-span-2">
            {showPreview ? (
              <div className="glass-card rounded-2xl p-8">
                {renderPreview()}
              </div>
            ) : (
              <div className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full p-4 bg-secondary border surface-border rounded-lg text-primary text-xl font-semibold focus:border-brand-primary focus:outline-none transition-colors"
                    placeholder="How I Completely Rebooted Our Marketing Strategy"
                    value={post.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                  />
                  {post.slug && (
                    <p className="text-sm text-muted mt-1">
                      URL: /post/{post.slug}
                    </p>
                  )}
                </div>

                {/* Excerpt */}
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    Excerpt
                  </label>
                  <textarea
                    className="w-full p-3 bg-secondary border surface-border rounded-lg text-primary focus:border-brand-primary focus:outline-none transition-colors"
                    rows={2}
                    placeholder="A brief summary of your reboot (appears in post previews)"
                    value={post.excerpt}
                    onChange={(e) => setPost({ ...post, excerpt: e.target.value })}
                  />
                </div>

                {/* Content Editor */}
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    Content <span className="text-red-400">*</span>
                  </label>
                  
                  {/* Formatting Toolbar */}
                  <div className="bg-tertiary rounded-t-lg p-2 flex items-center gap-1 border surface-border border-b-0">
                    <button
                      type="button"
                      onClick={() => insertFormatting('bold')}
                      className="p-2 hover:surface-hover rounded transition-colors text-secondary"
                      title="Bold"
                    >
                      <Bold className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting('italic')}
                      className="p-2 hover:surface-hover rounded transition-colors text-secondary"
                      title="Italic"
                    >
                      <Italic className="w-4 h-4" />
                    </button>
                    <div className="w-px h-6 bg-surface-border mx-1" />
                    <button
                      type="button"
                      onClick={() => insertFormatting('h1')}
                      className="p-2 hover:surface-hover rounded transition-colors text-secondary"
                      title="Heading 1"
                    >
                      <Heading1 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting('h2')}
                      className="p-2 hover:surface-hover rounded transition-colors text-secondary"
                      title="Heading 2"
                    >
                      <Heading2 className="w-4 h-4" />
                    </button>
                    <div className="w-px h-6 bg-surface-border mx-1" />
                    <button
                      type="button"
                      onClick={() => insertFormatting('list')}
                      className="p-2 hover:surface-hover rounded transition-colors text-secondary"
                      title="List"
                    >
                      <List className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting('quote')}
                      className="p-2 hover:surface-hover rounded transition-colors text-secondary"
                      title="Quote"
                    >
                      <Quote className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting('code')}
                      className="p-2 hover:surface-hover rounded transition-colors text-secondary"
                      title="Code"
                    >
                      <Code className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting('link')}
                      className="p-2 hover:surface-hover rounded transition-colors text-secondary"
                      title="Link"
                    >
                      <Link2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <textarea
                    id="content-editor"
                    className="w-full p-4 bg-secondary border surface-border rounded-b-lg text-primary focus:border-brand-primary focus:outline-none transition-colors font-mono"
                    rows={20}
                    placeholder="Share your reboot story... What did you change? What were the results? What did you learn?"
                    value={post.content}
                    onChange={(e) => setPost({ ...post, content: e.target.value })}
                  />
                  
                  <p className="text-sm text-muted mt-2">
                    Supports Markdown formatting
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Post Type */}
            <div className="glass-card rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-primary">
                Post Type <span className="text-red-400">*</span>
              </h3>
              <div className="space-y-2">
                {postTypes.map(type => {
                  const Icon = type.icon
                  return (
                    <button
                      key={type.id}
                      onClick={() => setPost({ ...post, postType: type.id })}
                      className={`w-full p-3 rounded-lg border transition-all flex items-center gap-3 ${
                        post.postType === type.id
                          ? 'border-brand-primary bg-brand-primary/10'
                          : 'border-surface-border hover:border-brand-primary/50'
                      }`}
                    >
                      <div className={`p-2 rounded bg-gradient-to-r ${type.color}`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-medium text-primary">{type.name}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Topic Category */}
            <div className="glass-card rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-primary">
                Topic Category <span className="text-red-400">*</span>
              </h3>
              <select
                className="w-full p-3 bg-secondary border surface-border rounded-lg text-primary focus:border-brand-primary focus:outline-none transition-colors"
                value={post.topicCategory}
                onChange={(e) => setPost({ ...post, topicCategory: e.target.value })}
              >
                <option value="">Select a category</option>
                {topicCategories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div className="glass-card rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-primary">Tags</h3>
              
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="text"
                  className="flex-1 p-2 bg-secondary border surface-border rounded-lg text-primary text-sm focus:border-brand-primary focus:outline-none transition-colors"
                  placeholder="Add a tag"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <button
                  onClick={() => addTag(tagInput)}
                  className="p-2 bg-brand-primary hover:bg-blue-600 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4 text-white" />
                </button>
              </div>

              {/* Current Tags */}
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-tertiary rounded-full text-sm flex items-center gap-1 text-primary"
                    >
                      <Hash className="w-3 h-3" />
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-red-400 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Popular Tags */}
              <div>
                <p className="text-xs text-muted mb-2">Popular tags:</p>
                <div className="flex flex-wrap gap-1">
                  {popularTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => addTag(tag)}
                      className="px-2 py-1 text-xs bg-tertiary/50 hover:bg-tertiary rounded transition-colors text-secondary"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Featured Post */}
            <div className="glass-card rounded-lg p-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-5 h-5 rounded border-surface-border bg-secondary text-brand-primary focus:ring-brand-primary focus:ring-offset-0"
                  checked={post.featured}
                  onChange={(e) => setPost({ ...post, featured: e.target.checked })}
                />
                <div>
                  <span className="font-medium text-primary">Feature this post</span>
                  <p className="text-sm text-muted">
                    Featured posts appear at the top of the homepage
                  </p>
                </div>
              </label>
            </div>

            {/* Guidelines */}
            <div className="glass-card rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-primary">
                <AlertCircle className="w-5 h-5 text-yellow-400" />
                Reboot Guidelines
              </h3>
              <ul className="space-y-2 text-sm text-secondary">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">✓</span>
                  Share real results with specific metrics
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">✓</span>
                  Explain what you changed and why
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">✓</span>
                  Include lessons learned
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">✓</span>
                  Be authentic and honest
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-0.5">✗</span>
                  No promotional content or spam
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-0.5">✗</span>
                  No generic advice or theory
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}