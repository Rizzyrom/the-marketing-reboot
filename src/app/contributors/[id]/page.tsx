'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRole } from '@/hooks/useRole'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import ExclusiveHeader from '@/components/ExclusiveHeader'
import ParticleSystem from '@/components/brand/ParticleSystem'
import FollowButton from '@/components/FollowButton'

interface Contributor {
  id: string
  name: string
  title: string
  bio: string
  expertise: string[]
  job_title: string
  is_verified: boolean
  verified_date: string
  avatar_url: string
  linkedin_url: string
  website_url: string
  posts: Post[]
}

interface Post {
  id: string
  title: string
  excerpt: string
  created_at: string
}

export default function ContributorPage({ params }: { params: { id: string } }) {
  const { user } = useAuth()
  const { isReader } = useRole()
  const router = useRouter()
  const [contributor, setContributor] = useState<Contributor | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchContributor()
  }, [params.id])

  const fetchContributor = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          posts (
            id,
            title,
            excerpt,
            created_at
          )
        `)
        .eq('id', params.id)
        .eq('user_role', 'contributor')
        .single()

      if (error) throw error
      setContributor(data)
    } catch (error) {
      console.error('Error fetching contributor:', error)
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

  if (!contributor) {
    return (
      <div className="min-h-screen bg-primary">
        <ExclusiveHeader />
        <div className="pt-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold gradient-text mb-8">Contributor Not Found</h1>
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
          <div className="glass-card p-8 mb-12">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-shrink-0">
                <img
                  src={contributor.avatar_url}
                  alt={contributor.name}
                  className="w-32 h-32 rounded-full"
                />
              </div>
              
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">{contributor.name}</h1>
                    <p className="text-xl text-secondary mb-4">{contributor.title}</p>
                  </div>
                  {isReader && (
                    <FollowButton 
                      contributorId={contributor.id}
                      size="md"
                      showText={true}
                    />
                  )}
                </div>
                
                <p className="text-secondary mb-6">{contributor.bio}</p>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  {contributor.expertise.map((exp, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 rounded-full text-sm bg-primary border surface-border"
                    >
                      {exp}
                    </span>
                  ))}
                </div>
                
                <div className="flex items-center gap-4">
                  {contributor.linkedin_url && (
                    <a
                      href={contributor.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-secondary hover:text-primary transition-colors"
                    >
                      LinkedIn
                    </a>
                  )}
                  {contributor.website_url && (
                    <a
                      href={contributor.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-secondary hover:text-primary transition-colors"
                    >
                      Website
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-6">Latest Posts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contributor.posts.map(post => (
              <div key={post.id} className="glass-card p-6">
                <h3 className="text-xl font-bold mb-2">{post.title}</h3>
                <p className="text-secondary mb-4">{post.excerpt}</p>
                <div className="text-sm text-secondary">
                  {new Date(post.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
} 