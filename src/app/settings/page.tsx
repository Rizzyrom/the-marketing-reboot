'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useRole } from '@/contexts/RoleContext'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/supabase'
import ExclusiveHeader from '@/components/ExclusiveHeader'
import ParticleSystem from '@/components/ParticleSystem'

interface Settings {
  email_notifications: boolean
  dark_mode: boolean
  language: string
}

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth()
  const { role } = useRole()
  const router = useRouter()
  const supabase = createClientComponentClient<Database>()
  
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [profile, setProfile] = useState<{
    full_name: string
    username: string
    bio: string
    avatar_url: string
  } | null>(null)
  const [settings, setSettings] = useState<Settings>({
    email_notifications: true,
    dark_mode: false,
    language: 'en'
  })
  const [isSaving, setIsSaving] = useState(false)

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [authLoading, user, router])

  // Load profile data
  useEffect(() => {
    if (user) {
      loadProfile()
    }
  }, [user])

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, username, bio, avatar_url')
        .eq('id', user?.id)
        .single()

      if (error) throw error

      setProfile(data)
    } catch (error) {
      console.error('Error loading profile:', error)
      setMessage({ type: 'error', text: 'Failed to load profile data' })
    }
  }

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile?.full_name,
          username: profile?.username,
          bio: profile?.bio,
          avatar_url: profile?.avatar_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', user?.id)

      if (error) throw error

      setMessage({ type: 'success', text: 'Profile updated successfully' })
    } catch (error) {
      console.error('Error updating profile:', error)
      setMessage({ type: 'error', text: 'Failed to update profile' })
    }
  }

  const handleSaveSettings = async () => {
    try {
      setIsSaving(true)
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError) throw authError
      if (!user) return

      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          ...settings
        })

      if (error) throw error
    } catch (error) {
      console.error('Error saving settings:', error)
    } finally {
      setIsSaving(false)
    }
  }

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-secondary">Loading settings...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-primary">
      <ExclusiveHeader />
      <ParticleSystem />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>
        
        <div className="glass-card p-6">
          <form onSubmit={updateProfile} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={profile?.full_name || ''}
                onChange={(e) => setProfile(prev => ({ ...prev!, full_name: e.target.value }))}
                className="w-full px-4 py-2 rounded-lg bg-secondary/10 border surface-border focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Username
              </label>
              <input
                type="text"
                value={profile?.username || ''}
                onChange={(e) => setProfile(prev => ({ ...prev!, username: e.target.value }))}
                className="w-full px-4 py-2 rounded-lg bg-secondary/10 border surface-border focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>

            {role === 'contributor' && (
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Bio
                </label>
                <textarea
                  value={profile?.bio || ''}
                  onChange={(e) => setProfile(prev => ({ ...prev!, bio: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg bg-secondary/10 border surface-border focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Avatar URL
              </label>
              <input
                type="url"
                value={profile?.avatar_url || ''}
                onChange={(e) => setProfile(prev => ({ ...prev!, avatar_url: e.target.value }))}
                className="w-full px-4 py-2 rounded-lg bg-secondary/10 border surface-border focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>

            {message && (
              <div className={`p-4 rounded-lg ${
                message.type === 'success' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
              }`}>
                {message.text}
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold mb-1">Email Notifications</h2>
                <p className="text-gray-400">Receive email updates about your account</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.email_notifications}
                  onChange={(e) => setSettings({
                    ...settings,
                    email_notifications: e.target.checked
                  })}
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold mb-1">Dark Mode</h2>
                <p className="text-gray-400">Switch between light and dark theme</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.dark_mode}
                  onChange={(e) => setSettings({
                    ...settings,
                    dark_mode: e.target.checked
                  })}
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-2">Language</h2>
              <select
                value={settings.language}
                onChange={(e) => setSettings({
                  ...settings,
                  language: e.target.value
                })}
                className="w-full px-4 py-2 rounded-lg bg-secondary/10 border surface-border focus:outline-none focus:ring-2 focus:ring-brand-primary"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={handleSaveSettings}
                disabled={isSaving}
                className="btn-primary"
              >
                {isSaving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
} 