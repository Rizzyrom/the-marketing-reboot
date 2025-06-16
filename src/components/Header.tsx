'use client'

import Link from 'next/link'
import { TrendingUp, Sparkles, Users, Clock, Menu, X } from 'lucide-react'
import { useState } from 'react'

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full">
      <nav className="glass-card border-b border-[var(--glass-border)] bg-[var(--glass-bg)] shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3 hover-lift">
              <div className="relative">
                <svg className="w-12 h-12" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="publicLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{stopColor:'#9B5FFF'}}>
                        <animate attributeName="stop-color" 
                                 values="#9B5FFF;#00D4FF;#00FF88;#9B5FFF" 
                                 dur="4s" repeatCount="indefinite"/>
                      </stop>
                      <stop offset="100%" style={{stopColor:'#00D4FF'}}>
                        <animate attributeName="stop-color" 
                                 values="#00D4FF;#00FF88;#9B5FFF;#00D4FF" 
                                 dur="4s" repeatCount="indefinite"/>
                      </stop>
                    </linearGradient>
                    <filter id="publicLogoGlow">
                      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                  <path 
                    d="M 50 20 A 30 30 0 1 1 20 50 L 30 40 L 20 50 L 30 60" 
                    fill="none" 
                    stroke="url(#publicLogoGradient)" 
                    strokeWidth="4" 
                    strokeLinecap="round"
                    filter="url(#publicLogoGlow)"
                  >
                    <animateTransform
                      attributeName="transform"
                      type="rotate"
                      from="0 50 50"
                      to="360 50 50"
                      dur="8s"
                      repeatCount="indefinite"
                    />
                  </path>
                  <circle cx="50" cy="50" r="3" fill="#00FF88" filter="url(#publicLogoGlow)">
                    <animate attributeName="r" values="3;6;3" dur="2s" repeatCount="indefinite"/>
                  </circle>
                </svg>
              </div>
              <div>
                <div className="font-mono text-2xl font-black gradient-text text-glow-purple">
                  REBOOT
                </div>
                <div className="text-xs text-text-secondary font-medium tracking-widest uppercase">
                  Marketing Club
                </div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <Link href="/trending" className="nav-item group">
                <TrendingUp size={18} className="text-[#00FF88]" />
                <span>Trending</span>
                <div className="nav-underline bg-[#00FF88]"></div>
              </Link>
              <Link href="/topics" className="nav-item group">
                <Sparkles size={18} className="text-[#9B5FFF]" />
                <span>Topics</span>
                <div className="nav-underline bg-[#9B5FFF]"></div>
              </Link>
              <Link href="/contributors" className="nav-item group">
                <Users size={18} className="text-[#00D4FF]" />
                <span>Contributors</span>
                <div className="nav-underline bg-[#00D4FF]"></div>
              </Link>
              <Link href="/latest" className="nav-item group">
                <Clock size={18} className="text-[#FF006E]" />
                <span>Latest</span>
                <div className="nav-underline bg-[#FF006E]"></div>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
            <div className="py-4 space-y-3">
              <Link href="/trending" className="mobile-nav-item">
                <TrendingUp size={18} className="text-[#00FF88]" />
                <span>Trending</span>
              </Link>
              <Link href="/topics" className="mobile-nav-item">
                <Sparkles size={18} className="text-[#9B5FFF]" />
                <span>Topics</span>
              </Link>
              <Link href="/contributors" className="mobile-nav-item">
                <Users size={18} className="text-[#00D4FF]" />
                <span>Contributors</span>
              </Link>
              <Link href="/latest" className="mobile-nav-item">
                <Clock size={18} className="text-[#FF006E]" />
                <span>Latest</span>
              </Link>
            </div>
            
            <div className="pt-4 border-t border-glass-border space-y-3">
              <Link 
                href="/auth/login"
                className="block text-center py-3 text-white font-semibold hover:text-[#00D4FF] transition-colors"
              >
                Sign In
              </Link>
              <Link 
                href="/auth/signup"
                className="block text-center btn-glow bg-gradient-to-r from-[#9B5FFF] to-[#00D4FF] text-white"
              >
                <span className="font-bold">Get Started</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <style jsx>{`
        .nav-item {
          @apply relative flex items-center gap-2 text-text-secondary hover:text-white font-medium transition-all duration-200 text-sm uppercase tracking-wide;
        }
        
        .nav-underline {
          @apply absolute bottom-0 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300;
          transform: translateY(8px);
        }
        
        .mobile-menu {
          @apply md:hidden overflow-hidden transition-all duration-300;
          max-height: 0;
        }
        
        .mobile-menu.open {
          max-height: 500px;
        }
        
        .mobile-nav-item {
          @apply flex items-center gap-3 px-4 py-3 text-text-secondary hover:text-white hover:bg-white/5 rounded-lg transition-all;
        }
        
        .btn-glow {
          @apply flex items-center;
        }
      `}</style>
    </header>
  )
}