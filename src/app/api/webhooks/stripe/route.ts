import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { prisma } from '@/lib/db'
import { stripeWebhooks } from '@/lib/stripe'
import Stripe from 'stripe'

// POST /api/webhooks/stripe - Handle Stripe webhook events
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      console.error('Missing Stripe signature')
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error('Missing STRIPE_WEBHOOK_SECRET environment variable')
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
    }

    // Verify webhook signature
    let event: Stripe.Event
    try {
      event = stripeWebhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET)
    } catch (error) {
      console.error('Webhook signature verification failed:', error)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    console.log(`Received Stripe webhook: ${event.type}`)

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent)
        break

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent)
        break

      case 'account.updated':
        await handleAccountUpdated(event.data.object as Stripe.Account, event.account)
        break

      case 'charge.dispute.created':
        await handleChargeDispute(event.data.object as Stripe.Dispute)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

// Handle successful payment intent
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    const booking = await prisma.booking.findFirst({
      where: { stripePaymentIntentId: paymentIntent.id },
    })

    if (!booking) {
      console.error(`Booking not found for payment intent: ${paymentIntent.id}`)
      return
    }

    // Update booking status
    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        paymentStatus: 'SUCCEEDED',
        paidAt: new Date(),
        stripeChargeId: paymentIntent.latest_charge as string,
      },
    })

    // Create payout record for the stylist
    const payoutDate = new Date()
    payoutDate.setDate(payoutDate.getDate() + 2) // Schedule payout for 2 days later

    await prisma.payout.create({
      data: {
        bookingId: booking.id,
        stylistId: booking.stylistId,
        amount: booking.stylistPayout,
        currency: booking.currency,
        status: 'PENDING',
        scheduledFor: payoutDate,
      },
    })

    console.log(`Payment succeeded for booking ${booking.id}`)
  } catch (error) {
    console.error('Error handling payment success:', error)
  }
}

// Handle failed payment intent
async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    const booking = await prisma.booking.findFirst({
      where: { stripePaymentIntentId: paymentIntent.id },
    })

    if (!booking) {
      console.error(`Booking not found for payment intent: ${paymentIntent.id}`)
      return
    }

    // Update booking status
    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        paymentStatus: 'FAILED',
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancelReason: 'Payment failed',
      },
    })

    console.log(`Payment failed for booking ${booking.id}`)
  } catch (error) {
    console.error('Error handling payment failure:', error)
  }
}

// Handle Stripe account updates
async function handleAccountUpdated(account: Stripe.Account, connectedAccountId?: string) {
  try {
    const accountId = connectedAccountId || account.id

    const stylist = await prisma.stylist.findFirst({
      where: { stripeAccountId: accountId },
    })

    if (!stylist) {
      console.log(`No stylist found for Stripe account: ${accountId}`)
      return
    }

    // Determine account status
    let status = 'pending'
    if (account.charges_enabled && account.payouts_enabled) {
      status = 'active'
    } else if (account.requirements?.disabled_reason) {
      status = 'restricted'
    }

    // Update stylist account status
    await prisma.stylist.update({
      where: { id: stylist.id },
      data: {
        stripeAccountStatus: status,
      },
    })

    console.log(`Updated account status for stylist ${stylist.id}: ${status}`)
  } catch (error) {
    console.error('Error handling account update:', error)
  }
}

// Handle charge disputes
async function handleChargeDispute(dispute: Stripe.Dispute) {
  try {
    const booking = await prisma.booking.findFirst({
      where: { stripeChargeId: dispute.charge as string },
    })

    if (!booking) {
      console.error(`Booking not found for charge: ${dispute.charge}`)
      return
    }

    // Update booking with dispute information
    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        paymentStatus: 'REFUNDED', // Simplified - in production you'd have a DISPUTED status
      },
    })

    // Cancel any pending payouts
    await prisma.payout.updateMany({
      where: {
        bookingId: booking.id,
        status: 'PENDING',
      },
      data: {
        status: 'CANCELLED',
        failureReason: 'Payment disputed',
      },
    })

    console.log(`Dispute created for booking ${booking.id}`)
  } catch (error) {
    console.error('Error handling charge dispute:', error)
  }
}
