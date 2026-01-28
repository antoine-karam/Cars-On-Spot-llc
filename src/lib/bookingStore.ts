import { create } from 'zustand'
import { ServiceType } from '@prisma/client'

export type BookingStop = {
  id: string
  address: string
  lat?: number
  lng?: number
}

export type BookingWizardState = {
  // Step 1: Ride Info
  serviceType: ServiceType | null
  pickupDateTime: string // ISO string
  pickupAddress: string
  pickupLat?: number
  pickupLng?: number
  dropoffAddress: string
  dropoffLat?: number
  dropoffLng?: number
  stops: BookingStop[]
  passengers: number
  luggageCount: number
  childSeatCount: number

  // Step 2: (Future)
  // Step 3: (Future)

  // Wizard state
  currentStep: number
}

type BookingWizardActions = {
  setServiceType: (serviceType: ServiceType) => void
  setPickupDateTime: (dateTime: string) => void
  setPickupAddress: (address: string, lat?: number, lng?: number) => void
  setDropoffAddress: (address: string, lat?: number, lng?: number) => void
  addStop: (stop: BookingStop) => void
  removeStop: (stopId: string) => void
  updateStop: (stopId: string, stop: Partial<BookingStop>) => void
  setPassengers: (count: number) => void
  setLuggageCount: (count: number) => void
  setChildSeatCount: (count: number) => void
  setCurrentStep: (step: number) => void
  reset: () => void
}

const initialState: BookingWizardState = {
  serviceType: null,
  pickupDateTime: '',
  pickupAddress: '',
  dropoffAddress: '',
  stops: [],
  passengers: 1,
  luggageCount: 0,
  childSeatCount: 0,
  currentStep: 1,
}

export const useBookingStore = create<BookingWizardState & BookingWizardActions>(
  (set) => ({
    ...initialState,

    setServiceType: (serviceType) => set({ serviceType }),

    setPickupDateTime: (pickupDateTime) => set({ pickupDateTime }),

    setPickupAddress: (address, lat, lng) =>
      set({ pickupAddress: address, pickupLat: lat, pickupLng: lng }),

    setDropoffAddress: (address, lat, lng) =>
      set({ dropoffAddress: address, dropoffLat: lat, dropoffLng: lng }),

    addStop: (stop) =>
      set((state) => ({
        stops: [...state.stops, stop],
      })),

    removeStop: (stopId) =>
      set((state) => ({
        stops: state.stops.filter((stop) => stop.id !== stopId),
      })),

    updateStop: (stopId, updatedStop) =>
      set((state) => ({
        stops: state.stops.map((stop) =>
          stop.id === stopId ? { ...stop, ...updatedStop } : stop
        ),
      })),

    setPassengers: (passengers) => set({ passengers }),

    setLuggageCount: (luggageCount) => set({ luggageCount }),

    setChildSeatCount: (childSeatCount) => set({ childSeatCount }),

    setCurrentStep: (currentStep) => set({ currentStep }),

    reset: () => set(initialState),
  })
)
