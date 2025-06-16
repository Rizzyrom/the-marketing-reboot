'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { safeLogin } from '@/utils/auth-helpers'
import ClientOnly from '@/components/ClientOnly'
import ParticleSystem from '@/components/brand/ParticleSystem'
import Logo from '@/components/brand/Logo'
import { Eye, EyeOff, Sparkles, Zap } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error } = await safeLogin(email, password)
    
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    if (data) {
      // Use window.location for more reliable redirect
      window.location.href = '/dashboard'
    }
  }

  return (
    <ClientOnly>
      <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-primary">
        <ParticleSystem />

        <div className="w-full max-w-md relative z-10">
          <div className="glass-card hover:border-brand-primary/30 transition-all duration-500">
            {/* Logo */}
            <div className="text-center mb-8">
              <div className="mb-4">
                <Logo size="medium" showText={true} animated={true} className="justify-center" />
              </div>
              <h1 className="font-orbitron text-3xl font-bold mb-2 gradient-text">Welcome Back</h1>
              <p className="text-secondary">Ready to continue your reboot?</p>
            </div>

            {/* Form */}
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
                    Signing In...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Sign In
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
                  Join the reboot
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