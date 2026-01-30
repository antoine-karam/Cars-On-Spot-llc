export const bookingServiceTypes = [
  'TO_AIRPORT',
  'FROM_AIRPORT',
  'POINT_TO_POINT',
  'HOURLY',
] as const

export type BookingServiceType = (typeof bookingServiceTypes)[number]

export const bookingServiceTypeLabels: Record<BookingServiceType, string> = {
  TO_AIRPORT: 'To Airport',
  FROM_AIRPORT: 'From Airport',
  POINT_TO_POINT: 'Point to Point',
  HOURLY: 'Hourly',
}

export type RouteProvider = 'GOOGLE' | 'MAPBOX'

export type LatLng = {
  lat: number
  lng: number
}

export type RouteQuote = {
  distanceMiles: string
  durationMinutes: number
  polyline: string
  provider: RouteProvider
}

export type AvailableVehicle = {
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
