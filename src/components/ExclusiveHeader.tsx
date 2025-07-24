'use client'

import Link from 'next/link'
import { Sun, Moon, User, ChevronDown, LogOut, LayoutDashboard, Settings, Shield, Mic } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/contexts/AuthContext'
import { useRole } from '@/contexts/RoleContext'
import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

export default function ExclusiveHeader() {
  const { theme, toggleTheme } = useTheme()
  const { user, profile, logout } = useAuth()
  const { role, isContributor, isAdmin } = useRole()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const supabase = createClientComponentClient()
  const router = useRouter()

  // DEBUG LOGGING
  useEffect(() => {
    console.log('🔍 ExclusiveHeader Debug:', {
      user: user?.email,
      profile: {
        id: profile?.id,
        email: profile?.email_contact,
        role: profile?.user_role,
        is_admin: profile?.is_admin
      },
      roleContext: {
        role,
        isAdmin,
        isContributor
      }
    })
  }, [user, profile, role, isAdmin, isContributor])

  // Direct database check
  const [directCheck, setDirectCheck] = useState<any>(null)

  useEffect(() => {
    const checkDirectly = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('user_role, is_admin, is_verified')
          .eq('id', user.id)
          .single()
        
        console.log('🔐 Direct DB Check:', { data, error })
        setDirectCheck(data)
      }
    }
    checkDirectly()
  }, [user, supabase])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Use logout from AuthContext
  const handleSignOut = async () => {
    setIsOpen(false)
    await logout()
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-header">
      <nav className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Animated Lightning Bolt Logo - Horizontal Version from Loading Screen */}
          <Link href="/" className="flex items-center gap-3 z-10">
            <div className="relative">
              <svg 
                className="w-8 h-10" 
                viewBox="0 0 100 120" 
                xmlns="http://www.w3.org/2000/svg"
                style={{ overflow: 'visible' }}
              >
                <defs>
                  <linearGradient id="headerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{stopColor:'#1E40AF'}}>
                      <animate attributeName="stop-color" 
                               values="#1E40AF;#3B82F6;#10B981;#32D74B;#6366F1;#8B5CF6;#1E40AF" 
                               dur="2s" repeatCount="indefinite"/>
                    </stop>
                    <stop offset="25%" style={{stopColor:'#3B82F6'}}>
                      <animate attributeName="stop-color" 
                               values="#3B82F6;#10B981;#32D74B;#6366F1;#8B5CF6;#1E40AF;#3B82F6" 
                               dur="2s" repeatCount="indefinite"/>
                    </stop>
                    <stop offset="50%" style={{stopColor:'#10B981'}}>
                      <animate attributeName="stop-color" 
                               values="#10B981;#32D74B;#6366F1;#8B5CF6;#1E40AF;#3B82F6;#10B981" 
                               dur="2s" repeatCount="indefinite"/>
                    </stop>
                    <stop offset="75%" style={{stopColor:'#6366F1'}}>
                      <animate attributeName="stop-color" 
                               values="#6366F1;#8B5CF6;#1E40AF;#3B82F6;#10B981;#32D74B;#6366F1" 
                               dur="2s" repeatCount="indefinite"/>
                    </stop>
                    <stop offset="100%" style={{stopColor:'#8B5CF6'}}>
                      <animate attributeName="stop-color" 
                               values="#8B5CF6;#1E40AF;#3B82F6;#10B981;#32D74B;#6366F1;#8B5CF6" 
                               dur="2s" repeatCount="indefinite"/>
                    </stop>
                  </linearGradient>
                  <filter id="headerGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                
                <path 
                  d="M 50 10 L 70 10 L 45 50 L 65 50 L 25 110 L 40 70 L 20 70 L 50 10 Z" 
                  fill="url(#headerGradient)"
                  filter="url(#headerGlow)"
                >
                  <animateTransform
                    attributeName="transform"
                    type="scale"
                    values="1;1.05;1"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                </path>
                
                {/* Animated circles - smaller for header */}
                <circle cx="30" cy="80" r="1" fill="#32D74B">
                  <animate attributeName="opacity" values="0;1;0" dur="1s" repeatCount="indefinite"/>
                  <animate attributeName="r" values="0.5;1.5;0.5" dur="1s" repeatCount="indefinite"/>
                </circle>
                <circle cx="60" cy="40" r="1" fill="#3B82F6">
                  <animate attributeName="opacity" values="0;1;0" dur="1.2s" begin="0.2s" repeatCount="indefinite"/>
                  <animate attributeName="r" values="0.5;2;0.5" dur="1.2s" begin="0.2s" repeatCount="indefinite"/>
                </circle>
                <circle cx="70" cy="75" r="1" fill="#10B981">
                  <animate attributeName="opacity" values="0;1;0" dur="1.4s" begin="0.4s" repeatCount="indefinite"/>
                  <animate attributeName="r" values="0.3;1.5;0.3" dur="1.4s" begin="0.4s" repeatCount="indefinite"/>
                </circle>
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium tracking-wide text-gray-600 dark:text-gray-400">THE</span>
              <span className="text-xl font-bold tracking-tight gradient-text">MARKETING REBOOT</span>
            </div>
          </Link>

          {/* Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            <Link 
              href="/topics" 
              className="nav-link text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-[#3B82F6] dark:hover:text-[#3B82F6]"
            >
              Topics
            </Link>
            <Link 
              href="/contributors" 
              className="nav-link text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-[#3B82F6] dark:hover:text-[#3B82F6]"
            >
              Contributors
            </Link>
            <Link 
              href="/resources" 
              className="nav-link text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-[#3B82F6] dark:hover:text-[#3B82F6]"
            >
              Resources
            </Link>
            <Link 
              href="/interviews" 
              className="nav-link text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-[#3B82F6] dark:hover:text-[#3B82F6]"
            >
              Interactive Interviews
            </Link>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5 text-yellow-500" />
              ) : (
                <Moon className="h-5 w-5 text-gray-600" />
              )}
            </button>

            {/* Auth Buttons / Profile */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="flex items-center space-x-2 rounded-full bg-gray-100 dark:bg-gray-800 px-3 py-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-[#1E40AF] to-[#10B981] flex items-center justify-center text-white font-bold">
                    {profile?.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </button>

                {isOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-lg bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-40">
                      <div className="py-1">
                        {/* DEBUG: Log what conditions are being checked */}
                        {console.log('Menu visibility check:', { 
                          isAdmin, 
                          isContributor, 
                          directCheck,
                          profile,
                          userEmail: user?.email,
                          shouldShowAdmin: isAdmin || directCheck?.is_admin || profile?.is_admin || user?.email === 'romomahmoud@gmail.com',
                          shouldShowContributor: isContributor || directCheck?.user_role === 'contributor' || profile?.user_role === 'contributor'
                        })}
                        
                        {/* Show My Profile for Admin and Contributors ONLY */}
                        {(isAdmin || isContributor || directCheck?.is_admin || directCheck?.user_role === 'contributor' || profile?.is_admin || profile?.user_role === 'contributor' || user?.email === 'romomahmoud@gmail.com') && (
                          <Link
                            href="/profile"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => setIsOpen(false)}
                          >
                            <User className="mr-3 h-4 w-4" />
                            My Profile
                          </Link>
                        )}
                        
                        {/* Show Dashboard for Admin and Contributors */}
                        {(isAdmin || isContributor || directCheck?.is_admin || directCheck?.user_role === 'contributor' || profile?.is_admin || profile?.user_role === 'contributor' || user?.email === 'romomahmoud@gmail.com') && (
                          <Link
                            href="/dashboard"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => setIsOpen(false)}
                          >
                            <LayoutDashboard className="mr-3 h-4 w-4" />
                            Dashboard
                          </Link>
                        )}
                        
                        {/* Show Admin only for Admin users */}
                        {(isAdmin || directCheck?.is_admin || profile?.is_admin || user?.email === 'romomahmoud@gmail.com') && (
                          <Link
                            href="/admin"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => setIsOpen(false)}
                          >
                            <Shield className="mr-3 h-4 w-4" />
                            Admin
                          </Link>
                        )}
                        
                        {/* Settings for all users */}
                        <Link
                          href="/settings"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => setIsOpen(false)}
                        >
                          <Settings className="mr-3 h-4 w-4" />
                          Settings
                        </Link>
                        
                        <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
                        
                        {/* Log Out for all users */}
                        <button
                          onClick={handleSignOut}
                          className="flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <LogOut className="mr-3 h-4 w-4" />
                          Log Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/auth/login"
                  className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-[#3B82F6] transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/auth/signup"
                  className="btn-primary text-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  )
}