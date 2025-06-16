'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/supabase'
import { ArrowLeft, Edit, Trash2 } from 'lucide-react'

interface PostViewProps {
  params: {
    id: string
  }
}

export default function PostView({ params }: PostViewProps) {
  const [post, setPost] = useState<{
    title: string
    content: string
    status: 'draft' | 'published'
    created_at: string
    updated_at: string
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    async function fetchPost() {
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .eq('id', params.id)
          .single()

        if (error) throw error

        setPost(data)
      } catch (error) {
        console.error('Error fetching post:', error)
        router.push('/cms/posts')
      } finally {
        setIsLoading(false)
      }
    }

    fetchPost()
  }, [params.id, router, supabase])

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', params.id)

      if (error) throw error

      router.push('/cms/posts')
    } catch (error) {
      console.error('Error deleting post:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="glass-card p-8 text-center">
        Loading post...
      </div>
    )
  }

  if (!post) {
    return (
      <div className="glass-card p-8 text-center">
        Post not found
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="gradient-text text-3xl font-bold">
            {post.title}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push(`/cms/posts/${params.id}/edit`)}
            className="p-2 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors"
          >
            <Edit className="w-5 h-5" />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors text-red-500"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm text-[var(--text-secondary)]">
        <span className="px-3 py-1 rounded-full bg-[var(--bg-secondary)]">
          {post.status}
        </span>
        <span>
          Created: {new Date(post.created_at).toLocaleDateString()}
        </span>
        <span>
          Updated: {new Date(post.updated_at).toLocaleDateString()}
        </span>
      </div>

      <div 
        className="prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto glass-card p-8"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
    </div>
  )
} 