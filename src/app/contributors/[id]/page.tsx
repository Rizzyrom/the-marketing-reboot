'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/supabase'
import { Bookmark, Globe, Twitter, Linkedin } from 'lucide-react'
import Link from 'next/link'
import FollowButton from '@/components/FollowButton'

interface ContributorProfile {
  id: string
  full_name: string
  bio: string
  website: string
  twitter: string
  linkedin: string
  is_verified: boolean
  created_at: string
}

interface Post {
  id: string
  title: string
  content: string
  created_at: string
  status: 'draft' | 'published'
}

interface ContributorPageProps {
  params: {
    id: string
  }
}

export default function ContributorPage({ params }: ContributorPageProps) {
  const [profile, setProfile] = useState<ContributorProfile | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [isFollowing, setIsFollowing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    async function fetchContributorData() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) throw new Error('Not authenticated')

        // Fetch contributor profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', params.id)
          .single()

        if (profileError) throw profileError

        // Fetch contributor's posts
        const { data: postsData, error: postsError } = await supabase
          .from('posts')
          .select('*')
          .eq('author_id', params.id)
          .eq('status', 'published')
          .order('created_at', { ascending: false })

        if (postsError) throw postsError

        // Check if current user is following
        const { data: followData, error: followError } = await supabase
          .from('follows')
          .select('id')
          .eq('follower_id', session.user.id)
          .eq('contributor_id', params.id)
          .single()

        if (followError && followError.code !== 'PGRST116') throw followError

        setProfile(profileData)
        setPosts(postsData)
        setIsFollowing(!!followData)
      } catch (error) {
        console.error('Error fetching contributor data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchContributorData()
  }, [params.id, supabase])

  if (isLoading) {
    return (
      <div className="glass-card p-8 text-center">
        Loading profile...
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="glass-card p-8 text-center">
        Contributor not found
      </div>
    )
  }

  return (
    <div className="space-y-12">
      <div className="glass-card p-8">
        <div className="flex items-start justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <h1 className="gradient-text text-3xl font-bold">
                {profile.full_name}
              </h1>
              {profile.is_verified && (
                <span className="px-2 py-0.5 rounded-full bg-[var(--accent-primary)] text-white text-xs">
                  Verified
                </span>
              )}
            </div>

            {profile.bio && (
              <p className="text-[var(--text-secondary)]">
                {profile.bio}
              </p>
            )}

            <div className="flex items-center gap-4">
              {profile.website && (
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors"
                >
                  <Globe className="w-5 h-5" />
                </a>
              )}
              {profile.twitter && (
                <a
                  href={`https://twitter.com/${profile.twitter}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors"
                >
                  <Twitter className="w-5 h-5" />
                </a>
              )}
              {profile.linkedin && (
                <a
                  href={profile.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>

          <FollowButton
            contributorId={profile.id}
            isFollowing={isFollowing}
            onFollowChange={setIsFollowing}
          />
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Bookmark className="w-5 h-5" />
          Posts
        </h2>

        {posts.length === 0 ? (
          <div className="glass-card p-8 text-center text-[var(--text-secondary)]">
            No posts yet
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map(post => (
              <div key={post.id} className="glass-card p-6">
                <Link
                  href={`/posts/${post.id}`}
                  className="text-lg font-medium hover:text-[var(--accent-primary)] transition-colors"
                >
                  {post.title}
                </Link>
                <div className="mt-2 text-sm text-[var(--text-secondary)]">
                  {new Date(post.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 