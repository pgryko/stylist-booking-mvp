import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { UserRole } from '@prisma/client'
import { z } from 'zod'

// Service update schema (all fields optional for PATCH-like behavior)
const serviceUpdateSchema = z.object({
  name: z.string().min(3, 'Service name must be at least 3 characters').max(100).optional(),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  price: z.number().positive('Price must be positive').max(9999.99, 'Price too high').optional(),
  duration: z
    .number()
    .int()
    .min(15, 'Duration must be at least 15 minutes')
    .max(480, 'Duration cannot exceed 8 hours')
    .optional(),
  isActive: z.boolean().optional(),
})

interface RouteParams {
  params: {
    id: string
  }
}

// GET /api/services/[id] - Get specific service
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json({ error: 'Service ID is required' }, { status: 400 })
    }

    const service = await prisma.service.findUnique({
      where: { id },
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
            bio: true,
            yearsExperience: true,
            user: {
              select: {
                id: true,
              },
            },
          },
        },
        bookings: {
          where: {
            status: 'COMPLETED',
          },
          select: {
            id: true,
            date: true,
            dancer: {
              select: {
                dancer: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
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
          take: 10, // Recent bookings
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
    })

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    // Transform data
    const transformedService = {
      ...service,
      price: Number(service.price),
      completedBookings: service._count.bookings,
      durationHours: Math.floor(service.duration / 60),
      durationMinutes: service.duration % 60,
      recentBookings: service.bookings.map((booking) => ({
        ...booking,
        clientName: booking.dancer?.dancer
          ? `${booking.dancer.dancer.firstName} ${booking.dancer.dancer.lastName}`
          : 'Anonymous',
      })),
    }

    return NextResponse.json(transformedService)
  } catch (error) {
    console.error('Error fetching service:', error)
    return NextResponse.json({ error: 'Failed to fetch service' }, { status: 500 })
  }
}

// PUT /api/services/[id] - Update service (authenticated stylist owner only)
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
      return NextResponse.json({ error: 'Service ID is required' }, { status: 400 })
    }

    // Check if service exists and get ownership info
    const existingService = await prisma.service.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        stylist: {
          select: {
            id: true,
            userId: true,
            user: {
              select: {
                role: true,
              },
            },
          },
        },
      },
    })

    if (!existingService) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    // Check authorization - must be the stylist owner or an admin
    const isOwner = existingService.stylist.userId === session.user.id
    const isAdmin = session.user.role === UserRole.ADMIN

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized - Can only update your own services' },
        { status: 403 }
      )
    }

    // Validate request body
    const validatedData = serviceUpdateSchema.parse(body)

    // Check for name conflicts if name is being updated
    if (validatedData.name && validatedData.name !== existingService.name) {
      const nameConflict = await prisma.service.findFirst({
        where: {
          stylistId: existingService.stylist.id,
          name: validatedData.name,
          id: { not: id },
        },
      })

      if (nameConflict) {
        return NextResponse.json(
          { error: 'Service with this name already exists' },
          { status: 409 }
        )
      }
    }

    // Update service
    const updatedService = await prisma.service.update({
      where: { id },
      data: validatedData,
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
      ...updatedService,
      price: Number(updatedService.price),
    }

    return NextResponse.json(transformedService)
  } catch (error) {
    console.error('Error updating service:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Failed to update service' }, { status: 500 })
  }
}

// DELETE /api/services/[id] - Delete service (authenticated stylist owner only)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()

    // Check authentication
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { id } = params

    if (!id) {
      return NextResponse.json({ error: 'Service ID is required' }, { status: 400 })
    }

    // Check if service exists and get ownership/booking info
    const existingService = await prisma.service.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        stylist: {
          select: {
            id: true,
            userId: true,
            user: {
              select: {
                role: true,
              },
            },
          },
        },
        _count: {
          select: {
            bookings: {
              where: {
                status: { in: ['CONFIRMED', 'COMPLETED'] },
              },
            },
          },
        },
      },
    })

    if (!existingService) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    // Check authorization - must be the stylist owner or an admin
    const isOwner = existingService.stylist.userId === session.user.id
    const isAdmin = session.user.role === UserRole.ADMIN

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized - Can only delete your own services' },
        { status: 403 }
      )
    }

    // Check if service has active bookings
    if (existingService._count.bookings > 0) {
      return NextResponse.json(
        {
          error: 'Cannot delete service with existing bookings. Set isActive to false instead.',
          bookingCount: existingService._count.bookings,
        },
        { status: 409 }
      )
    }

    // Delete service
    await prisma.service.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Service deleted successfully' }, { status: 200 })
  } catch (error) {
    console.error('Error deleting service:', error)
    return NextResponse.json({ error: 'Failed to delete service' }, { status: 500 })
  }
}
