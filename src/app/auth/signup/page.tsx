'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import ClientOnly from '@/components/ClientOnly'
import ParticleSystem from '@/components/brand/ParticleSystem'
import { Eye, EyeOff, Sparkles, Zap, CheckCircle, AlertCircle, User, Mail, Lock, AtSign, TrendingUp, ArrowRight, Gift } from 'lucide-react'

interface InviteDetails {
  id: string
  email: string
  invite_code: string
  expires_at: string
  metadata?: {
    full_name?: string
    message?: string
  }
}

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  
  // Invite-specific state
  const searchParams = useSearchParams()
  const inviteCode = searchParams.get('invite')
  const [inviteDetails, setInviteDetails] = useState<InviteDetails | null>(null)
  const [checkingInvite, setCheckingInvite] = useState(false)
  
  const router = useRouter()
  const { signup } = useAuth()
  const supabase = createClientComponentClient()

  // Check invite code on mount
  useEffect(() => {
    const checkInvite = async () => {
      if (!inviteCode) return

      setCheckingInvite(true)
      try {
        const { data, error } = await supabase
          .from('contributor_invitations')
          .select('*')
          .eq('invite_code', inviteCode)
          .single()

        if (error || !data) {
          setError('Invalid or expired invitation code')
          return
        }

        // Check if expired
        if (new Date(data.expires_at) < new Date()) {
          setError('This invitation has expired')
          return
        }

        // Check if already used
        if (data.used_at) {
          setError('This invitation has already been used')
          return
        }

        setInviteDetails(data)
        setEmail(data.email)
        if (data.metadata?.full_name) {
          setFullName(data.metadata.full_name)
        }
      } catch (err) {
        setError('Error checking invitation')
      } finally {
        setCheckingInvite(false)
      }
    }

    checkInvite()
  }, [inviteCode, supabase])

  // Password strength indicator
  const getPasswordStrength = () => {
    if (!password) return { strength: 0, label: '', color: '' }
    let strength = 0
    if (password.length >= 8) strength++
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++
    if (password.match(/[0-9]/)) strength++
    if (password.match(/[^a-zA-Z0-9]/)) strength++
    
    const strengthLevels = [
      { strength: 0, label: '', color: '' },
      { strength: 1, label: 'Weak', color: 'bg-red-500' },
      { strength: 2, label: 'Fair', color: 'bg-yellow-500' },
      { strength: 3, label: 'Good', color: 'bg-brand-primary' },
      { strength: 4, label: 'Strong', color: 'bg-brand-tertiary' }
    ]
    
    return strengthLevels[strength]
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Create the user account
      await signup(email, password, fullName, username)
      
      // If this is a contributor invite, handle the additional steps
      if (inviteDetails) {
        // Get the newly created user
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          // Update profile to be a contributor
          await supabase
            .from('profiles')
            .update({
              user_role: 'contributor',
              is_verified: true,
              verified_date: new Date().toISOString()
            })
            .eq('id', user.id)

          // Mark invitation as used
          await supabase
            .from('contributor_invitations')
            .update({
              used_at: new Date().toISOString(),
              used_by: user.id
            })
            .eq('id', inviteDetails.id)
        }
      }
      
      setSuccess(true)
      // Redirect based on user type
      setTimeout(() => {
        if (inviteDetails) {
          window.location.href = '/profile/edit?welcome=contributor'
        } else {
          window.location.href = '/dashboard'
        }
      }, 2000)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (checkingInvite) {
    return (
      <ClientOnly>
        <div className="min-h-screen flex items-center justify-center px-4 bg-primary">
          <ParticleSystem />
          <div className="w-full max-w-md relative z-10">
            <div className="glass-card text-center">
              <div className="animate-spin w-12 h-12 border-3 border-brand-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-secondary">Verifying invitation...</p>
            </div>
          </div>
        </div>
      </ClientOnly>
    )
  }

  if (success) {
    return (
      <ClientOnly>
        <div className="min-h-screen flex items-center justify-center px-4 bg-primary">
          <ParticleSystem />
          <div className="w-full max-w-md relative z-10">
            <div className="glass-card text-center animate-pulse">
              <div className="mb-4">
                <CheckCircle className="w-16 h-16 text-brand-tertiary mx-auto animate-bounce" />
              </div>
              <h1 className="font-orbitron text-3xl font-bold mb-4 gradient-text">
                {inviteDetails ? 'Welcome, Contributor!' : 'Welcome to the Reboot!'}
              </h1>
              <p className="text-secondary mb-6">
                {inviteDetails 
                  ? 'Your contributor account has been created. Redirecting to profile setup...'
                  : 'Your account has been created. Redirecting to dashboard...'}
              </p>
              <div className="flex justify-center">
                <div className="w-8 h-8 border-2 border-brand-tertiary border-t-transparent rounded-full animate-spin"></div>
              </div>
            </div>
          </div>
        </div>
      </ClientOnly>
    )
  }

  return (
    <ClientOnly>
      <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden bg-primary">
        <ParticleSystem />

        <div className="w-full max-w-md relative z-10">
          <div className="glass-card hover:border-brand-tertiary/30 transition-all duration-500">
            {/* Logo */}
            <div className="text-center mb-8">
              <div className="mb-4 flex justify-center">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-pulse">
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="url(#lightning-gradient)" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <defs>
                        <linearGradient id="lightning-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#3B82F6" />
                          <stop offset="100%" stopColor="#10B981" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-medium tracking-wide text-[var(--text-secondary)]">THE</span>
                    <span className="text-xl font-bold tracking-tight gradient-text">MARKETING REBOOT</span>
                  </div>
                </div>
              </div>
              <h1 className="font-orbitron text-3xl font-bold mb-2 gradient-text">
                {inviteDetails ? 'Create Contributor Account' : 'Join the Revolution'}
              </h1>
              <p className="text-secondary">
                {inviteDetails 
                  ? 'You\'ve been invited as a verified contributor'
                  : 'Ready to reboot your marketing career?'}
              </p>
            </div>

            {/* Invite Details */}
            {inviteDetails && (
              <div className="mb-6 p-4 bg-gradient-to-r from-brand-primary/10 to-brand-tertiary/10 rounded-lg border border-brand-primary/20">
                <div className="flex items-center gap-3 mb-2">
                  <Gift className="w-5 h-5 text-brand-primary" />
                  <h3 className="font-semibold text-primary">Exclusive Invitation</h3>
                </div>
                <p className="text-sm text-secondary mb-2">
                  Invite Code: <span className="font-mono text-brand-primary">{inviteCode}</span>
                </p>
                {inviteDetails.metadata?.message && (
                  <p className="text-sm text-secondary italic">
                    "{inviteDetails.metadata.message}"
                  </p>
                )}
              </div>
            )}

            {/* Contributor CTA - Only show for non-invited users */}
            {!inviteDetails && (
              <div className="mb-6 p-4 bg-brand-tertiary/5 rounded-lg border border-brand-tertiary/20">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-brand-tertiary" />
                    <div>
                      <h3 className="font-semibold text-primary text-sm">Share Your Marketing Expertise</h3>
                      <p className="text-xs text-secondary">Apply to become a verified contributor</p>
                    </div>
                  </div>
                  <Link 
                    href="/contributor-interest" 
                    className="inline-flex items-center gap-2 px-4 py-2 bg-brand-tertiary/10 text-brand-tertiary rounded-lg hover:bg-brand-tertiary/20 transition-all duration-300 text-sm whitespace-nowrap"
                  >
                    Apply Now
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSignup} className="space-y-6">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm backdrop-blur animate-pulse flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div className="group">
                  <label className="block text-sm font-semibold mb-2 text-secondary group-hover:text-brand-tertiary transition-colors">
                    Full Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      className="w-full p-3 pl-10 bg-secondary/50 border surface-border rounded-lg focus:border-brand-primary focus:outline-none transition-all duration-300 hover:border-brand-primary/30 text-primary placeholder-muted"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Sarah Zhang"
                      disabled={loading}
                    />
                    <User className="absolute left-3 top-3.5 w-4 h-4 text-secondary" />
                  </div>
                </div>
                <div className="group">
                  <label className="block text-sm font-semibold mb-2 text-secondary group-hover:text-brand-tertiary transition-colors">
                    Username
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      className="w-full p-3 pl-10 bg-secondary/50 border surface-border rounded-lg focus:border-brand-primary focus:outline-none transition-all duration-300 hover:border-brand-primary/30 text-primary placeholder-muted"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                      placeholder="sarah-zhang"
                      disabled={loading}
                    />
                    <AtSign className="absolute left-3 top-3.5 w-4 h-4 text-secondary" />
                  </div>
                </div>
              </div>
              
              <div className="group">
                <label className="block text-sm font-semibold mb-2 text-secondary group-hover:text-brand-tertiary transition-colors">
                  Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    className="w-full p-3 pl-10 bg-secondary/50 border surface-border rounded-lg focus:border-brand-primary focus:outline-none transition-all duration-300 hover:border-brand-primary/30 text-primary placeholder-muted disabled:opacity-60"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    disabled={loading || !!inviteDetails}
                  />
                  <Mail className="absolute left-3 top-3.5 w-4 h-4 text-secondary" />
                  {inviteDetails && (
                    <Lock className="absolute right-3 top-3.5 w-4 h-4 text-brand-primary" />
                  )}
                </div>
              </div>
              
              <div className="group">
                <label className="block text-sm font-semibold mb-2 text-secondary group-hover:text-brand-tertiary transition-colors">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    className="w-full p-3 pl-10 pr-12 bg-secondary/50 border surface-border rounded-lg focus:border-brand-primary focus:outline-none transition-all duration-300 hover:border-brand-primary/30 text-primary placeholder-muted"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={loading}
                  />
                  <Lock className="absolute left-3 top-3.5 w-4 h-4 text-secondary" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-secondary hover:text-brand-tertiary transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                
                {/* Password Strength Indicator */}
                {password && (
                  <div className="mt-2 space-y-1">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                            level <= getPasswordStrength().strength
                              ? getPasswordStrength().color
                              : 'bg-secondary'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-secondary">
                      Password strength: <span className="font-semibold text-brand-primary">
                        {getPasswordStrength().label}
                      </span>
                    </p>
                  </div>
                )}
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating Account...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    {inviteDetails ? 'Create Contributor Account' : 'Start My Reboot'}
                    <Zap className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </button>
            </form>

            {/* Links */}
            <div className="mt-6 text-center text-sm">
              <p className="text-secondary">
                Already have an account?{' '}
                <Link href="/auth/login" className="text-brand-primary hover:text-brand-secondary font-semibold transition-colors">
                  Log In
                </Link>
              </p>
            </div>

            {/* Benefits */}
            <div className="mt-8 pt-6 border-t surface-border">
              <p className="text-xs text-secondary text-center mb-4">
                {inviteDetails ? 'As a contributor, you get:' : 'Join the community and get:'}
              </p>
              <div className="grid grid-cols-3 gap-4 text-xs text-secondary">
                {inviteDetails ? (
                  <>
                    <div className="text-center">
                      <div className="w-8 h-8 mx-auto mb-1 rounded-full bg-brand-primary/20 flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-brand-primary" />
                      </div>
                      <span>Verified Badge</span>
                    </div>
                    <div className="text-center">
                      <div className="w-8 h-8 mx-auto mb-1 rounded-full bg-brand-tertiary/20 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-brand-tertiary" />
                      </div>
                      <span>Publishing Access</span>
                    </div>
                    <div className="text-center">
                      <div className="w-8 h-8 mx-auto mb-1 rounded-full bg-brand-secondary/20 flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 text-brand-secondary" />
                      </div>
                      <span>Analytics</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-center">
                      <div className="w-8 h-8 mx-auto mb-1 rounded-full bg-brand-tertiary/20 flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 text-brand-tertiary" />
                      </div>
                      <span>Growth Strategies</span>
                    </div>
                    <div className="text-center">
                      <div className="w-8 h-8 mx-auto mb-1 rounded-full bg-brand-primary/20 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-brand-primary" />
                      </div>
                      <span>Expert Network</span>
                    </div>
                    <div className="text-center">
                      <div className="w-8 h-8 mx-auto mb-1 rounded-full bg-brand-secondary/20 flex items-center justify-center">
                        <Zap className="w-4 h-4 text-brand-secondary" />
                      </div>
                      <span>Weekly Insights</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ClientOnly>
  )
}