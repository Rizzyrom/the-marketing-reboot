import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useAuth } from './useAuth'

type UserRole = 'contributor' | 'reader'

export function useRole() {
  const [role, setRole] = useState<UserRole | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const supabase = createClientComponentClient()

  useEffect(() => {
    if (!user?.id) {
      setRole(null)
      setLoading(false)
      return
    }

    async function fetchRole() {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_role')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Error fetching user role:', error)
        setRole(null)
      } else {
        setRole(data?.user_role as UserRole)
      }
      setLoading(false)
    }

    fetchRole()
  }, [user, supabase])

  return {
    role,
    loading,
    isContributor: role === 'contributor',
    isReader: role === 'reader',
  }
} 