'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useRole } from '@/contexts/RoleContext'
import { Zap, X, ArrowRight } from 'lucide-react'

export default function FloatingContributorButton() {
  const { user } = useAuth()
  const { isContributor, isAdmin } = useRole()
  const [isVisible, setIsVisible] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    // Check if user has dismissed the button
    const dismissed = localStorage.getItem('contributor_cta_dismissed')
    if (dismissed) {
      setIsDismissed(true)
      return
    }

    // Show button after 30 seconds for readers only
    const timer = setTimeout(() => {
      if (!isContributor && !isAdmin) {
        setIsVisible(true)
      }
    }, 30000)

    return () => clearTimeout(timer)
  }, [isContributor, isAdmin])

  const handleDismiss = () => {
    setIsVisible(false)
    setIsDismissed(true)
    localStorage.setItem('contributor_cta_dismissed', 'true')
  }

  // Don't show for contributors, admins, or if dismissed
  if (isContributor || isAdmin || isDismissed || !isVisible) {
    return null
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isExpanded ? (
        <div className="glass-card p-6 max-w-sm animate-slide-up">
          <button
            onClick={() => setIsExpanded(false)}
            className="absolute top-3 right-3 p-1 hover:bg-surface-hover rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-secondary" />
          </button>
          
          <div className="mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center mb-3">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-primary mb-2">
              Become a Contributor
            </h3>
            <p className="text-sm text-secondary">
              Share your marketing expertise with our exclusive community of industry leaders.
            </p>
          </div>
          
          <div className="space-y-3">
            <Link
              href="/apply"
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              Apply Now
              <ArrowRight className="w-4 h-4" />
            </Link>
            
            <button
              onClick={handleDismiss}
              className="w-full text-sm text-secondary hover:text-primary transition-colors"
            >
              Not interested
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsExpanded(true)}
          className="group relative"
        >
          {/* Animated glow effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 opacity-75 blur-xl group-hover:opacity-100 transition-opacity animate-pulse"></div>
          
          {/* Button */}
          <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full font-medium shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2">
            <Zap className="w-5 h-5" />
            <span>Become a Contributor</span>
          </div>
          
          {/* Floating badge */}
          <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full animate-bounce">
            Invite Only
          </div>
        </button>
      )}
    </div>
  )
}