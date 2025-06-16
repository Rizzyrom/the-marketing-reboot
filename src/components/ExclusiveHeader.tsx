'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Sun, Moon, User, Settings, LogOut, ChevronDown } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/contexts/AuthContext'

export default function ExclusiveHeader() {
  const [isOpen, setIsOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const pathname = usePathname()
  const { isDarkMode, toggleTheme } = useTheme()
  const { user, profile, logout } = useAuth()

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isUserMenuOpen) {
        setIsUserMenuOpen(false)
      }
    }

    if (isUserMenuOpen) {
      document.addEventListener('click', handleClickOutside)
    }

    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [isUserMenuOpen])

  const handleSignOut = async () => {
    try {
      await logout()
      setIsUserMenuOpen(false)
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const navigationItems = [
    { name: 'Topics', href: '/topics' },
    { name: 'Contributors', href: '/contributors' },
    { name: 'Resources', href: '/resources' },
    { name: 'Latest', href: '/latest' }
  ]

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <header className="header-nav bg-primary/90">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo with Lightning Bolt */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-12 transition-all duration-300 group-hover:scale-110">
              <svg 
                className="w-full h-full" 
                viewBox="0 0 40 48" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{stopColor:'#1E40AF'}}>
                      <animate attributeName="stop-color" 
                               values="#1E40AF;#3B82F6;#10B981;#32D74B;#6366F1;#8B5CF6;#1E40AF" 
                               dur="10s" repeatCount="indefinite"/>
                    </stop>
                    <stop offset="50%" style={{stopColor:'#3B82F6'}}>
                      <animate attributeName="stop-color" 
                               values="#3B82F6;#10B981;#32D74B;#6366F1;#8B5CF6;#1E40AF;#3B82F6" 
                               dur="10s" repeatCount="indefinite"/>
                    </stop>
                    <stop offset="100%" style={{stopColor:'#10B981'}}>
                      <animate attributeName="stop-color" 
                               values="#10B981;#32D74B;#6366F1;#8B5CF6;#1E40AF;#3B82F6;#10B981" 
                               dur="10s" repeatCount="indefinite"/>
                    </stop>
                  </linearGradient>
                </defs>
                <path 
                  d="M 20 4 L 28 4 L 18 20 L 26 20 L 10 44 L 16 28 L 8 28 L 20 4 Z" 
                  fill="url(#logoGradient)"
                  filter="drop-shadow(0 0 4px rgba(59, 130, 246, 0.5))"
                />
              </svg>
            </div>
            <div className="font-orbitron">
              <div className="text-xl font-black text-primary flex items-center">
                THE MARKETING
              </div>
              <div className="text-lg font-bold gradient-text -mt-1">
                REBOOT
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`font-semibold transition-colors relative nav-link ${
                  isActive(item.href) 
                    ? 'text-brand-primary' 
                    : 'text-secondary hover:text-primary'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-secondary/20 transition-all duration-200 text-secondary hover:text-primary"
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Authentication Section */}
            {user ? (
              <div className="flex items-center gap-4">
                <Link 
                  href="/post/create"
                  className="btn-primary"
                >
                  <span className="text-lg">+</span>
                  Start Reboot
                </Link>
                
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-secondary/20 transition-all duration-200"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center font-bold text-white text-sm">
                      {profile?.full_name?.charAt(0).toUpperCase() || profile?.username?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <ChevronDown className="w-4 h-4 text-secondary" />
                  </button>
                  
                  {isUserMenuOpen && (
                    <div className="absolute right-0 top-12 w-56 glass-card py-2 z-50">
                      <div className="px-4 py-2 border-b surface-border">
                        <div className="font-semibold text-primary text-sm">
                          {profile?.full_name || profile?.username || user?.email?.split('@')[0] || 'User'}
                        </div>
                        <div className="text-secondary text-xs">
                          {profile?.email_contact || user?.email}
                        </div>
                      </div>
                      <Link 
                        href="/profile" 
                        className="flex items-center gap-3 px-4 py-2 hover:surface-hover transition-colors text-secondary"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <User className="w-4 h-4" />
                        Profile
                      </Link>
                      <Link 
                        href="/dashboard" 
                        className="flex items-center gap-3 px-4 py-2 hover:surface-hover transition-colors text-secondary"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Settings className="w-4 h-4" />
                        Dashboard
                      </Link>
                      <button 
                        onClick={handleSignOut}
                        className="flex items-center gap-3 px-4 py-2 hover:surface-hover transition-colors text-secondary w-full text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link 
                  href="/auth/login"
                  className="px-5 py-2.5 text-primary font-semibold border surface-border rounded-lg hover:bg-secondary/20 transition-all duration-300"
                >
                  Sign In
                </Link>
                <Link 
                  href="/auth/signup"
                  className="bg-gradient-to-r from-green-500 to-green-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Join Reboot
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button & auth */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-secondary/20 transition-all duration-200 text-secondary hover:text-primary"
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            
            {user ? (
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center font-bold text-white text-sm">
                {profile?.full_name?.charAt(0).toUpperCase() || profile?.username?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
            ) : (
              <Link 
                href="/auth/login"
                className="text-primary font-semibold px-3 py-1.5"
              >
                Sign In
              </Link>
            )}
            
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg hover:bg-secondary/20 transition-all duration-200 text-secondary hover:text-primary"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className={`lg:hidden transition-all duration-300 ease-in-out ${
          isOpen 
            ? 'max-h-96 opacity-100 pb-6' 
            : 'max-h-0 opacity-0 overflow-hidden'
        }`}>
          <div className="pt-4 pb-2 space-y-2 border-t surface-border">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-3 font-semibold transition-colors ${
                  isActive(item.href) 
                    ? 'text-brand-primary' 
                    : 'text-secondary hover:text-primary'
                }`}
              >
                {item.name}
              </Link>
            ))}
            
            <div className="border-t surface-border pt-4 mt-4">
              {user ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 px-4 py-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center font-bold text-white text-sm">
                      {profile?.full_name?.charAt(0).toUpperCase() || profile?.username?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <div className="font-semibold text-primary text-sm">
                        {profile?.full_name || profile?.username || user?.email?.split('@')[0] || 'User'}
                      </div>
                      <div className="text-secondary text-xs">
                        {profile?.email_contact || user?.email}
                      </div>
                    </div>
                  </div>
                  <Link 
                    href="/post/create"
                    onClick={() => setIsOpen(false)}
                    className="btn-primary flex items-center justify-center mx-4"
                  >
                    <span className="text-lg">+</span>
                    Start Reboot
                  </Link>
                  <Link 
                    href="/profile"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 hover:surface-hover transition-colors text-secondary"
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </Link>
                  <Link 
                    href="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 hover:surface-hover transition-colors text-secondary"
                  >
                    <Settings className="w-4 h-4" />
                    Dashboard
                  </Link>
                  <button 
                    onClick={handleSignOut}
                    className="flex items-center gap-3 px-4 py-2 hover:surface-hover transition-colors text-secondary w-full text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="space-y-2 px-4">
                  <Link 
                    href="/auth/login"
                    onClick={() => setIsOpen(false)}
                    className="block w-full text-center py-3 text-primary font-semibold border surface-border rounded-lg hover:bg-secondary/20 transition-all duration-300"
                  >
                    Sign In
                  </Link>
                  <Link 
                    href="/auth/signup"
                    onClick={() => setIsOpen(false)}
                    className="block w-full text-center py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300"
                  >
                    Join Reboot
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}