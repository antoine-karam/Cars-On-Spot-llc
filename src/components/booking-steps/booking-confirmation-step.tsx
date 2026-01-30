'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useBookingStore } from '@/lib/bookingStore'
import { bookingServiceTypeLabels } from '@/lib/bookingTypes'

export function BookingConfirmationStep() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    serviceType,
    pickupDateTime,
    pickupAddress,
    pickupLat,
    pickupLng,
    dropoffAddress,
    dropoffLat,
    dropoffLng,
    stops,
    passengers,
    luggageCount,
    childSeatCount,
    routeQuote,
    selectedVehicleId,
    availableVehicles,
    setCurrentStep,
    reset,
  } = useBookingStore()

  const selectedVehicle = availableVehicles.find(
    (vehicle) => vehicle.id === selectedVehicleId
  )

  const handleConfirm = async () => {
    if (
      !serviceType ||
      !pickupDateTime ||
      !routeQuote ||
      !selectedVehicleId ||
      pickupLat === undefined ||
      pickupLng === undefined ||
      dropoffLat === undefined ||
      dropoffLng === undefined ||
      stops.some((stop) => stop.lat === undefined || stop.lng === undefined)
    ) {
      setError('Missing booking data. Please review your ride details.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceType,
          pickupDateTimeUtc: new Date(pickupDateTime).toISOString(),
          pickupAddress,
          pickupLocation: { lat: pickupLat, lng: pickupLng },
          dropoffAddress,
          dropoffLocation: { lat: dropoffLat, lng: dropoffLng },
          stops: stops.map((stop) => ({
            address: stop.address,
            location: {
              lat: stop.lat as number,
              lng: stop.lng as number,
            },
          })),
          passengers,
          luggageCount,
          childSeatCount,
          selectedVehicleId,
          routeQuote,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create booking')
      }

      const data = (await response.json()) as { bookingId: string }
      reset()
      router.push(`/book/success?bookingId=${data.bookingId}`)
    } catch (submitError) {
      console.error(submitError)
      setError('Unable to complete booking. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Ride Summary
        </h3>
        <div className="mt-4 grid grid-cols-1 gap-4 text-sm text-gray-700 dark:text-gray-300 md:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Service Type
            </p>
            <p className="font-medium">
              {serviceType ? bookingServiceTypeLabels[serviceType] : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Pickup Time
            </p>
            <p className="font-medium">
              {pickupDateTime ? new Date(pickupDateTime).toLocaleString() : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Pickup Address
            </p>
            <p className="font-medium">{pickupAddress}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Dropoff Address
            </p>
            <p className="font-medium">{dropoffAddress}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Passengers
            </p>
            <p className="font-medium">
              {passengers} • Luggage {luggageCount} • Child Seats {childSeatCount}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Stops
            </p>
            <p className="font-medium">
              {stops.length > 0 ? stops.map((stop) => stop.address).join(', ') : 'None'}
            </p>
          </div>
        </div>
      </div>

      {selectedVehicle && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-5 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-900/30 dark:text-gray-300">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Selected Vehicle
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {selectedVehicle.name}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Estimated Total
              </p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                ${selectedVehicle.totalPrice}
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 dark:border-red-700 dark:bg-red-900/20 dark:text-red-200">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setCurrentStep(2)}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
        >
          Back to Vehicle Selection
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={isSubmitting}
          className="rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          {isSubmitting ? 'Confirming...' : 'Confirm Booking'}
        </button>
      </div>
    </div>
  )
}
