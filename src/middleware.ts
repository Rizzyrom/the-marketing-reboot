import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Protected routes that require specific roles
const CONTRIBUTOR_ROUTES = ['/cms']
const AUTH_ROUTES = ['/dashboard', '/profile/edit', '/post/new']

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Refresh session if exists
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session) {
    // Get user profile with role
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_role, is_verified')
      .eq('id', session.user.id)
      .single()

    // Refresh session if expired
    const { data: { session: refreshedSession } } = await supabase.auth.refreshSession()
    if (!refreshedSession) {
      // If refresh failed and trying to access protected route, redirect to login
      if (AUTH_ROUTES.some(route => req.nextUrl.pathname.startsWith(route))) {
        return NextResponse.redirect(new URL('/auth/login', req.url))
      }
    }

    // Check role-based access
    if (CONTRIBUTOR_ROUTES.some(route => req.nextUrl.pathname.startsWith(route))) {
      if (!profile || profile.user_role !== 'contributor' || !profile.is_verified) {
        return NextResponse.redirect(new URL('/', req.url))
      }
    }
  } else {
    // No session - redirect to login for protected routes
    if (AUTH_ROUTES.some(route => req.nextUrl.pathname.startsWith(route))) {
      return NextResponse.redirect(new URL('/auth/login', req.url))
    }
  }

  return res
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}