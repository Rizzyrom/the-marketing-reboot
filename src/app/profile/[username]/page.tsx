'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import ExclusiveHeader from '@/components/ExclusiveHeader'
import ParticleSystem from '@/components/brand/ParticleSystem'
import { 
  ArrowLeft, Share2, UserPlus, MessageCircle, Mail, 
  Globe, Linkedin, Twitter, Github, Youtube, Instagram,
  MapPin, Briefcase, Calendar, Eye, Heart, BookmarkPlus,
  MoreHorizontal, CheckCircle, Users
} from 'lucide-react'

export default function PublicProfilePage() {
  const params = useParams()
  const username = params.username as string
  const [profile, setProfile] = useState<any>(null)
  const [contentBlocks, setContentBlocks] = useState<any[]>([])
  const [isFollowing, setIsFollowing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [viewerUser, setViewerUser] = useState<any>(null)
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [stats, setStats] = useState({
    followers: 1247,
    following: 389,
    posts: 42,
    views: 28500
  })

  useEffect(() => {
    // Get current logged in user (viewer)
    const authUser = localStorage.getItem('auth-user')
    if (authUser) {
      setViewerUser(JSON.parse(authUser))
    }

    // Load profile data
    loadProfile()
  }, [username])

  const loadProfile = () => {
    // In production, this would fetch from database
    // For now, we'll load from localStorage if it's the same user
    const savedProfile = localStorage.getItem('user-profile')
    if (savedProfile) {
      const profileData = JSON.parse(savedProfile)
      // Check if this is the profile we're looking for
      if (profileData.profile?.username === username) {
        setProfile(profileData.profile)
        setContentBlocks(profileData.blocks || [])
      } else {
        // Mock data for other profiles
        setProfile({
          fullName: 'Sarah Zhang',
          username: username,
          headline: 'Transforming Brands Through Data-Driven Marketing',
          profession: 'Chief Marketing Officer',
          company: 'TechCorp',
          location: 'San Francisco, CA',
          bio: 'Leading marketing transformation at scale. 15+ years building brands that matter. Passionate about the intersection of creativity and analytics.',
          avatar: null,
          experience: [
            'CMO at TechCorp (2020-Present)',
            'VP Marketing at StartupXYZ (2018-2020)',
            'Marketing Director at BigCo (2015-2018)'
          ],
          linkedinUrl: 'https://linkedin.com/in/sarahzhang',
          twitterUrl: 'https://twitter.com/sarahzhang',
          websiteUrl: 'https://sarahzhang.com',
          theme: 'cyberpunk'
        })
        setContentBlocks([
          {
            id: '1',
            type: 'heading',
            content: { text: 'Latest Marketing Insights' },
            size: { width: 'full' }
          },
          {
            id: '2',
            type: 'text',
            content: { text: 'Sharing my journey in rebooting traditional marketing approaches with data-driven strategies that actually work.' },
            size: { width: 'full' }
          }
        ])
      }
    }
    setLoading(false)
  }

  const handleFollow = () => {
    setIsFollowing(!isFollowing)
    setStats(prev => ({
      ...prev,
      followers: isFollowing ? prev.followers - 1 : prev.followers + 1
    }))
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${profile?.fullName} - The Marketing Reboot`,
        text: profile?.bio,
        url: window.location.href
      })
    } else {
      setShowShareMenu(!showShareMenu)
    }
  }

  const copyProfileLink = () => {
    navigator.clipboard.writeText(window.location.href)
    alert('Profile link copied!')
    setShowShareMenu(false)
  }

  const getBlockSizeClass = (size: string) => {
    switch (size) {
      case 'one-third': return 'col-span-1'
      case 'half': return 'col-span-2'
      case 'two-thirds': return 'col-span-2'
      case 'full': default: return 'col-span-3'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center transition-colors duration-500">
        <div className="text-primary">Loading profile...</div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center transition-colors duration-500">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary mb-4">Profile not found</h1>
          <Link href="/" className="text-brand-primary hover:text-blue-300">
            ← Back to home
          </Link>
        </div>
      </div>
    )
  }

  const isOwnProfile = viewerUser?.email && profile?.email === viewerUser.email

  return (
    <div className="min-h-screen bg-primary transition-colors duration-500">
      <ParticleSystem />
      <ExclusiveHeader />
      
      {/* Custom CSS for this profile */}
      <style dangerouslySetInnerHTML={{ __html: profile.customCSS || '' }} />
      
      {/* Header */}
      <header className="sticky top-20 z-40 bg-secondary/80 backdrop-blur-lg border-b surface-border">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity text-primary">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-semibold">Back to Community</span>
          </Link>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleShare}
              className="p-2 rounded-lg hover:surface-hover transition-colors relative text-secondary"
            >
              <Share2 className="w-5 h-5" />
              {showShareMenu && (
                <div className="absolute right-0 top-12 w-48 glass-card rounded-lg shadow-lg p-2">
                  <button 
                    onClick={copyProfileLink}
                    className="w-full text-left px-3 py-2 rounded hover:surface-hover transition-colors text-primary"
                  >
                    Copy Link
                  </button>
                  <a 
                    href={`https://twitter.com/intent/tweet?text=Check out ${profile.fullName}'s profile on The Marketing Reboot&url=${window.location.href}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-3 py-2 rounded hover:surface-hover transition-colors text-primary"
                  >
                    Share on Twitter
                  </a>
                  <a 
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${window.location.href}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-3 py-2 rounded hover:surface-hover transition-colors text-primary"
                  >
                    Share on LinkedIn
                  </a>
                </div>
              )}
            </button>
            
            {isOwnProfile ? (
              <Link 
                href="/profile/edit"
                className="btn-primary"
              >
                Edit Profile
              </Link>
            ) : (
              <>
                <button className="p-2 rounded-lg hover:surface-hover transition-colors text-secondary">
                  <MessageCircle className="w-5 h-5" />
                </button>
                <button
                  onClick={handleFollow}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                    isFollowing ? 'btn-secondary' : 'btn-primary'
                  }`}
                >
                  {isFollowing ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Following
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Follow
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Profile Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Profile Header Section */}
        <div className="glass-card rounded-2xl p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Avatar & Stats */}
            <div className="flex flex-col items-center md:items-start">
              <div className="relative mb-6">
                {profile.avatar ? (
                  <img 
                    src={profile.avatar} 
                    alt={profile.fullName}
                    className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-brand-primary to-purple-500 flex items-center justify-center text-5xl font-bold text-white">
                    {profile.fullName?.charAt(0) || 'U'}
                  </div>
                )}
                <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-400 rounded-full border-2 border-secondary" />
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 text-center md:text-left">
                <div>
                  <div className="text-2xl font-bold text-primary">{stats.followers.toLocaleString()}</div>
                  <div className="text-sm text-muted">Followers</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">{stats.following.toLocaleString()}</div>
                  <div className="text-sm text-muted">Following</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">{stats.posts}</div>
                  <div className="text-sm text-muted">Posts</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">{(stats.views / 1000).toFixed(1)}K</div>
                  <div className="text-sm text-muted">Views</div>
                </div>
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="mb-6">
                <h1 className="text-4xl font-bold mb-2 text-primary">{profile.fullName}</h1>
                <p className="text-xl mb-3 text-brand-primary">
                  @{profile.username}
                </p>
                {profile.headline && (
                  <h2 className="text-2xl mb-4 text-secondary">
                    {profile.headline}
                  </h2>
                )}
                
                <div className="flex flex-wrap gap-4 mb-4 text-lg">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-brand-primary" />
                    <span className="text-secondary">
                      {profile.profession}
                      {profile.company && ` at ${profile.company}`}
                    </span>
                  </div>
                  {profile.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-brand-primary" />
                      <span className="text-secondary">{profile.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-brand-primary" />
                    <span className="text-secondary">Member since Nov 2024</span>
                  </div>
                </div>

                {profile.bio && (
                  <p className="text-lg leading-relaxed mb-6 text-secondary">{profile.bio}</p>
                )}

                {/* Experience & Credibility */}
                {profile.experience && profile.experience.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-primary">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      Experience & Credibility
                    </h3>
                    <ul className="space-y-2">
                      {profile.experience.map((exp: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-brand-primary">•</span>
                          <span className="text-secondary">{exp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Social Links */}
                <div className="flex flex-wrap gap-3">
                  {profile.linkedinUrl && (
                    <a 
                      href={profile.linkedinUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg hover:surface-hover transition-colors border surface-border text-secondary"
                    >
                      <Linkedin className="w-5 h-5" />
                    </a>
                  )}
                  {profile.twitterUrl && (
                    <a 
                      href={profile.twitterUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg hover:surface-hover transition-colors border surface-border text-secondary"
                    >
                      <Twitter className="w-5 h-5" />
                    </a>
                  )}
                  {profile.githubUrl && (
                    <a 
                      href={profile.githubUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg hover:surface-hover transition-colors border surface-border text-secondary"
                    >
                      <Github className="w-5 h-5" />
                    </a>
                  )}
                  {profile.instagramUrl && (
                    <a 
                      href={profile.instagramUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg hover:surface-hover transition-colors border surface-border text-secondary"
                    >
                      <Instagram className="w-5 h-5" />
                    </a>
                  )}
                  {profile.youtubeUrl && (
                    <a 
                      href={profile.youtubeUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg hover:surface-hover transition-colors border surface-border text-secondary"
                    >
                      <Youtube className="w-5 h-5" />
                    </a>
                  )}
                  {profile.websiteUrl && (
                    <a 
                      href={profile.websiteUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg hover:surface-hover transition-colors border surface-border text-secondary"
                    >
                      <Globe className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Blocks */}
        {contentBlocks.length > 0 && (
          <div className="grid grid-cols-3 gap-6 mb-8">
            {contentBlocks.map(block => (
              <div key={block.id} className={getBlockSizeClass(block.size?.width || 'full')}>
                <div className="glass-card p-6 rounded-xl">
                  {block.type === 'heading' && (
                    <h2 className="text-2xl font-bold text-primary">{block.content?.text || ''}</h2>
                  )}
                  {block.type === 'text' && (
                    <p className="leading-relaxed text-secondary">{block.content?.text || ''}</p>
                  )}
                  {block.type === 'youtube-feed' && (
                    <div>
                      <h3 className="font-bold mb-4 flex items-center gap-2 text-primary">
                        <Youtube className="w-5 h-5 text-red-500" />
                        YouTube Videos
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        {[1,2,3,4].map(i => (
                          <div key={i} className="aspect-video bg-tertiary rounded-lg flex items-center justify-center">
                            <Youtube className="w-12 h-12 opacity-30 text-muted" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {block.type === 'twitter-feed' && (
                    <div>
                      <h3 className="font-bold mb-4 flex items-center gap-2 text-primary">
                        <Twitter className="w-5 h-5 text-blue-400" />
                        Latest Tweets
                      </h3>
                      <div className="space-y-3">
                        {[1,2,3].map(i => (
                          <div key={i} className="p-4 bg-tertiary rounded-lg">
                            <div className="flex items-start gap-3">
                              <Twitter className="w-4 h-4 mt-1 text-blue-400" />
                              <div className="flex-1">
                                <p className="text-sm mb-2 text-secondary">Sample tweet content here...</p>
                                <div className="flex gap-4 text-xs text-muted">
                                  <span>12 ❤️</span>
                                  <span>3 💬</span>
                                  <span>2h ago</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {block.type === 'instagram-feed' && (
                    <div>
                      <h3 className="font-bold mb-4 flex items-center gap-2 text-primary">
                        <Instagram className="w-5 h-5 text-pink-500" />
                        Instagram
                      </h3>
                      <div className="grid grid-cols-3 gap-2">
                        {[1,2,3,4,5,6].map(i => (
                          <div key={i} className="aspect-square bg-tertiary rounded-lg flex items-center justify-center">
                            <Instagram className="w-8 h-8 opacity-30 text-muted" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {block.type === 'custom-embed' && block.content?.code && (
                    <div dangerouslySetInnerHTML={{ __html: block.content.code }} />
                  )}
                  {block.type === 'html' && block.content?.html && (
                    <div dangerouslySetInnerHTML={{ __html: block.content.html }} />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Posts Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6 text-primary">Recent Reboots</h2>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <article 
                key={i}
                className="glass-card p-6 rounded-xl hover:scale-[1.02] transition-transform cursor-pointer"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="text-xs font-semibold px-3 py-1 rounded-full inline-block mb-2 bg-gradient-to-r from-brand-primary to-purple-500 text-white">
                      Strategy Reboot
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-primary">
                      How I Cut Our CAC by 67% in 3 Months
                    </h3>
                    <p className="text-secondary">
                      Threw out everything we knew about paid acquisition and rebuilt from scratch...
                    </p>
                  </div>
                  <button className="p-2 rounded-lg hover:surface-hover transition-colors text-secondary">
                    <BookmarkPlus className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex items-center gap-6 text-sm text-muted">
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    2.3K views
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    342 likes
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" />
                    89 comments
                  </span>
                  <span className="ml-auto">3 days ago</span>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Similar Profiles */}
        <div>
          <h2 className="text-2xl font-bold mb-6 text-primary">Similar Marketing Leaders</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <Link 
                key={i}
                href={`/profile/user${i}`}
                className="glass-card p-4 rounded-xl hover:scale-[1.02] transition-transform"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-primary to-purple-500 flex items-center justify-center text-lg font-bold text-white">
                    U{i}
                  </div>
                  <div>
                    <div className="font-semibold text-primary">User {i}</div>
                    <div className="text-sm text-muted">
                      @user{i}
                    </div>
                  </div>
                </div>
                <p className="text-sm mb-3 text-secondary">
                  Marketing professional focused on growth and innovation...
                </p>
                <button className="text-sm font-semibold text-brand-primary">
                  View Profile →
                </button>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}