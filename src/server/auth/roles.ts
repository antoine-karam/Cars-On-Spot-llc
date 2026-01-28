import { Session } from 'next-auth'

/**
 * Check if a session has a specific role
 */
export function hasRole(session: Session | null, role: string): boolean {
  if (!session?.user?.roles) {
    return false
  }
  return session.user.roles.includes(role)
}
