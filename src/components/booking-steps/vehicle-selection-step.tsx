'use client'

import { useBookingStore } from '@/lib/bookingStore'

export function VehicleSelectionStep() {
  const {
    routeQuote,
    availableVehicles,
    selectedVehicleId,
    setSelectedVehicleId,
    setCurrentStep,
  } = useBookingStore()

  if (!routeQuote) {
    return (
      <div className="rounded-md border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500 dark:border-gray-600 dark:text-gray-400">
        Route quote unavailable. Please go back and try again.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-900/30 dark:text-gray-300">
        <div className="flex flex-wrap gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Distance
            </p>
            <p className="font-semibold">{routeQuote.distanceMiles} miles</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Estimated Duration
            </p>
            <p className="font-semibold">{routeQuote.durationMinutes} min</p>
          </div>
        </div>
      </div>

      {availableVehicles.length === 0 ? (
        <div className="rounded-md border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500 dark:border-gray-600 dark:text-gray-400">
          No vehicles match your criteria. Adjust your ride details and try again.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {availableVehicles.map((vehicle) => {
            const isSelected = vehicle.id === selectedVehicleId
            return (
              <button
                key={vehicle.id}
                type="button"
                onClick={() => setSelectedVehicleId(vehicle.id)}
                className={`rounded-lg border p-4 text-left transition ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 shadow-sm dark:border-blue-400 dark:bg-blue-500/10'
                    : 'border-gray-200 bg-white hover:border-blue-300 dark:border-gray-700 dark:bg-gray-800'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {vehicle.name}
                    </h3>
                    {vehicle.make && vehicle.model && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {vehicle.make} {vehicle.model}
                        {vehicle.year ? ` • ${vehicle.year}` : ''}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Estimated total
                    </p>
                    <p className="text-xl font-semibold text-gray-900 dark:text-white">
                      ${vehicle.totalPrice}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {vehicle.currency}
                    </p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {vehicle.capacity}
                    </p>
                    <p>Passengers</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {vehicle.luggageCapacity}
                    </p>
                    <p>Luggage</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {vehicle.childSeatCapable ? 'Yes' : 'No'}
                    </p>
                    <p>Child Seats</p>
                  </div>
                </div>
                <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                  Rate used: ${vehicle.rateUsed}/mile
                </p>
              </button>
            )
          })}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setCurrentStep(1)}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
        >
          Back to Ride Info
        </button>
        <button
          type="button"
          disabled={!selectedVehicleId}
          onClick={() => setCurrentStep(3)}
          className="rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          Continue to Confirmation
        </button>
      </div>
    </div>
  )
}
