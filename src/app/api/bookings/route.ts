import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getCurrentCompany } from '@/server/tenant/getCurrentCompany'
import { getSession } from '@/server/auth/guards'
import { createBooking } from '@/server/bookings/createBooking'
import { bookingServiceTypes } from '@/lib/bookingTypes'

const latLngSchema = z.object({
  lat: z.number(),
  lng: z.number(),
})

const bookingStopSchema = z.object({
  address: z.string().min(3),
  location: latLngSchema,
})

const routeQuoteSchema = z.object({
  distanceMiles: z.string().min(1),
  durationMinutes: z.number().int().min(1),
  polyline: z.string().min(1),
  provider: z.enum(['GOOGLE', 'MAPBOX']),
})

const bookingSchema = z.object({
  serviceType: z.enum(bookingServiceTypes),
  pickupDateTimeUtc: z.string().datetime(),
  pickupAddress: z.string().min(5),
  pickupLocation: latLngSchema,
  dropoffAddress: z.string().min(5),
  dropoffLocation: latLngSchema,
  stops: z.array(bookingStopSchema).default([]),
  passengers: z.number().int().min(1),
  luggageCount: z.number().int().min(0),
  childSeatCount: z.number().int().min(0),
  selectedVehicleId: z.string().min(1),
  routeQuote: routeQuoteSchema,
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = bookingSchema.parse(body)
    const companyId = getCurrentCompany()
    const session = await getSession()

    const booking = await createBooking({
      companyId,
      createdByUserId: session?.user?.id ?? null,
      serviceType: parsed.serviceType,
      pickupDateTimeUtc: new Date(parsed.pickupDateTimeUtc),
      pickupAddress: parsed.pickupAddress,
      pickupLocation: parsed.pickupLocation,
      dropoffAddress: parsed.dropoffAddress,
      dropoffLocation: parsed.dropoffLocation,
      stops: parsed.stops,
      passengers: parsed.passengers,
      luggageCount: parsed.luggageCount,
      childSeatCount: parsed.childSeatCount,
      selectedVehicleId: parsed.selectedVehicleId,
      routeQuote: parsed.routeQuote,
    })

    return NextResponse.json(booking)
  } catch (error) {
    console.error('Booking create error', error)
    return NextResponse.json(
      { error: 'Unable to create booking' },
      { status: 400 }
    )
  }
}
