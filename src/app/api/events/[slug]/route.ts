import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { UserRole } from '@prisma/client'
import { z } from 'zod'

// Event update schema (all fields optional for PATCH)
const eventUpdateSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(100).optional(),
  slug: z
    .string()
    .min(3)
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
    .optional(),
  description: z.string().optional(),
  venue: z.string().min(3, 'Venue is required').optional(),
  address: z.string().min(5, 'Address is required').optional(),
  city: z.string().min(2, 'City is required').optional(),
  state: z.string().optional(),
  country: z.string().min(2, 'Country is required').optional(),
  postalCode: z.string().min(3, 'Postal code is required').optional(),
  startDate: z
    .string()
    .transform((str) => new Date(str))
    .optional(),
  endDate: z
    .string()
    .transform((str) => new Date(str))
    .optional(),
  timezone: z.string().min(3, 'Timezone is required').optional(),
  imageUrl: z.string().url().optional(),
  isActive: z.boolean().optional(),
})

interface RouteContext {
  params: Promise<{
    slug: string
  }>
}

// GET /api/events/[slug] - Get specific event by slug
export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const { slug } = await params

    if (!slug) {
      return NextResponse.json({ error: 'Event slug is required' }, { status: 400 })
    }

    const event = await prisma.event.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        venue: true,
        address: true,
        city: true,
        state: true,
        country: true,
        postalCode: true,
        startDate: true,
        endDate: true,
        timezone: true,
        imageUrl: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        availabilities: {
          select: {
            id: true,
            date: true,
            startTime: true,
            endTime: true,
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
          select: {
            id: true,
            date: true,
            startTime: true,
            endTime: true,
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

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Only show active events to non-admin users
    const session = await auth()
    const isAdmin = session?.user?.role === UserRole.ADMIN

    if (!event.isActive && !isAdmin) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    return NextResponse.json(event)
  } catch (error) {
    console.error('Error fetching event:', error)
    return NextResponse.json({ error: 'Failed to fetch event' }, { status: 500 })
  }
}

// PUT /api/events/[slug] - Update event (admin only)
export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await auth()

    // Check authentication and admin role
    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 })
    }

    const { slug } = await params
    const body = await request.json()

    if (!slug) {
      return NextResponse.json({ error: 'Event slug is required' }, { status: 400 })
    }

    // Check if event exists
    const existingEvent = await prisma.event.findUnique({
      where: { slug },
    })

    if (!existingEvent) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Validate request body
    const validatedData = eventUpdateSchema.parse(body)

    // Validate date range if both dates are provided
    if (validatedData.startDate && validatedData.endDate) {
      if (validatedData.endDate <= validatedData.startDate) {
        return NextResponse.json({ error: 'End date must be after start date' }, { status: 400 })
      }
    }

    // Check for unique slug if slug is being updated
    if (validatedData.slug && validatedData.slug !== slug) {
      const slugExists = await prisma.event.findUnique({
        where: { slug: validatedData.slug },
      })

      if (slugExists) {
        return NextResponse.json({ error: 'Event with this slug already exists' }, { status: 409 })
      }
    }

    // Update event
    const updatedEvent = await prisma.event.update({
      where: { slug },
      data: validatedData,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        venue: true,
        address: true,
        city: true,
        state: true,
        country: true,
        postalCode: true,
        startDate: true,
        endDate: true,
        timezone: true,
        imageUrl: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json(updatedEvent)
  } catch (error) {
    console.error('Error updating event:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 })
  }
}

// DELETE /api/events/[slug] - Delete event (admin only)
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await auth()

    // Check authentication and admin role
    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 })
    }

    const { slug } = await params

    if (!slug) {
      return NextResponse.json({ error: 'Event slug is required' }, { status: 400 })
    }

    // Check if event exists
    const existingEvent = await prisma.event.findUnique({
      where: { slug },
      include: {
        _count: {
          select: {
            bookings: true,
            availabilities: true,
          },
        },
      },
    })

    if (!existingEvent) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Check if event has active bookings
    if (existingEvent._count.bookings > 0) {
      return NextResponse.json(
        {
          error: 'Cannot delete event with existing bookings. Set isActive to false instead.',
          bookingCount: existingEvent._count.bookings,
        },
        { status: 409 }
      )
    }

    // Delete event and related data
    await prisma.$transaction(async (tx) => {
      // Delete availabilities first
      await tx.availability.deleteMany({
        where: { eventId: existingEvent.id },
      })

      // Delete the event
      await tx.event.delete({
        where: { slug },
      })
    })

    return NextResponse.json({ message: 'Event deleted successfully' }, { status: 200 })
  } catch (error) {
    console.error('Error deleting event:', error)
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 })
  }
}
