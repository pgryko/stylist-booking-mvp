import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { UserRole } from '@prisma/client'
import { z } from 'zod'

// Service creation schema
const serviceCreateSchema = z.object({
  name: z.string().min(3, 'Service name must be at least 3 characters').max(100),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  price: z.number().positive('Price must be positive').max(9999.99, 'Price too high'),
  duration: z
    .number()
    .int()
    .min(15, 'Duration must be at least 15 minutes')
    .max(480, 'Duration cannot exceed 8 hours'),
  isActive: z.boolean().default(true),
})

// GET /api/services - List services with filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Query parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const stylistId = searchParams.get('stylistId') || ''
    const minPrice = searchParams.get('minPrice')
      ? parseFloat(searchParams.get('minPrice')!)
      : undefined
    const maxPrice = searchParams.get('maxPrice')
      ? parseFloat(searchParams.get('maxPrice')!)
      : undefined
    const minDuration = searchParams.get('minDuration')
      ? parseInt(searchParams.get('minDuration')!)
      : undefined
    const maxDuration = searchParams.get('maxDuration')
      ? parseInt(searchParams.get('maxDuration')!)
      : undefined
    const activeOnly = searchParams.get('active') !== 'false' // Default to active only
    const sortBy = searchParams.get('sortBy') || 'name'
    const sortOrder = searchParams.get('sortOrder') || 'asc'

    // Calculate offset
    const offset = (page - 1) * limit

    // Build where clause
    const where: Record<string, unknown> = {}

    // Active filter
    if (activeOnly) {
      where.isActive = true
    }

    // Stylist filter
    if (stylistId) {
      where.stylistId = stylistId
    }

    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        {
          stylist: {
            displayName: { contains: search, mode: 'insensitive' },
          },
        },
      ]
    }

    // Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {}
      if (minPrice !== undefined) (where.price as Record<string, unknown>).gte = minPrice
      if (maxPrice !== undefined) (where.price as Record<string, unknown>).lte = maxPrice
    }

    // Duration range filter
    if (minDuration !== undefined || maxDuration !== undefined) {
      where.duration = {}
      if (minDuration !== undefined) (where.duration as Record<string, unknown>).gte = minDuration
      if (maxDuration !== undefined) (where.duration as Record<string, unknown>).lte = maxDuration
    }

    // Build orderBy
    const orderBy: Record<string, unknown> = {}

    // Handle nested sorting
    if (sortBy === 'stylistName') {
      orderBy.stylist = { displayName: sortOrder }
    } else {
      orderBy[sortBy] = sortOrder
    }

    // Execute queries
    const [services, totalCount] = await Promise.all([
      prisma.service.findMany({
        where,
        orderBy,
        skip: offset,
        take: limit,
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          duration: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          stylist: {
            select: {
              id: true,
              displayName: true,
              profileImageUrl: true,
              specialty: true,
              isVerified: true,
              user: {
                select: {
                  id: true,
                },
              },
            },
          },
          _count: {
            select: {
              bookings: {
                where: {
                  status: 'COMPLETED',
                },
              },
            },
          },
        },
      }),
      prisma.service.count({ where }),
    ])

    // Calculate pagination
    const totalPages = Math.ceil(totalCount / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    // Transform data
    const transformedServices = services.map((service) => ({
      ...service,
      price: Number(service.price),
      completedBookings: service._count.bookings,
      durationHours: Math.floor(service.duration / 60),
      durationMinutes: service.duration % 60,
    }))

    return NextResponse.json({
      services: transformedServices,
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
        stylistId,
        minPrice,
        maxPrice,
        minDuration,
        maxDuration,
        activeOnly,
        sortBy,
        sortOrder,
      },
    })
  } catch (error) {
    console.error('Error fetching services:', error)
    return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 })
  }
}

// POST /api/services - Create new service (authenticated stylist only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    // Check authentication
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Check if user is a stylist
    if (session.user.role !== UserRole.STYLIST) {
      return NextResponse.json({ error: 'Only stylists can create services' }, { status: 403 })
    }

    const body = await request.json()

    // Validate request body
    const validatedData = serviceCreateSchema.parse(body)

    // Get the stylist record for the authenticated user
    const stylist = await prisma.stylist.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    })

    if (!stylist) {
      return NextResponse.json({ error: 'Stylist profile not found' }, { status: 404 })
    }

    // Check for existing service with same name for this stylist
    const existingService = await prisma.service.findFirst({
      where: {
        stylistId: stylist.id,
        name: validatedData.name,
      },
    })

    if (existingService) {
      return NextResponse.json({ error: 'Service with this name already exists' }, { status: 409 })
    }

    // Create service
    const service = await prisma.service.create({
      data: {
        ...validatedData,
        stylistId: stylist.id,
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        duration: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        stylist: {
          select: {
            id: true,
            displayName: true,
          },
        },
      },
    })

    // Transform price to number
    const transformedService = {
      ...service,
      price: Number(service.price),
    }

    return NextResponse.json(transformedService, { status: 201 })
  } catch (error) {
    console.error('Error creating service:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Failed to create service' }, { status: 500 })
  }
}
