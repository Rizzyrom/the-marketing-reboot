'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/supabase'
import { UserPlus, UserMinus } from 'lucide-react'

interface FollowButtonProps {
  contributorId: string
  isFollowing: boolean
  onFollowChange: (isFollowing: boolean) => void
}

export default function FollowButton({ contributorId, isFollowing, onFollowChange }: FollowButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClientComponentClient<Database>()

  const handleFollow = async () => {
    setIsLoading(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      if (isFollowing) {
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', session.user.id)
          .eq('contributor_id', contributorId)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('follows')
          .insert([{
            follower_id: session.user.id,
            contributor_id: contributorId
          }])

        if (error) throw error
      }

      onFollowChange(!isFollowing)
    } catch (error) {
      console.error('Error toggling follow:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleFollow}
      disabled={isLoading}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
        isFollowing ? 'bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)]' : 'bg-[var(--accent-primary)] hover:bg-[var(--accent-secondary)] text-white'
      }`}
    >
      {isFollowing ? (
        <>
          <UserMinus className="w-4 h-4" />
          Unfollow
        </>
      ) : (
        <>
          <UserPlus className="w-4 h-4" />
          Follow
        </>
      )}
    </button>
  )
} 