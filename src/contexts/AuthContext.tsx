'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
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
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const router = useRouter()

  // Helper functions to check user role - FIXED TO INCLUDE ADMIN
  const isContributor = profile?.user_role === 'contributor' || profile?.is_admin === true || user?.email === 'romomahmoud@gmail.com'
  const isReader = profile?.user_role === 'reader' && !profile?.is_admin

  // Fetch user profile from database
  const fetchProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        
        // If profile doesn't exist, create one
        if (error.code === 'PGRST116') {
          console.log('Profile not found, creating new profile');
          const { data: userData } = await supabase.auth.getUser();
          
          if (userData?.user) {
            // FIXED: Auto-admin for your email
            const isAdminEmail = userData.user.email === 'romomahmoud@gmail.com'
            
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert({
                id: userData.user.id,
                full_name: userData.user.user_metadata.full_name || '',
                username: userData.user.user_metadata.username || '',
                email_contact: userData.user.email || '',
                user_role: isAdminEmail ? 'contributor' : (userData.user.user_metadata.user_role || 'reader'),
                is_verified: isAdminEmail,
                is_admin: isAdminEmail
              })
              .select()
              .single();
            
            if (createError) {
              console.error('Error creating profile:', createError);
              throw createError;
            }
            
            if (newProfile) {
              console.log('New profile created:', newProfile);
              setProfile(newProfile);
              return newProfile;
            }
          }
        }
        throw error;
      }
      
      console.log('Profile fetched successfully:', data);
      setProfile(data);
      return data;
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      setProfile(null);
      return null;
    }
  };

  useEffect(() => {
    setMounted(true)
    
    // Check if user manually logged out
    const wasManualLogout = localStorage.getItem('manual_logout') === 'true'
    if (wasManualLogout) {
      localStorage.removeItem('manual_logout')
      setLoading(false)
      return
    }
    
    // Check active session
    const initAuth = async () => {
      try {
        console.log('AuthContext: Checking session...')
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Session check error:', error)
          setUser(null)
          setProfile(null)
        } else if (session?.user) {
          console.log('AuthContext: Found session for:', session.user.email)
          setUser(session.user)
          await fetchProfile(session.user.id)
        } else {
          console.log('AuthContext: No session found')
          setUser(null)
          setProfile(null)
        }
      } catch (error) {
        console.error('Auth init error:', error)
        setUser(null)
        setProfile(null)
      } finally {
        console.log('AuthContext: Setting loading to false')
        setLoading(false)
      }
    }

    initAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email)
      
      // Ignore auth changes if we're logging out
      if (isLoggingOut) {
        console.log('Ignoring auth change during logout')
        return
      }
      
      // Check for manual logout flag
      if (localStorage.getItem('manual_logout') === 'true') {
        console.log('Manual logout detected, ignoring auth change')
        return
      }
      
      if (event === 'SIGNED_OUT') {
        setUser(null)
        setProfile(null)
        setLoading(false)
        return
      }
      
      if (session?.user) {
        setUser(session.user)
        await fetchProfile(session.user.id)
      } else {
        setUser(null)
        setProfile(null)
      }
      
      // Don't set loading false here - let dashboard handle its own loading
    })

    return () => subscription.unsubscribe()
  }, [isLoggingOut])

  const login = async (email: string, password: string) => {
    try {
      console.log('AuthContext: Starting login...')
      
      // Clear any logout flag
      localStorage.removeItem('manual_logout')
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        console.error('Supabase login error:', error)
        if (error.message?.includes('rate limit')) {
          // For rate limits, we'll retry once after a short delay
          await new Promise(resolve => setTimeout(resolve, 2000))
          const retry = await supabase.auth.signInWithPassword({
            email,
            password,
          })
          if (retry.error) throw retry.error
          if (!retry.data?.user) throw new Error('Login failed')
        } else {
          throw error
        }
      }
      
      console.log('Login successful:', data?.user?.email)
      
      // Don't redirect here - let the calling component handle it
      
    } catch (error: unknown) {
      console.error('Login error details:', error)
      throw error
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

      // FIXED: Auto-admin for your email
      const isAdminEmail = email === 'romomahmoud@gmail.com'
      const userRole = isAdminEmail ? 'contributor' : (isContributor ? 'contributor' : 'reader')

      // Sign up the user with retry logic
      const signUpWithRetry = async (retries = 1): Promise<any> => {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              username: username,
              user_role: userRole
            },
            emailRedirectTo: `${window.location.origin}/auth/callback`
          }
        })
        
        if (error) {
          if (error.message?.includes('rate limit') && retries > 0) {
            await new Promise(resolve => setTimeout(resolve, 2000))
            return signUpWithRetry(retries - 1)
          }
          throw error
        }
        
        return data
      }

      const data = await signUpWithRetry()
      console.log('Signup response:', data)

      // Check if email confirmation is required
      if (data?.user && !data.session) {
        alert('Please check your email to confirm your account!')
      } else if (data?.session && data?.user) {
        // If auto-confirmed (like in development), create profile and redirect
        // Create profile record with role and retry logic
        const createProfileWithRetry = async (retries = 1): Promise<void> => {
          if (!data.user) return; // Type guard
          
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              full_name: fullName,
              username: username,
              email_contact: email,
              user_role: userRole,
              profile_public: isContributor || isAdminEmail,
              contributor_status: (isContributor || isAdminEmail) ? 'pending' : null,
              contributor_tier: (isContributor || isAdminEmail) ? 'standard' : null,
              is_admin: isAdminEmail,
              is_verified: isAdminEmail
            })
          
          if (profileError) {
            if (profileError.message?.includes('rate limit') && retries > 0) {
              await new Promise(resolve => setTimeout(resolve, 2000))
              return createProfileWithRetry(retries - 1)
            }
            throw profileError
          }
        }

        await createProfileWithRetry()
        
        if (data.user) {
          await fetchProfile(data.user.id)
        }
        
        if (mounted) {
          if (isContributor || isAdminEmail) {
            router.push('/dashboard')
          } else {
            router.push('/')
          }
        }
      }
    } catch (error: unknown) {
      console.error('Signup error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      console.log('Starting logout process...')
      setIsLoggingOut(true)
      
      // Set manual logout flag
      localStorage.setItem('manual_logout', 'true')
      
      // Clear all Supabase-related storage
      const keysToRemove: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.includes('supabase')) {
          keysToRemove.push(key)
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key))
      
      // Clear session storage
      sessionStorage.clear()
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Error signing out:', error)
      }
      
      // Clear all states
      setUser(null)
      setProfile(null)
      setLoading(false)
      
      console.log('Logout successful')
      
      // Force navigation with replace to prevent back button
      window.location.replace('/')
      
    } catch (error) {
      console.error('Error during logout:', error)
      // Force navigation anyway
      window.location.replace('/')
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
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}