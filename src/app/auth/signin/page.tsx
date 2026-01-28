import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/server/auth/auth'
import { SignInButton } from '@/components/signin-button'

export default async function SignInPage({
  searchParams,
}: {
  searchParams: { callbackUrl?: string }
}) {
  const session = await getServerSession(authOptions)

  if (session) {
    redirect(searchParams.callbackUrl || '/')
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md items-center justify-center p-8">
      <div className="w-full space-y-8 rounded-lg border border-gray-200 bg-white p-8 shadow dark:border-gray-700 dark:bg-gray-800">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Sign In</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Sign in with your Keycloak account
          </p>
        </div>
        <SignInButton callbackUrl={searchParams.callbackUrl} />
      </div>
    </div>
  )
}
