import { Prisma } from '@prisma/client'

export type PriceBreakdown = {
  rateUsed: Prisma.Decimal
  baseFee: Prisma.Decimal
  distanceFee: Prisma.Decimal
  stopsFee: Prisma.Decimal
  surchargesFee: Prisma.Decimal
  total: Prisma.Decimal
  currency: string
}

export function calculatePerMilePrice(params: {
  distanceMiles: string
  ratePerMile: Prisma.Decimal
  currency?: string
}): PriceBreakdown {
  const distance = new Prisma.Decimal(params.distanceMiles)
  const baseFee = new Prisma.Decimal(0)
  const distanceFee = distance.mul(params.ratePerMile)
  const stopsFee = new Prisma.Decimal(0)
  const surchargesFee = new Prisma.Decimal(0)
  const total = baseFee.add(distanceFee).add(stopsFee).add(surchargesFee)

  return {
    rateUsed: params.ratePerMile,
    baseFee,
    distanceFee,
    stopsFee,
    surchargesFee,
    total,
    currency: params.currency ?? 'USD',
  }
}
