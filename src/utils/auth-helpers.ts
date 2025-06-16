// utils/auth-helpers.ts

import { supabase } from '@/lib/supabase'

interface AuthError {
  message: string
  status?: number
  code?: string
}

// Retry logic for auth operations
export async function retryAuthOperation<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  let lastError: AuthError | null = null
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation()
    } catch (error: any) {
      lastError = error
      
      // Don't retry on auth errors (wrong password, etc)
      if (error.status === 400 || error.message?.includes('Invalid login')) {
        throw error
      }
      
      // Wait before retrying
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)))
      }
    }
  }
  
  throw lastError
}

// Safe login with retry and error handling
export async function safeLogin(email: string, password: string) {
  try {
    const result = await retryAuthOperation(async () => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) throw error
      return data
    })
    
    return { data: result, error: null }
  } catch (error: any) {
    // User-friendly error messages
    let message = 'Unable to sign in. Please try again.'
    
    if (error.message?.includes('Invalid login')) {
      message = 'Invalid email or password'
    } else if (error.message?.includes('Email not confirmed')) {
      message = 'Please check your email to confirm your account'
    } else if (error.message?.includes('network')) {
      message = 'Network error. Please check your connection'
    }
    
    return { data: null, error: { ...error, message } }
  }
}

// Safe signup with validation
export async function safeSignup(
  email: string,
  password: string,
  fullName: string,
  username: string
) {
  // Validate inputs
  if (!email || !email.includes('@')) {
    return { data: null, error: { message: 'Please enter a valid email' } }
  }
  
  if (password.length < 6) {
    return { data: null, error: { message: 'Password must be at least 6 characters' } }
  }
  
  if (!username || username.length < 3) {
    return { data: null, error: { message: 'Username must be at least 3 characters' } }
  }
  
  try {
    const result = await retryAuthOperation(async () => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            username: username,
          }
        }
      })
      
      if (error) throw error
      return data
    })
    
    return { data: result, error: null }
  } catch (error: any) {
    let message = 'Unable to create account. Please try again.'
    
    if (error.message?.includes('already registered')) {
      message = 'This email is already registered'
    } else if (error.message?.includes('network')) {
      message = 'Network error. Please check your connection'
    }
    
    return { data: null, error: { ...error, message } }
  }
}

// Check if user session is valid
export async function checkSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('Session check error:', error)
      return null
    }
    
    return session
  } catch (error) {
    console.error('Session check failed:', error)
    return null
  }
}

// Safe logout
export async function safeLogout() {
  try {
    await supabase.auth.signOut()
    
    // Clear any cached data
    if (typeof window !== 'undefined') {
      // Clear specific app data but not all localStorage
      const keysToRemove = ['user-profile', 'user-preferences']
      keysToRemove.forEach(key => localStorage.removeItem(key))
    }
    
    return { error: null }
  } catch (error) {
    console.error('Logout error:', error)
    return { error }
  }
}