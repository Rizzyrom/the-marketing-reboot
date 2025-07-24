'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useRole } from '@/contexts/RoleContext'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/supabase'
import ExclusiveHeader from '@/components/ExclusiveHeader'
import ParticleSystem from '@/components/ParticleSystem'
import { User, CheckCircle, Calendar, ArrowRight } from 'lucide-react'

interface Contributor {
  id: string
  full_name: string
  avatar_url: string | null
  bio: string | null
  job_title: string | null
  company: string | null
  user_role: string
  is_verified: boolean
  verified_date: string | null
}

export default function ContributorsPage() {
  const router = useRouter()
  const { isLoading: roleLoading } = useRole()
  const [contributors, setContributors] = useState<Contributor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    const fetchContributors = async () => {
      try {
        setIsLoading(true)
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_role', 'contributor')
          .eq('is_verified', true)
          .order('verified_date', { ascending: false })

        if (error) throw error
        setContributors(data || [])
      } catch (error) {
        console.error('Error fetching contributors:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchContributors()
  }, [supabase])

  if (roleLoading || isLoading) {
    return (
      <div className="min-h-screen bg-primary">
        <ExclusiveHeader />
        <ParticleSystem />
        <div className="container mx-auto px-4 pt-24 pb-12">
          <div className="glass-card p-8 text-center">
            <div className="animate-pulse">
              <div className="h-8 w-64 bg-gray-700 rounded mx-auto mb-4"></div>
              <div className="h-4 w-48 bg-gray-700 rounded mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-primary">
      <ExclusiveHeader />
      <ParticleSystem />
      
      {/* Fixed padding-top */}
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
            Our Contributors
          </h1>
          <p className="text-xl text-secondary max-w-2xl mx-auto">
            Learn from verified marketing leaders sharing their expertise
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contributors.map((contributor) => (
            <div 
              key={contributor.id} 
              className="glass-card p-6 hover:scale-105 transition-all duration-300 cursor-pointer"
              onClick={() => router.push(`/contributors/${contributor.id}`)}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-brand-primary to-brand-tertiary p-0.5">
                    <div className="w-full h-full rounded-full overflow-hidden bg-surface">
                      {contributor.avatar_url ? (
                        <img
                          src={contributor.avatar_url}
                          alt={contributor.full_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-primary/20 to-brand-tertiary/20">
                          <User className="w-10 h-10 text-brand-primary" />
                        </div>
                      )}
                    </div>
                  </div>
                  {contributor.is_verified && (
                    <div className="absolute -bottom-1 -right-1 bg-brand-tertiary rounded-full p-1">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-primary">
                    {contributor.full_name}
                  </h3>
                  {contributor.job_title && (
                    <p className="text-sm text-secondary">
                      {contributor.job_title}
                      {contributor.company && ` at ${contributor.company}`}
                    </p>
                  )}
                  {contributor.verified_date && (
                    <p className="text-xs text-secondary flex items-center gap-1 mt-1">
                      <Calendar className="w-3 h-3" />
                      Joined {new Date(contributor.verified_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
              
              {contributor.bio ? (
                <p className="text-secondary mb-4 line-clamp-3">
                  {contributor.bio}
                </p>
              ) : (
                <p className="text-secondary/50 italic mb-4">
                  No bio added yet
                </p>
              )}
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-brand-primary">
                  View Profile
                </span>
                <ArrowRight className="w-4 h-4 text-brand-primary" />
              </div>
            </div>
          ))}
        </div>

        {contributors.length === 0 && (
          <div className="glass-card p-12 text-center">
            <p className="text-secondary text-lg">No contributors yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}