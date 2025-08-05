import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { UserRole } from '@prisma/client'
import { z } from 'zod'

// Stylist profile update schema
const stylistUpdateSchema = z.object({
  displayName: z.string().min(2, 'Display name must be at least 2 characters').max(50).optional(),
  bio: z.string().max(1000, 'Bio must be less than 1000 characters').optional(),
  profileImageUrl: z.string().url('Must be a valid URL').optional(),
  portfolioImages: z.array(z.string().url()).max(10, 'Maximum 10 portfolio images').optional(),
  specialty: z.string().min(2, 'Specialty must be at least 2 characters').max(100).optional(),
  yearsExperience: z.number().int().min(0).max(50).optional(),
})

interface RouteParams {
  params: {
    id: string
  }
}

// GET /api/stylists/[id] - Get specific stylist profile
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json({ error: 'Stylist ID is required' }, { status: 400 })
    }

    const stylist = await prisma.stylist.findUnique({
      where: { id },
      select: {
        id: true,
        displayName: true,
        bio: true,
        profileImageUrl: true,
        portfolioImages: true,
        specialty: true,
        yearsExperience: true,
        isVerified: true,
        verifiedAt: true,
        user: {
          select: {
            id: true,
            email: true,
            createdAt: true,
          },
        },
        services: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            duration: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: [{ price: 'asc' }, { name: 'asc' }],
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
            startTime: true,
            endTime: true,
            event: {
              select: {
                id: true,
                name: true,
                slug: true,
                venue: true,
                city: true,
                state: true,
                country: true,
                startDate: true,
                endDate: true,
                imageUrl: true,
              },
            },
          },
          orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
        },
        bookings: {
          where: {
            status: 'COMPLETED',
          },
          select: {
            id: true,
            date: true,
            service: {
              select: {
                name: true,
              },
            },
            event: {
              select: {
                name: true,
                city: true,
                state: true,
              },
            },
          },
          orderBy: { date: 'desc' },
          take: 10, // Last 10 completed bookings
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
    })

    if (!stylist) {
      return NextResponse.json({ error: 'Stylist not found' }, { status: 404 })
    }

    // Transform and enrich data
    const portfolioImages = Array.isArray(stylist.portfolioImages) ? stylist.portfolioImages : []

    const priceRange =
      stylist.services.length > 0
        ? {
            min: Math.min(...stylist.services.map((s) => Number(s.price))),
            max: Math.max(...stylist.services.map((s) => Number(s.price))),
          }
        : null

    const upcomingEvents = stylist.availabilities.reduce(
      (events, avail) => {
        const eventId = avail.event.id
        if (!events.find((e) => e.id === eventId)) {
          events.push(avail.event)
        }
        return events
      },
      [] as (typeof stylist.availabilities)[0]['event'][]
    )

    const transformedStylist = {
      ...stylist,
      portfolioImages,
      priceRange,
      completedBookings: stylist._count.bookings,
      activeServices: stylist._count.services,
      upcomingAvailability: stylist._count.availabilities,
      upcomingEvents,
      recentWork: stylist.bookings,
    }

    return NextResponse.json(transformedStylist)
  } catch (error) {
    console.error('Error fetching stylist:', error)
    return NextResponse.json({ error: 'Failed to fetch stylist' }, { status: 500 })
  }
}

// PUT /api/stylists/[id] - Update stylist profile (authenticated stylist only)
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()

    // Check authentication
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'Stylist ID is required' }, { status: 400 })
    }

    // Check if stylist exists and belongs to the authenticated user
    const existingStylist = await prisma.stylist.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        user: {
          select: {
            role: true,
          },
        },
      },
    })

    if (!existingStylist) {
      return NextResponse.json({ error: 'Stylist not found' }, { status: 404 })
    }

    // Check authorization - must be the stylist themselves or an admin
    const isOwnProfile = existingStylist.userId === session.user.id
    const isAdmin = session.user.role === UserRole.ADMIN

    if (!isOwnProfile && !isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized - Can only update your own profile' },
        { status: 403 }
      )
    }

    // Validate request body
    const validatedData = stylistUpdateSchema.parse(body)

    // Update stylist profile
    const updatedStylist = await prisma.stylist.update({
      where: { id },
      data: validatedData,
      select: {
        id: true,
        displayName: true,
        bio: true,
        profileImageUrl: true,
        portfolioImages: true,
        specialty: true,
        yearsExperience: true,
        isVerified: true,
        verifiedAt: true,
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    })

    // Transform portfolio images
    const transformedStylist = {
      ...updatedStylist,
      portfolioImages: Array.isArray(updatedStylist.portfolioImages)
        ? updatedStylist.portfolioImages
        : [],
    }

    return NextResponse.json(transformedStylist)
  } catch (error) {
    console.error('Error updating stylist:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Failed to update stylist profile' }, { status: 500 })
  }
}
