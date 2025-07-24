'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useAuth } from '@/contexts/AuthContext'
import ExclusiveHeader from '@/components/ExclusiveHeader'
import ParticleSystem from '@/components/brand/ParticleSystem'
import {
  ChevronDown, ChevronUp, Plus, X, Trash2, Copy, Settings, Eye, 
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, 
  List, ListOrdered, Image, Video, FileText, Link, Quote, Code, 
  Type, PenLine, Layout, MessageSquare, BarChart2, Calendar, 
  Hash, Clock, PieChart, Upload, Check, Palette, Heading1, Heading2, Heading3,
  Minus, ArrowDown, User, LayoutGrid, CircleDashed, FilePieChart,
  ArrowLeft, SendHorizonal, Save, AlertCircle
} from 'lucide-react'

// Define types
interface Block {
  id: string;
  type: string;
  content: Record<string, any>;
  styles?: Record<string, string>;
}

interface PostData {
  id?: string;
  title?: string;
  excerpt?: string;
  featuredImage?: string;
  tags?: string[];
  topic?: string;
  blocks?: Block[];
  slug?: string;
  status?: 'draft' | 'pending_approval' | 'published' | 'rejected';
  author_id?: string;
  published?: boolean;
  lastSaved?: string;
  submittedAt?: string;
  reviewedAt?: string;
  reviewer_id?: string;
  reviewer_notes?: string;
}

interface EditorProps {
  initialContent?: PostData | null;
  onSave?: (postData: PostData) => void;
}

interface BlockStyle {
  label: string;
  value: string;
}

interface Topic {
  id: string;
  name: string;
}

interface Template {
  id: string;
  name: string;
  description: string;
  blocks: Block[];
}

interface BlockCategory {
  type: string;
  name: string;
  icon: React.ComponentType<any>;
}

interface TextFormattingOption {
  name: string;
  icon: React.ComponentType<any>;
  style: string;
}

interface BlockControlsProps {
  block: Block;
  index: number;
  moveBlock: (blockId: string, direction: 'up' | 'down') => void;
  duplicateBlock: (blockId: string) => void;
  removeBlock: (blockId: string) => void;
}

interface BlockStylingPanelProps {
  block: Block;
  updateBlockStyles: (blockId: string, styles: Record<string, string>) => void;
}

interface CalloutStyleType {
  bg: string;
  border: string;
}

interface BlockStatsType {
  wordCount: number;
  blockCount: number;
  readingTime: number;
}

