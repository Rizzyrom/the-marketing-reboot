'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { UserPlus, UserMinus } from 'lucide-react'

interface FollowButtonProps {
  contributorId: string
  initialIsFollowing?: boolean
  onFollowChange?: (isFollowing: boolean) => void
  showIcon?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'secondary'
  className?: string
}

export default function FollowButton({
  contributorId,
  initialIsFollowing = false,
  onFollowChange,
  showIcon = true,
  size = 'sm',
  variant = 'primary',
  className = ''
}: FollowButtonProps) {
  const { user } = useAuth()
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [loading, setLoading] = useState(false)

  // Check if user is following this contributor
  useEffect(() => {
    const checkFollowing = async () => {
      if (!user || !contributorId) return
      
      try {
        const { data } = await supabase
          .from('follows')
          .select('id')
          .eq('follower_id', user.id)
          .eq('following_id', contributorId)
          .single()
        
        setIsFollowing(!!data)
      } catch (error) {
        // Not following if no record found
        setIsFollowing(false)
      }
    }
    
    checkFollowing()
  }, [user, contributorId, supabase])

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    
    if (!user) {
      router.push('/auth/login')
      return
    }

    setLoading(true)
    
    try {
      if (isFollowing) {
        // Unfollow
        await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', contributorId)
      } else {
        // Follow
        await supabase
          .from('follows')
          .insert({
            follower_id: user.id,
            following_id: contributorId
          })
      }
      
      const newFollowState = !isFollowing
      setIsFollowing(newFollowState)
      onFollowChange?.(newFollowState)
      
    } catch (error) {
      console.error('Error toggling follow:', error)
    } finally {
      setLoading(false)
    }
  }

  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  }

  // Variant classes
  const variantClasses = {
    primary: isFollowing 
      ? 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300' 
      : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700',
    secondary: isFollowing
      ? 'bg-surface-secondary hover:bg-surface-hover text-secondary'
      : 'bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary'
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        rounded-full font-medium transition-all
        disabled:opacity-50 disabled:cursor-not-allowed
        inline-flex items-center gap-1
        ${className}
      `}
    >
      {loading ? (
        <span>...</span>
      ) : (
        <>
          {showIcon && (
            isFollowing ? (
              <UserMinus className={`${size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5'}`} />
            ) : (
              <UserPlus className={`${size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5'}`} />
            )
          )}
          {isFollowing ? 'Following' : 'Follow'}
        </>
      )}
    </button>
  )
}