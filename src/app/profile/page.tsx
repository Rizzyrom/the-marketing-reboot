'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useRole } from '@/contexts/RoleContext'
import { useAuth } from '@/contexts/AuthContext'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'
import ExclusiveHeader from '@/components/ExclusiveHeader'
import ParticleSystem from '@/components/ParticleSystem'
import { Calendar, Shield, MapPin, Briefcase, Link as LinkIcon, Twitter, Linkedin, Edit, LayoutDashboard, Eye } from 'lucide-react'

interface Profile {
  id: string
  full_name: string
  avatar_url: string | null
  bio: string | null
  user_role: string
  is_verified: boolean
  is_admin: boolean
  verified_date: string | null
  created_at: string
  company: string | null
  location: string | null
  website_url: string | null
  twitter_url: string | null
  linkedin_url: string | null
  job_title: string | null
  email_contact: string | null
}

export default function ProfilePage() {
  const router = useRouter()
  const { role, isContributor, isAdmin, isLoading: roleLoading } = useRole()
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    if (roleLoading) return

    if (!user) {
      router.push('/auth/login')
      return
    }

    // Only allow contributors and admins
    if (!roleLoading && !isContributor && !isAdmin) {
      router.push('/')
      return
    }
  }, [user, isContributor, isAdmin, roleLoading, router])

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user || roleLoading) return

      try {
        setIsLoading(true)
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (error) throw error
        
        setProfile(data as Profile)
      } catch (error) {
        console.error('Error fetching profile:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [supabase, user, roleLoading])

  if (roleLoading || isLoading) {
    return (
      <div className="min-h-screen bg-primary">
        <ExclusiveHeader />
        <ParticleSystem />
        <div className="container mx-auto px-4 py-24">
          <div className="glass-card p-8 text-center max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-32 w-32 bg-gray-700 rounded-full mx-auto mb-6"></div>
              <div className="h-8 w-3/4 bg-gray-700 rounded mx-auto mb-4"></div>
              <div className="h-4 w-1/2 bg-gray-700 rounded mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!isContributor && !isAdmin) {
    return null
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-primary">
        <ExclusiveHeader />
        <ParticleSystem />
        <div className="container mx-auto px-4 py-24">
          <div className="glass-card p-8 text-center max-w-4xl mx-auto">
            <p className="text-gray-400">Profile not found.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-primary">
      <ExclusiveHeader />
      <ParticleSystem />
      
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card p-8">
            {/* Profile Header */}
            <div className="flex flex-col md:flex-row items-start gap-6 mb-8">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name}
                  className="w-32 h-32 rounded-full border-4 border-brand-primary/20 shadow-lg"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-brand-primary to-brand-tertiary flex items-center justify-center shadow-lg">
                  <span className="text-white text-4xl font-bold">
                    {profile.full_name?.charAt(0) || 'U'}
                  </span>
                </div>
              )}
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-primary">{profile.full_name}</h1>
                  {profile.is_verified && (
                    <div className="flex items-center gap-1 bg-blue-500/20 px-3 py-1 rounded-full">
                      <Shield className="w-4 h-4 text-blue-500" />
                      <span className="text-xs text-blue-500 font-medium">Verified</span>
                    </div>
                  )}
                  {profile.is_admin && (
                    <div className="flex items-center gap-1 bg-purple-500/20 px-3 py-1 rounded-full">
                      <Shield className="w-4 h-4 text-purple-500" />
                      <span className="text-xs text-purple-500 font-medium">Admin</span>
                    </div>
                  )}
                </div>
                
                <p className="text-secondary mb-4">
                  {profile.user_role === 'contributor' ? 'Contributor' : profile.user_role === 'admin' ? 'Administrator' : 'Member'}
                  {profile.job_title && ` • ${profile.job_title}`}
                </p>
                
                {/* Info badges */}
                <div className="flex flex-wrap gap-4 text-sm text-secondary">
                  {profile.company && (
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4" />
                      <span>{profile.company}</span>
                    </div>
                  )}
                  {profile.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{profile.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Bio */}
            {profile.bio && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold mb-3 text-primary">About</h2>
                <p className="text-secondary leading-relaxed">{profile.bio}</p>
              </div>
            )}
            
            {/* Stats - Only for Contributors */}
            {isContributor && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="text-center p-4 bg-surface-secondary rounded-lg">
                  <div className="text-2xl font-bold text-primary">0</div>
                  <div className="text-sm text-secondary">Posts</div>
                </div>
                <div className="text-center p-4 bg-surface-secondary rounded-lg">
                  <div className="text-2xl font-bold text-primary">0</div>
                  <div className="text-sm text-secondary">Views</div>
                </div>
                <div className="text-center p-4 bg-surface-secondary rounded-lg">
                  <div className="text-2xl font-bold text-primary">0</div>
                  <div className="text-sm text-secondary">Likes</div>
                </div>
                <div className="text-center p-4 bg-surface-secondary rounded-lg">
                  <div className="text-2xl font-bold text-primary">0</div>
                  <div className="text-sm text-secondary">Comments</div>
                </div>
              </div>
            )}
            
            {/* Social Links */}
            {(profile.website_url || profile.twitter_url || profile.linkedin_url) && (
              <div className="border-t border-surface-border pt-6">
                <h2 className="text-lg font-semibold mb-3 text-primary">Connect</h2>
                <div className="flex gap-4">
                  {profile.website_url && (
                    <a 
                      href={profile.website_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-secondary hover:text-brand-primary transition-colors"
                    >
                      <LinkIcon className="w-4 h-4" />
                      <span>Website</span>
                    </a>
                  )}
                  {profile.twitter_url && (
                    <a 
                      href={profile.twitter_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-secondary hover:text-brand-primary transition-colors"
                    >
                      <Twitter className="w-4 h-4" />
                      <span>Twitter</span>
                    </a>
                  )}
                  {profile.linkedin_url && (
                    <a 
                      href={profile.linkedin_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-secondary hover:text-brand-primary transition-colors"
                    >
                      <Linkedin className="w-4 h-4" />
                      <span>LinkedIn</span>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="mt-6 flex flex-wrap gap-4">
            <Link 
              href="/profile/edit" 
              className="inline-flex items-center gap-2 btn-primary"
            >
              <Edit className="w-4 h-4" />
              Edit Profile
            </Link>
            <Link 
              href="/dashboard" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-surface-secondary hover:bg-surface-hover rounded-lg transition-colors text-primary font-medium"
            >
              <LayoutDashboard className="w-4 h-4" />
              View Dashboard
            </Link>
            {profile.user_role === 'contributor' && (
              <Link 
                href={`/contributors/${profile.id}`} 
                className="inline-flex items-center gap-2 px-6 py-3 bg-surface-secondary hover:bg-surface-hover rounded-lg transition-colors text-primary font-medium"
              >
                <Eye className="w-4 h-4" />
                View Public Profile
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}