'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/supabase'
import { ArrowLeft, Save } from 'lucide-react'
import dynamic from 'next/dynamic'

// Import TipTap editor dynamically to avoid SSR issues
const TipTapEditor = dynamic(() => import('@/components/TipTapEditor'), {
  ssr: false,
  loading: () => (
    <div className="glass-card p-8 text-center">
      Loading editor...
    </div>
  ),
})

interface EditPostProps {
  params: {
    id: string
  }
}

export default function EditPost({ params }: EditPostProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [status, setStatus] = useState<'draft' | 'published'>('draft')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    async function fetchPost() {
      try {
        const { data: post, error } = await supabase
          .from('posts')
          .select('*')
          .eq('id', params.id)
          .single()

        if (error) throw error

        setTitle(post.title)
        setContent(post.content)
        setStatus(post.status)
      } catch (error) {
        console.error('Error fetching post:', error)
        router.push('/cms/posts')
      } finally {
        setIsLoading(false)
      }
    }

    fetchPost()
  }, [params.id, router, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const { error } = await supabase
        .from('posts')
        .update({
          title,
          content,
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', params.id)

      if (error) throw error

      router.push('/cms/posts')
    } catch (error) {
      console.error('Error updating post:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="glass-card p-8 text-center">
        Loading post...
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="gradient-text text-3xl font-bold">
          Edit Post
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-2">
            Title
          </label>
          <input
            type="text"
            id="title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
            placeholder="Enter post title..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Content
          </label>
          <div className="glass-card rounded-lg">
            <TipTapEditor
              content={content}
              onChange={setContent}
            />
          </div>
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium mb-2">
            Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
            className="w-full px-4 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary flex items-center gap-2 px-6 py-2 rounded-lg"
          >
            <Save className="w-5 h-5" />
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
} 