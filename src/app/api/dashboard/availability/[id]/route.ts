import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

// Validation schema for availability updates
const availabilityUpdateSchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .optional(),
  startTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'Start time must be in HH:MM format')
    .optional(),
  endTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'End time must be in HH:MM format')
    .optional(),
})

interface RouteContext {
  params: Promise<{ id: string }>
}

// PUT /api/dashboard/availability/[id] - Update availability
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== 'STYLIST') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params
    const body = await request.json()

    // Validate the request body
    const validationResult = availabilityUpdateSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    // Find the stylist
    const stylist = await prisma.stylist.findUnique({
      where: { userId: session.user.id },
    })

    if (!stylist) {
      return NextResponse.json({ error: 'Stylist profile not found' }, { status: 404 })
    }

    // Find the availability and verify ownership
    const existingAvailability = await prisma.availability.findFirst({
      where: {
        id,
        stylistId: stylist.id,
      },
    })

    if (!existingAvailability) {
      return NextResponse.json({ error: 'Availability not found' }, { status: 404 })
    }

    const updateData = validationResult.data

    // Validate time logic if both times are provided
    if (updateData.startTime && updateData.endTime) {
      if (updateData.startTime >= updateData.endTime) {
        return NextResponse.json({ error: 'Start time must be before end time' }, { status: 400 })
      }
    }

    // If only one time is provided, validate against the existing time
    if (updateData.startTime && !updateData.endTime) {
      if (updateData.startTime >= existingAvailability.endTime) {
        return NextResponse.json({ error: 'Start time must be before end time' }, { status: 400 })
      }
    }

    if (updateData.endTime && !updateData.startTime) {
      if (existingAvailability.startTime >= updateData.endTime) {
        return NextResponse.json({ error: 'Start time must be before end time' }, { status: 400 })
      }
    }

    // Check for conflicts if date is being changed
    if (updateData.date) {
      const conflictingAvailability = await prisma.availability.findFirst({
        where: {
          stylistId: stylist.id,
          eventId: existingAvailability.eventId,
          date: new Date(updateData.date),
          id: { not: id }, // Exclude current availability
        },
      })

      if (conflictingAvailability) {
        return NextResponse.json(
          { error: 'Availability already exists for this event and date' },
          { status: 409 }
        )
      }
    }

    // Update the availability
    const updatedAvailability = await prisma.availability.update({
      where: { id },
      data: {
        ...(updateData.date && { date: new Date(updateData.date) }),
        ...(updateData.startTime && { startTime: updateData.startTime }),
        ...(updateData.endTime && { endTime: updateData.endTime }),
      },
      include: {
        event: {
          select: {
            id: true,
            name: true,
            slug: true,
            startDate: true,
            endDate: true,
            venue: true,
            city: true,
            state: true,
            country: true,
          },
        },
      },
    })

    return NextResponse.json({
      id: updatedAvailability.id,
      eventId: updatedAvailability.eventId,
      date: updatedAvailability.date.toISOString().split('T')[0],
      startTime: updatedAvailability.startTime,
      endTime: updatedAvailability.endTime,
      event: updatedAvailability.event,
      createdAt: updatedAvailability.createdAt,
      updatedAt: updatedAvailability.updatedAt,
    })
  } catch (error) {
    console.error('Error updating availability:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/dashboard/availability/[id] - Delete availability
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== 'STYLIST') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params

    // Find the stylist
    const stylist = await prisma.stylist.findUnique({
      where: { userId: session.user.id },
    })

    if (!stylist) {
      return NextResponse.json({ error: 'Stylist profile not found' }, { status: 404 })
    }

    // Find the availability and verify ownership
    const existingAvailability = await prisma.availability.findFirst({
      where: {
        id,
        stylistId: stylist.id,
      },
    })

    if (!existingAvailability) {
      return NextResponse.json({ error: 'Availability not found' }, { status: 404 })
    }

    // Check if there are any bookings for this availability
    const relatedBookings = await prisma.booking.findMany({
      where: {
        stylistId: stylist.id,
        eventId: existingAvailability.eventId,
        date: existingAvailability.date,
        status: {
          in: ['CONFIRMED'],
        },
      },
    })

    if (relatedBookings.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete availability with existing bookings' },
        { status: 409 }
      )
    }

    // Delete the availability
    await prisma.availability.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Availability deleted successfully' })
  } catch (error) {
    console.error('Error deleting availability:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
