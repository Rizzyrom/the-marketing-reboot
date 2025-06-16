'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/supabase'
import { Save } from 'lucide-react'

export default function CMSSettings() {
  const [profile, setProfile] = useState<{
    full_name: string
    bio: string
    website: string
    twitter: string
    linkedin: string
  }>({
    full_name: '',
    bio: '',
    website: '',
    twitter: '',
    linkedin: '',
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    async function fetchProfile() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) throw new Error('Not authenticated')

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (error) throw error

        setProfile({
          full_name: data.full_name || '',
          bio: data.bio || '',
          website: data.website || '',
          twitter: data.twitter || '',
          linkedin: data.linkedin || '',
        })
      } catch (error) {
        console.error('Error fetching profile:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          bio: profile.bio,
          website: profile.website,
          twitter: profile.twitter,
          linkedin: profile.linkedin,
          updated_at: new Date().toISOString(),
        })
        .eq('id', session.user.id)

      if (error) throw error

      alert('Profile updated successfully!')
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Failed to update profile. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="glass-card p-8 text-center">
        Loading profile...
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <h1 className="gradient-text text-3xl font-bold">
        Profile Settings
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="full_name" className="block text-sm font-medium mb-2">
            Full Name
          </label>
          <input
            type="text"
            id="full_name"
            required
            value={profile.full_name}
            onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
            className="w-full px-4 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
            placeholder="Enter your full name..."
          />
        </div>

        <div>
          <label htmlFor="bio" className="block text-sm font-medium mb-2">
            Bio
          </label>
          <textarea
            id="bio"
            value={profile.bio}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            className="w-full px-4 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] min-h-[100px]"
            placeholder="Tell us about yourself..."
          />
        </div>

        <div>
          <label htmlFor="website" className="block text-sm font-medium mb-2">
            Website
          </label>
          <input
            type="url"
            id="website"
            value={profile.website}
            onChange={(e) => setProfile({ ...profile, website: e.target.value })}
            className="w-full px-4 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
            placeholder="https://your-website.com"
          />
        </div>

        <div>
          <label htmlFor="twitter" className="block text-sm font-medium mb-2">
            Twitter
          </label>
          <input
            type="text"
            id="twitter"
            value={profile.twitter}
            onChange={(e) => setProfile({ ...profile, twitter: e.target.value })}
            className="w-full px-4 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
            placeholder="@username"
          />
        </div>

        <div>
          <label htmlFor="linkedin" className="block text-sm font-medium mb-2">
            LinkedIn
          </label>
          <input
            type="url"
            id="linkedin"
            value={profile.linkedin}
            onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })}
            className="w-full px-4 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
            placeholder="https://linkedin.com/in/username"
          />
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