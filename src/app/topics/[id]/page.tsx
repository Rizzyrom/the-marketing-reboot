'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRole } from '@/hooks/useRole'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import ExclusiveHeader from '@/components/ExclusiveHeader'
import ParticleSystem from '@/components/brand/ParticleSystem'

interface Topic {
  id: string
  title: string
  description: string
  posts: Post[]
}

interface Post {
  id: string
  title: string
  excerpt: string
  author: {
    name: string
    avatar_url: string
  }
  created_at: string
}

export default function TopicPage({ params }: { params: { id: string } }) {
  const { user } = useAuth()
  const { role, isContributor, isReader } = useRole()
  const router = useRouter()
  const [topic, setTopic] = useState<Topic | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchTopic()
  }, [params.id])

  const fetchTopic = async () => {
    try {
      const { data, error } = await supabase
        .from('topics')
        .select(`
          *,
          posts (
            id,
            title,
            excerpt,
            created_at,
            author:profiles (
              name,
              avatar_url
            )
          )
        `)
        .eq('id', params.id)
        .single()

      if (error) throw error
      setTopic(data)
    } catch (error) {
      console.error('Error fetching topic:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-primary border-t-transparent"></div>
      </div>
    )
  }

  if (!topic) {
    return (
      <div className="min-h-screen bg-primary">
        <ExclusiveHeader />
        <div className="pt-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold gradient-text mb-8">Topic Not Found</h1>
          </div>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-primary">
      <ParticleSystem />
      <ExclusiveHeader />
      
      <section className="relative pt-32 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 gradient-text">
              {topic.title}
            </h1>
            <p className="text-xl text-secondary max-w-3xl mx-auto">
              {topic.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topic.posts.map(post => (
              <div key={post.id} className="glass-card p-6">
                <h3 className="text-xl font-bold mb-2">{post.title}</h3>
                <p className="text-secondary mb-4">{post.excerpt}</p>
                <div className="flex items-center gap-3">
                  <img
                    src={post.author.avatar_url}
                    alt={post.author.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="text-sm text-secondary">{post.author.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
} 