'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { safeSignup } from '@/utils/auth-helpers'
import ClientOnly from '@/components/ClientOnly'
import ParticleSystem from '@/components/brand/ParticleSystem'
import Logo from '@/components/brand/Logo'
import { Eye, EyeOff, Sparkles, Zap, CheckCircle, AlertCircle, User, Mail, Lock, AtSign, TrendingUp } from 'lucide-react'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

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

    const { data, error } = await safeSignup(email, password, fullName, username)
    
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    if (data) {
      setSuccess(true)
      // Redirect to dashboard after short delay
      setTimeout(() => {
        window.location.href = '/dashboard'
      }, 2000)
    }
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
              <h1 className="font-orbitron text-3xl font-bold mb-4 gradient-text">Welcome to the Reboot!</h1>
              <p className="text-secondary mb-6">
                Your account has been created. Redirecting to dashboard...
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
              <div className="mb-4">
                <Logo size="medium" showText={true} animated={true} className="justify-center" />
              </div>
              <h1 className="font-orbitron text-3xl font-bold mb-2 gradient-text">Join the Revolution</h1>
              <p className="text-secondary">Ready to reboot your marketing career?</p>
            </div>

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
                    className="w-full p-3 pl-10 bg-secondary/50 border surface-border rounded-lg focus:border-brand-primary focus:outline-none transition-all duration-300 hover:border-brand-primary/30 text-primary placeholder-muted"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    disabled={loading}
                  />
                  <Mail className="absolute left-3 top-3.5 w-4 h-4 text-secondary" />
                  <Sparkles className="absolute right-3 top-3.5 w-5 h-5 text-brand-primary opacity-0 group-hover:opacity-100 transition-opacity" />
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
                    Start My Reboot
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
                  Sign in
                </Link>
              </p>
            </div>

            {/* Benefits */}
            <div className="mt-8 pt-6 border-t surface-border">
              <p className="text-xs text-secondary text-center mb-4">Join the community and get:</p>
              <div className="grid grid-cols-3 gap-4 text-xs text-secondary">
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </ClientOnly>
  )
}