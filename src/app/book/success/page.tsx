import { db } from '@/server/db'
import { getCurrentCompany } from '@/server/tenant/getCurrentCompany'

type SearchParams = {
  bookingId?: string
}

export default async function BookingSuccessPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const bookingId = searchParams.bookingId
  const companyId = getCurrentCompany()

  if (!bookingId) {
    return (
      <div className="mx-auto max-w-3xl p-8">
        <h1 className="text-2xl font-semibold">Booking Complete</h1>
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          We could not find a booking ID. Please check your confirmation email.
        </p>
      </div>
    )
  }

  const booking = await db.booking.findFirst({
    where: {
      id: bookingId,
      companyId,
    },
    include: {
      stops: {
        orderBy: { stopOrder: 'asc' },
      },
      routeQuote: true,
      priceSnapshot: {
        include: { vehicle: true },
      },
    },
  })

  if (!booking) {
    return (
      <div className="mx-auto max-w-3xl p-8">
        <h1 className="text-2xl font-semibold">Booking Complete</h1>
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          We could not find that booking. Please contact support if you need
          help.
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl p-8">
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Booking Confirmed
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Your booking has been created successfully. Reference ID: {booking.id}
        </p>

        <div className="mt-6 space-y-4 text-sm text-gray-700 dark:text-gray-300">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Pickup
            </p>
            <p className="font-medium">{booking.pickupAddress}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {booking.pickupDateTimeUtc.toLocaleString()}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Dropoff
            </p>
            <p className="font-medium">{booking.dropoffAddress}</p>
          </div>

          {booking.stops.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Stops
              </p>
              <ul className="mt-2 space-y-1">
                {booking.stops.map((stop) => (
                  <li key={stop.id} className="text-sm">
                    {stop.stopOrder}. {stop.address}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {booking.routeQuote && (
            <div className="rounded-md border border-gray-200 bg-gray-50 p-4 text-sm dark:border-gray-700 dark:bg-gray-900/30">
              <div className="flex flex-wrap gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Distance
                  </p>
                  <p className="font-semibold">
                    {booking.routeQuote.distanceMiles.toString()} miles
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Duration
                  </p>
                  <p className="font-semibold">
                    {booking.routeQuote.durationMinutes} minutes
                  </p>
                </div>
              </div>
            </div>
          )}

          {booking.priceSnapshot && (
            <div className="rounded-md border border-gray-200 bg-gray-50 p-4 text-sm dark:border-gray-700 dark:bg-gray-900/30">
              <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Pricing
              </p>
              <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-medium">
                    Vehicle: {booking.priceSnapshot.vehicle.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Rate used: ${booking.priceSnapshot.rateUsed.toString()}/mile
                  </p>
                </div>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  Total: ${booking.priceSnapshot.total.toString()}{' '}
                  {booking.priceSnapshot.currency}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
