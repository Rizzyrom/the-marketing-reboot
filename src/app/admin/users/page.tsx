'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useRole } from '@/contexts/RoleContext'
import { useAuth } from '@/contexts/AuthContext'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import ExclusiveHeader from '@/components/ExclusiveHeader'
import ParticleSystem from '@/components/ParticleSystem'
import { Search, Filter, Shield, UserCheck, Users, Mail, Edit, Trash2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface UserProfile {
  id: string
  full_name: string
  email_contact: string
  user_role: 'contributor' | 'reader' | 'admin'
  is_admin: boolean
  is_verified: boolean
  created_at: string
  profile_views: number
  last_active: string | null
}

export default function AdminUsersPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAdmin, isLoading: roleLoading } = useRole()
  const { user } = useAuth()
  const supabase = createClientComponentClient()
  
  const [users, setUsers] = useState<UserProfile[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState(searchParams.get('filter') || 'all')

  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      router.push('/')
    }
  }, [isAdmin, roleLoading, router])

  useEffect(() => {
    const fetchUsers = async () => {
      if (!isAdmin || !user) return
      
      try {
        setIsLoading(true)
        
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false })
        
        if (error) throw error
        
        setUsers(data || [])
        setFilteredUsers(data || [])
      } catch (error) {
        console.error('Error fetching users:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsers()
  }, [isAdmin, user, supabase])

  useEffect(() => {
    let filtered = users

    // Filter by role
    if (filterRole !== 'all') {
      if (filterRole === 'contributors') {
        filtered = filtered.filter(u => u.user_role === 'contributor')
      } else if (filterRole === 'readers') {
        filtered = filtered.filter(u => u.user_role === 'reader')
      } else if (filterRole === 'admins') {
        filtered = filtered.filter(u => u.is_admin)
      }
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(u => 
        u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email_contact?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredUsers(filtered)
  }, [users, filterRole, searchTerm])

  const updateUserRole = async (userId: string, newRole: 'contributor' | 'reader') => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          user_role: newRole,
          is_verified: newRole === 'contributor' 
        })
        .eq('id', userId)

      if (error) throw error

      // Update local state
      setUsers(prev => prev.map(u => 
        u.id === userId 
          ? { ...u, user_role: newRole, is_verified: newRole === 'contributor' }
          : u
      ))
    } catch (error) {
      console.error('Error updating user role:', error)
    }
  }

  const toggleAdmin = async (userId: string, currentAdminStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_admin: !currentAdminStatus })
        .eq('id', userId)

      if (error) throw error

      // Update local state
      setUsers(prev => prev.map(u => 
        u.id === userId 
          ? { ...u, is_admin: !currentAdminStatus }
          : u
      ))
    } catch (error) {
      console.error('Error updating admin status:', error)
    }
  }

  if (roleLoading || isLoading) {
    return (
      <div className="min-h-screen bg-primary">
        <ExclusiveHeader />
        <ParticleSystem />
        <div className="container mx-auto px-4 py-24">
          <div className="glass-card p-8 text-center">
            <div className="animate-pulse">
              <div className="h-8 w-64 bg-gray-700 rounded mx-auto mb-4"></div>
              <div className="h-4 w-48 bg-gray-700 rounded mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!isAdmin) return null

  return (
    <div className="min-h-screen bg-primary">
      <ExclusiveHeader />
      <ParticleSystem />
      
      <div className="container mx-auto px-4 py-24">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/admin"
            className="inline-flex items-center gap-2 text-secondary hover:text-primary mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Admin Dashboard
          </Link>
          
          <h1 className="text-4xl font-bold gradient-text mb-2">User Management</h1>
          <p className="text-secondary">Manage users, roles, and permissions</p>
        </div>

        {/* Filters and Search */}
        <div className="glass-card p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary" />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-surface-secondary border border-surface-border rounded-lg focus:outline-none focus:border-brand-primary text-primary"
              />
            </div>

            {/* Role Filter */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilterRole('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filterRole === 'all' 
                    ? 'bg-brand-primary text-white' 
                    : 'bg-surface-secondary text-secondary hover:bg-surface-hover'
                }`}
              >
                All ({users.length})
              </button>
              <button
                onClick={() => setFilterRole('contributors')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filterRole === 'contributors' 
                    ? 'bg-brand-primary text-white' 
                    : 'bg-surface-secondary text-secondary hover:bg-surface-hover'
                }`}
              >
                Contributors ({users.filter(u => u.user_role === 'contributor').length})
              </button>
              <button
                onClick={() => setFilterRole('readers')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filterRole === 'readers' 
                    ? 'bg-brand-primary text-white' 
                    : 'bg-surface-secondary text-secondary hover:bg-surface-hover'
                }`}
              >
                Readers ({users.filter(u => u.user_role === 'reader').length})
              </button>
              <button
                onClick={() => setFilterRole('admins')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filterRole === 'admins' 
                    ? 'bg-brand-primary text-white' 
                    : 'bg-surface-secondary text-secondary hover:bg-surface-hover'
                }`}
              >
                Admins ({users.filter(u => u.is_admin).length})
              </button>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-border">
                  <th className="text-left px-6 py-4 text-sm font-medium text-secondary">User</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-secondary">Role</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-secondary">Status</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-secondary">Joined</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-secondary">Activity</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-secondary">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-surface-hover transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-primary">{user.full_name || 'Unnamed'}</div>
                        <div className="text-sm text-secondary">{user.email_contact}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={user.user_role}
                        onChange={(e) => updateUserRole(user.id, e.target.value as 'contributor' | 'reader')}
                        className="px-3 py-1 bg-surface-secondary border border-surface-border rounded text-sm"
                      >
                        <option value="reader">Reader</option>
                        <option value="contributor">Contributor</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {user.is_admin && (
                          <span className="px-2 py-1 bg-purple-500/20 text-purple-500 text-xs rounded-full font-medium">
                            Admin
                          </span>
                        )}
                        {user.is_verified && (
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-500 text-xs rounded-full font-medium">
                            Verified
                          </span>
                        )}
                        {!user.is_admin && !user.is_verified && (
                          <span className="px-2 py-1 bg-gray-500/20 text-gray-500 text-xs rounded-full font-medium">
                            Regular
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-secondary">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div>
                        <div className="text-primary">{user.profile_views || 0} views</div>
                        {user.last_active && (
                          <div className="text-xs text-secondary">
                            Last: {new Date(user.last_active).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleAdmin(user.id, user.is_admin)}
                          className={`p-2 rounded-lg transition-colors ${
                            user.is_admin 
                              ? 'bg-purple-500/20 text-purple-500 hover:bg-purple-500/30' 
                              : 'bg-surface-secondary text-secondary hover:bg-surface-hover'
                          }`}
                          title={user.is_admin ? 'Remove Admin' : 'Make Admin'}
                        >
                          <Shield className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => router.push(`/admin/users/${user.id}`)}
                          className="p-2 bg-surface-secondary hover:bg-surface-hover rounded-lg transition-colors"
                          title="Edit User"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 bg-surface-secondary hover:bg-red-500/20 hover:text-red-500 rounded-lg transition-colors"
                          title="Delete User"
                          disabled
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-12 text-secondary">
              No users found matching your criteria
            </div>
          )}
        </div>
      </div>
    </div>
  )
}