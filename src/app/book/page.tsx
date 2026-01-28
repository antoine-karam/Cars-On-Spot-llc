'use client'

import { BookingWizard } from '@/components/booking-wizard'

export default function BookPage() {
  return (
    <div className="mx-auto max-w-4xl p-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Book a Ride</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Complete the steps below to book your limousine service
        </p>
      </div>

      <BookingWizard />
    </div>
  )
}
