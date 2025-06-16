'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import ExclusiveHeader from '@/components/ExclusiveHeader'
import { ArrowRight, Zap, Sparkles, TrendingUp, Target, Brain, Palette, Hash, Users, MessageSquare, Lightbulb, Rocket, Globe, Cpu, Eye, PenTool, BarChart3, Search, Clock, Heart, Bookmark, Share } from 'lucide-react'

// Enhanced topic data for sidebar
const topics = [
  {
    id: 'brand-creative',
    icon: Palette,
    title: 'Brand & Creative',
    count: '127 insights',
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    id: 'growth-performance',
    icon: TrendingUp,
    title: 'Growth & Performance',
    count: '203 strategies',
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'content-communications',
    icon: PenTool,
    title: 'Content & Communications',
    count: '156 frameworks',
    gradient: 'from-green-500 to-emerald-500'
  },
  {
    id: 'seo-organic',
    icon: Search,
    title: 'SEO & Organic Discovery',
    count: '89 methods',
    gradient: 'from-orange-500 to-red-500'
  },
  {
    id: 'ai-automation',
    icon: Cpu,
    title: 'AI & Automation',
    count: '234 innovations',
    gradient: 'from-indigo-500 to-purple-500'
  },
  {
    id: 'web-tech',
    icon: Globe,
    title: 'Web & Tech',
    count: '178 reviews',
    gradient: 'from-teal-500 to-blue-500'
  },
  {
    id: 'social-community',
    icon: Users,
    title: 'Social & Community',
    count: '192 tactics',
    gradient: 'from-pink-500 to-rose-500'
  },
  {
    id: 'sales-strategy',
    icon: Target,
    title: 'Sales & Strategy',
    count: '145 playbooks',
    gradient: 'from-violet-500 to-purple-500'
  },
  {
    id: 'careers-culture',
    icon: Rocket,
    title: 'Careers & Culture',
    count: '98 stories',
    gradient: 'from-cyan-500 to-blue-500'
  }
]

const bannerMessages = [
  'Marketing is Evolving. So Are We.',
  'A new kind of marketing club—smarter, sharper, evolved.'
]

// Featured posts with varied layouts
const featuredPosts = [
  {
    id: 1,
    layout: 'large',
    author: {
      name: 'Sarah Zhang',
      title: 'VP Growth @ Stripe',
      avatar: 'SZ'
    },
    type: 'Strategy Reboot',
    title: 'How We Killed Our Attribution Model and Built Something That Actually Works',
    excerpt: 'Spent 8 months proving that multi-touch attribution is mostly BS for our business. Ripped out the complex tracking systems and built a simple framework that actually correlates with revenue.',
    engagement: {
      likes: '2.1K',
      comments: '384',
      time: '2 hours ago'
    },
    featured: true
  },
  {
    id: 2,
    layout: 'square',
    author: {
      name: 'Marcus Chen',
      title: 'Brand Director @ Notion',
      avatar: 'MC'
    },
    type: 'Brand Reboot',
    title: 'Building a Brand That Builds Itself',
    excerpt: 'Community-led growth isn\'t just a buzzword. It\'s the future of sustainable marketing.',
    engagement: {
      likes: '1.8K',
      comments: '267',
      time: '4 hours ago'
    }
  },
  {
    id: 3,
    layout: 'square',
    author: {
      name: 'Elena Rodriguez',
      title: 'Head of Growth @ Shopify',
      avatar: 'ER'
    },
    type: 'Growth Reboot',
    title: 'The AI Marketing Stack That Actually Works',
    excerpt: 'Cut through the AI hype and built a practical tech stack that works.',
    engagement: {
      likes: '3.2K',
      comments: '489',
      time: '6 hours ago'
    }
  },
  {
    id: 4,
    layout: 'horizontal',
    author: {
      name: 'David Kim',
      title: 'CMO @ Tesla',
      avatar: 'DK'
    },
    type: 'Strategy Reboot',
    title: 'Why We Stopped All Traditional Advertising',
    excerpt: 'Tesla\'s unconventional approach to marketing that built a $1T company without spending a penny on ads. Here\'s the complete framework.',
    engagement: {
      likes: '4.5K',
      comments: '672',
      time: '8 hours ago'
    }
  },
  {
    id: 5,
    layout: 'horizontal',
    author: {
      name: 'Lisa Park',
      title: 'VP Marketing @ Airbnb',
      avatar: 'LP'
    },
    type: 'Growth Reboot',
    title: 'How We Built Trust with Complete Strangers',
    excerpt: 'The psychology behind getting people to stay in strangers\' homes and the marketing tactics that made it mainstream.',
    engagement: {
      likes: '2.9K',
      comments: '341',
      time: '12 hours ago'
    }
  }
]

