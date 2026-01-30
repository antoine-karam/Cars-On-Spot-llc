import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getCurrentCompany } from '@/server/tenant/getCurrentCompany'
import { getAvailableVehicles } from '@/server/vehicles/getAvailableVehicles'

const availableVehiclesSchema = z.object({
  pickupDateTimeUtc: z.string().datetime(),
  passengers: z.number().int().min(1),
  luggageCount: z.number().int().min(0),
  childSeatCount: z.number().int().min(0),
  distanceMiles: z.string().min(1),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = availableVehiclesSchema.parse(body)
    const companyId = getCurrentCompany()

    const vehicles = await getAvailableVehicles({
      companyId,
      pickupDateTimeUtc: new Date(parsed.pickupDateTimeUtc),
      passengers: parsed.passengers,
      luggageCount: parsed.luggageCount,
      childSeatCount: parsed.childSeatCount,
      distanceMiles: parsed.distanceMiles,
    })

    return NextResponse.json({ vehicles })
  } catch (error) {
    console.error('Available vehicles error', error)
    return NextResponse.json(
      { error: 'Unable to load available vehicles' },
      { status: 400 }
    )
  }
}
