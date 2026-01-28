import Link from 'next/link'

export default function UnauthorizedPage() {
  return (
    <div className="mx-auto max-w-2xl p-8 text-center">
      <h1 className="mb-4 text-4xl font-bold">403 - Unauthorized</h1>
      <p className="mb-8 text-lg text-gray-600 dark:text-gray-400">
        You don&apos;t have permission to access this page.
      </p>
      <div className="flex justify-center gap-4">
        <Link
          href="/"
          className="rounded-md bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
        >
          Go Home
        </Link>
        <Link
          href="/account"
          className="rounded-md border border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          View Account
        </Link>
      </div>
    </div>
  )
}
