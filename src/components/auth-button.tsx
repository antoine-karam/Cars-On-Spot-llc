'use client'

import { signIn, signOut, useSession } from 'next-auth/react'

export function AuthButton() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <div className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
        Loading...
      </div>
    )
  }

  if (session?.user) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {session.user.name || session.user.email}
          {session.user.roles.length > 0 && (
            <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
              ({session.user.roles.join(', ')})
            </span>
          )}
        </span>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          Sign Out
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => signIn('keycloak', { callbackUrl: '/' })}
      className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    >
      Sign In
    </button>
  )
}
