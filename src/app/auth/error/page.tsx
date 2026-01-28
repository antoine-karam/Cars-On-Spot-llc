import Link from 'next/link'

export default function AuthErrorPage({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  const errorMessages: Record<string, string> = {
    Configuration: 'There is a problem with the server configuration.',
    AccessDenied: 'You do not have permission to sign in.',
    Verification: 'The verification token has expired or has already been used.',
    Default: 'An error occurred during authentication.',
  }

  const error = searchParams.error || 'Default'
  const message = errorMessages[error] || errorMessages.Default

  return (
    <div className="mx-auto flex min-h-screen max-w-md items-center justify-center p-8">
      <div className="w-full space-y-6 rounded-lg border border-red-200 bg-white p-8 shadow dark:border-red-800 dark:bg-gray-800">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 dark:text-red-400">
            Authentication Error
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">{message}</p>
        </div>
        <div className="flex justify-center gap-4">
          <Link
            href="/auth/signin"
            className="rounded-md bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700"
          >
            Try Again
          </Link>
          <Link
            href="/"
            className="rounded-md border border-gray-300 bg-white px-6 py-2 font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  )
}
