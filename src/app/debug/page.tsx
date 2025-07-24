'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRole } from '@/contexts/RoleContext'
import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import ExclusiveHeader from '@/components/ExclusiveHeader'
import ParticleSystem from '@/components/ParticleSystem'

export default function DebugPage() {
  const { user } = useAuth()
  const roleContext = useRole()
  const [profileData, setProfileData] = useState<any>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    if (user) {
      fetchProfile()
    }
  }, [user])

  const fetchProfile = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user?.id)
      .single()

    setProfileData(data)
  }

  return (
    <div className="min-h-screen bg-primary">
      <ExclusiveHeader />
      <ParticleSystem />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Debug Info</h1>
        
        <div className="glass-card p-6 mb-4">
          <h2 className="font-semibold mb-2">Auth User:</h2>
          <pre className="text-sm overflow-auto p-4 bg-secondary/10 rounded-lg">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>

        <div className="glass-card p-6 mb-4">
          <h2 className="font-semibold mb-2">Role Context:</h2>
          <pre className="text-sm overflow-auto p-4 bg-secondary/10 rounded-lg">
            {JSON.stringify(roleContext, null, 2)}
          </pre>
        </div>

        <div className="glass-card p-6">
          <h2 className="font-semibold mb-2">Profile Data:</h2>
          <pre className="text-sm overflow-auto p-4 bg-secondary/10 rounded-lg">
            {JSON.stringify(profileData, null, 2)}
          </pre>
        </div>
      </main>
    </div>
  )
} 