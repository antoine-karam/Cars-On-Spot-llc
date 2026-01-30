import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getRouteQuote } from '@/server/maps/googleMaps'

const latLngSchema = z.object({
  lat: z.number(),
  lng: z.number(),
})

const routeQuoteSchema = z.object({
  pickup: latLngSchema,
  dropoff: latLngSchema,
  stops: z.array(latLngSchema).optional().default([]),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = routeQuoteSchema.parse(body)
    const quote = await getRouteQuote(parsed)

    return NextResponse.json(quote)
  } catch (error) {
    console.error('Route quote error', error)
    return NextResponse.json(
      { error: 'Unable to compute route quote' },
      { status: 400 }
    )
  }
}
