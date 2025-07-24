import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Protected routes that require specific roles
const CONTRIBUTOR_ROUTES = ['/cms', '/dashboard']
const ADMIN_ROUTES = ['/admin']
const AUTH_ROUTES = ['/dashboard', '/admin', '/profile/edit', '/post/new']

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  try {
    // Refresh session if exists
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (session) {
      // Get user profile with role
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_role, is_verified, is_admin')
        .eq('id', session.user.id)
        .single()

      // Check admin access
      if (ADMIN_ROUTES.some(route => req.nextUrl.pathname.startsWith(route))) {
        if (!profile || !profile.is_admin) {
          // Special case for your admin email
          if (session.user.email !== 'romomahmoud@gmail.com') {
            return NextResponse.redirect(new URL('/', req.url))
          }
        }
      }

      // Check contributor access
      if (CONTRIBUTOR_ROUTES.some(route => req.nextUrl.pathname.startsWith(route))) {
        if (!profile || (profile.user_role !== 'contributor' && !profile.is_admin) || !profile.is_verified) {
          // Special case for your admin email
          if (session.user.email !== 'romomahmoud@gmail.com') {
            return NextResponse.redirect(new URL('/', req.url))
          }
        }
      }
    } else {
      // No session - redirect to login for protected routes
      if (AUTH_ROUTES.some(route => req.nextUrl.pathname.startsWith(route))) {
        return NextResponse.redirect(new URL('/auth/login', req.url))
      }
    }

    return res

  } catch (error) {
    console.error('Middleware error:', error)
    return res
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}