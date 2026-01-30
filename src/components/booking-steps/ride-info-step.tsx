'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useBookingStore } from '@/lib/bookingStore'
import { env } from '@/lib/env.client'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  bookingServiceTypeLabels,
  bookingServiceTypes,
  type BookingServiceType,
  type AvailableVehicle,
  type LatLng,
} from '@/lib/bookingTypes'

const rideInfoSchema = z.object({
  serviceType: z.enum(bookingServiceTypes, {
    required_error: 'Please select a service type',
  }),
  pickupDateTime: z.string().min(1, 'Pickup date and time is required'),
  pickupAddress: z.string().min(5, 'Pickup address must be at least 5 characters'),
  dropoffAddress: z.string().min(5, 'Dropoff address must be at least 5 characters'),
  passengers: z.coerce.number().int().min(1, 'At least 1 passenger is required').max(20),
  luggageCount: z.coerce.number().int().min(0, 'Luggage count cannot be negative'),
  childSeatCount: z.coerce.number().int().min(0, 'Child seat count cannot be negative'),
})

type RideInfoFormData = z.infer<typeof rideInfoSchema>

export function RideInfoStep() {
  const {
    serviceType,
    pickupDateTime,
    pickupAddress,
    pickupLat,
    pickupLng,
    dropoffAddress,
    dropoffLat,
    dropoffLng,
    stops,
    passengers,
    luggageCount,
    childSeatCount,
    setServiceType,
    setPickupDateTime,
    setPickupAddress,
    setDropoffAddress,
    addStop,
    removeStop,
    updateStop,
    setPassengers,
    setLuggageCount,
    setChildSeatCount,
    setRouteQuote,
    setAvailableVehicles,
    setSelectedVehicleId,
    setCurrentStep,
  } = useBookingStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<RideInfoFormData>({
    resolver: zodResolver(rideInfoSchema),
    defaultValues: {
      serviceType: serviceType || undefined,
      pickupDateTime: pickupDateTime || '',
      pickupAddress: pickupAddress || '',
      dropoffAddress: dropoffAddress || '',
      passengers: passengers,
      luggageCount: luggageCount,
      childSeatCount: childSeatCount,
    },
  })

  const [newStopAddress, setNewStopAddress] = useState('')
  const [newStopLocation, setNewStopLocation] = useState<LatLng | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isMapsReady, setIsMapsReady] = useState(false)

  const pickupInputRef = useRef<HTMLInputElement | null>(null)
  const dropoffInputRef = useRef<HTMLInputElement | null>(null)
  const stopInputRef = useRef<HTMLInputElement | null>(null)
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<google.maps.Map | null>(null)
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null)

  const pickupRegister = useMemo(
    () =>
      register('pickupAddress', {
        onChange: (event) => {
          setPickupAddress(event.target.value)
        },
      }),
    [register, setPickupAddress]
  )

  const dropoffRegister = useMemo(
    () =>
      register('dropoffAddress', {
        onChange: (event) => {
          setDropoffAddress(event.target.value)
        },
      }),
    [register, setDropoffAddress]
  )

  const loadGoogleMaps = () =>
    new Promise<void>((resolve, reject) => {
      if (typeof window === 'undefined') {
        resolve()
        return
      }

      if (window.google?.maps?.places) {
        resolve()
        return
      }

      const existingScript = document.querySelector<HTMLScriptElement>(
        'script[data-google-maps="true"]'
      )

      if (existingScript) {
        existingScript.addEventListener('load', () => resolve())
        existingScript.addEventListener('error', () =>
          reject(new Error('Failed to load Google Maps'))
        )
        return
      }

      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`
      script.async = true
      script.defer = true
      script.dataset.googleMaps = 'true'
      script.addEventListener('load', () => resolve())
      script.addEventListener('error', () =>
        reject(new Error('Failed to load Google Maps'))
      )
      document.head.appendChild(script)
    })

  useEffect(() => {
    let isMounted = true

    loadGoogleMaps()
      .then(() => {
        if (isMounted) {
          setIsMapsReady(true)
        }
      })
      .catch((error) => {
        console.error(error)
      })

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (!isMapsReady || !mapContainerRef.current) {
      return
    }

    if (!mapRef.current) {
      mapRef.current = new google.maps.Map(mapContainerRef.current, {
        center: { lat: 39.8283, lng: -98.5795 },
        zoom: 4,
        mapTypeControl: false,
        streetViewControl: false,
      })
      directionsRendererRef.current = new google.maps.DirectionsRenderer({
        map: mapRef.current,
        suppressMarkers: false,
      })
    }
  }, [isMapsReady])

  useEffect(() => {
    if (!isMapsReady) {
      return
    }

    if (pickupInputRef.current) {
      const autocomplete = new google.maps.places.Autocomplete(
        pickupInputRef.current,
        { fields: ['formatted_address', 'geometry'] }
      )
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace()
        const location = place.geometry?.location
        if (!place.formatted_address || !location) {
          return
        }
        const address = place.formatted_address
        setValue('pickupAddress', address, { shouldValidate: true })
        setPickupAddress(address, location.lat(), location.lng())
      })
    }

    if (dropoffInputRef.current) {
      const autocomplete = new google.maps.places.Autocomplete(
        dropoffInputRef.current,
        { fields: ['formatted_address', 'geometry'] }
      )
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace()
        const location = place.geometry?.location
        if (!place.formatted_address || !location) {
          return
        }
        const address = place.formatted_address
        setValue('dropoffAddress', address, { shouldValidate: true })
        setDropoffAddress(address, location.lat(), location.lng())
      })
    }

    if (stopInputRef.current) {
      const autocomplete = new google.maps.places.Autocomplete(stopInputRef.current, {
        fields: ['formatted_address', 'geometry'],
      })
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace()
        const location = place.geometry?.location
        if (!place.formatted_address || !location) {
          return
        }
        const address = place.formatted_address
        setNewStopAddress(address)
        setNewStopLocation({ lat: location.lat(), lng: location.lng() })
      })
    }
  }, [isMapsReady, setDropoffAddress, setPickupAddress, setValue])

  useEffect(() => {
    if (!mapRef.current || !directionsRendererRef.current) {
      return
    }

    if (!pickupLat || !pickupLng || !dropoffLat || !dropoffLng) {
      directionsRendererRef.current.setDirections({ routes: [] } as never)
      return
    }

    const directionsService = new google.maps.DirectionsService()
    const waypoints = stops
      .filter((stop) => stop.lat !== undefined && stop.lng !== undefined)
      .map((stop) => ({
        location: { lat: stop.lat as number, lng: stop.lng as number },
        stopover: true,
      }))

    directionsService.route(
      {
        origin: { lat: pickupLat, lng: pickupLng },
        destination: { lat: dropoffLat, lng: dropoffLng },
        waypoints,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          directionsRendererRef.current?.setDirections(result)
        }
      }
    )
  }, [dropoffLat, dropoffLng, pickupLat, pickupLng, stops])

  const geocodeAddress = async (address: string) => {
    const response = await fetch('/api/geocode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address }),
    })

    if (!response.ok) {
      throw new Error('Geocoding failed')
    }

    return (await response.json()) as {
      address: string
      location: { lat: number; lng: number }
    }
  }

  const onSubmit = async (data: RideInfoFormData) => {
    setIsLoading(true)
    setErrorMessage(null)
    // Update store with form data
    try {
      setServiceType(data.serviceType)
      setPickupDateTime(data.pickupDateTime)
      setPickupAddress(data.pickupAddress)
      setDropoffAddress(data.dropoffAddress)
      setPassengers(data.passengers)
      setLuggageCount(data.luggageCount)
      setChildSeatCount(data.childSeatCount)

      const pickupResult =
        pickupLat && pickupLng
          ? { address: data.pickupAddress, location: { lat: pickupLat, lng: pickupLng } }
          : await geocodeAddress(data.pickupAddress)
      const dropoffResult =
        dropoffLat && dropoffLng
          ? { address: data.dropoffAddress, location: { lat: dropoffLat, lng: dropoffLng } }
          : await geocodeAddress(data.dropoffAddress)

      setPickupAddress(
        pickupResult.address,
        pickupResult.location.lat,
        pickupResult.location.lng
      )
      setDropoffAddress(
        dropoffResult.address,
        dropoffResult.location.lat,
        dropoffResult.location.lng
      )
      setValue('pickupAddress', pickupResult.address)
      setValue('dropoffAddress', dropoffResult.address)

      const stopResults = await Promise.all(
        stops.map(async (stop) => {
          if (stop.lat !== undefined && stop.lng !== undefined) {
            return {
              address: stop.address,
              location: { lat: stop.lat, lng: stop.lng },
            }
          }
          return geocodeAddress(stop.address)
        })
      )

      stopResults.forEach((result, index) => {
        const stop = stops[index]
        if (!stop) return
        updateStop(stop.id, {
          address: result.address,
          lat: result.location.lat,
          lng: result.location.lng,
        })
      })

      const routeResponse = await fetch('/api/route-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pickup: pickupResult.location,
          dropoff: dropoffResult.location,
          stops: stopResults.map((result) => result.location),
        }),
      })

      if (!routeResponse.ok) {
        throw new Error('Route quote failed')
      }

      const routeQuote = await routeResponse.json()
      setRouteQuote(routeQuote)

      const pickupDateTimeUtc = new Date(data.pickupDateTime).toISOString()
      const vehiclesResponse = await fetch('/api/available-vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pickupDateTimeUtc,
          passengers: data.passengers,
          luggageCount: data.luggageCount,
          childSeatCount: data.childSeatCount,
          distanceMiles: routeQuote.distanceMiles,
        }),
      })

      if (!vehiclesResponse.ok) {
        throw new Error('Vehicle availability failed')
      }

      const vehiclesPayload = (await vehiclesResponse.json()) as {
        vehicles: AvailableVehicle[]
      }
      setAvailableVehicles(vehiclesPayload.vehicles)
      setSelectedVehicleId(null)

      // Move to next step
      setCurrentStep(2)
    } catch (error) {
      console.error(error)
      setErrorMessage(
        'Unable to calculate route or load vehicles. Please review your details and try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddStop = () => {
    if (newStopAddress.trim().length < 5) {
      return
    }

    const stop: typeof stops[0] = {
      id: `stop-${Date.now()}`,
      address: newStopAddress.trim(),
      lat: newStopLocation?.lat,
      lng: newStopLocation?.lng,
    }

    addStop(stop)
    setNewStopAddress('')
    setNewStopLocation(null)
  }

  const handleRemoveStop = (stopId: string) => {
    removeStop(stopId)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Service Type */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Service Type <span className="text-red-500">*</span>
        </label>
        <select
          {...register('serviceType')}
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400"
        >
          <option value="">Select service type</option>
          {bookingServiceTypes.map((type) => (
            <option key={type} value={type}>
              {bookingServiceTypeLabels[type as BookingServiceType]}
            </option>
          ))}
        </select>
        {errors.serviceType && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.serviceType.message}
          </p>
        )}
      </div>

      {/* Pickup Date & Time */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Pickup Date & Time <span className="text-red-500">*</span>
        </label>
        <input
          type="datetime-local"
          {...register('pickupDateTime')}
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400"
        />
        {errors.pickupDateTime && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.pickupDateTime.message}
          </p>
        )}
      </div>

      {/* Pickup Address */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Pickup Address <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          {...pickupRegister}
          ref={(element) => {
            pickupRegister.ref(element)
            pickupInputRef.current = element
          }}
          placeholder="Enter pickup address"
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400"
        />
        {errors.pickupAddress && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.pickupAddress.message}
          </p>
        )}
      </div>

      {/* Dropoff Address */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Dropoff Address <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          {...dropoffRegister}
          ref={(element) => {
            dropoffRegister.ref(element)
            dropoffInputRef.current = element
          }}
          placeholder="Enter dropoff address"
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400"
        />
        {errors.dropoffAddress && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.dropoffAddress.message}
          </p>
        )}
      </div>

      {/* Stops */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Additional Stops
        </label>

        {/* Existing Stops */}
        {stops.length > 0 && (
          <div className="mb-3 space-y-2">
            {stops.map((stop) => (
              <div
                key={stop.id}
                className="flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 p-2 dark:border-gray-600 dark:bg-gray-700"
              >
                <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">
                  {stop.address}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveStop(stop.id)}
                  className="rounded-md px-2 py-1 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add Stop */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newStopAddress}
            onChange={(e) => {
              setNewStopAddress(e.target.value)
              setNewStopLocation(null)
            }}
            placeholder="Enter stop address"
            className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400"
            ref={stopInputRef}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAddStop()
              }
            }}
          />
          <button
            type="button"
            onClick={handleAddStop}
            disabled={newStopAddress.trim().length < 5}
            className="rounded-md bg-gray-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-500 dark:hover:bg-gray-600"
          >
            Add Stop
          </button>
        </div>
      </div>

      {/* Passengers, Luggage, Child Seats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Passengers <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            {...register('passengers')}
            min="1"
            max="20"
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400"
          />
          {errors.passengers && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.passengers.message}
            </p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Luggage Count
          </label>
          <input
            type="number"
            {...register('luggageCount')}
            min="0"
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400"
          />
          {errors.luggageCount && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.luggageCount.message}
            </p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Child Seats
          </label>
          <input
            type="number"
            {...register('childSeatCount')}
            min="0"
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400"
          />
          {errors.childSeatCount && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.childSeatCount.message}
            </p>
          )}
        </div>
      </div>

      {errorMessage && (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 dark:border-red-700 dark:bg-red-900/20 dark:text-red-200">
          {errorMessage}
        </p>
      )}

      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Route Preview
        </p>
        <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex h-64 items-center justify-center bg-gray-100 text-sm text-gray-500 dark:bg-gray-900/40 dark:text-gray-400">
            {!isMapsReady ? (
              <span>Loading map...</span>
            ) : (
              <div ref={mapContainerRef} className="h-64 w-full" />
            )}
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex flex-wrap justify-end gap-4 pt-4">
        <button
          type="button"
          onClick={() => useBookingStore.getState().reset()}
          className="rounded-md border border-gray-300 bg-white px-6 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
        >
          Reset
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          {isLoading ? 'Calculating Route...' : 'Continue to Vehicle Selection'}
        </button>
      </div>
    </form>
  )
}
