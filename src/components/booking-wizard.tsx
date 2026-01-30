'use client'

import { useBookingStore } from '@/lib/bookingStore'
import { RideInfoStep } from './booking-steps/ride-info-step'
import { VehicleSelectionStep } from './booking-steps/vehicle-selection-step'
import { BookingConfirmationStep } from './booking-steps/booking-confirmation-step'

export function BookingWizard() {
  const currentStep = useBookingStore((state) => state.currentStep)

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow dark:border-gray-700 dark:bg-gray-800">
      {/* Step Indicator */}
      <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
        <div className="flex items-center justify-between">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                  step === currentStep
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : step < currentStep
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-gray-300 text-gray-500 dark:border-gray-600 dark:text-gray-400'
                }`}
              >
                {step < currentStep ? (
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  step
                )}
              </div>
              {step < 3 && (
                <div
                  className={`mx-2 h-1 w-16 ${
                    step < currentStep
                      ? 'bg-blue-600'
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-between text-xs text-gray-600 dark:text-gray-400">
          <span className={currentStep === 1 ? 'font-semibold text-blue-600' : ''}>
            Ride Info
          </span>
          <span className={currentStep === 2 ? 'font-semibold text-blue-600' : ''}>
            Vehicle Selection
          </span>
          <span className={currentStep === 3 ? 'font-semibold text-blue-600' : ''}>
            Confirmation
          </span>
        </div>
      </div>

      {/* Step Content */}
      <div className="p-6">
        {currentStep === 1 && <RideInfoStep />}
        {currentStep === 2 && <VehicleSelectionStep />}
        {currentStep === 3 && <BookingConfirmationStep />}
      </div>
    </div>
  )
}
