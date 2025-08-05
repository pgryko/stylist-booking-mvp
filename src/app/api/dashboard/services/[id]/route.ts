import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

// Service update schema
const serviceUpdateSchema = z.object({
  name: z.string().min(2, 'Service name must be at least 2 characters').max(100).optional(),
  description: z.string().max(500).optional(),
  price: z.number().min(0.01, 'Price must be greater than 0').max(1000).optional(),
  duration: z.number().int().min(15, 'Duration must be at least 15 minutes').max(480).optional(),
  isActive: z.boolean().optional(),
})

interface RouteContext {
  params: Promise<{
    id: string
  }>
}

// PUT /api/dashboard/services/[id] - Update service
export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    if (session.user.role !== 'STYLIST') {
      return NextResponse.json({ error: 'Access denied - Stylist role required' }, { status: 403 })
    }

    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: 'Service ID is required' }, { status: 400 })
    }

    // Get the stylist record
    const stylist = await prisma.stylist.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    })

    if (!stylist) {
      return NextResponse.json({ error: 'Stylist profile not found' }, { status: 404 })
    }

    // Check if service exists and belongs to the stylist
    const existingService = await prisma.service.findUnique({
      where: { id },
      select: {
        id: true,
        stylistId: true,
        name: true,
      },
    })

    if (!existingService) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    if (existingService.stylistId !== stylist.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Can only update your own services' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = serviceUpdateSchema.parse(body)

    // Check for name conflicts if name is being updated
    if (validatedData.name && validatedData.name !== existingService.name) {
      const conflictingService = await prisma.service.findFirst({
        where: {
          stylistId: stylist.id,
          name: validatedData.name,
          id: { not: id },
        },
      })

      if (conflictingService) {
        return NextResponse.json(
          { error: 'A service with this name already exists' },
          { status: 400 }
        )
      }
    }

    // Update the service
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
        _count: {
          select: {
            bookings: true,
          },
        },
      },
    })

    // Transform response
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

// DELETE /api/dashboard/services/[id] - Delete service
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    if (session.user.role !== 'STYLIST') {
      return NextResponse.json({ error: 'Access denied - Stylist role required' }, { status: 403 })
    }

    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: 'Service ID is required' }, { status: 400 })
    }

    // Get the stylist record
    const stylist = await prisma.stylist.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    })

    if (!stylist) {
      return NextResponse.json({ error: 'Stylist profile not found' }, { status: 404 })
    }

    // Check if service exists and belongs to the stylist
    const existingService = await prisma.service.findUnique({
      where: { id },
      select: {
        id: true,
        stylistId: true,
        name: true,
        _count: {
          select: {
            bookings: true,
          },
        },
      },
    })

    if (!existingService) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    if (existingService.stylistId !== stylist.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Can only delete your own services' },
        { status: 403 }
      )
    }

    // Check if service has active bookings
    const activeBookings = await prisma.booking.count({
      where: {
        serviceId: id,
        status: { in: ['CONFIRMED'] },
        date: { gte: new Date() },
      },
    })

    if (activeBookings > 0) {
      return NextResponse.json(
        {
          error: 'Cannot delete service with active bookings',
          details: `This service has ${activeBookings} active booking(s). Please cancel or complete these bookings first.`,
        },
        { status: 400 }
      )
    }

    // Soft delete by deactivating if there are completed bookings
    // Hard delete if no bookings exist
    if (existingService._count.bookings > 0) {
      // Soft delete - just deactivate
      await prisma.service.update({
        where: { id },
        data: {
          isActive: false,
          name: `${existingService.name} (Deleted)`,
        },
      })
    } else {
      // Hard delete - no booking history
      await prisma.service.delete({
        where: { id },
      })
    }

    return NextResponse.json({
      message: 'Service deleted successfully',
      type: existingService._count.bookings > 0 ? 'soft_delete' : 'hard_delete',
    })
  } catch (error) {
    console.error('Error deleting service:', error)
    return NextResponse.json({ error: 'Failed to delete service' }, { status: 500 })
  }
}

// GET /api/dashboard/services/[id] - Get specific service details
export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    if (session.user.role !== 'STYLIST') {
      return NextResponse.json({ error: 'Access denied - Stylist role required' }, { status: 403 })
    }

    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: 'Service ID is required' }, { status: 400 })
    }

    // Get the stylist record
    const stylist = await prisma.stylist.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    })

    if (!stylist) {
      return NextResponse.json({ error: 'Stylist profile not found' }, { status: 404 })
    }

    // Get service details
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
        stylistId: true,
        _count: {
          select: {
            bookings: true,
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
                email: true,
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
          take: 10,
        },
      },
    })

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    if (service.stylistId !== stylist.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Can only view your own services' },
        { status: 403 }
      )
    }

    // Transform response
    const transformedService = {
      ...service,
      price: Number(service.price),
      recentBookings: service.bookings.map((booking) => ({
        ...booking,
        dancer: {
          name: booking.dancer.dancer
            ? `${booking.dancer.dancer.firstName} ${booking.dancer.dancer.lastName}`
            : booking.dancer.email.split('@')[0], // Fallback to email username
        },
      })),
    }

    return NextResponse.json(transformedService)
  } catch (error) {
    console.error('Error fetching service:', error)
    return NextResponse.json({ error: 'Failed to fetch service' }, { status: 500 })
  }
}
