'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import ExclusiveHeader from '@/components/ExclusiveHeader'
import ParticleSystem from '@/components/brand/ParticleSystem'
import { 
  Camera, Save, Eye, Layout, Palette, Settings, Plus, GripVertical,
  Type, Image, Video, BarChart3, Trophy, Users, TrendingUp,
  Calendar, MessageSquare, Link2, Code, Briefcase, MapPin,
  Globe, Linkedin, Twitter, Github, Youtube, Instagram, Music,
  FileText, BookOpen, Target, Lightbulb, X, Upload, Rss,
  ArrowLeft, Home, LayoutDashboard
} from 'lucide-react'

export default function ProfileEditPage() {
  const { user, profile } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('basic')
  const [previewMode, setPreviewMode] = useState(false)
  const [previewDevice, setPreviewDevice] = useState('desktop')
  const [selectedTheme, setSelectedTheme] = useState('lightning')
  const [draggedBlock, setDraggedBlock] = useState<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Profile data with new fields
  const [profileData, setProfileData] = useState({
    fullName: '',
    username: '',
    headline: '',
    profession: '',
    company: '',
    location: '',
    bio: '',
    avatar: '',
    experience: [] as string[],
    linkedinUrl: '',
    twitterUrl: '',
    githubUrl: '',
    websiteUrl: '',
    instagramUrl: '',
    youtubeUrl: '',
    email: '',
    theme: 'lightning',
    customCSS: '',
    layout: 'default'
  })

  // Content blocks with drag support
  const [contentBlocks, setContentBlocks] = useState<any[]>([])

  // Enhanced themes updated for Lightning Bolt branding
  const themes: Record<string, { name: string; styles: string; class: string }> = {
    lightning: {
      name: 'Lightning Bolt (Default)',
      styles: `
        --bg-primary: var(--bg-primary);
        --bg-secondary: var(--bg-secondary);
        --text-primary: var(--text-primary);
        --text-secondary: var(--text-secondary);
        --accent: var(--brand-primary);
        --accent-secondary: var(--brand-tertiary);
        --border: var(--surface-border);
      `,
      class: 'theme-lightning'
    },
    executive: {
      name: 'Executive',
      styles: `
        --bg-primary: #FFFFFF;
        --bg-secondary: #F9FAFB;
        --text-primary: #111827;
        --text-secondary: #6B7280;
        --accent: #F59E0B;
        --accent-secondary: #3B82F6;
        --border: #E5E7EB;
        background: #FFFFFF;
        color: var(--text-primary);
        font-family: 'Inter', sans-serif;
      `,
      class: 'theme-executive'
    },
    sunset: {
      name: 'Sunset Vibes',
      styles: `
        --bg-primary: #FEF3C7;
        --bg-secondary: #FDE68A;
        --text-primary: #78350F;
        --text-secondary: #92400E;
        --accent: #F97316;
        --accent-secondary: #A855F7;
        --border: #FCD34D;
        background: linear-gradient(135deg, #FEF3C7 0%, #FED7AA 100%);
        color: var(--text-primary);
        font-family: 'Playfair Display', serif;
      `,
      class: 'theme-sunset'
    },
    ocean: {
      name: 'Ocean Breeze',
      styles: `
        --bg-primary: #F0F9FF;
        --bg-secondary: #E0F2FE;
        --text-primary: #0C4A6E;
        --text-secondary: #0284C7;
        --accent: #0891B2;
        --accent-secondary: #10B981;
        --border: #BAE6FD;
        background: linear-gradient(180deg, #F0F9FF 0%, #CFFAFE 100%);
        color: var(--text-primary);
        font-family: 'Poppins', sans-serif;
      `,
      class: 'theme-ocean'
    },
    forest: {
      name: 'Forest',
      styles: `
        --bg-primary: #F0FDF4;
        --bg-secondary: #DCFCE7;
        --text-primary: #14532D;
        --text-secondary: #166534;
        --accent: #059669;
        --accent-secondary: #84CC16;
        --border: #86EFAC;
        background: linear-gradient(135deg, #F0FDF4 0%, #D1FAE5 100%);
        color: var(--text-primary);
        font-family: 'Merriweather', serif;
      `,
      class: 'theme-forest'
    },
    cosmic: {
      name: 'Cosmic',
      styles: `
        --bg-primary: #1E1B4B;
        --bg-secondary: #312E81;
        --text-primary: #F3F4F6;
        --text-secondary: #C7D2FE;
        --accent: #EC4899;
        --accent-secondary: #8B5CF6;
        --border: #6366F1;
        background: radial-gradient(ellipse at top, #1E1B4B 0%, #111827 100%);
        color: var(--text-primary);
        font-family: 'Space Grotesk', monospace;
      `,
      class: 'theme-cosmic'
    }
  }

  // Enhanced content block templates
  const blockTemplates = [
    { id: 'heading', name: 'Heading', icon: Type },
    { id: 'text', name: 'Text Block', icon: FileText },
    { id: 'image', name: 'Image', icon: Image },
    { id: 'video', name: 'Video', icon: Video },
    { id: 'stats', name: 'Stats Grid', icon: BarChart3 },
    { id: 'achievements', name: 'Achievements', icon: Trophy },
    { id: 'testimonials', name: 'Testimonials', icon: MessageSquare },
    { id: 'team', name: 'Team Section', icon: Users },
    { id: 'timeline', name: 'Timeline', icon: Calendar },
    { id: 'projects', name: 'Projects', icon: Briefcase },
    { id: 'skills', name: 'Skills', icon: Target },
    { id: 'cta', name: 'Call to Action', icon: Lightbulb },
    { id: 'social-links', name: 'Social Links', icon: Link2 },
    { id: 'youtube-feed', name: 'YouTube Feed', icon: Youtube },
    { id: 'twitter-feed', name: 'Twitter/X Feed', icon: Twitter },
    { id: 'instagram-feed', name: 'Instagram Feed', icon: Instagram },
    { id: 'linkedin-feed', name: 'LinkedIn Feed', icon: Linkedin },
    { id: 'rss-feed', name: 'RSS Feed', icon: Rss },
    { id: 'github-activity', name: 'GitHub Activity', icon: Github },
    { id: 'custom-embed', name: 'Custom Embed', icon: Code },
    { id: 'html', name: 'Custom HTML/CSS', icon: Code }
  ]

  // Layout templates with actual content
  const layoutTemplates = {
    default: { name: 'Default', blocks: [] },
    portfolio: { 
      name: 'Portfolio', 
      blocks: [
        { type: 'heading', content: { text: 'Featured Projects' }, size: { width: 'full' } },
        { type: 'projects', content: {}, size: { width: 'full' } },
        { type: 'skills', content: {}, size: { width: 'half' } },
        { type: 'github-activity', content: {}, size: { width: 'half' } }
      ]
    },
    executive: {
      name: 'Executive',
      blocks: [
        { type: 'stats', content: {}, size: { width: 'full' } },
        { type: 'achievements', content: {}, size: { width: 'two-thirds' } },
        { type: 'testimonials', content: {}, size: { width: 'one-third' } }
      ]
    },
    creator: {
      name: 'Content Creator',
      blocks: [
        { type: 'youtube-feed', content: {}, size: { width: 'half' } },
        { type: 'instagram-feed', content: {}, size: { width: 'half' } },
        { type: 'twitter-feed', content: {}, size: { width: 'full' } }
      ]
    }
  }

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }
    
    // Load profile data from the profile in context
    if (profile) {
      setProfileData(prev => ({
        ...prev,
        fullName: profile.full_name || '',
        username: profile.username || '',
        email: user.email || '',
        bio: profile.bio || '',
        company: profile.company || '',
        location: profile.location || '',
        linkedinUrl: profile.linkedin_url || '',
        twitterUrl: profile.twitter_url || '',
        websiteUrl: profile.website_url || '',
        avatar: profile.avatar_url || '',
        theme: profile.theme || 'lightning',
        customCSS: profile.custom_css || '',
        profession: profile.job_title || '',
      }))
    }
    
    // Load saved profile blocks from localStorage (temporary)
    const savedBlocks = localStorage.getItem(`profile-blocks-${user.id}`)
    if (savedBlocks) {
      const blocksData = JSON.parse(savedBlocks)
      setContentBlocks(blocksData.blocks || [])
      if (blocksData.layout) {
        setProfileData(prev => ({ ...prev, layout: blocksData.layout }))
      }
    }
    
    setLoading(false)
  }, [user, profile, router])

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setProfileData({ ...profileData, avatar: e.target?.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  const addExperience = () => {
    const newExperience = prompt('Enter role/company (e.g., "CMO at TechCorp")')
    if (newExperience) {
      setProfileData({ 
        ...profileData, 
        experience: [...(profileData.experience || []), newExperience] 
      })
    }
  }

  const removeExperience = (index: number) => {
    setProfileData({
      ...profileData,
      experience: (profileData.experience || []).filter((_, i) => i !== index)
    })
  }

  const handleSave = () => {
    setSaving(true)
    const profileDataToSave = {
      profile: { ...profileData, theme: selectedTheme },
      blocks: contentBlocks
    }
    localStorage.setItem('user-profile', JSON.stringify(profileDataToSave))
    setTimeout(() => {
      setSaving(false)
      alert('Profile saved successfully!')
    }, 1000)
  }

  const addContentBlock = (type: string) => {
    const newBlock = {
      id: Date.now().toString(),
      type,
      content: {},
      size: { width: 'full' },
      position: contentBlocks.length,
      styles: {
        backgroundColor: '',
        borderStyle: 'none',
        animation: 'none',
        customCSS: ''
      }
    }
    setContentBlocks([...contentBlocks, newBlock])
  }

  const updateBlock = (blockId: string, updates: any) => {
    setContentBlocks(blocks =>
      blocks.map(block =>
        block.id === blockId ? { ...block, ...updates } : block
      )
    )
  }

  const deleteBlock = (blockId: string) => {
    setContentBlocks(blocks => blocks.filter(block => block.id !== blockId))
  }

  const handleDragStart = (e: React.DragEvent, block: any) => {
    setDraggedBlock(block)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, targetBlock: any) => {
    e.preventDefault()
    if (!draggedBlock || draggedBlock.id === targetBlock.id) return

    const newBlocks = [...contentBlocks]
    const draggedIndex = newBlocks.findIndex(b => b.id === draggedBlock.id)
    const targetIndex = newBlocks.findIndex(b => b.id === targetBlock.id)
    
    newBlocks.splice(draggedIndex, 1)
    newBlocks.splice(targetIndex, 0, draggedBlock)
    
    setContentBlocks(newBlocks)
    setDraggedBlock(null)
  }

  const renderBlockContent = (block: any) => {
    switch (block.type) {
      case 'heading':
        return (
          <input
            type="text"
            placeholder="Enter heading..."
            className="w-full text-3xl font-bold bg-transparent border-b surface-border p-2 text-primary"
            value={block.content?.text || ''}
            onChange={(e) => updateBlock(block.id, { 
              content: { ...block.content, text: e.target.value } 
            })}
          />
        )
      
      case 'text':
        return (
          <textarea
            placeholder="Enter text content..."
            className="w-full bg-transparent border surface-border rounded p-3 min-h-[100px] text-primary"
            value={block.content?.text || ''}
            onChange={(e) => updateBlock(block.id, { 
              content: { ...block.content, text: e.target.value } 
            })}
          />
        )
      
      case 'youtube-feed':
        return (
          <div>
            <input
              type="text"
              placeholder="YouTube channel URL or ID"
              className="w-full bg-secondary border surface-border rounded p-2 mb-2 text-primary"
              value={block.content?.channelId || ''}
              onChange={(e) => updateBlock(block.id, { 
                content: { ...block.content, channelId: e.target.value } 
              })}
            />
            <div className="text-secondary text-sm">
              Latest videos from your YouTube channel will appear here
            </div>
          </div>
        )
      
      case 'twitter-feed':
        return (
          <div>
            <input
              type="text"
              placeholder="Twitter/X username (without @)"
              className="w-full bg-secondary border surface-border rounded p-2 mb-2 text-primary"
              value={block.content?.username || ''}
              onChange={(e) => updateBlock(block.id, { 
                content: { ...block.content, username: e.target.value } 
              })}
            />
            <div className="text-secondary text-sm">
              Your latest tweets will be displayed here
            </div>
          </div>
        )
      
      case 'instagram-feed':
        return (
          <div>
            <input
              type="text"
              placeholder="Instagram username"
              className="w-full bg-secondary border surface-border rounded p-2 mb-2 text-primary"
              value={block.content?.username || ''}
              onChange={(e) => updateBlock(block.id, { 
                content: { ...block.content, username: e.target.value } 
              })}
            />
            <div className="text-secondary text-sm">
              Your Instagram posts will be displayed in a grid
            </div>
          </div>
        )
      
      case 'linkedin-feed':
        return (
          <div>
            <input
              type="text"
              placeholder="LinkedIn profile URL"
              className="w-full bg-secondary border surface-border rounded p-2 mb-2 text-primary"
              value={block.content?.profileUrl || ''}
              onChange={(e) => updateBlock(block.id, { 
                content: { ...block.content, profileUrl: e.target.value } 
              })}
            />
            <div className="text-secondary text-sm">
              Recent LinkedIn activity and posts
            </div>
          </div>
        )
      
      case 'github-activity':
        return (
          <div>
            <input
              type="text"
              placeholder="GitHub username"
              className="w-full bg-secondary border surface-border rounded p-2 mb-2 text-primary"
              value={block.content?.username || ''}
              onChange={(e) => updateBlock(block.id, { 
                content: { ...block.content, username: e.target.value } 
              })}
            />
            <div className="text-secondary text-sm">
              Your GitHub contribution graph and recent activity
            </div>
          </div>
        )
      
      case 'custom-embed':
        return (
          <div>
            <textarea
              placeholder="Paste any embed code (iframe, widget, etc.)..."
              className="w-full bg-secondary border surface-border rounded p-2 mb-2 font-mono text-sm text-primary"
              rows={4}
              value={block.content?.code || ''}
              onChange={(e) => updateBlock(block.id, { 
                content: { ...block.content, code: e.target.value } 
              })}
            />
            {block.content?.code && (
              <div dangerouslySetInnerHTML={{ __html: block.content.code }} />
            )}
          </div>
        )
      
      case 'html':
        return (
          <div>
            <textarea
              placeholder="Enter custom HTML/CSS..."
              className="w-full bg-secondary border surface-border rounded p-2 mb-2 font-mono text-sm text-primary"
              rows={6}
              value={block.content?.html || ''}
              onChange={(e) => updateBlock(block.id, { 
                content: { ...block.content, html: e.target.value } 
              })}
            />
            {block.content?.html && (
              <div dangerouslySetInnerHTML={{ __html: block.content.html }} />
            )}
          </div>
        )
      
      default:
        return (
          <div className="text-secondary p-4 border border-dashed surface-border rounded">
            {block.type} block - Configuration coming soon
          </div>
        )
    }
  }

  const getBlockSizeClass = (size: string) => {
    switch (size) {
      case 'one-third': return 'col-span-1'
      case 'half': return 'col-span-2'
      case 'two-thirds': return 'col-span-2'
      case 'full': default: return 'col-span-3'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <ParticleSystem />
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto"></div>
          <p className="mt-4 text-secondary">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (previewMode) {
    const currentTheme = themes[selectedTheme]
    const themeStyles = `.${currentTheme.class} { ${currentTheme.styles} }`
    
    return (
      <div className={`min-h-screen ${currentTheme.class}`}>
        <style dangerouslySetInnerHTML={{ __html: themeStyles }} />
        {/* Preview Header */}
        <div className="fixed top-0 left-0 right-0 bg-black/80 backdrop-blur border-b border-white/10 p-4 z-50">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setPreviewMode(false)}
                className="text-white hover:text-brand-primary"
              >
                ← Back to Editor
              </button>
              <span className="text-gray-400">Preview Mode</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPreviewDevice('desktop')}
                className={`px-3 py-1 rounded ${previewDevice === 'desktop' ? 'bg-brand-primary text-white' : 'bg-gray-700 text-gray-300'}`}
              >
                Desktop
              </button>
              <button
                onClick={() => setPreviewDevice('tablet')}
                className={`px-3 py-1 rounded ${previewDevice === 'tablet' ? 'bg-brand-primary text-white' : 'bg-gray-700 text-gray-300'}`}
              >
                Tablet
              </button>
              <button
                onClick={() => setPreviewDevice('mobile')}
                className={`px-3 py-1 rounded ${previewDevice === 'mobile' ? 'bg-brand-primary text-white' : 'bg-gray-700 text-gray-300'}`}
              >
                Mobile
              </button>
            </div>
          </div>
        </div>
        
        {/* Preview Content */}
        <div className="pt-20 p-8">
          <div className={`mx-auto ${
            previewDevice === 'mobile' ? 'max-w-sm' : 
            previewDevice === 'tablet' ? 'max-w-2xl' : 'max-w-6xl'
          }`}>
            {/* Custom CSS */}
            <style dangerouslySetInnerHTML={{ __html: profileData.customCSS }} />
            
            {/* Profile Header */}
            <div className="glass-card mb-8">
              <div className="flex items-start gap-6">
                <div className="relative">
                  {profileData.avatar ? (
                    <img 
                      src={profileData.avatar} 
                      alt={profileData.fullName}
                      className="w-32 h-32 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full flex items-center justify-center text-4xl font-bold bg-gradient-to-r from-brand-primary to-brand-tertiary text-white">
                      {profileData.fullName?.charAt(0) || 'U'}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h1 className="text-4xl font-bold mb-1 text-primary">{profileData.fullName || 'Your Name'}</h1>
                  <p className="text-xl mb-2 text-brand-primary">@{profileData.username || 'username'}</p>
                  {profileData.headline && profileData.headline.trim() && (
                    <h2 className="text-2xl mb-3 text-secondary">{profileData.headline}</h2>
                  )}
                  <p className="text-lg mb-1 text-primary">
                    {profileData.profession || 'Profession'}
                    {profileData.company && ` at ${profileData.company}`}
                  </p>
                  <p className="mb-4 text-secondary">{profileData.location || 'Location'}</p>
                  {profileData.experience && profileData.experience.length > 0 && (
                    <div className="mb-4">
                      <h3 className="font-semibold mb-2 text-primary">Experience & Credibility</h3>
                      <ul className="space-y-1">
                        {profileData.experience.map((exp, idx) => (
                          <li key={idx} className="text-secondary">• {exp}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <p className="text-lg text-primary">{profileData.bio || 'Your bio will appear here...'}</p>
                </div>
              </div>
            </div>
            
            {/* Content Blocks */}
            <div className="grid grid-cols-3 gap-6">
              {contentBlocks.map(block => (
                <div key={block.id} className={getBlockSizeClass(block.size?.width || 'full')}>
                  <div className="glass-card">
                    {block.type === 'heading' && <h2 className="text-3xl font-bold text-primary">{block.content?.text || ''}</h2>}
                    {block.type === 'text' && <p className="text-primary">{block.content?.text || ''}</p>}
                    {block.type === 'youtube-feed' && (
                      <div>
                        <h3 className="font-bold mb-4 text-primary">YouTube Videos</h3>
                        <div className="grid grid-cols-2 gap-4">
                          {[1,2,3,4].map(i => (
                            <div key={i} className="aspect-video bg-black/20 rounded flex items-center justify-center">
                              <Youtube className="w-12 h-12 opacity-50 text-secondary" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {block.type === 'twitter-feed' && (
                      <div>
                        <h3 className="font-bold mb-4 text-primary">Latest Tweets</h3>
                        <div className="space-y-4">
                          {[1,2,3].map(i => (
                            <div key={i} className="p-4 rounded bg-secondary">
                              <Twitter className="w-5 h-5 mb-2 text-brand-primary" />
                              <p className="text-sm text-secondary">Sample tweet content...</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {block.type === 'instagram-feed' && (
                      <div>
                        <h3 className="font-bold mb-4 text-primary">Instagram</h3>
                        <div className="grid grid-cols-3 gap-2">
                          {[1,2,3,4,5,6].map(i => (
                            <div key={i} className="aspect-square bg-black/20 rounded flex items-center justify-center">
                              <Instagram className="w-8 h-8 opacity-50 text-secondary" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {block.type === 'custom-embed' && block.content?.code && (
                      <div dangerouslySetInnerHTML={{ __html: block.content.code }} />
                    )}
                    {block.type === 'html' && block.content?.html && (
                      <div dangerouslySetInnerHTML={{ __html: block.content.html }} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-primary">
      <ParticleSystem />
      
      {/* Main Navigation Header */}
      <ExclusiveHeader />
      
      {/* Editor Header */}
      <header className="bg-secondary border-b surface-border p-4 mt-16">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link 
              href="/dashboard" 
              className="text-brand-primary hover:text-brand-secondary flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-primary">Profile Studio</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href={`/profile/${profileData.username || profile?.username || 'me'}`}
              className="flex items-center gap-2 px-4 py-2 bg-brand-purple hover:bg-brand-purple-light rounded-lg transition-colors text-white"
            >
              <Eye className="w-4 h-4" />
              View Profile
            </Link>
            <button
              onClick={() => setPreviewMode(true)}
              className="flex items-center gap-2 px-4 py-2 bg-secondary hover:surface-hover rounded-lg transition-colors text-primary border surface-border"
            >
              <Eye className="w-4 h-4" />
              Preview
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-brand-tertiary hover:bg-brand-green-light rounded-lg transition-colors text-white"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-145px)]">
        {/* Sidebar */}
        <div className="w-64 bg-secondary border-r surface-border overflow-y-auto">
          <div className="p-4">
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('basic')}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'basic' ? 'bg-brand-primary text-white' : 'text-secondary hover:surface-hover'
                }`}
              >
                <Settings className="inline w-4 h-4 mr-2" />
                Basic Info
              </button>
              <button
                onClick={() => setActiveTab('blocks')}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'blocks' ? 'bg-brand-primary text-white' : 'text-secondary hover:surface-hover'
                }`}
              >
                <Layout className="inline w-4 h-4 mr-2" />
                Content Blocks
              </button>
              <button
                onClick={() => setActiveTab('theme')}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'theme' ? 'bg-brand-primary text-white' : 'text-secondary hover:surface-hover'
                }`}
              >
                <Palette className="inline w-4 h-4 mr-2" />
                Theme
              </button>
              <button
                onClick={() => setActiveTab('css')}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'css' ? 'bg-brand-primary text-white' : 'text-secondary hover:surface-hover'
                }`}
              >
                <Code className="inline w-4 h-4 mr-2" />
                Custom CSS
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {/* Basic Info Tab */}
          {activeTab === 'basic' && (
            <div className="max-w-2xl space-y-6">
              <h2 className="text-2xl font-bold text-primary mb-6">Basic Information</h2>
              
              {/* Avatar Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-secondary mb-2">Profile Photo</label>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {profileData.avatar ? (
                      <img 
                        src={profileData.avatar} 
                        alt="Avatar"
                        className="w-24 h-24 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-brand-primary to-brand-tertiary flex items-center justify-center">
                        <Camera className="w-8 h-8 text-white" />
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-brand-primary hover:bg-brand-secondary rounded-lg transition-colors text-white flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Photo
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">Full Name</label>
                  <input
                    type="text"
                    className="w-full p-3 bg-secondary border surface-border rounded-lg text-primary"
                    value={profileData.fullName}
                    onChange={(e) => setProfileData({...profileData, fullName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">Username</label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-secondary">@</span>
                    <input
                      type="text"
                      className="w-full p-3 pl-8 bg-secondary border surface-border rounded-lg text-primary"
                      value={profileData.username}
                      onChange={(e) => setProfileData({...profileData, username: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary mb-2">Headline (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g., 'Transforming Brands Through Data-Driven Marketing'"
                  className="w-full p-3 bg-secondary border surface-border rounded-lg text-primary placeholder-muted"
                  value={profileData.headline}
                  onChange={(e) => setProfileData({...profileData, headline: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">Profession</label>
                  <input
                    type="text"
                    placeholder="e.g., Chief Marketing Officer"
                    className="w-full p-3 bg-secondary border surface-border rounded-lg text-primary placeholder-muted"
                    value={profileData.profession}
                    onChange={(e) => setProfileData({...profileData, profession: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">Company</label>
                  <input
                    type="text"
                    className="w-full p-3 bg-secondary border surface-border rounded-lg text-primary"
                    value={profileData.company}
                    onChange={(e) => setProfileData({...profileData, company: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary mb-2">Location</label>
                <input
                  type="text"
                  className="w-full p-3 bg-secondary border surface-border rounded-lg text-primary"
                  value={profileData.location}
                  onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary mb-2">Bio</label>
                <textarea
                  className="w-full p-3 bg-secondary border surface-border rounded-lg text-primary"
                  rows={4}
                  value={profileData.bio}
                  onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Experience & Credibility
                </label>
                <div className="space-y-2">
                  {profileData.experience && profileData.experience.map((exp, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={exp}
                        onChange={(e) => {
                          const newExp = [...(profileData.experience || [])]
                          newExp[idx] = e.target.value
                          setProfileData({...profileData, experience: newExp})
                        }}
                        className="flex-1 p-2 bg-secondary border surface-border rounded text-primary"
                      />
                      <button
                        onClick={() => removeExperience(idx)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={addExperience}
                    className="text-brand-primary hover:text-brand-secondary text-sm"
                  >
                    + Add Experience/Role
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-primary mb-4">Social Links</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Linkedin className="w-5 h-5 text-secondary" />
                    <input
                      type="text"
                      placeholder="LinkedIn URL"
                      className="flex-1 p-2 bg-secondary border surface-border rounded text-primary placeholder-muted"
                      value={profileData.linkedinUrl}
                      onChange={(e) => setProfileData({...profileData, linkedinUrl: e.target.value})}
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Twitter className="w-5 h-5 text-secondary" />
                    <input
                      type="text"
                      placeholder="Twitter/X URL"
                      className="flex-1 p-2 bg-secondary border surface-border rounded text-primary placeholder-muted"
                      value={profileData.twitterUrl}
                      onChange={(e) => setProfileData({...profileData, twitterUrl: e.target.value})}
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Instagram className="w-5 h-5 text-secondary" />
                    <input
                      type="text"
                      placeholder="Instagram URL"
                      className="flex-1 p-2 bg-secondary border surface-border rounded text-primary placeholder-muted"
                      value={profileData.instagramUrl}
                      onChange={(e) => setProfileData({...profileData, instagramUrl: e.target.value})}
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Youtube className="w-5 h-5 text-secondary" />
                    <input
                      type="text"
                      placeholder="YouTube URL"
                      className="flex-1 p-2 bg-secondary border surface-border rounded text-primary placeholder-muted"
                      value={profileData.youtubeUrl}
                      onChange={(e) => setProfileData({...profileData, youtubeUrl: e.target.value})}
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Github className="w-5 h-5 text-secondary" />
                    <input
                      type="text"
                      placeholder="GitHub URL"
                      className="flex-1 p-2 bg-secondary border surface-border rounded text-primary placeholder-muted"
                      value={profileData.githubUrl}
                      onChange={(e) => setProfileData({...profileData, githubUrl: e.target.value})}
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-secondary" />
                    <input
                      type="text"
                      placeholder="Website URL"
                      className="flex-1 p-2 bg-secondary border surface-border rounded text-primary placeholder-muted"
                      value={profileData.websiteUrl}
                      onChange={(e) => setProfileData({...profileData, websiteUrl: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Content Blocks Tab */}
          {activeTab === 'blocks' && (
            <div>
              <h2 className="text-2xl font-bold text-primary mb-6">Content Blocks</h2>
              
              {/* Block Templates */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-secondary mb-4">Add New Block</h3>
                <div className="grid grid-cols-4 gap-3">
                  {blockTemplates.map(template => {
                    const Icon = template.icon
                    return (
                      <button
                        key={template.id}
                        onClick={() => addContentBlock(template.id)}
                        className="p-4 bg-secondary hover:surface-hover rounded-lg transition-colors text-center border surface-border"
                      >
                        <Icon className="w-8 h-8 mx-auto mb-2 text-secondary" />
                        <span className="text-sm text-secondary">{template.name}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Current Blocks */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-secondary">Current Blocks</h3>
                {contentBlocks.length === 0 ? (
                  <p className="text-muted">No blocks added yet. Click a template above to add content.</p>
                ) : (
                  contentBlocks.map((block, index) => (
                    <div 
                      key={block.id} 
                      className="glass-card"
                      draggable
                      onDragStart={(e) => handleDragStart(e, block)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, block)}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <GripVertical className="w-5 h-5 text-secondary cursor-move" />
                          <span className="font-medium text-primary">
                            {blockTemplates.find(t => t.id === block.type)?.name || block.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <select
                            className="px-3 py-1 bg-secondary border surface-border rounded text-sm text-primary"
                            value={block.size?.width || 'full'}
                            onChange={(e) => updateBlock(block.id, {
                              size: { ...block.size, width: e.target.value }
                            })}
                          >
                            <option value="one-third">1/3 Width</option>
                            <option value="half">1/2 Width</option>
                            <option value="two-thirds">2/3 Width</option>
                            <option value="full">Full Width</option>
                          </select>
                          <button
                            onClick={() => deleteBlock(block.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Block Content Editor */}
                      {renderBlockContent(block)}
                      
                      {/* Block Styling Options */}
                      <details className="mt-4">
                        <summary className="text-sm text-secondary cursor-pointer hover:text-primary">
                          Block Styling Options
                        </summary>
                        <div className="mt-3 space-y-3">
                          <div>
                            <label className="block text-xs text-secondary mb-1">Background</label>
                            <select
                              className="w-full p-2 bg-secondary border surface-border rounded text-sm text-primary"
                              value={block.styles?.backgroundColor || ''}
                              onChange={(e) => updateBlock(block.id, {
                                styles: { ...block.styles, backgroundColor: e.target.value }
                              })}
                            >
                              <option value="">Default</option>
                              <option value="bg-gradient-to-r from-brand-primary to-brand-secondary">Blue Gradient</option>
                              <option value="bg-gradient-to-r from-brand-tertiary to-brand-primary">Green Gradient</option>
                              <option value="bg-secondary">Dark</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-xs text-secondary mb-1">Custom CSS (for this block)</label>
                            <textarea
                              className="w-full p-2 bg-secondary border surface-border rounded text-sm text-primary font-mono"
                              rows={2}
                              placeholder="#block-id { /* your CSS */ }"
                              value={block.styles?.customCSS || ''}
                              onChange={(e) => updateBlock(block.id, {
                                styles: { ...block.styles, customCSS: e.target.value }
                              })}
                            />
                          </div>
                        </div>
                      </details>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Theme Tab */}
          {activeTab === 'theme' && (
            <div>
              <h2 className="text-2xl font-bold text-primary mb-6">Choose Theme</h2>
              <div className="grid grid-cols-3 gap-4">
                {Object.entries(themes).map(([key, theme]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedTheme(key)}
                    className={`p-6 rounded-lg border-2 transition-all ${
                      selectedTheme === key
                        ? 'border-brand-primary bg-secondary'
                        : 'surface-border bg-primary hover:border-brand-secondary'
                    }`}
                  >
                    <h3 className="font-semibold text-primary mb-3">{theme.name}</h3>
                    <div 
                      className="h-24 rounded mb-3" 
                      style={{ 
                        background: key === 'lightning' ? 'linear-gradient(135deg, #1E40AF, #10B981)' :
                                   key === 'executive' ? 'linear-gradient(135deg, #FFFFFF, #F9FAFB)' :
                                   key === 'sunset' ? 'linear-gradient(135deg, #FEF3C7, #F97316)' :
                                   key === 'ocean' ? 'linear-gradient(135deg, #F0F9FF, #0891B2)' :
                                   key === 'forest' ? 'linear-gradient(135deg, #F0FDF4, #059669)' :
                                   'linear-gradient(135deg, #1E1B4B, #EC4899)'
                      }}
                    />
                    <p className="text-sm text-secondary">
                      {key === 'lightning' && 'Lightning Bolt brand theme'}
                      {key === 'executive' && 'Clean, professional, minimal'}
                      {key === 'sunset' && 'Warm, creative, artistic'}
                      {key === 'ocean' && 'Cool, calm, trustworthy'}
                      {key === 'forest' && 'Natural, organic, sustainable'}
                      {key === 'cosmic' && 'Bold, mysterious, innovative'}
                    </p>
                  </button>
                ))}
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-semibold text-primary mb-4">Layout Template</h3>
                <select
                  className="w-full max-w-xs p-3 bg-secondary border surface-border rounded-lg text-primary"
                  value={profileData.layout}
                  onChange={(e) => {
                    setProfileData({...profileData, layout: e.target.value})
                    // Apply template blocks if not default
                    if (e.target.value !== 'default') {
                      const template = layoutTemplates[e.target.value as keyof typeof layoutTemplates]
                      if (template && template.blocks) {
                        const newBlocks = template.blocks.map(b => ({
                          ...b,
                          id: Date.now().toString() + Math.random(),
                          position: contentBlocks.length,
                          size: b.size || { width: 'full' },
                          styles: {}
                        }))
                        setContentBlocks([...contentBlocks, ...newBlocks])
                      }
                    }
                  }}
                >
                  <option value="default">Default (Empty)</option>
                  <option value="portfolio">Portfolio</option>
                  <option value="executive">Executive</option>
                  <option value="creator">Content Creator</option>
                </select>
                <p className="text-sm text-secondary mt-2">
                  Templates add pre-configured blocks to your profile
                </p>
              </div>
            </div>
          )}

          {/* Custom CSS Tab */}
          {activeTab === 'css' && (
            <div>
              <h2 className="text-2xl font-bold text-primary mb-6">Custom CSS</h2>
              <p className="text-secondary mb-4">
                Add custom CSS to style your entire profile. Use standard CSS syntax.
              </p>
              
              <textarea
                className="w-full h-96 p-4 bg-secondary border surface-border rounded-lg text-primary font-mono text-sm"
                placeholder={`/* Example CSS */
.profile-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* Custom animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Style specific blocks */
#block-123456 {
  transform: rotate(-2deg);
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
}

/* Your custom styles here... */`}
                value={profileData.customCSS}
                onChange={(e) => setProfileData({...profileData, customCSS: e.target.value})}
              />
              
              <div className="mt-4 p-4 bg-secondary rounded-lg">
                <h4 className="font-semibold text-primary mb-2">CSS Tips:</h4>
                <ul className="text-sm text-secondary space-y-1">
                  <li>• Use class selectors for better specificity</li>
                  <li>• Import Google Fonts with @import</li>
                  <li>• Add animations and transitions</li>
                  <li>• Override theme colors with CSS variables</li>
                  <li>• Each block has a unique ID you can target</li>
                  <li>• Use media queries for responsive design</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}