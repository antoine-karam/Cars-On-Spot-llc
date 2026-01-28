'use client'

import { signIn } from 'next-auth/react'

export function SignInButton({ callbackUrl }: { callbackUrl?: string }) {
  return (
    <button
      onClick={() =>
        signIn('keycloak', {
          callbackUrl: callbackUrl || '/',
        })
      }
      className="w-full rounded-md bg-blue-600 px-4 py-3 text-center font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    >
      Sign in with Keycloak
    </button>
  )
}
