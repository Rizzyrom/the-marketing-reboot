'use client'

import { useEffect, useState } from 'react'
import { useRole } from '@/contexts/RoleContext'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/supabase'
import ExclusiveHeader from '@/components/ExclusiveHeader'
import ParticleSystem from '@/components/ParticleSystem'

interface SavedPost {
  id: string
  title: string
  content: string
  author: {
    id: string
    full_name: string
    avatar_url: string | null
    user_role: string
    isVerified: boolean
  }
  created_at: string
}

export default function SavedPostsPage() {
  const { isLoading: roleLoading } = useRole()
  const [savedPosts, setSavedPosts] = useState<SavedPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    const fetchSavedPosts = async () => {
      try {
        setIsLoading(true)
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError) throw authError
        if (!user) {
          setSavedPosts([])
          return
        }

        const { data, error } = await supabase
          .from('saved_posts')
          .select(`
            post_id,
            posts:post_id (
              id,
              title,
              content,
              created_at,
              author:author_id (
                id,
                full_name,
                avatar_url,
                user_role,
                is_verified
              )
            )
          `)
          .eq('user_id', user.id)
          .order('saved_at', { ascending: false })

        if (error) throw error
        
        const postsData: SavedPost[] = (data || []).map(saved => {
          const post = saved.posts as unknown as SavedPost
          return {
            id: post.id,
            title: post.title,
            content: post.content,
            author: post.author,
            created_at: post.created_at
          }
        })
        
        setSavedPosts(postsData)
      } catch (error) {
        console.error('Error fetching saved posts:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSavedPosts()
  }, [supabase])

  if (roleLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0A0A0A] to-[#1A1A1A]">
        <ExclusiveHeader />
        <ParticleSystem />
        <div className="container mx-auto px-4 py-8">
          <div className="glass-card p-8 text-center">
            <div className="animate-pulse">
              <div className="h-8 w-3/4 bg-gray-700 rounded mx-auto mb-4"></div>
              <div className="h-4 w-1/2 bg-gray-700 rounded mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0A0A] to-[#1A1A1A]">
      <ExclusiveHeader />
      <ParticleSystem />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center gradient-text">Saved Posts</h1>
        
        {savedPosts.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <p className="text-gray-400">You haven&apos;t saved any posts yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {savedPosts.map((post) => (
              <div key={post.id} className="glass-card p-6">
                <div className="flex items-center mb-4">
                  {post.author.avatar_url ? (
                    <img
                      src={post.author.avatar_url}
                      alt={post.author.full_name}
                      className="w-10 h-10 rounded-full mr-3"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-700 mr-3 flex items-center justify-center">
                      <span className="text-gray-400 text-sm">
                        {post.author.full_name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div>
                    <div className="flex items-center">
                      <span className="font-medium text-white">{post.author.full_name}</span>
                      {post.author.isVerified && (
                        <span className="ml-2 text-blue-400">✓</span>
                      )}
                    </div>
                    <span className="text-sm text-gray-400">
                      {new Date(post.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
                <p className="text-gray-300">{post.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 