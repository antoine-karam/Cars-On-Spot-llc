import { NextResponse } from 'next/server'
import { z } from 'zod'
import { geocodeAddress } from '@/server/maps/googleMaps'

const geocodeSchema = z.object({
  address: z.string().min(5),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = geocodeSchema.parse(body)
    const result = await geocodeAddress(parsed.address)

    return NextResponse.json({
      address: result.formattedAddress,
      location: result.location,
    })
  } catch (error) {
    console.error('Geocode error', error)
    return NextResponse.json(
      { error: 'Unable to geocode address' },
      { status: 400 }
    )
  }
}
