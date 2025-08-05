import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

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
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Fetch dashboard statistics
    const [
      totalBookings,
      completedBookings,
      upcomingBookings,
      activeServices,
      upcomingEvents,
      recentBookings,
      upcomingEventsList,
      monthlyEarnings,
      totalEarnings,
    ] = await Promise.all([
      // Total bookings count
      prisma.booking.count({
        where: { stylistId },
      }),

      // Completed bookings count
      prisma.booking.count({
        where: { stylistId, status: 'COMPLETED' },
      }),

      // Upcoming bookings count
      prisma.booking.count({
        where: {
          stylistId,
          status: 'CONFIRMED',
          date: { gte: now },
        },
      }),

      // Active services count
      prisma.service.count({
        where: { stylistId, isActive: true },
      }),

      // Upcoming events with availability count
      prisma.availability.count({
        where: {
          stylistId,
          event: {
            startDate: { gte: now },
            isActive: true,
          },
        },
      }),

      // Recent bookings (last 10)
      prisma.booking.findMany({
        where: { stylistId },
        select: {
          id: true,
          date: true,
          status: true,
          service: {
            select: {
              name: true,
              price: true,
            },
          },
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
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),

      // Upcoming events with availability
      prisma.availability.findMany({
        where: {
          stylistId,
          event: {
            startDate: { gte: now },
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
              city: true,
              state: true,
              startDate: true,
            },
          },
        },
        orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
        take: 10,
      }),

      // Monthly earnings
      prisma.booking.aggregate({
        where: {
          stylistId,
          status: 'COMPLETED',
          completedAt: { gte: startOfMonth },
        },
        _sum: {
          stylistPayout: true,
        },
      }),

      // Total earnings
      prisma.booking.aggregate({
        where: {
          stylistId,
          status: 'COMPLETED',
        },
        _sum: {
          stylistPayout: true,
        },
      }),
    ])

    // Transform recent bookings data
    const transformedRecentBookings = recentBookings.map((booking) => ({
      id: booking.id,
      date: booking.date.toISOString(),
      service: {
        name: booking.service.name,
        price: Number(booking.service.price),
      },
      dancer: {
        name: booking.dancer.dancer
          ? `${booking.dancer.dancer.firstName} ${booking.dancer.dancer.lastName}`
          : booking.dancer.email.split('@')[0], // Fallback to email username
      },
      event: {
        name: booking.event.name,
        city: booking.event.city,
        state: booking.event.state,
      },
      status: booking.status,
    }))

    // Transform upcoming events data
    const transformedUpcomingEvents = upcomingEventsList.map((availability) => ({
      id: availability.event.id,
      name: availability.event.name,
      city: availability.event.city,
      state: availability.event.state,
      startDate: availability.event.startDate.toISOString(),
      availabilityDate: availability.date.toISOString(),
      timeSlot: `${availability.startTime} - ${availability.endTime}`,
    }))

    // Calculate profile views (mock data for now - would come from analytics service)
    const profileViews = Math.floor(Math.random() * 200) + 50

    const dashboardData = {
      stats: {
        totalEarnings: Number(totalEarnings._sum.stylistPayout || 0),
        monthlyEarnings: Number(monthlyEarnings._sum.stylistPayout || 0),
        totalBookings,
        completedBookings,
        upcomingBookings,
        activeServices,
        profileViews,
        upcomingEvents,
      },
      recentBookings: transformedRecentBookings,
      upcomingEvents: transformedUpcomingEvents,
    }

    return NextResponse.json(dashboardData)
  } catch (error) {
    console.error('Error fetching dashboard overview:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 })
  }
}
