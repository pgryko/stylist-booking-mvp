import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET /api/stylists - List stylists with filtering and search
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Query parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const search = searchParams.get('search') || ''
    const specialty = searchParams.get('specialty') || ''
    const verifiedOnly = searchParams.get('verified') === 'true'
    const hasAvailability = searchParams.get('available') === 'true'
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Calculate offset
    const offset = (page - 1) * limit

    // Build where clause
    const where: Record<string, unknown> = {}

    // Search filter across multiple fields
    if (search) {
      where.OR = [
        { displayName: { contains: search } },
        { bio: { contains: search } },
        { specialty: { contains: search } },
      ]
    }

    // Specialty filter
    if (specialty) {
      where.specialty = { contains: specialty }
    }

    // Verification filter
    if (verifiedOnly) {
      where.isVerified = true
    }

    // Availability filter - stylists with future availabilities
    if (hasAvailability) {
      where.availabilities = {
        some: {
          event: {
            startDate: { gte: new Date() },
            isActive: true,
          },
        },
      }
    }

    // Build orderBy
    const orderBy: Record<string, string> = {}

    // Handle special sorting cases
    if (sortBy === 'experience') {
      orderBy.yearsExperience = sortOrder
    } else if (sortBy === 'verified') {
      orderBy.isVerified = sortOrder
    } else {
      orderBy[sortBy] = sortOrder
    }

    // Execute queries
    const [stylists, totalCount] = await Promise.all([
      prisma.stylist.findMany({
        where,
        orderBy,
        skip: offset,
        take: limit,
        select: {
          id: true,
          displayName: true,
          bio: true,
          profileImageUrl: true,
          specialty: true,
          yearsExperience: true,
          isVerified: true,
          verifiedAt: true,
          portfolioImages: true,
          user: {
            select: {
              id: true,
              createdAt: true,
            },
          },
          services: {
            where: { isActive: true },
            select: {
              id: true,
              name: true,
              price: true,
              duration: true,
            },
            orderBy: { price: 'asc' },
          },
          availabilities: {
            where: {
              event: {
                startDate: { gte: new Date() },
                isActive: true,
              },
            },
            select: {
              id: true,
              date: true,
              event: {
                select: {
                  id: true,
                  name: true,
                  city: true,
                  state: true,
                  country: true,
                  startDate: true,
                  endDate: true,
                },
              },
            },
            orderBy: [{ date: 'asc' }, { event: { startDate: 'asc' } }],
            take: 5, // Limit to next 5 events for performance
          },
          _count: {
            select: {
              services: { where: { isActive: true } },
              bookings: { where: { status: 'COMPLETED' } },
              availabilities: {
                where: {
                  event: {
                    startDate: { gte: new Date() },
                    isActive: true,
                  },
                },
              },
            },
          },
        },
      }),
      prisma.stylist.count({ where }),
    ])

    // Calculate pagination
    const totalPages = Math.ceil(totalCount / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    // Transform data to include computed fields
    const transformedStylists = stylists.map((stylist) => ({
      ...stylist,
      portfolioImages: Array.isArray(stylist.portfolioImages) ? stylist.portfolioImages : [],
      completedBookings: stylist._count.bookings,
      activeServices: stylist._count.services,
      upcomingAvailability: stylist._count.availabilities,
      nextEvents: stylist.availabilities.map((avail) => avail.event),
      priceRange:
        stylist.services.length > 0
          ? {
              min: Math.min(...stylist.services.map((s) => Number(s.price))),
              max: Math.max(...stylist.services.map((s) => Number(s.price))),
            }
          : null,
    }))

    return NextResponse.json({
      stylists: transformedStylists,
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
        specialty,
        verifiedOnly,
        hasAvailability,
        sortBy,
        sortOrder,
      },
    })
  } catch (error) {
    console.error('Error fetching stylists:', error)
    return NextResponse.json({ error: 'Failed to fetch stylists' }, { status: 500 })
  }
}
