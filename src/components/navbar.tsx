import { AuthButton } from './auth-button'

export function Navbar() {
  return (
    <nav className="border-b border-gray-200 dark:border-gray-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold">Limo Booking</h1>
          </div>
          <div className="flex items-center space-x-4">
            <a
              href="/"
              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            >
              Home
            </a>
            <a
              href="/account"
              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            >
              Account
            </a>
            <AuthButton />
          </div>
        </div>
      </div>
    </nav>
  )
}
