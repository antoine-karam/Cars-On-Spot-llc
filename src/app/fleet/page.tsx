import { db } from '@/server/db'
import { getCurrentCompany } from '@/server/tenant/getCurrentCompany'
import { RateType } from '@prisma/client'
import { VehicleCard } from '@/components/vehicle-card'
import { FleetFilters } from '@/components/fleet-filters'

type SearchParams = {
  capacity?: string
  childSeatCapable?: string
}

export default async function FleetPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const companyId = getCurrentCompany()

  // Parse filters from searchParams
  const capacityFilter = searchParams.capacity ? parseInt(searchParams.capacity, 10) : undefined
  const childSeatCapableFilter =
    searchParams.childSeatCapable === 'true' ? true : searchParams.childSeatCapable === 'false' ? false : undefined

  // Build where clause
  const where: any = {
    companyId,
    deletedAt: null, // Only active vehicles
  }

  if (capacityFilter !== undefined) {
    where.capacity = capacityFilter
  }

  if (childSeatCapableFilter !== undefined) {
    where.childSeatCapable = childSeatCapableFilter
  }

  // Fetch vehicles with current rate
  const vehicles = await db.vehicle.findMany({
    where,
    include: {
      rates: {
        where: {
          rateType: RateType.PER_MILE,
          effectiveTo: null, // Current rate
        },
        take: 1,
        orderBy: {
          effectiveFrom: 'desc',
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  })

  return (
    <div className="mx-auto max-w-7xl p-8">
      <div className="mb-8">
        <h1 className="mb-4 text-3xl font-bold">Fleet Management</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage and view your vehicle fleet
        </p>
      </div>

      <FleetFilters
        currentCapacity={capacityFilter}
        currentChildSeatCapable={childSeatCapableFilter}
      />

      {vehicles.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center shadow dark:border-gray-700 dark:bg-gray-800">
          <p className="text-gray-500 dark:text-gray-400">
            No vehicles found matching your filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {vehicles.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              currentRate={vehicle.rates[0] || null}
            />
          ))}
        </div>
      )}
    </div>
  )
}
