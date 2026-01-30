import { BookingStatus, RouteProvider, ServiceType } from '@prisma/client'
import { db } from '@/server/db'
import { calculatePerMilePrice } from '@/server/bookings/pricing'
import type { BookingServiceType, RouteQuote, LatLng } from '@/lib/bookingTypes'

const serviceTypeMap: Record<BookingServiceType, ServiceType> = {
  TO_AIRPORT: ServiceType.AIRPORT_TRANSFER,
  FROM_AIRPORT: ServiceType.AIRPORT_TRANSFER,
  POINT_TO_POINT: ServiceType.POINT_TO_POINT,
  HOURLY: ServiceType.HOURLY,
}

type BookingStopInput = {
  address: string
  location: LatLng
}

export async function createBooking(params: {
  companyId: string
  createdByUserId: string
  serviceType: BookingServiceType
  pickupDateTimeUtc: Date
  pickupAddress: string
  pickupLocation: LatLng
  dropoffAddress: string
  dropoffLocation: LatLng
  stops: BookingStopInput[]
  passengers: number
  luggageCount: number
  childSeatCount: number
  selectedVehicleId: string
  routeQuote: RouteQuote
}): Promise<{ bookingId: string }> {
  const vehicle = await db.vehicle.findFirst({
    where: {
      id: params.selectedVehicleId,
      companyId: params.companyId,
      active: true,
      deletedAt: null,
    },
    include: {
      rates: {
        where: {
          rateType: 'PER_MILE',
          effectiveTo: null,
        },
        take: 1,
        orderBy: {
          effectiveFrom: 'desc',
        },
      },
    },
  })

  if (!vehicle || !vehicle.rates[0]?.pricePerMile) {
    throw new Error('Selected vehicle is no longer available')
  }

  const pricing = calculatePerMilePrice({
    distanceMiles: params.routeQuote.distanceMiles,
    ratePerMile: vehicle.rates[0].pricePerMile,
  })

  const booking = await db.$transaction(async tx => {
    const createdBooking = await tx.booking.create({
      data: {
        companyId: params.companyId,
        createdByUserId: params.createdByUserId ?? null,
        serviceType: serviceTypeMap[params.serviceType],
        pickupDateTimeUtc: params.pickupDateTimeUtc,
        pickupAddress: params.pickupAddress,
        pickupLat: params.pickupLocation.lat,
        pickupLng: params.pickupLocation.lng,
        dropoffAddress: params.dropoffAddress,
        dropoffLat: params.dropoffLocation.lat,
        dropoffLng: params.dropoffLocation.lng,
        passengers: params.passengers,
        luggageCount: params.luggageCount,
        childSeatCount: params.childSeatCount,
        status: BookingStatus.PENDING_PAYMENT,
      },
    })

    if (params.stops.length > 0) {
      await tx.bookingStop.createMany({
        data: params.stops.map((stop, index) => ({
          bookingId: createdBooking.id,
          stopOrder: index + 1,
          address: stop.address,
          lat: stop.location.lat,
          lng: stop.location.lng,
        })),
      })
    }

    await tx.routeQuote.create({
      data: {
        bookingId: createdBooking.id,
        provider:
          RouteProvider[
            params.routeQuote.provider as keyof typeof RouteProvider
          ],
        distanceMiles: params.routeQuote.distanceMiles,
        durationMinutes: params.routeQuote.durationMinutes,
        polyline: params.routeQuote.polyline,
      },
    })

    await tx.bookingPriceSnapshot.create({
      data: {
        bookingId: createdBooking.id,
        vehicleId: vehicle.id,
        rateUsed: pricing.rateUsed,
        baseFee: pricing.baseFee,
        distanceFee: pricing.distanceFee,
        stopsFee: pricing.stopsFee,
        surchargesFee: pricing.surchargesFee,
        total: pricing.total,
        currency: pricing.currency,
      },
    })

    return createdBooking
  })

  return { bookingId: booking.id }
}
