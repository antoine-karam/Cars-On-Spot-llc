import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from './auth'

/**
 * Server-side guard to require authentication
 * Redirects to sign-in if not authenticated
 */
export async function requireAuth() {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect('/auth/signin')
  }
  return session
}

/**
 * Server-side guard to require a specific role
 * Redirects to unauthorized if role is missing
 */
export async function requireRole(role: string) {
  const session = await requireAuth()
  if (!session.user.roles.includes(role)) {
    redirect('/unauthorized')
  }
  return session
}

/**
 * Server-side guard to require any of the specified roles
 * Redirects to unauthorized if none of the roles are present
 */
export async function requireAnyRole(roles: string[]) {
  const session = await requireAuth()
  const hasRole = roles.some((role) => session.user.roles.includes(role))
  if (!hasRole) {
    redirect('/unauthorized')
  }
  return session
}

/**
 * Get current session (non-blocking, returns null if not authenticated)
 * Useful for pages that work for both authenticated and unauthenticated users
 */
export async function getSession() {
  return getServerSession(authOptions)
}
