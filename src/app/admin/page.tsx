'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useRole } from '@/contexts/RoleContext'
import { useAuth } from '@/contexts/AuthContext'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import ExclusiveHeader from '@/components/ExclusiveHeader'
import ParticleSystem from '@/components/ParticleSystem'
import { Users, FileText, Settings, Shield, Send, CheckCircle, XCircle, Eye, Mail, TrendingUp, Activity, Clock, UserCheck, AlertCircle } from 'lucide-react'

interface Stats {
  totalUsers: number
  totalContributors: number
  totalReaders: number
  totalPosts: number
  pendingApplications: number
  pendingPosts: number
}

interface ContributorApplication {
  id: string
  email: string
  full_name: string
  bio: string
  linkedin_url: string
  portfolio_url: string
  years_experience: number
  expertise_areas: string[]
  created_at: string
  status: 'pending' | 'approved' | 'rejected'
}

interface PendingPost {
  id: string
  title: string
  author: {
    full_name: string
    email: string
  }
  created_at: string
  excerpt: string
}

export default function AdminPage() {
  const router = useRouter()
  const { role, isAdmin, isLoading: roleLoading } = useRole()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'overview' | 'applications' | 'invites' | 'posts' | 'users'>('overview')
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalContributors: 0,
    totalReaders: 0,
    totalPosts: 0,
    pendingApplications: 0,
    pendingPosts: 0
  })
  const [applications, setApplications] = useState<ContributorApplication[]>([])
  const [pendingPosts, setPendingPosts] = useState<PendingPost[]>([])
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteMessage, setInviteMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      router.push('/')
    }
  }, [isAdmin, roleLoading, router])

  useEffect(() => {
    const fetchData = async () => {
      if (!isAdmin || !user) return
      
      try {
        setIsLoading(true)
        
        // Fetch stats
        const [
          { count: userCount },
          { count: contributorCount },
          { count: readerCount },
          { count: postCount },
          { data: pendingApps },
          { data: pendingPostsData }
        ] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('user_role', 'contributor'),
          supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('user_role', 'reader'),
          supabase.from('posts').select('*', { count: 'exact', head: true }),
          supabase.from('contributor_applications').select('*').eq('status', 'pending'),
          supabase.from('posts').select('*, profiles!author_id(full_name, email)').eq('published', false)
        ])

        setStats({
          totalUsers: userCount || 0,
          totalContributors: contributorCount || 0,
          totalReaders: readerCount || 0,
          totalPosts: postCount || 0,
          pendingApplications: pendingApps?.length || 0,
          pendingPosts: pendingPostsData?.length || 0
        })

        if (pendingApps) setApplications(pendingApps)
        if (pendingPostsData) setPendingPosts(pendingPostsData as any)
        
      } catch (error) {
        console.error('Error fetching admin data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [isAdmin, user, supabase])

  const handleApplicationAction = async (applicationId: string, action: 'approve' | 'reject') => {
    try {
      if (action === 'approve') {
        // Get the application details
        const app = applications.find(a => a.id === applicationId)
        if (!app) return

        // Generate unique invite code
        const inviteCode = `TMR-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`

        // Create contributor invitation
        const { data: invite, error: inviteError } = await supabase
          .from('contributor_invitations')
          .insert({
            email: app.email,
            invite_code: inviteCode,
            invited_by: user?.id,
            metadata: {
              pre_approved: true,
              application_id: applicationId,
              full_name: app.full_name
            }
          })
          .select()
          .single()

        if (inviteError) {
          console.error('Failed to create invitation:', inviteError)
          alert('Failed to create invitation')
          return
        }

        // Call Edge Function to send email
        const { error: emailError } = await supabase.functions.invoke('send-contributor-invite', {
          body: {
            to: app.email,
            applicantName: app.full_name,
            inviteCode: inviteCode,
            inviteLink: `${window.location.origin}/auth/signup?invite=${inviteCode}`,
            message: 'Congratulations! Your application to become a contributor has been approved.'
          }
        })

        if (emailError) {
          console.error('Failed to send email:', emailError)
          // Still continue with approval even if email fails
          alert(`Application approved but email failed to send. Invite link: ${window.location.origin}/auth/signup?invite=${inviteCode}`)
        } else {
          alert('Application approved and invitation email sent!')
        }
      }

      // Update application status
      await supabase
        .from('contributor_applications')
        .update({ 
          status: action === 'approve' ? 'approved' : 'rejected',
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', applicationId)

      // Refresh applications
      setApplications(prev => prev.filter(app => app.id !== applicationId))
      
    } catch (error) {
      console.error('Error handling application:', error)
      alert('Failed to process application')
    }
  }

  const sendInvite = async () => {
    if (!inviteEmail) return

    try {
      // Generate invite code
      const inviteCode = `TMR-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
      
      const { data, error } = await supabase
        .from('contributor_invitations')
        .insert({
          email: inviteEmail,
          invite_code: inviteCode,
          invited_by: user?.id,
          message: inviteMessage
        })
        .select()
        .single()

      if (error) throw error

      const inviteLink = `${window.location.origin}/auth/signup?invite=${inviteCode}`

      // Call Edge Function to send email
      const { error: emailError } = await supabase.functions.invoke('send-contributor-invite', {
        body: {
          to: inviteEmail,
          applicantName: inviteEmail.split('@')[0], // Use email prefix as name
          inviteCode: inviteCode,
          inviteLink: inviteLink,
          message: inviteMessage || 'You\'ve been invited to join The Marketing Reboot as a contributor!'
        }
      })

      if (emailError) {
        console.error('Failed to send email:', emailError)
        // Copy to clipboard as fallback
        navigator.clipboard.writeText(inviteLink)
        alert(`Email failed to send, but invite created! Link copied to clipboard:\n${inviteLink}`)
      } else {
        navigator.clipboard.writeText(inviteLink)
        alert(`Invite sent! Link also copied to clipboard:\n${inviteLink}`)
      }
      
      setInviteEmail('')
      setInviteMessage('')
      
    } catch (error) {
      console.error('Error sending invite:', error)
      alert('Failed to send invite')
    }
  }

  const approvePost = async (postId: string) => {
    try {
      await supabase
        .from('posts')
        .update({ published: true })
        .eq('id', postId)

      setPendingPosts(prev => prev.filter(post => post.id !== postId))
    } catch (error) {
      console.error('Error approving post:', error)
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">Admin Dashboard</h1>
          <p className="text-secondary">Manage your community and content</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'overview' 
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                : 'glass-card hover:bg-surface-hover text-secondary'
            }`}
          >
            <Activity className="w-4 h-4 inline mr-2" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            className={`px-6 py-3 rounded-lg font-medium transition-all relative ${
              activeTab === 'applications' 
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                : 'glass-card hover:bg-surface-hover text-secondary'
            }`}
          >
            <UserCheck className="w-4 h-4 inline mr-2" />
            Applications
            {stats.pendingApplications > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                {stats.pendingApplications}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('invites')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'invites' 
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                : 'glass-card hover:bg-surface-hover text-secondary'
            }`}
          >
            <Send className="w-4 h-4 inline mr-2" />
            Send Invites
          </button>
          <button
            onClick={() => setActiveTab('posts')}
            className={`px-6 py-3 rounded-lg font-medium transition-all relative ${
              activeTab === 'posts' 
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                : 'glass-card hover:bg-surface-hover text-secondary'
            }`}
          >
            <FileText className="w-4 h-4 inline mr-2" />
            Posts
            {stats.pendingPosts > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                {stats.pendingPosts}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'users' 
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                : 'glass-card hover:bg-surface-hover text-secondary'
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Users
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <Users className="w-8 h-8 text-brand-primary" />
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <h3 className="text-sm text-secondary mb-1">Total Users</h3>
                <p className="text-3xl font-bold text-primary">{stats.totalUsers}</p>
                <p className="text-xs text-secondary mt-2">
                  {stats.totalContributors} contributors • {stats.totalReaders} readers
                </p>
              </div>

              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <FileText className="w-8 h-8 text-brand-tertiary" />
                  <Activity className="w-5 h-5 text-blue-500" />
                </div>
                <h3 className="text-sm text-secondary mb-1">Total Posts</h3>
                <p className="text-3xl font-bold text-primary">{stats.totalPosts}</p>
                <p className="text-xs text-secondary mt-2">
                  {stats.pendingPosts} pending approval
                </p>
              </div>

              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <AlertCircle className="w-8 h-8 text-orange-500" />
                  <Clock className="w-5 h-5 text-orange-500" />
                </div>
                <h3 className="text-sm text-secondary mb-1">Pending Actions</h3>
                <p className="text-3xl font-bold text-primary">
                  {stats.pendingApplications + stats.pendingPosts}
                </p>
                <p className="text-xs text-secondary mt-2">
                  Requires your attention
                </p>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="glass-card p-6">
              <h3 className="text-xl font-semibold mb-4 text-primary">Recent Activity</h3>
              <div className="space-y-4">
                {applications.slice(0, 3).map(app => (
                  <div key={app.id} className="flex items-center justify-between p-4 bg-surface-secondary rounded-lg">
                    <div>
                      <p className="font-medium text-primary">{app.full_name} applied</p>
                      <p className="text-sm text-secondary">
                        {new Date(app.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-xs bg-orange-500/20 text-orange-500 px-3 py-1 rounded-full">
                      Pending Review
                    </span>
                  </div>
                ))}
                {applications.length === 0 && (
                  <p className="text-secondary text-center py-8">No recent activity</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'applications' && (
          <div className="glass-card p-6">
            <h3 className="text-xl font-semibold mb-6 text-primary">Contributor Applications</h3>
            
            {applications.length === 0 ? (
              <p className="text-secondary text-center py-12">No pending applications</p>
            ) : (
              <div className="space-y-4">
                {applications.map(app => (
                  <div key={app.id} className="border border-surface-border rounded-lg p-6 hover:border-brand-primary transition-colors">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-primary mb-1">{app.full_name}</h4>
                        <p className="text-secondary mb-3">{app.email}</p>
                        
                        <p className="text-sm mb-4">{app.bio}</p>
                        
                        <div className="flex flex-wrap gap-4 text-sm">
                          <span className="text-secondary">
                            <strong>{app.years_experience}</strong> years experience
                          </span>
                          {app.linkedin_url && (
                            <a href={app.linkedin_url} target="_blank" rel="noopener noreferrer" 
                               className="text-brand-primary hover:underline">
                              LinkedIn →
                            </a>
                          )}
                          {app.portfolio_url && (
                            <a href={app.portfolio_url} target="_blank" rel="noopener noreferrer" 
                               className="text-brand-primary hover:underline">
                              Portfolio →
                            </a>
                          )}
                        </div>
                        
                        <div className="mt-3 flex flex-wrap gap-2">
                          {app.expertise_areas.map((area, i) => (
                            <span key={i} className="text-xs bg-surface-secondary px-3 py-1 rounded-full">
                              {area}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleApplicationAction(app.id, 'approve')}
                          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleApplicationAction(app.id, 'reject')}
                          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center gap-2"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'invites' && (
          <div className="glass-card p-6 max-w-2xl">
            <h3 className="text-xl font-semibold mb-6 text-primary">Send Contributor Invite</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-secondary">
                  Email Address
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="contributor@example.com"
                  className="w-full px-4 py-2 bg-surface-secondary border border-surface-border rounded-lg focus:outline-none focus:border-brand-primary text-primary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-secondary">
                  Personal Message (Optional)
                </label>
                <textarea
                  value={inviteMessage}
                  onChange={(e) => setInviteMessage(e.target.value)}
                  placeholder="Add a personal note to your invitation..."
                  rows={4}
                  className="w-full px-4 py-2 bg-surface-secondary border border-surface-border rounded-lg focus:outline-none focus:border-brand-primary text-primary"
                />
              </div>
              
              <button
                onClick={sendInvite}
                disabled={!inviteEmail}
                className="btn-primary flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                Send Invitation
              </button>
              
              <div className="mt-6 p-4 bg-surface-secondary rounded-lg">
                <p className="text-sm text-secondary">
                  <strong>Note:</strong> The invite link will be valid for 7 days. 
                  The recipient will be able to create a contributor account with verified status.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'posts' && (
          <div className="glass-card p-6">
            <h3 className="text-xl font-semibold mb-6 text-primary">Pending Posts</h3>
            
            {pendingPosts.length === 0 ? (
              <p className="text-secondary text-center py-12">No posts pending approval</p>
            ) : (
              <div className="space-y-4">
                {pendingPosts.map(post => (
                  <div key={post.id} className="border border-surface-border rounded-lg p-6 hover:border-brand-primary transition-colors">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-primary mb-2">{post.title}</h4>
                        <p className="text-sm text-secondary mb-3">
                          By {post.author.full_name} • {new Date(post.created_at).toLocaleDateString()}
                        </p>
                        <p className="text-secondary line-clamp-2">{post.excerpt}</p>
                      </div>
                      
                      <div className="flex gap-3">
                        <button
                          onClick={() => router.push(`/admin/posts/${post.id}`)}
                          className="px-4 py-2 bg-surface-secondary hover:bg-surface-hover rounded-lg transition-colors flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          Review
                        </button>
                        <button
                          onClick={() => approvePost(post.id)}
                          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Approve
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="glass-card p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-primary">User Management</h3>
              <button
                onClick={() => router.push('/admin/users')}
                className="btn-primary"
              >
                View All Users
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => router.push('/admin/users?filter=contributors')}
                className="p-6 bg-surface-secondary hover:bg-surface-hover rounded-lg transition-colors text-left"
              >
                <Shield className="w-8 h-8 text-brand-primary mb-3" />
                <h4 className="font-semibold text-primary mb-1">Contributors</h4>
                <p className="text-3xl font-bold text-primary mb-1">{stats.totalContributors}</p>
                <p className="text-sm text-secondary">Manage verified contributors</p>
              </button>
              
              <button
                onClick={() => router.push('/admin/users?filter=readers')}
                className="p-6 bg-surface-secondary hover:bg-surface-hover rounded-lg transition-colors text-left"
              >
                <Users className="w-8 h-8 text-brand-tertiary mb-3" />
                <h4 className="font-semibold text-primary mb-1">Readers</h4>
                <p className="text-3xl font-bold text-primary mb-1">{stats.totalReaders}</p>
                <p className="text-sm text-secondary">View reader accounts</p>
              </button>
              
              <button
                onClick={() => router.push('/admin/settings')}
                className="p-6 bg-surface-secondary hover:bg-surface-hover rounded-lg transition-colors text-left"
              >
                <Settings className="w-8 h-8 text-secondary mb-3" />
                <h4 className="font-semibold text-primary mb-1">Settings</h4>
                <p className="text-sm text-secondary mt-4">Configure system settings</p>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}