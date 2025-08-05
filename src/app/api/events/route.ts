import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { UserRole } from '@prisma/client'
import { z } from 'zod'

// Event creation/update schema
const eventSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(100),
  slug: z
    .string()
    .min(3)
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  description: z.string().optional(),
  venue: z.string().min(3, 'Venue is required'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().optional(),
  country: z.string().min(2, 'Country is required'),
  postalCode: z.string().min(3, 'Postal code is required'),
  startDate: z.string().transform((str) => new Date(str)),
  endDate: z.string().transform((str) => new Date(str)),
  timezone: z.string().min(3, 'Timezone is required'),
  imageUrl: z.string().url().optional(),
  isActive: z.boolean().default(true),
})

// GET /api/events - List events with filtering and search
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Query parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const search = searchParams.get('search') || ''
    const country = searchParams.get('country') || ''
    const state = searchParams.get('state') || ''
    const city = searchParams.get('city') || ''
    const upcoming = searchParams.get('upcoming') === 'true'
    const sortBy = searchParams.get('sortBy') || 'startDate'
    const sortOrder = searchParams.get('sortOrder') || 'asc'

    // Calculate offset
    const offset = (page - 1) * limit

    // Build where clause
    const where: Record<string, unknown> = {
      isActive: true,
    }

    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { venue: { contains: search } },
        { city: { contains: search } },
      ]
    }

    // Location filters
    if (country) where.country = { contains: country }
    if (state) where.state = { contains: state }
    if (city) where.city = { contains: city }

    // Upcoming events filter
    if (upcoming) {
      where.startDate = { gte: new Date() }
    }

    // Build orderBy
    const orderBy: Record<string, string> = {}
    orderBy[sortBy] = sortOrder

    // Execute queries
    const [events, totalCount] = await Promise.all([
      prisma.event.findMany({
        where,
        orderBy,
        skip: offset,
        take: limit,
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

    return NextResponse.json({
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
      },
    })
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 })
  }
}

// POST /api/events - Create new event (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    // Check authentication and admin role
    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 })
    }

    const body = await request.json()

    // Validate request body
    const validatedData = eventSchema.parse(body)

    // Validate date range
    if (validatedData.endDate <= validatedData.startDate) {
      return NextResponse.json({ error: 'End date must be after start date' }, { status: 400 })
    }

    // Check for unique slug
    const existingEvent = await prisma.event.findUnique({
      where: { slug: validatedData.slug },
    })

    if (existingEvent) {
      return NextResponse.json({ error: 'Event with this slug already exists' }, { status: 409 })
    }

    // Create event
    const event = await prisma.event.create({
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

    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    console.error('Error creating event:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 })
  }
}
