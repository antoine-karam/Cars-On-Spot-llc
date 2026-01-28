'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ServiceType } from '@prisma/client'
import { useBookingStore } from '@/lib/bookingStore'
import { useState } from 'react'

const rideInfoSchema = z.object({
  serviceType: z.nativeEnum(ServiceType, {
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
    dropoffAddress,
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
    setCurrentStep,
  } = useBookingStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
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

  const onSubmit = (data: RideInfoFormData) => {
    // Update store with form data
    setServiceType(data.serviceType)
    setPickupDateTime(data.pickupDateTime)
    setPickupAddress(data.pickupAddress)
    setDropoffAddress(data.dropoffAddress)
    setPassengers(data.passengers)
    setLuggageCount(data.luggageCount)
    setChildSeatCount(data.childSeatCount)

    // Move to next step
    setCurrentStep(2)
  }

  const handleAddStop = () => {
    if (newStopAddress.trim().length < 5) {
      return
    }

    const stop: typeof stops[0] = {
      id: `stop-${Date.now()}`,
      address: newStopAddress.trim(),
    }

    addStop(stop)
    setNewStopAddress('')
  }

  const handleRemoveStop = (stopId: string) => {
    removeStop(stopId)
  }

  const selectedServiceType = watch('serviceType')

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
          <option value={ServiceType.POINT_TO_POINT}>Point to Point</option>
          <option value={ServiceType.HOURLY}>Hourly</option>
          <option value={ServiceType.MULTI_STOP}>Multi-Stop</option>
          <option value={ServiceType.AIRPORT_TRANSFER}>Airport Transfer</option>
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
          {...register('pickupAddress')}
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
          {...register('dropoffAddress')}
          placeholder="Enter dropoff address"
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400"
        />
        {errors.dropoffAddress && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.dropoffAddress.message}
          </p>
        )}
      </div>

      {/* Stops (only for MULTI_STOP service type) */}
      {selectedServiceType === ServiceType.MULTI_STOP && (
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
              onChange={(e) => setNewStopAddress(e.target.value)}
              placeholder="Enter stop address"
              className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400"
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
      )}

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

      {/* Submit Button */}
      <div className="flex justify-end gap-4 pt-4">
        <button
          type="button"
          onClick={() => useBookingStore.getState().reset()}
          className="rounded-md border border-gray-300 bg-white px-6 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
        >
          Reset
        </button>
        <button
          type="submit"
          className="rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          Continue to Vehicle Selection
        </button>
      </div>
    </form>
  )
}
