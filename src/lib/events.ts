import { prisma } from '@/lib/db'
import { Event } from '@prisma/client'

export interface EventFilters {
  search?: string
  country?: string
  state?: string
  city?: string
  upcoming?: boolean
  sortBy?: 'startDate' | 'endDate' | 'name' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface EventWithCounts extends Event {
  _count: {
    availabilities: number
    bookings: number
  }
}

export interface PaginatedEvents {
  events: EventWithCounts[]
  pagination: {
    page: number
    limit: number
    totalCount: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
  filters: EventFilters
}

/**
 * Get paginated events with filtering and search
 */
export async function getEvents(filters: EventFilters = {}): Promise<PaginatedEvents> {
  const {
    search = '',
    country = '',
    state = '',
    city = '',
    upcoming = false,
    sortBy = 'startDate',
    sortOrder = 'asc',
    page = 1,
    limit = 12,
  } = filters

  const offset = (page - 1) * limit

  // Build where clause
  const where: Record<string, unknown> = {
    isActive: true,
  }

  // Search filter
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { venue: { contains: search, mode: 'insensitive' } },
      { city: { contains: search, mode: 'insensitive' } },
    ]
  }

  // Location filters
  if (country) where.country = { contains: country, mode: 'insensitive' }
  if (state) where.state = { contains: state, mode: 'insensitive' }
  if (city) where.city = { contains: city, mode: 'insensitive' }

  // Upcoming events filter
  if (upcoming) {
    where.startDate = { gte: new Date() }
  }

  // Build orderBy
  const orderBy: Record<string, unknown> = {}
  orderBy[sortBy] = sortOrder

  // Execute queries
  const [events, totalCount] = await Promise.all([
    prisma.event.findMany({
      where,
      orderBy,
      skip: offset,
      take: limit,
      include: {
        _count: {
          select: {
            availabilities: true,
            bookings: true,
          },
        },
      },
    }),
    prisma.event.count({ where }),
  ])

  // Calculate pagination
  const totalPages = Math.ceil(totalCount / limit)
  const hasNextPage = page < totalPages
  const hasPrevPage = page > 1

  return {
    events,
    pagination: {
      page,
      limit,
      totalCount,
      totalPages,
      hasNextPage,
      hasPrevPage,
    },
    filters: {
      search,
      country,
      state,
      city,
      upcoming,
      sortBy,
      sortOrder,
      page,
      limit,
    },
  }
}

/**
 * Get event by slug with related data
 */
export async function getEventBySlug(slug: string, includeInactive = false) {
  const whereClause = includeInactive ? { slug } : { slug, isActive: true }

  return await prisma.event.findUnique({
    where: whereClause,
    include: {
      availabilities: {
        include: {
          stylist: {
            select: {
              id: true,
              displayName: true,
              profileImageUrl: true,
              specialty: true,
              isVerified: true,
            },
          },
        },
        orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
      },
      bookings: {
        where: {
          status: 'CONFIRMED',
        },
        include: {
          stylist: {
            select: {
              id: true,
              displayName: true,
            },
          },
          service: {
            select: {
              name: true,
            },
          },
        },
        orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
      },
      _count: {
        select: {
          availabilities: true,
          bookings: {
            where: {
              status: 'CONFIRMED',
            },
          },
        },
      },
    },
  })
}

/**
 * Get upcoming events for homepage
 */
export async function getUpcomingEvents(limit = 6) {
  return await prisma.event.findMany({
    where: {
      isActive: true,
      startDate: { gte: new Date() },
    },
    orderBy: {
      startDate: 'asc',
    },
    take: limit,
    include: {
      _count: {
        select: {
          availabilities: true,
          bookings: {
            where: {
              status: 'CONFIRMED',
            },
          },
        },
      },
    },
  })
}

/**
 * Get countries with event counts for filters
 */
export async function getEventCountries() {
  const countries = await prisma.event.groupBy({
    by: ['country'],
    where: {
      isActive: true,
      startDate: { gte: new Date() },
    },
    _count: {
      country: true,
    },
    orderBy: {
      country: 'asc',
    },
  })

  return countries.map((item) => ({
    country: item.country,
    count: item._count.country,
  }))
}

/**
 * Get states for a specific country
 */
export async function getEventStates(country: string) {
  const states = await prisma.event.groupBy({
    by: ['state'],
    where: {
      isActive: true,
      startDate: { gte: new Date() },
      country: { contains: country, mode: 'insensitive' },
      state: { not: null },
    },
    _count: {
      state: true,
    },
    orderBy: {
      state: 'asc',
    },
  })

  return states.map((item) => ({
    state: item.state!,
    count: item._count.state,
  }))
}

/**
 * Get cities for a specific country/state combination
 */
export async function getEventCities(country: string, state?: string) {
  const where: Record<string, unknown> = {
    isActive: true,
    startDate: { gte: new Date() },
    country: { contains: country, mode: 'insensitive' },
  }

  if (state) {
    where.state = { contains: state, mode: 'insensitive' }
  }

  const cities = await prisma.event.groupBy({
    by: ['city'],
    where,
    _count: {
      city: true,
    },
    orderBy: {
      city: 'asc',
    },
  })

  return cities.map((item) => ({
    city: item.city,
    count: item._count.city,
  }))
}
