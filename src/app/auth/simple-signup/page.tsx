'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import ParticleSystem from '@/components/brand/ParticleSystem'
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

export default function SimpleSignup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('')
  const router = useRouter()
  
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setMessageType('')
    
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: 'Test User',
            username: email.split('@')[0]
          }
        }
      })
      
      if (authError) throw authError
      
      // Create profile directly
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            username: email.split('@')[0],
            full_name: 'Test User',
            email_contact: email,
            contributor_tier: 'founder',
            contributor_status: 'approved',
            profile_public: true,
            show_social_feeds: true,
            email_notifications: true
          })
        
        if (profileError) console.error('Profile error:', profileError)
      }
      
      setMessage('Account created successfully! Redirecting to profile setup...')
      setMessageType('success')
      setTimeout(() => router.push('/profile/edit'), 2000)
    } catch (error: any) {
      setMessage(error.message || 'An error occurred during signup')
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-primary flex items-center justify-center transition-colors duration-500">
      <ParticleSystem />
      
      <div className="w-full max-w-md mx-4 relative z-10">
        <div className="glass-card p-8">
          <div className="text-center mb-8">
            <h1 className="font-orbitron text-2xl font-bold mb-2 text-primary">
              Dev Mode Signup
            </h1>
            <p className="text-secondary">
              Quick account creation for testing
            </p>
          </div>
          
          <form onSubmit={handleSignup} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 bg-secondary border surface-border rounded-lg text-primary focus:border-brand-primary focus:outline-none transition-colors placeholder-muted"
                placeholder="your@email.com"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 bg-secondary border surface-border rounded-lg text-primary focus:border-brand-primary focus:outline-none transition-colors placeholder-muted"
                placeholder="Choose a secure password"
                required
                minLength={6}
              />
              <p className="text-xs text-muted mt-1">
                Minimum 6 characters
              </p>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Create Test Account'
              )}
            </button>
          </form>
          
          {message && (
            <div className={`mt-6 p-4 rounded-lg flex items-center gap-2 ${
              messageType === 'success' 
                ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}>
              {messageType === 'success' ? (
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
              )}
              <span className="text-sm">{message}</span>
            </div>
          )}
          
          <div className="mt-6 text-center">
            <p className="text-xs text-muted">
              For development and testing purposes only
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}