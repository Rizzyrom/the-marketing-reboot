'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import type { Profile } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  profile: Profile | null
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, fullName: string, username: string, isContributor?: boolean) => Promise<void>
  logout: () => void
  loading: boolean
  refreshProfile: () => Promise<void>
  isContributor: boolean
  isReader: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  // Helper functions to check user role
  const isContributor = profile?.user_role === 'contributor'
  const isReader = profile?.user_role === 'reader'

  // Fetch user profile from database
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        
        // If profile doesn't exist, create one
        if (error.code === 'PGRST116') {
          const { data: userData } = await supabase.auth.getUser()
          if (userData.user) {
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert({
                id: userData.user.id,
                full_name: userData.user.user_metadata.full_name || '',
                username: userData.user.user_metadata.username || '',
                email_contact: userData.user.email,
                user_role: 'reader' // Default to reader
              })
              .select()
              .single()
            
            if (!createError && newProfile) {
              setProfile(newProfile)
              return
            }
          }
        }
        setProfile(null)
      } else {
        setProfile(data)
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error)
      setProfile(null)
    }
  }

  useEffect(() => {
    setMounted(true)
    
    // Check active session
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          setUser(session.user)
          await fetchProfile(session.user.id)
        } else {
          setUser(null)
          setProfile(null)
        }
      } catch (error) {
        console.error('Auth init error:', error)
      } finally {
        setLoading(false)
      }
    }

    initAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email)
      
      if (session?.user) {
        setUser(session.user)
        await fetchProfile(session.user.id)
      } else {
        setUser(null)
        setProfile(null)
      }
      
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      setLoading(true)
      console.log('AuthContext: Starting login...')
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        console.error('Supabase login error:', error)
        throw error
      }
      
      console.log('Login successful:', data.user?.email)
      
      // Fetch profile after successful login
      if (data.user) {
        console.log('Fetching profile for user:', data.user.id)
        await fetchProfile(data.user.id)
      }
      
      // Use window.location for redirect to avoid hydration issues
      console.log('Redirecting to dashboard...')
      if (mounted) {
        window.location.href = '/dashboard'
      }
      
    } catch (error: any) {
      console.error('Login error details:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signup = async (email: string, password: string, fullName: string, username: string, isContributor: boolean = false) => {
    try {
      setLoading(true)
      
      // First check if username is already taken
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .maybeSingle()

      if (existingProfile) {
        throw new Error('Username already taken')
      }

      // Sign up the user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            username: username,
            user_role: isContributor ? 'contributor' : 'reader'
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })
      
      if (error) throw error

      console.log('Signup response:', data)

      // Check if email confirmation is required
      if (data.user && !data.session) {
        alert('Please check your email to confirm your account!')
      } else if (data.session) {
        // If auto-confirmed (like in development), create profile and redirect
        if (data.user) {
          // Create profile record with role
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              full_name: fullName,
              username: username,
              email_contact: email,
              user_role: isContributor ? 'contributor' : 'reader',
              profile_public: isContributor, // Contributors have public profiles by default
              contributor_status: isContributor ? 'pending' : null,
              contributor_tier: isContributor ? 'standard' : null
            })
          
          if (profileError) {
            console.error('Profile creation error:', profileError)
          }
          
          await fetchProfile(data.user.id)
        }
        
        setTimeout(() => {
          if (mounted) {
            window.location.href = '/dashboard'
          }
        }, 100)
      }
    } catch (error: any) {
      console.error('Signup error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      setLoading(true)
      await supabase.auth.signOut()
      setUser(null)
      setProfile(null)
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id)
    }
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      login, 
      signup, 
      logout, 
      loading,
      refreshProfile,
      isContributor,
      isReader
    }}>
      {mounted ? children : null}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}