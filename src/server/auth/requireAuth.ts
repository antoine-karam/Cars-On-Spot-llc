import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from './auth'

/**
 * Server function that returns the current session or redirects to sign-in
 */
export async function requireAuth() {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect('/auth/signin')
  }
  return session
}
