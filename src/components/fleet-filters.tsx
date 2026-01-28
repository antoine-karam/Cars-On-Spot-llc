'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

type FleetFiltersProps = {
  currentCapacity?: number
  currentChildSeatCapable?: boolean
}

export function FleetFilters({
  currentCapacity,
  currentChildSeatCapable,
}: FleetFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateFilter = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value === null || value === '') {
        params.delete(key)
      } else {
        params.set(key, value)
      }
      router.push(`/fleet?${params.toString()}`)
    },
    [router, searchParams]
  )

  const clearFilters = useCallback(() => {
    router.push('/fleet')
  }, [router])

  const hasActiveFilters =
    currentCapacity !== undefined || currentChildSeatCapable !== undefined

  return (
    <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Filters
        </h2>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div>
          <label
            htmlFor="capacity"
            className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Capacity
          </label>
          <select
            id="capacity"
            value={currentCapacity?.toString() || ''}
            onChange={(e) => updateFilter('capacity', e.target.value)}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400"
          >
            <option value="">All capacities</option>
            <option value="4">4 passengers</option>
            <option value="5">5 passengers</option>
            <option value="6">6 passengers</option>
            <option value="7">7 passengers</option>
            <option value="8">8 passengers</option>
            <option value="12">12 passengers</option>
            <option value="14">14 passengers</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="childSeatCapable"
            className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Child Seat Capable
          </label>
          <select
            id="childSeatCapable"
            value={
              currentChildSeatCapable === undefined
                ? ''
                : currentChildSeatCapable.toString()
            }
            onChange={(e) => updateFilter('childSeatCapable', e.target.value)}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400"
          >
            <option value="">All vehicles</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>
      </div>
    </div>
  )
}
