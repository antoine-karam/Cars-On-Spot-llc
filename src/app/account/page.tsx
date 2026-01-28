import { requireAuth } from '@/server/auth/requireAuth'

export default async function AccountPage() {
  const session = await requireAuth()

  return (
    <div className="mx-auto max-w-4xl p-8">
      <h1 className="mb-6 text-3xl font-bold">Account</h1>
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow dark:border-gray-700 dark:bg-gray-800">
        <div className="space-y-4">
          <div className="rounded-md bg-gray-50 p-4 dark:bg-gray-900">
            <h2 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
              Session Summary
            </h2>
            <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <p>Email: {session.user.email}</p>
              <p>Name: {session.user.name || 'Not provided'}</p>
              <p>IDP Subject: {session.user.idpSubject}</p>
              <p>Roles: {session.user.roles.join(', ') || 'None'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
