import { RateType } from '@prisma/client'
import { db } from '@/server/db'
import { calculatePerMilePrice } from '@/server/bookings/pricing'

export type AvailableVehicleResult = {
  id: string
  name: string
  make?: string | null
  model?: string | null
  year?: number | null
  capacity: number
  luggageCapacity: number
  childSeatCapable: boolean
  rateUsed: string
  totalPrice: string
  currency: string
}

export async function getAvailableVehicles(params: {
  companyId: string
  pickupDateTimeUtc: Date
  passengers: number
  luggageCount: number
  childSeatCount: number
  distanceMiles: string
}): Promise<AvailableVehicleResult[]> {
  const vehicles = await db.vehicle.findMany({
    where: {
      companyId: params.companyId,
      active: true,
      deletedAt: null,
      capacity: {
        gte: params.passengers,
      },
      luggageCapacity: {
        gte: params.luggageCount,
      },
      ...(params.childSeatCount > 0 ? { childSeatCapable: true } : {}),
    },
    include: {
      rates: {
        where: {
          rateType: RateType.PER_MILE,
          effectiveTo: null,
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

  // TODO: filter out vehicles with overlapping bookings once availability logic exists.

  return vehicles.flatMap((vehicle) => {
    const currentRate = vehicle.rates[0]
    if (!currentRate?.pricePerMile) {
      return []
    }

    const pricing = calculatePerMilePrice({
      distanceMiles: params.distanceMiles,
      ratePerMile: currentRate.pricePerMile,
    })

    return [
      {
        id: vehicle.id,
        name: vehicle.name,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        capacity: vehicle.capacity,
        luggageCapacity: vehicle.luggageCapacity,
        childSeatCapable: vehicle.childSeatCapable,
        rateUsed: pricing.rateUsed.toFixed(2),
        totalPrice: pricing.total.toFixed(2),
        currency: pricing.currency,
      },
    ]
  })
}
