'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/supabase'
import { Plus, Edit, Trash, Eye } from 'lucide-react'

interface Post {
  id: string
  title: string
  status: 'draft' | 'published'
  created_at: string
  updated_at: string
}

export default function CMSPosts() {
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return

        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .eq('author_id', session.user.id)
          .order('created_at', { ascending: false })

        if (error) throw error
        setPosts(data || [])
      } catch (error) {
        console.error('Error fetching posts:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPosts()
  }, [])

  const handleDelete = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)

      if (error) throw error

      setPosts(posts.filter(post => post.id !== postId))
    } catch (error) {
      console.error('Error deleting post:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="glass-card p-8 text-center">
        Loading posts...
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="gradient-text text-3xl font-bold">
          My Posts
        </h1>
        <Link
          href="/cms/posts/new"
          className="btn-primary flex items-center gap-2 px-4 py-2 rounded-lg"
        >
          <Plus className="w-5 h-5" />
          New Post
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <p className="text-[var(--text-secondary)] mb-4">
            You haven't created any posts yet.
          </p>
          <Link
            href="/cms/posts/new"
            className="btn-primary inline-flex items-center gap-2 px-4 py-2 rounded-lg"
          >
            <Plus className="w-5 h-5" />
            Create Your First Post
          </Link>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border-primary)]">
                  <th className="px-6 py-3 text-left text-sm font-medium text-[var(--text-secondary)]">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-[var(--text-secondary)]">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-[var(--text-secondary)]">
                    Last Updated
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-[var(--text-secondary)]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr
                    key={post.id}
                    className="border-b border-[var(--border-primary)] last:border-0"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium">{post.title}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          post.status === 'published'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }`}
                      >
                        {post.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                      {new Date(post.updated_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/post/${post.id}`}
                          className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                          title="View post"
                        >
                          <Eye className="w-5 h-5" />
                        </Link>
                        <Link
                          href={`/cms/posts/${post.id}/edit`}
                          className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                          title="Edit post"
                        >
                          <Edit className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="p-2 text-red-500 hover:text-red-600 transition-colors"
                          title="Delete post"
                        >
                          <Trash className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
} 