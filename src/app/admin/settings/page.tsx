'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useRole } from '@/contexts/RoleContext'
import { useAuth } from '@/contexts/AuthContext'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import ExclusiveHeader from '@/components/ExclusiveHeader'
import ParticleSystem from '@/components/ParticleSystem'
import { ArrowLeft, Save, Mail, Globe, Shield, Bell, Database, Zap } from 'lucide-react'
import Link from 'next/link'

interface Settings {
  site_name: string
  site_description: string
  site_url: string
  contact_email: string
  auto_approve_contributors: boolean
  require_post_approval: boolean
  enable_email_notifications: boolean
  maintenance_mode: boolean
  invite_expiry_days: number
  max_posts_per_day: number
}

export default function AdminSettingsPage() {
  const router = useRouter()
  const { isAdmin, isLoading: roleLoading } = useRole()
  const { user } = useAuth()
  const supabase = createClientComponentClient()
  
  const [settings, setSettings] = useState<Settings>({
    site_name: 'The Marketing Reboot',
    site_description: 'Where Marketing Leaders Shape the Future',
    site_url: 'https://marketingreboot.com',
    contact_email: 'contact@marketingreboot.com',
    auto_approve_contributors: false,
    require_post_approval: true,
    enable_email_notifications: true,
    maintenance_mode: false,
    invite_expiry_days: 7,
    max_posts_per_day: 10
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      router.push('/')
    }
  }, [isAdmin, roleLoading, router])

  useEffect(() => {
    const fetchSettings = async () => {
      if (!isAdmin || !user) return
      
      try {
        setIsLoading(true)
        
        // In a real app, you'd fetch from a settings table
        // For now, using default values
        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching settings:', error)
        setIsLoading(false)
      }
    }

    fetchSettings()
  }, [isAdmin, user, supabase])

  const handleSave = async () => {
    try {
      setIsSaving(true)
      
      // In a real app, you'd save to a settings table
      // For demonstration, just showing success
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      alert('Settings saved successfully!')
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  if (roleLoading || isLoading) {
    return (
      <div className="min-h-screen bg-primary">
        <ExclusiveHeader />
        <ParticleSystem />
        <div className="container mx-auto px-4 py-24">
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

  if (!isAdmin) return null

  return (
    <div className="min-h-screen bg-primary">
      <ExclusiveHeader />
      <ParticleSystem />
      
      <div className="container mx-auto px-4 py-24">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/admin"
            className="inline-flex items-center gap-2 text-secondary hover:text-primary mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Admin Dashboard
          </Link>
          
          <h1 className="text-4xl font-bold gradient-text mb-2">System Settings</h1>
          <p className="text-secondary">Configure your platform settings and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* General Settings */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <Globe className="w-6 h-6 text-brand-primary" />
              <h2 className="text-xl font-semibold text-primary">General Settings</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-secondary">
                  Site Name
                </label>
                <input
                  type="text"
                  value={settings.site_name}
                  onChange={(e) => setSettings(prev => ({ ...prev, site_name: e.target.value }))}
                  className="w-full px-4 py-2 bg-surface-secondary border border-surface-border rounded-lg focus:outline-none focus:border-brand-primary text-primary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-secondary">
                  Site Description
                </label>
                <textarea
                  value={settings.site_description}
                  onChange={(e) => setSettings(prev => ({ ...prev, site_description: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-2 bg-surface-secondary border border-surface-border rounded-lg focus:outline-none focus:border-brand-primary text-primary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-secondary">
                  Site URL
                </label>
                <input
                  type="url"
                  value={settings.site_url}
                  onChange={(e) => setSettings(prev => ({ ...prev, site_url: e.target.value }))}
                  className="w-full px-4 py-2 bg-surface-secondary border border-surface-border rounded-lg focus:outline-none focus:border-brand-primary text-primary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-secondary">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={settings.contact_email}
                  onChange={(e) => setSettings(prev => ({ ...prev, contact_email: e.target.value }))}
                  className="w-full px-4 py-2 bg-surface-secondary border border-surface-border rounded-lg focus:outline-none focus:border-brand-primary text-primary"
                />
              </div>
            </div>
          </div>

          {/* Security & Permissions */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-6 h-6 text-brand-primary" />
              <h2 className="text-xl font-semibold text-primary">Security & Permissions</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium text-primary">Auto-approve Contributors</label>
                  <p className="text-sm text-secondary">Automatically approve contributor applications</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.auto_approve_contributors}
                    onChange={(e) => setSettings(prev => ({ ...prev, auto_approve_contributors: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-surface-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium text-primary">Require Post Approval</label>
                  <p className="text-sm text-secondary">Posts need admin approval before publishing</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.require_post_approval}
                    onChange={(e) => setSettings(prev => ({ ...prev, require_post_approval: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-surface-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
                </label>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-secondary">
                  Invite Expiry (days)
                </label>
                <input
                  type="number"
                  value={settings.invite_expiry_days}
                  onChange={(e) => setSettings(prev => ({ ...prev, invite_expiry_days: parseInt(e.target.value) || 7 }))}
                  min="1"
                  max="30"
                  className="w-full px-4 py-2 bg-surface-secondary border border-surface-border rounded-lg focus:outline-none focus:border-brand-primary text-primary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-secondary">
                  Max Posts Per Day (per user)
                </label>
                <input
                  type="number"
                  value={settings.max_posts_per_day}
                  onChange={(e) => setSettings(prev => ({ ...prev, max_posts_per_day: parseInt(e.target.value) || 10 }))}
                  min="1"
                  max="50"
                  className="w-full px-4 py-2 bg-surface-secondary border border-surface-border rounded-lg focus:outline-none focus:border-brand-primary text-primary"
                />
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <Bell className="w-6 h-6 text-brand-primary" />
              <h2 className="text-xl font-semibold text-primary">Notifications</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium text-primary">Email Notifications</label>
                  <p className="text-sm text-secondary">Send email notifications for important events</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.enable_email_notifications}
                    onChange={(e) => setSettings(prev => ({ ...prev, enable_email_notifications: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-surface-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
                </label>
              </div>
              
              <div className="p-4 bg-surface-secondary rounded-lg">
                <p className="text-sm text-secondary">
                  <strong>Email Provider Status:</strong> {settings.enable_email_notifications ? 'Active' : 'Inactive'}
                </p>
                <p className="text-xs text-secondary mt-2">
                  Configure email settings in your Supabase dashboard
                </p>
              </div>
            </div>
          </div>

          {/* Maintenance */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <Database className="w-6 h-6 text-brand-primary" />
              <h2 className="text-xl font-semibold text-primary">Maintenance</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium text-primary">Maintenance Mode</label>
                  <p className="text-sm text-secondary">Temporarily disable the site for maintenance</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.maintenance_mode}
                    onChange={(e) => setSettings(prev => ({ ...prev, maintenance_mode: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-surface-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                </label>
              </div>
              
              {settings.maintenance_mode && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-sm text-red-500">
                    ⚠️ Maintenance mode is active. Only admins can access the site.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="btn-primary flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Zap className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Settings
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}