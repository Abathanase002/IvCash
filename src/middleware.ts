import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Admin routes - require admin or super_admin role
    if (path.startsWith('/admin')) {
      if (!token || !['admin', 'super_admin'].includes(token.role as string)) {
        return NextResponse.redirect(new URL('/login', req.url))
      }
    }

    // Student routes - require student role
    if (path.startsWith('/student')) {
      if (!token || token.role !== 'student') {
        return NextResponse.redirect(new URL('/login', req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: ['/admin/:path*', '/student/:path*'],
}

