'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useRole } from '@/contexts/RoleContext'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/supabase'
import ExclusiveHeader from '@/components/ExclusiveHeader'
import ParticleSystem from '@/components/ParticleSystem'

interface Following {
  id: string
  full_name: string
  avatar_url: string | null
  bio: string | null
  user_role: string
  isVerified: boolean
  verified_date: string | null
}

export default function FollowingPage() {
  const router = useRouter()
  const { isLoading: roleLoading } = useRole()
  const [following, setFollowing] = useState<Following[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    const fetchFollowing = async () => {
      try {
        setIsLoading(true)
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError) throw authError
        if (!user) {
          setFollowing([])
          return
        }

        const { data, error } = await supabase
          .from('follows')
          .select(`
            following_id,
            profiles:following_id (
              id,
              full_name,
              avatar_url,
              bio,
              user_role,
              is_verified,
              verified_date
            )
          `)
          .eq('follower_id', user.id)
          .order('created_at', { ascending: false })

        if (error) throw error
        
        const followingData: Following[] = (data || []).map(follow => {
          const profile = follow.profiles as unknown as Following
          return {
            id: profile.id,
            full_name: profile.full_name,
            avatar_url: profile.avatar_url,
            bio: profile.bio,
            user_role: profile.user_role,
            isVerified: profile.isVerified,
            verified_date: profile.verified_date
          }
        })
        
        setFollowing(followingData)
      } catch (error) {
        console.error('Error fetching following:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchFollowing()
  }, [supabase])

  if (roleLoading || isLoading) {
    return (
      <div className="min-h-screen bg-bg-primary">
        <ExclusiveHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="glass-card p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Loading...</h2>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <ExclusiveHeader />
      <ParticleSystem />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 gradient-text">Following</h1>
        
        {following.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Not Following Anyone Yet</h2>
            <p className="text-text-secondary mb-6">
              Start following contributors to see their latest posts and updates here.
            </p>
            <button
              onClick={() => router.push('/contributors')}
              className="btn-primary"
            >
              Discover Contributors
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {following.map((contributor) => (
              <div key={contributor.id} className="glass-card p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-brand-blue-light overflow-hidden">
                    {contributor.avatar_url ? (
                      <img
                        src={contributor.avatar_url}
                        alt={contributor.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-brand-blue text-white text-2xl">
                        {contributor.full_name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{contributor.full_name}</h3>
                    {contributor.isVerified && (
                      <span className="text-sm text-brand-green">Verified Contributor</span>
                    )}
                  </div>
                </div>
                {contributor.bio && (
                  <p className="text-text-secondary mb-4">{contributor.bio}</p>
                )}
                <button
                  onClick={() => router.push(`/contributors/${contributor.id}`)}
                  className="btn-primary w-full"
                >
                  View Profile
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 