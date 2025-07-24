'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import ClientOnly from '@/components/ClientOnly'
import ParticleSystem from '@/components/brand/ParticleSystem'
import { Eye, EyeOff, Sparkles, Zap } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const { login } = useAuth()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await login(email, password)
    } catch (error: any) {
      setError(error.message)
      setLoading(false)
    }
  }

  return (
    <ClientOnly>
      <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-primary">
        <ParticleSystem />

        <div className="w-full max-w-md relative z-10">
          <div className="glass-card hover:border-brand-primary/30 transition-all duration-500">
            {/* Animated Logo */}
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
              <h1 className="font-orbitron text-3xl font-bold mb-2 gradient-text">Welcome Back</h1>
              <p className="text-secondary">Ready to continue your reboot?</p>
            </div>

            {/* Form - REST OF YOUR FORM CODE STAYS THE SAME */}
            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm backdrop-blur animate-pulse">
                  {error}
                </div>
              )}
              
              <div className="group">
                <label className="block text-sm font-semibold mb-2 text-secondary group-hover:text-brand-primary transition-colors">
                  Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    className="w-full p-3 bg-secondary/50 border surface-border rounded-lg focus:border-brand-primary focus:outline-none transition-all duration-300 hover:border-brand-primary/30 text-primary placeholder-muted"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    disabled={loading}
                  />
                  <Sparkles className="absolute right-3 top-3.5 w-5 h-5 text-brand-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
              
              <div className="group">
                <label className="block text-sm font-semibold mb-2 text-secondary group-hover:text-brand-primary transition-colors">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    className="w-full p-3 bg-secondary/50 border surface-border rounded-lg focus:border-brand-primary focus:outline-none transition-all duration-300 hover:border-brand-primary/30 pr-12 text-primary placeholder-muted"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-secondary hover:text-brand-primary transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Logging In...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Log In
                    <Zap className="w-4 h-4" />
                  </span>
                )}
              </button>

              {loading && (
                <div className="text-center animate-fade-in">
                  <p className="text-sm text-secondary mb-2">Taking longer than expected?</p>
                  <Link 
                    href="/dashboard" 
                    className="text-brand-primary hover:text-brand-secondary underline text-sm transition-colors"
                  >
                    Click here to go to dashboard
                  </Link>
                </div>
              )}
            </form>

            {/* Links */}
            <div className="mt-6 text-center text-sm">
              <p className="text-secondary">
                Don't have an account?{' '}
                <Link href="/auth/signup" className="text-brand-primary hover:text-brand-secondary font-semibold transition-colors">
                  Sign Up
                </Link>
              </p>
              <div className="mt-4">
                <Link href="/forgot-password" className="text-secondary hover:text-brand-primary text-sm transition-colors">
                  Forgot your password?
                </Link>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="mt-8 pt-6 border-t surface-border">
              <div className="flex items-center justify-center gap-6 text-xs text-secondary">
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  Secure Login
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-brand-primary rounded-full animate-pulse"></div>
                  SSL Protected
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-brand-tertiary rounded-full animate-pulse"></div>
                  2FA Available
                </span>
              </div>
            </div>
          </div>

          {/* Bottom decoration */}
          <div className="text-center mt-8 text-xs text-secondary">
            <p>A community where marketing evolves daily</p>
          </div>
        </div>
      </div>
    </ClientOnly>
  )
}