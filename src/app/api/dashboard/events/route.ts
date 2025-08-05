import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

// GET /api/dashboard/events - Get available events for stylist availability
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== 'STYLIST') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const upcoming = searchParams.get('upcoming') === 'true'
    const active = searchParams.get('active') === 'true'

    // Build the query
    const whereClause: Prisma.EventWhereInput = {}

    if (active) {
      whereClause.isActive = true
    }

    if (upcoming) {
      whereClause.startDate = {
        gte: new Date(),
      }
    }

    const events = await prisma.event.findMany({
      where: whereClause,
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
      },
      orderBy: [{ startDate: 'asc' }, { name: 'asc' }],
    })

    return NextResponse.json({
      events: events.map((event) => ({
        ...event,
        startDate: event.startDate.toISOString(),
        endDate: event.endDate.toISOString(),
      })),
    })
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
