'use client'

import { useState } from 'react'
import { Bookmark } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/supabase'

interface SaveButtonProps {
  postId: string
  initialSaved?: boolean
}

export default function SaveButton({ postId, initialSaved = false }: SaveButtonProps) {
  const [isSaved, setIsSaved] = useState(initialSaved)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClientComponentClient<Database>()

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        // Redirect to login if not authenticated
        window.location.href = '/auth/login'
        return
      }

      if (isSaved) {
        // Unsave post
        const { error } = await supabase
          .from('saved_posts')
          .delete()
          .match({ user_id: session.user.id, post_id: postId })

        if (error) throw error
        setIsSaved(false)
      } else {
        // Save post
        const { error } = await supabase
          .from('saved_posts')
          .insert([{
            user_id: session.user.id,
            post_id: postId,
            saved_at: new Date().toISOString()
          }])

        if (error) throw error
        setIsSaved(true)
      }
    } catch (error) {
      console.error('Error toggling save:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleSave}
      disabled={isLoading}
      className={`p-2 rounded-full transition-colors ${
        isSaved 
          ? 'text-[var(--accent-primary)] hover:text-[var(--accent-secondary)]' 
          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
      }`}
      aria-label={isSaved ? 'Unsave post' : 'Save post'}
    >
      <Bookmark
        className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`}
      />
    </button>
  )
} 