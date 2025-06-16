'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/supabase'

type UserRole = 'contributor' | 'reader'

interface RoleContextType {
  role: UserRole | null
  isVerified: boolean
  isLoading: boolean
  refreshRole: () => Promise<void>
}

const RoleContext = createContext<RoleContextType | undefined>(undefined)

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<UserRole | null>(null)
  const [isVerified, setIsVerified] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientComponentClient<Database>()

  const refreshRole = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setRole(null)
        setIsVerified(false)
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('user_role, is_verified')
        .eq('id', session.user.id)
        .single()

      if (profile) {
        setRole(profile.user_role)
        setIsVerified(profile.is_verified)
      }
    } catch (error) {
      console.error('Error refreshing role:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    refreshRole()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      refreshRole()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <RoleContext.Provider value={{ role, isVerified, isLoading, refreshRole }}>
      {children}
    </RoleContext.Provider>
  )
}

export function useRole() {
  const context = useContext(RoleContext)
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider')
  }
  return context
} 