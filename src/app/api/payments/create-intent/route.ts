import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { stripePayments } from '@/lib/stripe'
import { z } from 'zod'

// Validation schema for payment intent creation
const createPaymentIntentSchema = z.object({
  serviceId: z.string().min(1, 'Service ID is required'),
  eventId: z.string().min(1, 'Event ID is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Start time must be in HH:MM format'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'End time must be in HH:MM format'),
})

// POST /api/payments/create-intent - Create payment intent for booking
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== 'DANCER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Validate the request body
    const validationResult = createPaymentIntentSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const { serviceId, eventId, date, startTime, endTime } = validationResult.data

    // Find the service and stylist
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: {
        stylist: {
          select: {
            id: true,
            displayName: true,
            stripeAccountId: true,
            stripeAccountStatus: true,
          },
        },
      },
    })

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    if (!service.isActive) {
      return NextResponse.json({ error: 'Service is not available' }, { status: 400 })
    }

    // Check if stylist has a valid Stripe account
    if (!service.stylist.stripeAccountId) {
      return NextResponse.json({ error: 'Stylist payment account not set up' }, { status: 400 })
    }

    // Verify the event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    })

    if (!event || !event.isActive) {
      return NextResponse.json({ error: 'Event not found or inactive' }, { status: 404 })
    }

    // Check stylist availability
    const availability = await prisma.availability.findFirst({
      where: {
        stylistId: service.stylist.id,
        eventId,
        date: new Date(date),
      },
    })

    if (!availability) {
      return NextResponse.json(
        { error: 'Stylist not available for selected date' },
        { status: 400 }
      )
    }

    // Validate time slot is within availability
    if (startTime < availability.startTime || endTime > availability.endTime) {
      return NextResponse.json(
        { error: 'Requested time is outside available hours' },
        { status: 400 }
      )
    }

    // Check for booking conflicts
    const existingBooking = await prisma.booking.findFirst({
      where: {
        stylistId: service.stylist.id,
        eventId,
        date: new Date(date),
        status: 'CONFIRMED',
        OR: [
          {
            AND: [
              { startTime: { lte: new Date(`${date}T${startTime}:00Z`) } },
              { endTime: { gt: new Date(`${date}T${startTime}:00Z`) } },
            ],
          },
          {
            AND: [
              { startTime: { lt: new Date(`${date}T${endTime}:00Z`) } },
              { endTime: { gte: new Date(`${date}T${endTime}:00Z`) } },
            ],
          },
        ],
      },
    })

    if (existingBooking) {
      return NextResponse.json({ error: 'Time slot is already booked' }, { status: 409 })
    }

    // Calculate dynamic pricing
    const currentDate = new Date()
    const bookingDate = new Date(date)
    const advanceBookingDays = Math.floor(
      (bookingDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
    )

    // Get dynamic pricing calculation
    let finalPrice = service.price
    let appliedRules: Array<{
      id: string
      name: string
      ruleType: string
      modifierType: string
      modifierValue: number
      previousPrice: number
      newPrice: number
      priceChange: number
    }> = []

    try {
      const pricingResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/pricing/calculate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceId,
          eventId,
          date,
          startTime,
          endTime,
          advanceBookingDays: Math.max(0, advanceBookingDays),
        }),
      })

      if (pricingResponse.ok) {
        const pricingData = await pricingResponse.json()
        finalPrice = pricingData.finalPrice
        appliedRules = pricingData.appliedRules || []
      } else {
        console.warn('Failed to get dynamic pricing, using base price')
      }
    } catch (error) {
      console.warn('Error calculating dynamic pricing, using base price:', error)
    }

    // Calculate fees based on final price
    const servicePrice = finalPrice
    const platformFeeRate = 0.15 // 15% platform fee
    const platformFee = Math.round(servicePrice * platformFeeRate * 100) // in cents
    const stylistPayout = Math.round(servicePrice * (1 - platformFeeRate) * 100) // in cents
    const totalAmount = Math.round(servicePrice * 100) // in cents

    // Create booking record first
    const booking = await prisma.booking.create({
      data: {
        dancerId: session.user.id,
        stylistId: service.stylist.id,
        eventId,
        serviceId,
        date: new Date(date),
        startTime: new Date(`${date}T${startTime}:00Z`),
        endTime: new Date(`${date}T${endTime}:00Z`),
        servicePrice,
        platformFee: platformFee / 100,
        stylistPayout: stylistPayout / 100,
        currency: 'USD',
        status: 'CONFIRMED',
        paymentStatus: 'PENDING',
      },
    })

    // Create Stripe payment intent
    const paymentIntent = await stripePayments.createPaymentIntent({
      amount: totalAmount,
      currency: 'usd',
      connectedAccountId: service.stylist.stripeAccountId,
      applicationFeeAmount: platformFee,
      transferGroup: `booking_${booking.id}`,
      metadata: {
        bookingId: booking.id,
        dancerId: session.user.id,
        stylistId: service.stylist.id,
        serviceId,
        eventId,
      },
    })

    // Update booking with payment intent ID
    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        stripePaymentIntentId: paymentIntent.id,
      },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      bookingId: booking.id,
      amount: totalAmount,
      currency: 'usd',
      serviceDetails: {
        name: service.name,
        description: service.description,
        duration: service.duration,
        stylistName: service.stylist.displayName,
      },
      eventDetails: {
        name: event.name,
        venue: event.venue,
        date,
        startTime,
        endTime,
      },
      pricing: {
        basePrice: service.price,
        finalPrice: servicePrice,
        priceChange: servicePrice - service.price,
        platformFee: platformFee / 100,
        total: servicePrice,
        appliedRules,
      },
    })
  } catch (error) {
    console.error('Error creating payment intent:', error)
    return NextResponse.json({ error: 'Failed to create payment intent' }, { status: 500 })
  }
}
