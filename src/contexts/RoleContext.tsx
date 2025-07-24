'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface RoleContextType {
  role: string | null
  isContributor: boolean
  isReader: boolean
  isAdmin: boolean
  isVerified: boolean
  loading: boolean
  isLoading: boolean // Add this for compatibility
}

const RoleContext = createContext<RoleContextType>({
  role: null,
  isContributor: false,
  isReader: false,
  isAdmin: false,
  isVerified: false,
  loading: true,
  isLoading: true
})

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [roleData, setRoleData] = useState<RoleContextType>({
    role: null,
    isContributor: false,
    isReader: false,
    isAdmin: false,
    isVerified: false,
    loading: true,
    isLoading: true
  })
  
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchRole = async () => {
      if (!user) {
        console.log('No user, setting default role data')
        setRoleData({
          role: null,
          isContributor: false,
          isReader: false,
          isAdmin: false,
          isVerified: false,
          loading: false,
          isLoading: false
        })
        return
      }

      try {
        console.log('Fetching role for user:', user.id)
        const { data, error } = await supabase
          .from('profiles')
          .select('user_role, is_admin, is_verified')
          .eq('id', user.id)
          .single()

        console.log('Role fetch result:', { data, error, userId: user.id })

        if (error) {
          console.error('Error fetching role:', error)
          throw error
        }

        const role = data?.user_role || 'reader'
        const isAdmin = data?.is_admin || false
        
        // FIXED: Admins are also considered contributors
        const isContributor = role === 'contributor' || isAdmin || user.email === 'romomahmoud@gmail.com'
        
        const newRoleData = {
          role,
          isContributor,
          isReader: role === 'reader' && !isAdmin,
          isAdmin,
          isVerified: data?.is_verified || false,
          loading: false,
          isLoading: false
        }
        
        console.log('Setting role data:', newRoleData)
        setRoleData(newRoleData)
      } catch (error) {
        console.error('Error in role fetch, setting default role:', error)
        
        // FIXED: If it's your admin email, give admin/contributor access even if DB fails
        if (user.email === 'romomahmoud@gmail.com') {
          setRoleData({
            role: 'contributor',
            isContributor: true,
            isReader: false,
            isAdmin: true,
            isVerified: true,
            loading: false,
            isLoading: false
          })
        } else {
          setRoleData({
            role: 'reader',
            isContributor: false,
            isReader: true,
            isAdmin: false,
            isVerified: false,
            loading: false,
            isLoading: false
          })
        }
      }
    }

    // Set loading state before fetching
    setRoleData(prev => ({ ...prev, loading: true, isLoading: true }))
    fetchRole()
  }, [user, supabase])

  return (
    <RoleContext.Provider value={roleData}>
      {children}
    </RoleContext.Provider>
  )
}

export const useRole = () => {
  const context = useContext(RoleContext)
  if (!context) {
    throw new Error('useRole must be used within RoleProvider')
  }
  return context
}