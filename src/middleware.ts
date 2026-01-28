import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // /admin requires admin role
    if (path.startsWith('/admin')) {
      if (!token?.roles?.includes('admin')) {
        return NextResponse.redirect(new URL('/unauthorized', req.url))
      }
    }

    // /driver requires driver role
    if (path.startsWith('/driver')) {
      if (!token?.roles?.includes('driver')) {
        return NextResponse.redirect(new URL('/unauthorized', req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname

        // Public routes that don't require auth
        if (
          path === '/' ||
          path.startsWith('/api/auth') ||
          path.startsWith('/auth') ||
          path.startsWith('/unauthorized')
        ) {
          return true
        }

        // Protected routes require token
        if (path.startsWith('/admin') || path.startsWith('/driver') || path.startsWith('/account')) {
          return !!token
        }

        // Allow all other routes
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
