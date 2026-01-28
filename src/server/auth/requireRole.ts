import { redirect } from 'next/navigation'
import { requireAuth } from './requireAuth'
import { hasRole } from './roles'

/**
 * Server function that requires a specific role
 * Redirects to /unauthorized if the role is missing
 */
export async function requireRole(role: string) {
  const session = await requireAuth()
  if (!hasRole(session, role)) {
    redirect('/unauthorized')
  }
  return session
}
