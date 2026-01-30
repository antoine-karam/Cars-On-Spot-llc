import { env } from '@/lib/env.server'

export type LatLng = {
  lat: number
  lng: number
}

export type RouteQuoteResult = {
  distanceMiles: string
  durationMinutes: number
  polyline: string
  provider: 'GOOGLE'
  providerRef?: string
}

type GoogleDirectionsResponse = {
  routes: Array<{
    overview_polyline?: { points: string }
    legs?: Array<{
      distance?: { value: number }
      duration?: { value: number }
    }>
  }>
  status: string
  error_message?: string
}

type GoogleGeocodeResponse = {
  results: Array<{
    formatted_address: string
    geometry: {
      location: {
        lat: number
        lng: number
      }
    }
  }>
  status: string
  error_message?: string
}

const GOOGLE_MAPS_BASE_URL = 'https://maps.googleapis.com/maps/api'

function buildLatLngParam(latLng: LatLng): string {
  return `${latLng.lat},${latLng.lng}`
}

export async function geocodeAddress(address: string): Promise<{
  location: LatLng
  formattedAddress: string
}> {
  const url = new URL(`${GOOGLE_MAPS_BASE_URL}/geocode/json`)
  url.searchParams.set('address', address)
  url.searchParams.set('key', env.GOOGLE_MAPS_API_KEY)

  const response = await fetch(url.toString())
  if (!response.ok) {
    throw new Error('Failed to fetch geocode response')
  }

  const data = (await response.json()) as GoogleGeocodeResponse
  if (data.status !== 'OK' || data.results.length === 0) {
    throw new Error(data.error_message || 'Unable to geocode address')
  }

  const [result] = data.results

  return {
    location: result.geometry.location,
    formattedAddress: result.formatted_address,
  }
}

export async function getRouteQuote(params: {
  pickup: LatLng
  dropoff: LatLng
  stops?: LatLng[]
}): Promise<RouteQuoteResult> {
  const url = new URL(`${GOOGLE_MAPS_BASE_URL}/directions/json`)
  url.searchParams.set('origin', buildLatLngParam(params.pickup))
  url.searchParams.set('destination', buildLatLngParam(params.dropoff))
  url.searchParams.set('key', env.GOOGLE_MAPS_API_KEY)

  if (params.stops && params.stops.length > 0) {
    const waypoints = params.stops.map(buildLatLngParam).join('|')
    url.searchParams.set('waypoints', waypoints)
  }

  const response = await fetch(url.toString())
  if (!response.ok) {
    throw new Error('Failed to fetch directions response')
  }

  const data = (await response.json()) as GoogleDirectionsResponse
  if (data.status !== 'OK' || data.routes.length === 0) {
    throw new Error(data.error_message || 'Unable to compute route')
  }

  const [route] = data.routes
  const totalMeters =
    route.legs?.reduce((sum, leg) => sum + (leg.distance?.value || 0), 0) ?? 0
  const totalSeconds =
    route.legs?.reduce((sum, leg) => sum + (leg.duration?.value || 0), 0) ?? 0

  const distanceMiles = totalMeters / 1609.34
  const durationMinutes = Math.max(1, Math.round(totalSeconds / 60))

  return {
    distanceMiles: distanceMiles.toFixed(2),
    durationMinutes,
    polyline: route.overview_polyline?.points || '',
    provider: 'GOOGLE',
  }
}
