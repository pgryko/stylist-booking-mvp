import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

// Service creation/update schema
const serviceSchema = z.object({
  name: z.string().min(2, 'Service name must be at least 2 characters').max(100),
  description: z.string().max(500).optional(),
  price: z.number().min(0.01, 'Price must be greater than 0').max(1000),
  duration: z.number().int().min(15, 'Duration must be at least 15 minutes').max(480),
  isActive: z.boolean().default(true),
})

// GET /api/dashboard/services - List stylist's services with stats
export async function GET() {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    if (session.user.role !== 'STYLIST') {
      return NextResponse.json({ error: 'Access denied - Stylist role required' }, { status: 403 })
    }

    // Get the stylist record
    const stylist = await prisma.stylist.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    })

    if (!stylist) {
      return NextResponse.json({ error: 'Stylist profile not found' }, { status: 404 })
    }

    const stylistId = stylist.id

    // Fetch services and stats
    const [services, serviceStats] = await Promise.all([
      // Services with booking counts
      prisma.service.findMany({
        where: { stylistId },
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          duration: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              bookings: true,
            },
          },
        },
        orderBy: [{ isActive: 'desc' }, { createdAt: 'desc' }],
      }),

      // Overall stats
      prisma.service.aggregate({
        where: { stylistId },
        _count: {
          id: true,
        },
      }),
    ])

    // Calculate additional stats
    const activeServices = services.filter((s) => s.isActive).length
    const totalBookings = services.reduce((sum, service) => sum + service._count.bookings, 0)

    // Calculate total revenue from completed bookings
    const totalRevenue = await prisma.booking.aggregate({
      where: {
        stylistId,
        status: 'COMPLETED',
      },
      _sum: {
        stylistPayout: true,
      },
    })

    // Transform services data
    const transformedServices = services.map((service) => ({
      ...service,
      price: Number(service.price),
    }))

    const stats = {
      totalServices: serviceStats._count.id,
      activeServices,
      totalBookings,
      totalRevenue: Number(totalRevenue._sum.stylistPayout || 0),
    }

    return NextResponse.json({
      services: transformedServices,
      stats,
    })
  } catch (error) {
    console.error('Error fetching services:', error)
    return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 })
  }
}

// POST /api/dashboard/services - Create new service
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    if (session.user.role !== 'STYLIST') {
      return NextResponse.json({ error: 'Access denied - Stylist role required' }, { status: 403 })
    }

    // Get the stylist record
    const stylist = await prisma.stylist.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    })

    if (!stylist) {
      return NextResponse.json({ error: 'Stylist profile not found' }, { status: 404 })
    }

    const body = await request.json()
    const validatedData = serviceSchema.parse(body)

    // Check if service name already exists for this stylist
    const existingService = await prisma.service.findFirst({
      where: {
        stylistId: stylist.id,
        name: validatedData.name,
      },
    })

    if (existingService) {
      return NextResponse.json(
        { error: 'A service with this name already exists' },
        { status: 400 }
      )
    }

    // Create the service
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
      },
    })

    // Transform response
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