// Main component
const UltimateContentEditor: React.FC<EditorProps> = ({ initialContent = null, onSave }) => {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const { user, profile } = useAuth()
  
  // Main state
  const [blocks, setBlocks] = useState<Block[]>(initialContent?.blocks || [])
  const [title, setTitle] = useState<string>(initialContent?.title || '')
  const [excerpt, setExcerpt] = useState<string>(initialContent?.excerpt || '')
  const [featuredImage, setFeaturedImage] = useState<string>(initialContent?.featuredImage || '')
  const [tags, setTags] = useState<string[]>(initialContent?.tags || [])
  const [tagInput, setTagInput] = useState<string>('')
  const [topic, setTopic] = useState<string>(initialContent?.topic || '')
  const [activeBlock, setActiveBlock] = useState<string | null>(null)
  const [showTemplates, setShowTemplates] = useState<boolean>(false)
  const [showPreview, setShowPreview] = useState<boolean>(false)
  const [savedTemplates, setSavedTemplates] = useState<Template[]>([])
  const [saving, setSaving] = useState<boolean>(false)
  const [publishing, setPublishing] = useState<boolean>(false)
  const [lastSaved, setLastSaved] = useState<string | null>(initialContent?.lastSaved || null)
  const [blockStats, setBlockStats] = useState<BlockStatsType>({ wordCount: 0, blockCount: 0, readingTime: 0 })
  const [showPublishModal, setShowPublishModal] = useState<boolean>(false)
  const [publishNotes, setPublishNotes] = useState<string>('')
  const [showSuccessMessage, setShowSuccessMessage] = useState<boolean>(false)
  const [successMessage, setSuccessMessage] = useState<string>('')
  const [postSlug, setPostSlug] = useState<string>(initialContent?.slug || '')
  
  // Check if user is a contributor
  const isContributor = profile?.user_role === 'contributor'
  
  // Refs
  const blockRefs = useRef<Record<string, HTMLElement | null>>({})
  
  // Sample topics
  const TOPICS: Topic[] = [
    { id: 'marketing-strategy', name: 'Marketing Strategy & Performance' },
    { id: 'content-communications', name: 'Content & Communications' },
    { id: 'seo-organic', name: 'SEO & Organic Discovery' },
    { id: 'ai-automation', name: 'AI & Automation' },
    { id: 'web-tech', name: 'Web & Tech' },
    { id: 'social-community', name: 'Social & Community' },
    { id: 'sales-strategy', name: 'Sales & Strategy' },
    { id: 'careers-culture', name: 'Careers & Culture' }
  ]

  // Templates - predefined article structures
  const ARTICLE_TEMPLATES: Template[] = [
    {
      id: 'case-study',
      name: 'Case Study',
      description: 'Problem → Solution → Results structure',
      blocks: [
        {
          type: 'heading',
          content: { text: 'Client Challenge', level: 'h2' },
          id: 'cs-challenge'
        },
        {
          type: 'paragraph',
          content: { text: 'Describe the problem the client was facing...' },
          id: 'cs-challenge-desc'
        },
        {
          type: 'heading',
          content: { text: 'Our Solution', level: 'h2' },
          id: 'cs-solution'
        },
        {
          type: 'paragraph',
          content: { text: 'Explain your approach to solving the problem...' },
          id: 'cs-solution-desc'
        },
        {
          type: 'callout',
          content: { 
            text: 'Key innovation: Highlight your unique approach here',
            type: 'info'
          },
          id: 'cs-callout'
        },
        {
          type: 'heading',
          content: { text: 'Results & Impact', level: 'h2' },
          id: 'cs-results'
        },
        {
          type: 'paragraph',
          content: { text: 'Explain the impact and results achieved...' },
          id: 'cs-results-desc'
        }
      ]
    },
    {
      id: 'how-to-guide',
      name: 'How-To Guide',
      description: 'Step-by-step instructional format',
      blocks: [
        {
          type: 'paragraph',
          content: { text: 'Brief introduction to what readers will learn...' },
          id: 'htg-intro'
        },
        {
          type: 'heading',
          content: { text: 'Step 1: Getting Started', level: 'h2' },
          id: 'htg-step1'
        },
        {
          type: 'paragraph',
          content: { text: 'Instructions for the first step...' },
          id: 'htg-step1-desc'
        },
        {
          type: 'heading',
          content: { text: 'Step 2: Building Your Strategy', level: 'h2' },
          id: 'htg-step2'
        },
        {
          type: 'paragraph',
          content: { text: 'Instructions for the second step...' },
          id: 'htg-step2-desc'
        },
        {
          type: 'callout',
          content: { 
            text: 'Pro Tip: Share an insider tip or shortcut here',
            type: 'tip'
          },
          id: 'htg-tip'
        },
        {
          type: 'heading',
          content: { text: 'Step 3: Measuring Success', level: 'h2' },
          id: 'htg-step3'
        },
        {
          type: 'paragraph',
          content: { text: 'Instructions for the third step...' },
          id: 'htg-step3-desc'
        }
      ]
    }
  ]

  // Block categories
  const BLOCK_CATEGORIES: Record<string, BlockCategory[]> = {
    text: [
      { type: 'paragraph', name: 'Paragraph', icon: Type },
      { type: 'heading', name: 'Heading', icon: PenLine },
      { type: 'list', name: 'List', icon: List },
      { type: 'quote', name: 'Quote', icon: Quote },
      { type: 'callout', name: 'Callout', icon: MessageSquare },
      { type: 'code', name: 'Code Block', icon: Code }
    ],
    media: [
      { type: 'image', name: 'Image', icon: Image },
      { type: 'gallery', name: 'Image Gallery', icon: LayoutGrid },
      { type: 'video', name: 'Video', icon: Video },
      { type: 'file', name: 'File', icon: FileText }
    ],
    interactive: [
      { type: 'poll', name: 'Poll', icon: BarChart2 },
      { type: 'quiz', name: 'Quiz', icon: FileText },
      { type: 'calculator', name: 'Calculator', icon: FilePieChart },
      { type: 'timeline', name: 'Timeline', icon: Calendar }
    ],
    layout: [
      { type: 'divider', name: 'Divider', icon: Minus },
      { type: 'columns', name: 'Columns', icon: Layout },
      { type: 'spacer', name: 'Spacer', icon: ArrowDown }
    ],
    embed: [
      { type: 'embed-tweet', name: 'Twitter', icon: CircleDashed },
      { type: 'embed-youtube', name: 'YouTube', icon: Video },
      { type: 'embed-custom', name: 'Custom Embed', icon: Code }
    ],
    advanced: [
      { type: 'table', name: 'Table', icon: Layout },
      { type: 'comparison-table', name: 'Comparison', icon: LayoutGrid },
      { type: 'stats', name: 'Stats Grid', icon: BarChart2 },
      { type: 'person', name: 'Team Member', icon: User },
      { type: 'chart', name: 'Chart', icon: PieChart }
    ]
  }

  // Toolbar options for text formatting
  const TEXT_FORMATTING_OPTIONS: TextFormattingOption[] = [
    { name: 'Bold', icon: Bold, style: 'bold' },
    { name: 'Italic', icon: Italic, style: 'italic' },
    { name: 'Underline', icon: Underline, style: 'underline' },
    { name: 'Heading 1', icon: Heading1, style: 'h1' },
    { name: 'Heading 2', icon: Heading2, style: 'h2' },
    { name: 'Heading 3', icon: Heading3, style: 'h3' },
    { name: 'Align Left', icon: AlignLeft, style: 'align-left' },
    { name: 'Align Center', icon: AlignCenter, style: 'align-center' },
    { name: 'Align Right', icon: AlignRight, style: 'align-right' },
    { name: 'Bullet List', icon: List, style: 'bullet-list' },
    { name: 'Numbered List', icon: ListOrdered, style: 'ordered-list' },
    { name: 'Link', icon: Link, style: 'link' }
  ]

  // Font styles
  const FONT_STYLES: BlockStyle[] = [
    { label: 'Default', value: 'font-sans' },
    { label: 'Serif', value: 'font-serif' },
    { label: 'Mono', value: 'font-mono' },
    { label: 'Orbitron', value: 'font-orbitron' }
  ]

  // Font sizes
  const FONT_SIZES: BlockStyle[] = [
    { label: 'Small', value: 'text-sm' },
    { label: 'Normal', value: 'text-base' },
    { label: 'Large', value: 'text-lg' },
    { label: 'XL', value: 'text-xl' },
    { label: '2XL', value: 'text-2xl' },
    { label: '3XL', value: 'text-3xl' }
  ]

  // Background styles
  const BACKGROUND_STYLES: BlockStyle[] = [
    { label: 'None', value: '' },
    { label: 'Light Gray', value: 'bg-gray-100 dark:bg-gray-800' },
    { label: 'Brand Primary', value: 'bg-brand-primary/10' },
    { label: 'Brand Secondary', value: 'bg-brand-secondary/10' },
    { label: 'Blue Gradient', value: 'bg-gradient-to-r from-blue-500 to-indigo-500' },
    { label: 'Purple Gradient', value: 'bg-gradient-to-r from-purple-500 to-pink-500' }
  ]

  // Check if user is logged in
  useEffect(() => {
    if (!user) {
      // Redirect to login if no user
      router.push('/auth/login')
    }
  }, [user])

  // Update stats on initial load
  useEffect(() => {
    if (blocks.length > 0) {
      updateStats(blocks)
    }
  }, [])
  
  // Generate slug from title
  useEffect(() => {
    if (title && !postSlug) {
      const slug = title
        .toLowerCase()
        .replace(/[^\w\s]/gi, '')
        .replace(/\s+/g, '-')
        .trim()
      
      setPostSlug(`${slug}-${Date.now().toString().slice(-4)}`)
    }
  }, [title])

  // Generate a unique ID for new blocks
  const generateId = (): string => `block-${Date.now()}-${Math.floor(Math.random() * 1000)}`

  // Add a new block to the content
  const addBlock = (type: string, index: number = blocks.length): void => {
    const newBlock: Block = {
      id: generateId(),
      type,
      content: {}
    }
    
    const newBlocks = [...blocks]
    newBlocks.splice(index, 0, newBlock)
    setBlocks(newBlocks)
    
    // Focus the new block after it's added
    setTimeout(() => {
      const blockEl = blockRefs.current[newBlock.id]
      if (blockEl) {
        blockEl.focus()
      }
    }, 100)
    
    setActiveBlock(newBlock.id)
    updateStats(newBlocks)
  }

  // Update a block
  const updateBlock = (blockId: string, updates: Partial<Block>): void => {
    const newBlocks = blocks.map(block => 
      block.id === blockId ? { ...block, ...updates } : block
    )
    setBlocks(newBlocks)
    updateStats(newBlocks)
  }

  // Update block content
  const updateBlockContent = (blockId: string, content: Record<string, any>): void => {
    updateBlock(blockId, { content })
  }

  // Update block styles
  const updateBlockStyles = (blockId: string, styles: Record<string, string>): void => {
    const block = blocks.find(b => b.id === blockId)
    if (block) {
      updateBlock(blockId, { 
        styles: { ...block.styles, ...styles } 
      })
    }
  }

  // Remove a block
  const removeBlock = (blockId: string): void => {
    const newBlocks = blocks.filter(block => block.id !== blockId)
    setBlocks(newBlocks)
    setActiveBlock(null)
    updateStats(newBlocks)
  }

  // Duplicate a block
  const duplicateBlock = (blockId: string): void => {
    const block = blocks.find(b => b.id === blockId)
    if (block) {
      const index = blocks.findIndex(b => b.id === blockId)
      const newBlock = {
        ...JSON.parse(JSON.stringify(block)),
        id: generateId()
      }
      const newBlocks = [...blocks]
      newBlocks.splice(index + 1, 0, newBlock)
      setBlocks(newBlocks)
      updateStats(newBlocks)
    }
  }

  // Move a block up or down
  const moveBlock = (blockId: string, direction: 'up' | 'down'): void => {
    const index = blocks.findIndex(b => b.id === blockId)
    if (index === -1) return
    
    const newIndex = direction === 'up' ? Math.max(0, index - 1) : Math.min(blocks.length - 1, index + 1)
    if (newIndex === index) return
    
    const newBlocks = [...blocks]
    const block = newBlocks[index]
    newBlocks.splice(index, 1)
    newBlocks.splice(newIndex, 0, block)
    setBlocks(newBlocks)
  }

  // Apply a template
  const applyTemplate = (templateId: string): void => {
    const template = [...ARTICLE_TEMPLATES, ...savedTemplates].find(t => t.id === templateId)
    if (template) {
      // Create deep copies of blocks with new IDs
      const newBlocks = template.blocks.map(block => ({
        ...JSON.parse(JSON.stringify(block)),
        id: generateId()
      }))
      
      setBlocks(newBlocks)
      setShowTemplates(false)
      updateStats(newBlocks)
    }
  }

  // Save as custom template
  const saveAsTemplate = (): void => {
    if (blocks.length === 0) return
    
    const templateName = prompt('Enter a name for this template:')
    if (!templateName) return
    
    const newTemplate: Template = {
      id: `custom-${Date.now()}`,
      name: templateName,
      description: 'Custom template',
      blocks: JSON.parse(JSON.stringify(blocks))
    }
    
    setSavedTemplates([...savedTemplates, newTemplate])
    
    // Save to localStorage
    try {
      const existingTemplates = localStorage.getItem('saved-templates')
      const templates = existingTemplates ? JSON.parse(existingTemplates) : []
      localStorage.setItem('saved-templates', JSON.stringify([...templates, newTemplate]))
      
      // Show toast
      showToast('Template saved successfully!')
    } catch (error) {
      console.error('Error saving template:', error)
    }
  }

  // Add a tag
  const addTag = (tag: string): void => {
    if (!tag) return
    const cleanTag = tag.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-')
    if (cleanTag && !tags.includes(cleanTag)) {
      setTags([...tags, cleanTag])
    }
    setTagInput('')
  }

  // Remove a tag
  const removeTag = (tag: string): void => {
    setTags(tags.filter(t => t !== tag))
  }

  // Handle tag input key press
  const handleTagKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter' && tagInput) {
      e.preventDefault()
      addTag(tagInput)
    }
  }

  // Format text in editable blocks
  const formatText = (command: string, value: string = ''): void => {
    document.execCommand(command, false, value)
  }

  // Update word count and reading time
  const updateStats = (blocks: Block[]): void => {
    let wordCount = 0
    blocks.forEach(block => {
      if (block.type === 'paragraph' || block.type === 'heading' || block.type === 'quote' || block.type === 'callout') {
        const text = block.content?.text || ''
        wordCount += text.split(/\s+/).filter((word: string) => word.length > 0).length
      }
    })
    
    const readingTime = Math.ceil(wordCount / 200) // Assuming 200 words per minute
    
    setBlockStats({
      wordCount,
      blockCount: blocks.length,
      readingTime
    })
  }

  // Navigate back to dashboard
  const handleBackToDashboard = (): void => {
    // Check for unsaved changes
    if (blocks.length > 0 && !lastSaved) {
      const confirmLeave = confirm('You have unsaved changes. Are you sure you want to leave?')
      if (!confirmLeave) return
    }
    router.push('/dashboard')
  }

  // Auto-save functionality
  useEffect(() => {
    const autoSaveTimer = setTimeout(() => {
      if (blocks.length > 0 || title) {
        handleSave()
      }
    }, 30000) // Auto-save every 30 seconds
    
    return () => clearTimeout(autoSaveTimer)
  }, [blocks, title, excerpt, tags, topic])

  // Show toast notification
  const showToast = (message: string): void => {
    // Create toast element
    const toast = document.createElement('div')
    toast.className = 'fixed top-4 right-4 bg-brand-primary text-white py-2 px-4 rounded-lg shadow-lg z-50 animate-fade-in'
    toast.textContent = message
    
    // Add to DOM
    document.body.appendChild(toast)
    
    // Remove after 3 seconds
    setTimeout(() => {
      toast.classList.add('animate-fade-out')
      setTimeout(() => {
        document.body.removeChild(toast)
      }, 300)
    }, 3000)
  }

  // Handle success message
  const handleShowSuccess = (message: string): void => {
    setSuccessMessage(message)
    setShowSuccessMessage(true)
    
    // Redirect to dashboard after 2 seconds
    setTimeout(() => {
      router.push('/dashboard')
    }, 2000)
  }

  // Handle save draft
  const handleSave = async (): Promise<void> => {
    if (!user) {
      showToast('You must be logged in to save a draft.')
      return
    }
    
    setSaving(true)
    
    // Generate slug if not exists
    const slug = postSlug || `${title.toLowerCase().replace(/[^\w\s]/gi, '').replace(/\s+/g, '-')}-${Date.now().toString().slice(-4)}`
    
    // Construct the post data
    const postData: PostData = {
      id: initialContent?.id,
      title,
      excerpt,
      featuredImage,
      tags,
      topic,
      blocks,
      slug,
      status: 'draft',
      author_id: user.id,
      published: false,
      lastSaved: new Date().toISOString()
    }
    
    try {
      // Save to Supabase
      const { data, error } = await supabase
        .from('posts')
        .upsert({
          id: initialContent?.id || undefined,
          title,
          excerpt,
          featured_image: featuredImage,
          tags,
          topic,
          content: JSON.stringify(blocks),
          slug,
          status: 'draft',
          author_id: user.id,
          published: false,
          updated_at: new Date().toISOString()
        })
        .select()
      
      if (error) throw error
      
      // Call the onSave callback
      if (onSave) {
        onSave(postData)
      }
      
      setLastSaved(new Date().toISOString())
      showToast('Draft saved successfully!')
      
      // If it's a new post, update the ID
      if (!initialContent?.id && data && data[0]) {
        initialContent = { ...initialContent, id: data[0].id }
      }
      
    } catch (error) {
      console.error('Error saving draft:', error)
      showToast('Error saving draft. Please try again.')
    } finally {
      setSaving(false)
    }
  }
  
  // Handle publish
  const handlePublish = (): void => {
    if (!user) {
      showToast('You must be logged in to publish.')
      return
    }
    
    if (!isContributor) {
      showToast('Only contributors can publish posts.')
      return
    }
    
    if (!title) {
      showToast('Please add a title before publishing.')
      return
    }
    
    if (blocks.length === 0) {
      showToast('Please add some content before publishing.')
      return
    }
    
    if (!topic) {
      showToast('Please select a topic before publishing.')
      return
    }
    
    // Show publish modal
    setShowPublishModal(true)
  }
  
  // Handle submit for approval
  const handleSubmitForApproval = async (): Promise<void> => {
    if (!user) return
    
    setPublishing(true)
    setShowPublishModal(false)
    
    // Generate slug if not exists
    const slug = postSlug || `${title.toLowerCase().replace(/[^\w\s]/gi, '').replace(/\s+/g, '-')}-${Date.now().toString().slice(-4)}`
    
    try {
      // Save to Supabase with pending_approval status
      const { data, error } = await supabase
        .from('posts')
        .upsert({
          id: initialContent?.id || undefined,
          title,
          excerpt,
          featured_image: featuredImage,
          tags,
          topic,
          content: JSON.stringify(blocks),
          slug,
          status: 'pending_approval',
          author_id: user.id,
          published: false,
          updated_at: new Date().toISOString(),
          submitted_at: new Date().toISOString(),
          submission_notes: publishNotes
        })
        .select()
      
      if (error) throw error
      
      // Show success message
      handleShowSuccess('Your post has been submitted for approval!')
      
    } catch (error) {
      console.error('Error publishing post:', error)
      showToast('Error submitting post. Please try again.')
      setPublishing(false)
    }
  }

  // Load saved templates on mount
  useEffect(() => {
    // Load from localStorage
    const loadedTemplates = localStorage.getItem('saved-templates')
    if (loadedTemplates) {
      try {
        setSavedTemplates(JSON.parse(loadedTemplates))
      } catch (e) {
        console.error('Error loading saved templates', e)
      }
    }
  }, [])

  // Save templates when they change
  useEffect(() => {
    if (savedTemplates.length > 0) {
      localStorage.setItem('saved-templates', JSON.stringify(savedTemplates))
    }
  }, [savedTemplates])

  // Render block content based on type
  const renderBlockContent = (block: Block) => {
    const isActive = activeBlock === block.id
    
    switch (block.type) {
      case 'paragraph':
        return (
          <div 
            className={`relative group ${isActive ? 'ring-2 ring-brand-primary/50 rounded' : ''}`}
          >
            {isActive && (
              <div className="absolute -top-10 left-0 right-0 flex items-center justify-center space-x-1 bg-secondary border surface-border rounded-md p-1 shadow-lg z-10">
                {TEXT_FORMATTING_OPTIONS.map((option) => (
                  <button
                    key={option.style}
                    onClick={() => formatText(option.style)}
                    className="p-1 hover:bg-surface-hover rounded transition-colors"
                    title={option.name}
                  >
                    <option.icon className="w-4 h-4 text-primary" />
                  </button>
                ))}
              </div>
            )}
            <div
              ref={(el: HTMLDivElement | null) => { blockRefs.current[block.id] = el; }}
              contentEditable
              data-placeholder="Start writing..."
              className={`prose max-w-none p-4 rounded focus:outline-none ${block.styles?.fontStyle || ''} ${block.styles?.fontSize || ''} ${block.styles?.backgroundColor || ''}`}
              onFocus={() => setActiveBlock(block.id)}
              onBlur={(e: React.FocusEvent<HTMLDivElement>) => updateBlockContent(block.id, { ...block.content, text: e.currentTarget.innerHTML })}
              dangerouslySetInnerHTML={{ __html: block.content?.text || '' }}
              suppressContentEditableWarning
            />
          </div>
        )
        
      case 'heading':
        const HeadingTag = block.content?.level || 'h2'
        return (
          <div 
            className={`relative group ${isActive ? 'ring-2 ring-brand-primary/50 rounded' : ''}`}
          >
            {isActive && (
              <div className="absolute -top-10 left-0 flex items-center space-x-1 bg-secondary border surface-border rounded-md p-1 shadow-lg z-10">
                <button
                  onClick={() => updateBlockContent(block.id, { ...block.content, level: 'h1' })}
                  className={`p-1 hover:bg-surface-hover rounded transition-colors ${block.content?.level === 'h1' ? 'bg-brand-primary/20' : ''}`}
                  title="Heading 1"
                >
                  <Heading1 className="w-4 h-4 text-primary" />
                </button>
                <button
                  onClick={() => updateBlockContent(block.id, { ...block.content, level: 'h2' })}
                  className={`p-1 hover:bg-surface-hover rounded transition-colors ${block.content?.level === 'h2' ? 'bg-brand-primary/20' : ''}`}
                  title="Heading 2"
                >
                  <Heading2 className="w-4 h-4 text-primary" />
                </button>
                <button
                  onClick={() => updateBlockContent(block.id, { ...block.content, level: 'h3' })}
                  className={`p-1 hover:bg-surface-hover rounded transition-colors ${block.content?.level === 'h3' ? 'bg-brand-primary/20' : ''}`}
                  title="Heading 3"
                >
                  <Heading3 className="w-4 h-4 text-primary" />
                </button>
              </div>
            )}
            <HeadingTag
              ref={(el: HTMLHeadingElement | null) => { blockRefs.current[block.id] = el; }}
              contentEditable
              data-placeholder="Heading text..."
              className={`p-4 font-bold rounded focus:outline-none ${block.styles?.fontStyle || ''} ${block.styles?.fontSize || 'text-2xl'} ${block.styles?.backgroundColor || ''}`}
              onFocus={() => setActiveBlock(block.id)}
              onBlur={(e: React.FocusEvent<HTMLHeadingElement>) => updateBlockContent(block.id, { ...block.content, text: e.currentTarget.innerHTML })}
              dangerouslySetInnerHTML={{ __html: block.content?.text || '' }}
              suppressContentEditableWarning
            />
          </div>
        )
        
      case 'quote':
        return (
          <div 
            className={`relative group ${isActive ? 'ring-2 ring-brand-primary/50 rounded' : ''}`}
          >
            <blockquote className={`p-4 border-l-4 border-brand-primary ${block.styles?.backgroundColor || 'bg-surface-hover'} rounded`}>
              <div
                ref={(el: HTMLDivElement | null) => { blockRefs.current[block.id] = el; }}
                contentEditable
                data-placeholder="Quote text..."
                className="italic text-lg mb-2 focus:outline-none"
                onFocus={() => setActiveBlock(block.id)}
                onBlur={(e: React.FocusEvent<HTMLDivElement>) => updateBlockContent(block.id, { ...block.content, text: e.currentTarget.innerHTML })}
                dangerouslySetInnerHTML={{ __html: block.content?.text || '' }}
                suppressContentEditableWarning
              />
              {isActive && (
                <>
                  <input
                    type="text"
                    placeholder="Source name"
                    className="bg-transparent border-b surface-border p-1 w-full mb-1 text-sm focus:outline-none focus:border-brand-primary"
                    value={block.content?.source || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateBlockContent(block.id, { ...block.content, source: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="Citation (publication, date, etc.)"
                    className="bg-transparent border-b surface-border p-1 w-full text-xs focus:outline-none focus:border-brand-primary"
                    value={block.content?.citation || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateBlockContent(block.id, { ...block.content, citation: e.target.value })}
                  />
                </>
              )}
              {!isActive && block.content?.source && (
                <footer className="text-sm">
                  <cite>— {block.content.source}</cite>
                  {block.content?.citation && <span className="text-xs ml-2 opacity-75">{block.content.citation}</span>}
                </footer>
              )}
            </blockquote>
          </div>
        )
        
      case 'callout':
        const calloutTypes = {
          info: { bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-700' },
          warning: { bg: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-yellow-200 dark:border-yellow-700' },
          success: { bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-200 dark:border-green-700' },
          error: { bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-700' },
          tip: { bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-200 dark:border-purple-700' },
          highlight: { bg: 'bg-brand-primary/10', border: 'border-brand-primary/20' },
          summary: { bg: 'bg-gray-50 dark:bg-gray-800', border: 'border-gray-200 dark:border-gray-700' }
        }
        
        const calloutType = block.content?.type || 'info'
        const calloutStyle = calloutTypes[calloutType as keyof typeof calloutTypes] || calloutTypes.info
        
        return (
          <div 
            className={`relative group ${isActive ? 'ring-2 ring-brand-primary/50 rounded' : ''}`}
          >
            <div className={`p-4 border ${calloutStyle.border} ${calloutStyle.bg} rounded-lg`}>
              {isActive && (
                <div className="mb-2">
                  <select
                    className="w-full p-2 bg-white/20 dark:bg-black/20 border surface-border rounded text-sm"
                    value={block.content?.type || 'info'}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateBlockContent(block.id, { ...block.content, type: e.target.value })}
                  >
                    <option value="info">Information</option>
                    <option value="warning">Warning</option>
                    <option value="success">Success</option>
                    <option value="error">Error</option>
                    <option value="tip">Tip</option>
                    <option value="highlight">Highlight</option>
                    <option value="summary">Summary</option>
                  </select>
                </div>
              )}
              <div
                ref={(el: HTMLDivElement | null) => { blockRefs.current[block.id] = el; }}
                contentEditable
                data-placeholder="Callout content..."
                className="focus:outline-none"
                onFocus={() => setActiveBlock(block.id)}
                onBlur={(e: React.FocusEvent<HTMLDivElement>) => updateBlockContent(block.id, { ...block.content, text: e.currentTarget.innerHTML })}
                dangerouslySetInnerHTML={{ __html: block.content?.text || '' }}
                suppressContentEditableWarning
              />
            </div>
          </div>
        )
        
      case 'image':
        return (
          <div 
            className={`relative group ${isActive ? 'ring-2 ring-brand-primary/50 rounded' : ''}`}
          >
            <div className="p-4">
              {isActive && (
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Image URL"
                    className="w-full p-2 bg-secondary border surface-border rounded mb-2 text-primary"
                    value={block.content?.url || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateBlockContent(block.id, { ...block.content, url: e.target.value })}
                  />
                  <button 
                    className="btn-secondary w-full mb-4"
                    onClick={() => {
                      // In a real implementation, you'd upload to Supabase Storage
                      // For now, we'll just ask for a URL
                      const url = prompt('Enter image URL:')
                      if (url) {
                        updateBlockContent(block.id, { ...block.content, url })
                      }
                    }}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Image
                  </button>
                </div>
              )}
              
              {block.content?.url ? (
                <figure className="mb-2">
                  <img
                    src={block.content.url}
                    alt={block.content?.caption || 'Image'}
                    className="max-w-full h-auto rounded"
                  />
                  <figcaption>
                    <input
                      type="text"
                      placeholder="Add caption (optional)"
                      className="w-full p-2 mt-2 bg-secondary/50 border-b surface-border text-sm text-secondary text-center focus:outline-none"
                      value={block.content?.caption || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateBlockContent(block.id, { ...block.content, caption: e.target.value })}
                    />
                  </figcaption>
                </figure>
              ) : (
                <div className="border-2 border-dashed surface-border rounded-lg p-12 text-center">
                  <Image className="w-8 h-8 mx-auto mb-4 text-secondary" />
                  <p className="text-secondary">
                    {isActive ? 'Enter image URL or upload' : 'No image added yet'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )
        
      // Additional block types would be rendered here, following the same pattern
      
      default:
        return (
          <div 
            className={`relative group ${isActive ? 'ring-2 ring-brand-primary/50 rounded' : ''}`}
          >
            <div className="p-4 border border-dashed surface-border rounded">
              <p className="text-center text-secondary">
                {block.type} block
              </p>
            </div>
          </div>
        )
    }
  }

  // Block control buttons
  const BlockControls: React.FC<BlockControlsProps> = ({ block, index, moveBlock, duplicateBlock, removeBlock }) => (
    <div className="absolute -left-10 top-1/2 transform -translate-y-1/2 flex flex-col space-y-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <button
        className="p-1 bg-secondary border surface-border rounded hover:bg-surface-hover transition-colors"
        onClick={() => moveBlock(block.id, 'up')}
        disabled={index === 0}
        title="Move up"
      >
        <ChevronUp className="w-4 h-4 text-primary" />
      </button>
      <button
        className="p-1 bg-secondary border surface-border rounded hover:bg-surface-hover transition-colors"
        onClick={() => moveBlock(block.id, 'down')}
        disabled={index === blocks.length - 1}
        title="Move down"
      >
        <ChevronDown className="w-4 h-4 text-primary" />
      </button>
      <button
        className="p-1 bg-secondary border surface-border rounded hover:bg-surface-hover transition-colors"
        onClick={() => duplicateBlock(block.id)}
        title="Duplicate"
      >
        <Copy className="w-4 h-4 text-primary" />
      </button>
      <button
        className="p-1 bg-secondary border surface-border rounded hover:bg-surface-hover transition-colors"
        onClick={() => removeBlock(block.id)}
        title="Delete"
      >
        <Trash2 className="w-4 h-4 text-primary" />
      </button>
    </div>
  )

  // Block styling panel
  const BlockStylingPanel: React.FC<BlockStylingPanelProps> = ({ block, updateBlockStyles }) => (
    <div className="bg-secondary border surface-border rounded-lg p-4 mt-4">
      <h3 className="font-semibold text-sm mb-4 flex items-center">
        <Palette className="w-4 h-4 mr-2" />
        Block Styling
      </h3>
      
      <div className="space-y-4">
        {/* Font Style */}
        <div>
          <label className="block text-xs mb-1">Font Style</label>
          <select
            className="w-full p-2 bg-secondary border surface-border rounded text-sm"
            value={block.styles?.fontStyle || ''}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateBlockStyles(block.id, { fontStyle: e.target.value })}
          >
            <option value="">Default</option>
            {FONT_STYLES.map(style => (
              <option key={style.value} value={style.value}>{style.label}</option>
            ))}
          </select>
        </div>
        
        {/* Font Size */}
        <div>
          <label className="block text-xs mb-1">Font Size</label>
          <select
            className="w-full p-2 bg-secondary border surface-border rounded text-sm"
            value={block.styles?.fontSize || ''}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateBlockStyles(block.id, { fontSize: e.target.value })}
          >
            <option value="">Default</option>
            {FONT_SIZES.map(size => (
              <option key={size.value} value={size.value}>{size.label}</option>
            ))}
          </select>
        </div>
        
        {/* Background Style */}
        <div>
          <label className="block text-xs mb-1">Background</label>
          <select
            className="w-full p-2 bg-secondary border surface-border rounded text-sm"
            value={block.styles?.backgroundColor || ''}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateBlockStyles(block.id, { backgroundColor: e.target.value })}
          >
            <option value="">None</option>
            {BACKGROUND_STYLES.map(style => (
              <option key={style.value} value={style.value}>{style.label}</option>
            ))}
          </select>
        </div>
        
        {/* Text Alignment */}
        <div>
          <label className="block text-xs mb-1">Alignment</label>
          <div className="flex space-x-2">
            <button
              className={`p-2 border surface-border rounded flex-1 ${block.styles?.textAlign === 'left' || !block.styles?.textAlign ? 'bg-brand-primary/20' : 'bg-secondary'}`}
              onClick={() => updateBlockStyles(block.id, { textAlign: 'left' })}
            >
              <AlignLeft className="w-4 h-4 mx-auto" />
            </button>
            <button
              className={`p-2 border surface-border rounded flex-1 ${block.styles?.textAlign === 'center' ? 'bg-brand-primary/20' : 'bg-secondary'}`}
              onClick={() => updateBlockStyles(block.id, { textAlign: 'center' })}
            >
              <AlignCenter className="w-4 h-4 mx-auto" />
            </button>
            <button
              className={`p-2 border surface-border rounded flex-1 ${block.styles?.textAlign === 'right' ? 'bg-brand-primary/20' : 'bg-secondary'}`}
              onClick={() => updateBlockStyles(block.id, { textAlign: 'right' })}
            >
              <AlignRight className="w-4 h-4 mx-auto" />
            </button>
          </div>
        </div>
        
        {/* Padding */}
        <div>
          <label className="block text-xs mb-1">Padding</label>
          <select
            className="w-full p-2 bg-secondary border surface-border rounded text-sm"
            value={block.styles?.padding || ''}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateBlockStyles(block.id, { padding: e.target.value })}
          >
            <option value="">Default</option>
            <option value="p-0">None</option>
            <option value="p-2">Small</option>
            <option value="p-4">Medium</option>
            <option value="p-6">Large</option>
            <option value="p-8">Extra Large</option>
          </select>
        </div>
      </div>
    </div>
  )

  // Preview mode toggle
  const renderPreview = () => {
    return (
      <div className="glass-card rounded-2xl p-8">
        <div className="prose prose-invert max-w-none">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4 text-primary">{title || 'Untitled Post'}</h1>
            
            {topic && (
              <div className="mb-4">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-brand-primary to-brand-secondary">
                  {TOPICS.find(t => t.id === topic)?.name || topic}
                </span>
              </div>
            )}
            
            {excerpt && (
              <p className="text-xl text-secondary mb-8">{excerpt}</p>
            )}
          </div>
          
          <div>
            {blocks.map(block => {
              // A simplified preview renderer
              switch (block.type) {
                case 'paragraph':
                  return (
                    <div 
                      key={block.id}
                      className={`mb-4 ${block.styles?.textAlign ? `text-${block.styles.textAlign}` : ''} ${block.styles?.fontSize || ''} ${block.styles?.fontStyle || ''} ${block.styles?.backgroundColor || ''} ${block.styles?.padding || ''}`}
                      dangerouslySetInnerHTML={{ __html: block.content?.text || '' }}
                    />
                  )
                  
                case 'heading':
                  const HeadingComponent = block.content?.level || 'h2'
                  return (
                    <HeadingComponent 
                      key={block.id}
                      className={`font-bold ${block.styles?.textAlign ? `text-${block.styles.textAlign}` : ''} ${block.styles?.fontSize || ''} ${block.styles?.fontStyle || ''} ${block.styles?.backgroundColor || ''} ${block.styles?.padding || ''}`}
                      dangerouslySetInnerHTML={{ __html: block.content?.text || '' }}
                    />
                  )
                  
                case 'quote':
                  return (
                    <blockquote 
                      key={block.id}
                      className={`p-4 border-l-4 border-brand-primary ${block.styles?.backgroundColor || 'bg-surface-hover'} rounded mb-4`}
                    >
                      <div className="italic text-lg mb-2" dangerouslySetInnerHTML={{ __html: block.content?.text || '' }} />
                      {block.content?.source && (
                        <footer className="text-sm">
                          <cite>— {block.content.source}</cite>
                          {block.content?.citation && <span className="text-xs ml-2 opacity-75">{block.content.citation}</span>}
                        </footer>
                      )}
                    </blockquote>
                  )
                  
                case 'image':
                  return (
                    <figure key={block.id} className="mb-4">
                      {block.content?.url && (
                        <img
                          src={block.content.url}
                          alt={block.content?.caption || 'Image'}
                          className="max-w-full h-auto rounded"
                        />
                      )}
                      {block.content?.caption && (
                        <figcaption className="text-sm text-center mt-2 text-secondary">
                          {block.content.caption}
                        </figcaption>
                      )}
                    </figure>
                  )
                  
                // More cases would be added for other block types
                  
                default:
                  return (
                    <div key={block.id} className="mb-4 p-4 border border-dashed surface-border rounded">
                      <p className="text-center text-secondary">
                        {block.type} block preview
                      </p>
                    </div>
                  )
              }
            })}
          </div>
          
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-8">
              {tags.map(tag => (
                <span key={tag} className="px-3 py-1 bg-tertiary rounded-full text-sm text-secondary">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Publish modal
  const renderPublishModal = () => {
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <div className="glass-card rounded-2xl max-w-lg w-full p-6">
          <h2 className="text-2xl font-bold mb-4 text-primary">Submit for Approval</h2>
          
          <p className="text-secondary mb-6">
            Your post will be reviewed by an admin before being published. You can add notes for the reviewer below.
          </p>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-secondary mb-2">
              Notes for Reviewer (optional)
            </label>
            <textarea
              className="w-full p-3 bg-secondary border surface-border rounded-lg text-primary focus:border-brand-primary focus:outline-none transition-colors"
              rows={4}
              placeholder="Any context or notes about this post that might help the reviewer..."
              value={publishNotes}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPublishNotes(e.target.value)}
            />
          </div>
          
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => setShowPublishModal(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitForApproval}
              className="btn-primary flex items-center gap-2"
            >
              <SendHorizonal className="w-4 h-4" />
              Submit for Approval
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Success message
  const renderSuccessMessage = () => {
    return (
      <div className="fixed inset-0 bg-primary flex items-center justify-center z-50">
        <ParticleSystem />
        <div className="text-center">
          <div className="mb-4">
            <Check className="w-16 h-16 text-green-400 mx-auto" />
          </div>
          <h1 className="text-3xl font-bold mb-2 text-primary">{successMessage}</h1>
          <p className="text-secondary mb-4">Redirecting to dashboard...</p>
          <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    )
  }

  // If success message is showing, render only that
  if (showSuccessMessage) {
    return renderSuccessMessage()
  }

  return (
    <div className="bg-primary transition-colors duration-500">
      <ParticleSystem />
      <ExclusiveHeader />

      {/* Main Content */}
      <div className="pt-24 max-w-6xl mx-auto px-4 py-8">
        {/* Navigation Bar with Back Button */}
        <div className="mb-8 flex justify-between items-center">
          <button 
            onClick={handleBackToDashboard}
            className="btn-secondary flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="btn-secondary flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              {showPreview ? 'Edit' : 'Preview'}
            </button>
            
            <button
              onClick={handleSave}
              className="btn-secondary flex items-center gap-2"
              disabled={saving}
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Draft
                </>
              )}
            </button>
            
            {isContributor && (
              <button
                onClick={handlePublish}
                className="btn-primary flex items-center gap-2"
                disabled={publishing}
              >
                {publishing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Publishing...
                  </>
                ) : (
                  <>
                    <SendHorizonal className="w-4 h-4" />
                    Submit for Approval
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar - Templates & Blocks */}
          <div className="lg:sticky lg:top-28 h-fit">
            <div className="glass-card rounded-2xl p-6">
              <div className="flex space-x-2 mb-6">
                <button
                  className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-colors ${!showTemplates ? 'bg-brand-primary text-white' : 'bg-secondary hover:bg-tertiary'}`}
                  onClick={() => setShowTemplates(false)}
                >
                  Blocks
                </button>
                <button
                  className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-colors ${showTemplates ? 'bg-brand-primary text-white' : 'bg-secondary hover:bg-tertiary'}`}
                  onClick={() => setShowTemplates(true)}
                >
                  Templates
                </button>
              </div>

              {showTemplates ? (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-primary mb-4">Article Templates</h3>
                    <div className="space-y-3">
                      {ARTICLE_TEMPLATES.map(template => (
                        <button
                          key={template.id}
                          className="w-full p-3 text-left bg-secondary hover:bg-tertiary border surface-border rounded-lg transition-colors"
                          onClick={() => applyTemplate(template.id)}
                        >
                          <div className="font-medium">{template.name}</div>
                          <div className="text-xs text-secondary mt-1">{template.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {savedTemplates.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-primary mb-4">Saved Templates</h3>
                      <div className="space-y-3">
                        {savedTemplates.map(template => (
                          <button
                            key={template.id}
                            className="w-full p-3 text-left bg-secondary hover:bg-tertiary border surface-border rounded-lg transition-colors"
                            onClick={() => applyTemplate(template.id)}
                          >
                            <div className="font-medium">{template.name}</div>
                            <div className="text-xs text-secondary mt-1">{template.description}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    className="w-full p-3 border border-dashed surface-border rounded-lg hover:bg-secondary transition-colors"
                    onClick={saveAsTemplate}
                  >
                    <div className="flex items-center justify-center">
                      <Plus className="w-4 h-4 mr-2" />
                      <span>Save Current as Template</span>
                    </div>
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(BLOCK_CATEGORIES).map(([category, blocks]) => (
                    <div key={category}>
                      <h3 className="font-semibold text-primary mb-4 capitalize">{category} Blocks</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {blocks.map(block => (
                          <button
                            key={block.type}
                            className="p-3 bg-secondary hover:bg-tertiary border surface-border rounded-lg transition-colors flex flex-col items-center justify-center"
                            onClick={() => addBlock(block.type)}
                          >
                            <block.icon className="w-5 h-5 mb-2" />
                            <span className="text-xs">{block.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Editor/Preview */}
          <div className="lg:col-span-2">
            {/* Content Statistics Bar */}
            <div className="glass-card rounded-2xl p-4 mb-6 flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div>
                  <div className="text-sm text-secondary">Words</div>
                  <div className="font-semibold">{blockStats.wordCount}</div>
                </div>
                <div>
                  <div className="text-sm text-secondary">Reading Time</div>
                  <div className="font-semibold">{blockStats.readingTime} min</div>
                </div>
                <div>
                  <div className="text-sm text-secondary">Blocks</div>
                  <div className="font-semibold">{blockStats.blockCount}</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="text-sm text-secondary">
                  {lastSaved ? `Last saved: ${new Date(lastSaved).toLocaleTimeString()}` : 'Not saved yet'}
                </div>
              </div>
            </div>

            {showPreview ? (
              renderPreview()
            ) : (
              <div className="space-y-6">
                {/* Title */}
                <div className="glass-card rounded-2xl p-6">
                  <input
                    type="text"
                    className="w-full p-4 bg-secondary border surface-border rounded-lg text-primary text-3xl font-semibold focus:border-brand-primary focus:outline-none transition-colors"
                    placeholder="Post Title"
                    value={title}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                  />
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Excerpt
                    </label>
                    <textarea
                      className="w-full p-3 bg-secondary border surface-border rounded-lg text-primary focus:border-brand-primary focus:outline-none transition-colors"
                      rows={2}
                      placeholder="A brief summary of your post (appears in previews)"
                      value={excerpt}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setExcerpt(e.target.value)}
                    />
                  </div>
                </div>

                {/* Content Blocks */}
                <div className="space-y-6">
                  {blocks.map((block, index) => (
                    <div key={block.id} className="glass-card rounded-2xl p-6 relative group">
                      <BlockControls 
                        block={block} 
                        index={index} 
                        moveBlock={moveBlock} 
                        duplicateBlock={duplicateBlock} 
                        removeBlock={removeBlock} 
                      />
                      {renderBlockContent(block)}
                      {activeBlock === block.id && (
                        <BlockStylingPanel 
                          block={block} 
                          updateBlockStyles={updateBlockStyles} 
                        />
                      )}
                    </div>
                  ))}
                  
                  {/* Add Block Button */}
                  <button
                    className="w-full p-6 border-2 border-dashed surface-border rounded-2xl hover:bg-secondary/20 transition-colors flex items-center justify-center"
                    onClick={() => setShowTemplates(prev => !prev)}
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    <span>{blocks.length === 0 ? 'Add Content or Choose a Template' : 'Add More Content'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Post Settings */}
        {!showPreview && (
          <div className="mt-12 glass-card rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-6">Post Settings</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Topic Category
                </label>
                <select
                  className="w-full p-3 bg-secondary border surface-border rounded-lg text-primary focus:border-brand-primary focus:outline-none transition-colors"
                  value={topic}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTopic(e.target.value)}
                >
                  <option value="">Select a topic...</option>
                  {TOPICS.map(topic => (
                    <option key={topic.id} value={topic.id}>{topic.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Featured Image
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    className="flex-grow p-3 bg-secondary border surface-border rounded-lg text-primary focus:border-brand-primary focus:outline-none transition-colors"
                    placeholder="Image URL"
                    value={featuredImage}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFeaturedImage(e.target.value)}
                  />
                  <button
                    className="btn-secondary flex items-center gap-2"
                    onClick={() => {
                      // In a real implementation, you'd upload to Supabase Storage
                      // For now, we'll just ask for a URL
                      const url = prompt('Enter featured image URL:')
                      if (url) {
                        setFeaturedImage(url)
                      }
                    }}
                  >
                    <Upload className="w-4 h-4" />
                    Upload
                  </button>
                </div>
                
                {featuredImage && (
                  <div className="mt-4 relative">
                    <img
                      src={featuredImage}
                      alt="Featured"
                      className="w-full h-40 object-cover rounded-lg"
                    />
                    <button
                      className="absolute top-2 right-2 p-2 bg-red-500 rounded-full text-white"
                      onClick={() => setFeaturedImage('')}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-secondary mb-2">
                  Tags
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    className="flex-grow p-3 bg-secondary border surface-border rounded-lg text-primary focus:border-brand-primary focus:outline-none transition-colors"
                    placeholder="Add tags..."
                    value={tagInput}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                  />
                  <button
                    className="btn-secondary flex items-center gap-2"
                    onClick={() => addTag(tagInput)}
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>
                
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {tags.map(tag => (
                      <div
                        key={tag}
                        className="px-3 py-1 bg-tertiary rounded-full text-sm text-secondary flex items-center"
                      >
                        #{tag}
                        <button
                          className="ml-2 text-secondary/70 hover:text-secondary"
                          onClick={() => removeTag(tag)}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="md:col-span-2">
                <div className="flex items-start gap-2 text-sm">
                  <AlertCircle className="w-4 h-4 text-brand-primary mt-0.5 flex-shrink-0" />
                  <div className="text-secondary">
                    <p className="mb-1">
                      {isContributor ? 
                        'Your post will be submitted for admin approval before it is published to the community.' :
                        'Only contributors can submit posts for publication. If you would like to become a contributor, please visit your profile settings to apply.'
                      }
                    </p>
                    {initialContent?.status === 'pending_approval' && (
                      <p className="font-semibold text-brand-primary">
                        This post is currently under review by admins.
                      </p>
                    )}
                    {initialContent?.status === 'rejected' && (
                      <p className="font-semibold text-red-500">
                        This post was rejected. Please review admin feedback, make necessary changes, and resubmit.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Sticky Footer */}
        <div className="fixed bottom-0 left-0 right-0 bg-primary border-t surface-border py-4 px-6 flex justify-end space-x-4 z-10">
          <div className="flex-grow flex items-center">
            <div className="text-sm text-secondary">
              {lastSaved ? `Last saved: ${new Date(lastSaved).toLocaleTimeString()}` : 'Not saved yet'}
            </div>
          </div>
          
          <button
            onClick={handleBackToDashboard}
            className="btn-secondary flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          
          <button
            onClick={handleSave}
            className="btn-secondary flex items-center gap-2"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Draft'}
          </button>
          
          {isContributor && (
            <button
              onClick={handlePublish}
              className="btn-primary flex items-center gap-2"
              disabled={publishing}
            >
              {publishing ? 'Publishing...' : 'Submit for Approval'}
            </button>
          )}
        </div>
      </div>
      
      {/* Publish Modal */}
      {showPublishModal && renderPublishModal()}
    </div>
  )
}

export default UltimateContentEditor