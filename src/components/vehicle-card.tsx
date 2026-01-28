import { Vehicle, VehicleRate } from '@prisma/client'
import Link from 'next/link'

type VehicleCardProps = {
  vehicle: Vehicle
  currentRate: VehicleRate | null
}

export function VehicleCard({ vehicle, currentRate }: VehicleCardProps) {
  const formatPrice = (rate: VehicleRate | null) => {
    if (!rate) return 'N/A'
    if (rate.pricePerMile) {
      return `$${rate.pricePerMile.toString()}/mile`
    }
    if (rate.pricePerHour) {
      return `$${rate.pricePerHour.toString()}/hour`
    }
    if (rate.flatRate) {
      return `$${rate.flatRate.toString()}`
    }
    return 'N/A'
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow transition-shadow hover:shadow-lg dark:border-gray-700 dark:bg-gray-800">
      <div className="p-6">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {vehicle.name}
            </h3>
            {vehicle.make && vehicle.model && (
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {vehicle.make} {vehicle.model}
                {vehicle.year && ` • ${vehicle.year}`}
              </p>
            )}
          </div>
          {vehicle.active ? (
            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
              Active
            </span>
          ) : (
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-200">
              Inactive
            </span>
          )}
        </div>

        <div className="mb-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Capacity:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {vehicle.capacity} passengers
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Luggage:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {vehicle.luggageCapacity} pieces
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Child Seats:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {vehicle.childSeatCapable ? 'Yes' : 'No'}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Current Rate:</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {formatPrice(currentRate)}
            </span>
          </div>
        </div>

        <div className="mt-6 flex gap-2">
          <Link
            href={`/fleet/${vehicle.id}`}
            className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  )
}
