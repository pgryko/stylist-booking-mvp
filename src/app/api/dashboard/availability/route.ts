import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { Prisma } from '@prisma/client'

// Validation schema for availability updates
const availabilitySchema = z.object({
  eventId: z.string().min(1, 'Event ID is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Start time must be in HH:MM format'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'End time must be in HH:MM format'),
})

// GET /api/dashboard/availability - Get stylist availability
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== 'STYLIST') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('eventId')
    const month = searchParams.get('month') // YYYY-MM format

    // Find the stylist
    const stylist = await prisma.stylist.findUnique({
      where: { userId: session.user.id },
    })

    if (!stylist) {
      return NextResponse.json({ error: 'Stylist profile not found' }, { status: 404 })
    }

    // Build the query
    const whereClause: Prisma.AvailabilityWhereInput = {
      stylistId: stylist.id,
    }

    if (eventId) {
      whereClause.eventId = eventId
    }

    if (month) {
      const [year, monthNum] = month.split('-').map(Number)
      const startDate = new Date(year, monthNum - 1, 1)
      const endDate = new Date(year, monthNum, 0) // Last day of month

      whereClause.date = {
        gte: startDate,
        lte: endDate,
      }
    }

    const availabilities = await prisma.availability.findMany({
      where: whereClause,
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
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    })

    return NextResponse.json({
      availabilities: availabilities.map((availability) => ({
        id: availability.id,
        eventId: availability.eventId,
        date: availability.date.toISOString().split('T')[0], // YYYY-MM-DD format
        startTime: availability.startTime,
        endTime: availability.endTime,
        event: availability.event,
        createdAt: availability.createdAt,
        updatedAt: availability.updatedAt,
      })),
    })
  } catch (error) {
    console.error('Error fetching availability:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/dashboard/availability - Create new availability
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== 'STYLIST') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Validate the request body
    const validationResult = availabilitySchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const { eventId, date, startTime, endTime } = validationResult.data

    // Find the stylist
    const stylist = await prisma.stylist.findUnique({
      where: { userId: session.user.id },
    })

    if (!stylist) {
      return NextResponse.json({ error: 'Stylist profile not found' }, { status: 404 })
    }

    // Verify the event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    })

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Validate time logic
    if (startTime >= endTime) {
      return NextResponse.json({ error: 'Start time must be before end time' }, { status: 400 })
    }

    // Check for existing availability on the same date and event
    const existingAvailability = await prisma.availability.findFirst({
      where: {
        stylistId: stylist.id,
        eventId,
        date: new Date(date),
      },
    })

    if (existingAvailability) {
      return NextResponse.json(
        { error: 'Availability already exists for this event and date' },
        { status: 409 }
      )
    }

    // Create the availability
    const availability = await prisma.availability.create({
      data: {
        stylistId: stylist.id,
        eventId,
        date: new Date(date),
        startTime,
        endTime,
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

    return NextResponse.json(
      {
        id: availability.id,
        eventId: availability.eventId,
        date: availability.date.toISOString().split('T')[0],
        startTime: availability.startTime,
        endTime: availability.endTime,
        event: availability.event,
        createdAt: availability.createdAt,
        updatedAt: availability.updatedAt,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating availability:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
