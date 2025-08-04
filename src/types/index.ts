export type {
  User,
  UserRole,
  Dancer,
  Stylist,
  Admin,
  Event,
  Service,
  Availability,
  Booking,
  BookingStatus,
  PaymentStatus,
  Payout,
  PayoutStatus,
  Earning,
  AuditLog,
} from '@prisma/client'
import type {
  User,
  UserRole,
  Dancer,
  Stylist,
  Admin,
  Event,
  Service,
  Availability,
  Booking,
} from '@prisma/client'

// Extended types with relations
export type UserWithRelations = User & {
  dancer?: Dancer | null
  stylist?: Stylist | null
  admin?: Admin | null
}

export type StylistWithServices = Stylist & {
  services: Service[]
  user: User
}

export type BookingWithRelations = Booking & {
  dancer: User
  stylist: Stylist & {
    user: User
  }
  event: Event
  service: Service
}

export type EventWithAvailability = Event & {
  availabilities: (Availability & {
    stylist: Stylist & {
      user: User
      services: Service[]
    }
  })[]
}

// Form types
export type CreateUserInput = {
  email: string
  phone: string
  password: string
  role: UserRole
  firstName?: string
  lastName?: string
  displayName?: string
}

export type CreateEventInput = {
  name: string
  description?: string
  venue: string
  address: string
  city: string
  state?: string
  country: string
  postalCode: string
  startDate: Date
  endDate: Date
  timezone: string
  imageUrl?: string
}

export type CreateBookingInput = {
  dancerId: string
  stylistId: string
  eventId: string
  serviceId: string
  date: Date
  startTime: Date
  endTime: Date
  servicePrice: number
  platformFee: number
  stylistPayout: number
}

// API Response types
export type ApiResponse<T = unknown> = {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Utility types
export type TimeSlot = {
  startTime: Date
  endTime: Date
  isAvailable: boolean
  conflictReason?: string
}