export default function HomePage() {
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('') 

  useEffect(() => {
    // ENHANCED PARTICLES SYSTEM - More particles for better density
    const createParticle = () => {
      const particle = document.createElement('div')
      particle.style.position = 'absolute'
      particle.style.pointerEvents = 'none'
      particle.style.borderRadius = '50%'
      particle.style.left = Math.random() * 100 + '%'
      particle.style.animationDelay = Math.random() * 6 + 's'
      particle.style.animationDuration = (Math.random() * 4 + 6) + 's'
      particle.style.animationName = 'floatUp'
      particle.style.animationTimingFunction = 'linear'
      particle.style.animationIterationCount = '1'
      
      // Different particle types with brand colors and glow effects
      const particleTypes = [
        { bg: '#1E40AF', size: '3px', opacity: '0.7', shadow: '0 0 8px #1E40AF' },
        { bg: '#3B82F6', size: '2px', opacity: '0.6', shadow: '0 0 6px #3B82F6' },
        { bg: '#10B981', size: '4px', opacity: '0.8', shadow: '0 0 10px #10B981' },
        { bg: '#32D74B', size: '2px', opacity: '0.7', shadow: '0 0 6px #32D74B' },
        { bg: '#6366F1', size: '3px', opacity: '0.6', shadow: '0 0 8px #6366F1' },
        { bg: '#8B5CF6', size: '2px', opacity: '0.7', shadow: '0 0 6px #8B5CF6' },
        { bg: '#EC4899', size: '2px', opacity: '0.6', shadow: '0 0 6px #EC4899' },
        { bg: '#F59E0B', size: '3px', opacity: '0.7', shadow: '0 0 8px #F59E0B' },
        { bg: '#14B8A6', size: '3px', opacity: '0.6', shadow: '0 0 8px #14B8A6' }
      ]
      
      const type = particleTypes[Math.floor(Math.random() * particleTypes.length)]
      particle.style.background = type.bg
      particle.style.width = type.size
      particle.style.height = type.size
      particle.style.opacity = type.opacity
      particle.style.boxShadow = type.shadow
      
      // Add horizontal sway to 30% of particles
      if (Math.random() < 0.3) {
        particle.style.animationName = 'floatUp, sway'
        particle.style.animationDuration = `${(Math.random() * 4 + 6)}s, ${(Math.random() * 2 + 3)}s`
      }
      
      const particlesContainer = document.querySelector('.particles-container')
      if (particlesContainer) {
        particlesContainer.appendChild(particle)
        
        setTimeout(() => {
          if (particle.parentNode) {
            particle.parentNode.removeChild(particle)
          }
        }, 10000)
      }
    }

    // Create particles more frequently for better density
    const particlesInterval = setInterval(createParticle, 200) // Double density
    
    // Initialize with more particles
    for (let i = 0; i < 50; i++) { // Double initial particles
      setTimeout(createParticle, i * 40)
    }

    // Loading state - 0.75s
    const timer = setTimeout(() => {
      setLoading(false)
    }, 750)

    return () => {
      clearInterval(particlesInterval)
      clearTimeout(timer)
    }
  }, [])

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Newsletter signup:', email)
    setEmail('')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary transition-colors duration-500">
        <div className="text-center">
          {/* FIXED: Properly sized Lightning Bolt with theme support */}
          <div className="relative mb-12 w-40 h-48 mx-auto flex items-center justify-center overflow-visible">
            <svg 
              className="w-32 h-40" 
              viewBox="0 0 100 120" 
              xmlns="http://www.w3.org/2000/svg"
              style={{ overflow: 'visible' }}
            >
              <defs>
                <linearGradient id="loadingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{stopColor:'#1E40AF'}}>
                    <animate attributeName="stop-color" 
                             values="#1E40AF;#3B82F6;#10B981;#32D74B;#6366F1;#8B5CF6;#1E40AF" 
                             dur="2s" repeatCount="indefinite"/>
                  </stop>
                  <stop offset="25%" style={{stopColor:'#3B82F6'}}>
                    <animate attributeName="stop-color" 
                             values="#3B82F6;#10B981;#32D74B;#6366F1;#8B5CF6;#1E40AF;#3B82F6" 
                             dur="2s" repeatCount="indefinite"/>
                  </stop>
                  <stop offset="50%" style={{stopColor:'#10B981'}}>
                    <animate attributeName="stop-color" 
                             values="#10B981;#32D74B;#6366F1;#8B5CF6;#1E40AF;#3B82F6;#10B981" 
                             dur="2s" repeatCount="indefinite"/>
                  </stop>
                  <stop offset="75%" style={{stopColor:'#6366F1'}}>
                    <animate attributeName="stop-color" 
                             values="#6366F1;#8B5CF6;#1E40AF;#3B82F6;#10B981;#32D74B;#6366F1" 
                             dur="2s" repeatCount="indefinite"/>
                  </stop>
                  <stop offset="100%" style={{stopColor:'#8B5CF6'}}>
                    <animate attributeName="stop-color" 
                             values="#8B5CF6;#1E40AF;#3B82F6;#10B981;#32D74B;#6366F1;#8B5CF6" 
                             dur="2s" repeatCount="indefinite"/>
                  </stop>
                </linearGradient>
                <filter id="loadingGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="5" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              
              <path 
                d="M 50 10 L 70 10 L 45 50 L 65 50 L 25 110 L 40 70 L 20 70 L 50 10 Z" 
                fill="url(#loadingGradient)"
                filter="url(#loadingGlow)"
              >
                <animateTransform
                  attributeName="transform"
                  type="scale"
                  values="1;1.1;1"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </path>
              
              <circle cx="30" cy="80" r="1.5" fill="#32D74B">
                <animate attributeName="opacity" values="0;1;0" dur="1s" repeatCount="indefinite"/>
                <animate attributeName="r" values="1;3;1" dur="1s" repeatCount="indefinite"/>
                <animate attributeName="fill" values="#32D74B;#6366F1;#8B5CF6;#32D74B" dur="3s" repeatCount="indefinite"/>
              </circle>
              <circle cx="60" cy="40" r="2" fill="#3B82F6">
                <animate attributeName="opacity" values="0;1;0" dur="1.2s" begin="0.2s" repeatCount="indefinite"/>
                <animate attributeName="r" values="1;4;1" dur="1.2s" begin="0.2s" repeatCount="indefinite"/>
                <animate attributeName="fill" values="#3B82F6;#10B981;#8B5CF6;#32D74B;#3B82F6" dur="3.5s" repeatCount="indefinite"/>
              </circle>
              <circle cx="70" cy="75" r="1.5" fill="#10B981">
                <animate attributeName="opacity" values="0;1;0" dur="1.4s" begin="0.4s" repeatCount="indefinite"/>
                <animate attributeName="r" values="0.5;3;0.5" dur="1.4s" begin="0.4s" repeatCount="indefinite"/>
                <animate attributeName="fill" values="#10B981;#6366F1;#1E40AF;#32D74B;#10B981" dur="4s" repeatCount="indefinite"/>
              </circle>
              <circle cx="25" cy="55" r="2" fill="#6366F1">
                <animate attributeName="opacity" values="0;1;0" dur="1.1s" begin="0.6s" repeatCount="indefinite"/>
                <animate attributeName="r" values="1;3.5;1" dur="1.1s" begin="0.6s" repeatCount="indefinite"/>
                <animate attributeName="fill" values="#6366F1;#8B5CF6;#3B82F6;#10B981;#6366F1" dur="2.8s" repeatCount="indefinite"/>
              </circle>
              <circle cx="75" cy="30" r="1" fill="#8B5CF6">
                <animate attributeName="opacity" values="0;1;0" dur="1.3s" begin="0.8s" repeatCount="indefinite"/>
                <animate attributeName="r" values="0.5;2.5;0.5" dur="1.3s" begin="0.8s" repeatCount="indefinite"/>
                <animate attributeName="fill" values="#8B5CF6;#1E40AF;#32D74B;#6366F1;#8B5CF6" dur="3.2s" repeatCount="indefinite"/>
              </circle>
            </svg>
          </div>
          
          <h2 className="font-orbitron text-4xl font-bold mb-6 gradient-text">
            THE MARKETING REBOOT
          </h2>
          <p className="text-2xl text-secondary font-orbitron font-semibold">
            Marketing is Evolving. So Are We.
          </p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-primary transition-colors duration-500">
      {/* WORKING PARTICLES CONTAINER */}
      <div className="particles-container fixed inset-0 pointer-events-none z-10"></div>
      
      <ExclusiveHeader />
      
      {/* FIXED: Animated Banner - Perfect positioning and seamless repeating scroll */}
      <div className="fixed top-20 left-0 right-0 z-30 bg-gradient-to-r from-blue-600 via-purple-600 to-green-500 text-white py-4 overflow-hidden">
        <div className="flex items-center h-full">
          <div className="whitespace-nowrap animate-scroll flex items-center">
            {/* Create enough repetitions for seamless loop */}
            {Array.from({ length: 8 }, (_, i) => 
              bannerMessages.map((message, index) => (
                <span key={`${i}-${index}`} className="inline-block px-16 font-semibold text-lg">
                  {message}
                </span>
              ))
            ).flat()}
          </div>
        </div>
      </div>

      {/* ENHANCED: Hero Section - Fixed spacing and gradient text */}
      <section className="relative pt-44 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <div className="animate-fade-in">
            <h1 className="font-orbitron text-4xl sm:text-5xl lg:text-6xl font-black mb-4 leading-tight text-primary">
              Welcome to the
            </h1>
            {/* FIXED: Marketing Reboot text with proper gradient and spacing */}
            <div className="font-orbitron text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black mb-8 leading-tight">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-green-500 bg-clip-text text-transparent animate-gradient-text inline-block pb-2">
                Marketing Reboot
              </span>
            </div>
            <p className="text-lg sm:text-xl text-secondary max-w-3xl mx-auto mb-8 leading-relaxed">
              Where elite marketers share breakthrough strategies that actually move the needle.
            </p>
          </div>
          
          <div className="animate-slide-up flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/topics" className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold px-8 py-4 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
              <Zap className="w-5 h-5" />
              Explore Topics
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/contributors" className="inline-flex items-center gap-2 bg-primary text-primary border surface-border font-bold px-8 py-4 rounded-xl hover:surface-hover transition-all duration-300 transform hover:scale-105 shadow-lg">
              <Users className="w-5 h-5" />
              Meet Contributors
            </Link>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT: Two-column layout with perfect theme styling */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 relative z-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* LEFT: Posts Section - 3/4 width */}
            <div className="lg:col-span-3">
              <div className="flex items-center gap-3 mb-8">
                <h2 className="font-orbitron text-2xl font-bold text-primary">Latest</h2>
                <Zap className="w-6 h-6 text-brand-primary animate-pulse" />
              </div>
              
              <div className="space-y-6">
                {/* Large Featured Post */}
                {featuredPosts
                  .filter(post => post.layout === 'large')
                  .map(post => (
                    <article key={post.id} className="post-card p-6 hover:border-brand-primary transition-all duration-300 group cursor-pointer relative shadow-lg hover:shadow-xl">
                      {post.featured && (
                        <div className="absolute top-6 right-6 bg-gradient-to-r from-green-400 to-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                          TRENDING
                        </div>
                      )}
                      
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg">
                          {post.author.avatar}
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-primary">{post.author.name}</div>
                          <div className="text-secondary text-sm">{post.author.title}</div>
                        </div>
                        <div className="flex gap-2">
                          <button className="p-2 hover:surface-hover rounded-lg transition-colors">
                            <Bookmark className="w-4 h-4 text-secondary" />
                          </button>
                          <button className="p-2 hover:surface-hover rounded-lg transition-colors">
                            <Share className="w-4 h-4 text-secondary" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-semibold inline-block mb-4">
                        {post.type}
                      </div>
                      
                      <h3 className="font-orbitron text-xl font-bold mb-3 group-hover:text-brand-primary transition-colors text-primary">
                        {post.title}
                      </h3>
                      
                      <p className="text-secondary mb-6 leading-relaxed">
                        {post.excerpt}
                      </p>
                      
                      <div className="flex justify-between items-center pt-4 border-t surface-border">
                        <div className="flex gap-4 text-sm text-muted">
                          <span className="flex items-center gap-1 hover:text-red-500 transition-colors cursor-pointer">
                            <Heart className="w-4 h-4" />
                            {post.engagement.likes}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-4 h-4" />
                            {post.engagement.comments}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {post.engagement.time}
                          </span>
                        </div>
                      </div>
                    </article>
                  ))}

                {/* Square Posts Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {featuredPosts
                    .filter(post => post.layout === 'square')
                    .map(post => (
                      <article key={post.id} className="post-card p-6 hover:border-brand-primary transition-all duration-300 group cursor-pointer shadow-lg hover:shadow-xl transform hover:scale-105">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center font-bold text-white text-sm">
                            {post.author.avatar}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-primary text-sm truncate">{post.author.name}</div>
                            <div className="text-secondary text-xs truncate">{post.author.title}</div>
                          </div>
                        </div>
                        
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-2 py-1 rounded text-xs font-semibold inline-block mb-3">
                          {post.type}
                        </div>
                        
                        <h3 className="font-orbitron text-lg font-bold mb-2 group-hover:text-brand-primary transition-colors text-primary line-clamp-2">
                          {post.title}
                        </h3>
                        
                        <p className="text-secondary text-sm mb-4 line-clamp-2">
                          {post.excerpt}
                        </p>
                        
                        <div className="flex items-center gap-3 text-xs text-muted">
                          <span className="flex items-center gap-1 hover:text-red-500 transition-colors cursor-pointer">
                            <Heart className="w-3 h-3" />
                            {post.engagement.likes}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            {post.engagement.comments}
                          </span>
                        </div>
                      </article>
                    ))}
                </div>

                {/* Horizontal Posts */}
                <div className="space-y-4">
                  {featuredPosts
                    .filter(post => post.layout === 'horizontal')
                    .map(post => (
                      <article key={post.id} className="post-card p-6 hover:border-brand-primary transition-all duration-300 group cursor-pointer shadow-lg hover:shadow-xl">
                        <div className="flex flex-col md:flex-row gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center font-bold text-white text-sm">
                                {post.author.avatar}
                              </div>
                              <div>
                                <div className="font-semibold text-primary text-sm">{post.author.name}</div>
                                <div className="text-secondary text-xs">{post.author.title}</div>
                              </div>
                            </div>
                            
                            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-2 py-1 rounded text-xs font-semibold inline-block mb-3">
                              {post.type}
                            </div>
                            
                            <h3 className="font-orbitron text-lg font-bold mb-2 group-hover:text-brand-primary transition-colors text-primary">
                              {post.title}
                            </h3>
                            
                            <p className="text-secondary text-sm mb-4">
                              {post.excerpt}
                            </p>
                            
                            <div className="flex items-center gap-4 text-xs text-muted">
                              <span className="flex items-center gap-1 hover:text-red-500 transition-colors cursor-pointer">
                                <Heart className="w-3 h-3" />
                                {post.engagement.likes}
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageSquare className="w-3 h-3" />
                                {post.engagement.comments}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {post.engagement.time}
                              </span>
                            </div>
                          </div>
                        </div>
                      </article>
                    ))}
                </div>
              </div>
            </div>

            {/* RIGHT: Topics Sidebar - 1/4 width */}
            <div className="lg:sticky lg:top-32 lg:h-fit">
              <div className="glass-card">
                <h3 className="font-orbitron text-xl font-bold mb-6 text-primary">Topics</h3>
                <div className="space-y-3">
                  {topics.map((topic) => {
                    const Icon = topic.icon
                    return (
                      <Link
                        key={topic.id}
                        href={`/topics/${topic.id}`}
                        className="block p-3 rounded-lg hover:surface-hover transition-all duration-300 group"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${topic.gradient} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-primary text-sm">{topic.title}</h4>
                            <p className="text-xs text-secondary">{topic.count}</p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Footer Section - Full Width */}
      <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-green-500 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="font-orbitron text-3xl font-bold text-white mb-4">Join The Reboot</h3>
          <p className="text-white/90 text-xl mb-8">Get weekly insights from top marketing leaders.</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10 max-w-2xl mx-auto">
            <div className="flex flex-col items-center gap-2">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
              <span className="text-white">Weekly insights</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
              <span className="text-white">Exclusive case studies</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
              <span className="text-white">Early access</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
              <span className="text-white">Community discussions</span>
            </div>
          </div>
          
          <form onSubmit={handleNewsletterSubmit} className="max-w-xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 px-6 py-4 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 text-lg"
                required
              />
              <button
                type="submit"
                className="px-8 py-4 bg-white text-blue-600 font-bold rounded-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 text-lg whitespace-nowrap"
              >
                <Zap className="w-5 h-5" />
                Join The Reboot
              </button>
            </div>
          </form>
          
          <p className="text-white/70 mt-6 text-sm">
            Join 100+ top marketing professionals. Unsubscribe anytime.
          </p>
        </div>
      </section>
    </main>
  )
}