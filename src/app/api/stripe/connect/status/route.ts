import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { stripeConnect } from '@/lib/stripe'

// GET /api/stripe/connect/status - Get Stripe Connect account status
export async function GET() {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== 'STYLIST') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find the stylist
    const stylist = await prisma.stylist.findUnique({
      where: { userId: session.user.id },
    })

    if (!stylist) {
      return NextResponse.json({ error: 'Stylist profile not found' }, { status: 404 })
    }

    // If no Stripe account exists
    if (!stylist.stripeAccountId) {
      return NextResponse.json({
        hasAccount: false,
        status: 'not_created',
        canAcceptPayments: false,
        canReceivePayouts: false,
        requiresAction: false,
      })
    }

    try {
      // Get account details from Stripe
      const account = await stripeConnect.getAccount(stylist.stripeAccountId)
      const accountStatus = stripeConnect.getAccountStatus(account)

      // Update local database with current status
      const statusString =
        accountStatus.canAcceptPayments && accountStatus.canReceivePayouts
          ? 'active'
          : accountStatus.status

      await prisma.stylist.update({
        where: { id: stylist.id },
        data: {
          stripeAccountStatus: statusString,
        },
      })

      return NextResponse.json({
        hasAccount: true,
        accountId: stylist.stripeAccountId,
        status: accountStatus.status,
        canAcceptPayments: accountStatus.canAcceptPayments,
        canReceivePayouts: accountStatus.canReceivePayouts,
        requiresAction: accountStatus.requiresAction,
        requirements: {
          currentlyDue: account.requirements?.currently_due || [],
          eventuallyDue: account.requirements?.eventually_due || [],
          pendingVerification: account.requirements?.pending_verification || [],
        },
        payoutsEnabled: account.payouts_enabled,
        chargesEnabled: account.charges_enabled,
        detailsSubmitted: account.details_submitted,
      })
    } catch (error) {
      console.error('Error retrieving Stripe account:', error)

      // If account is invalid or deleted, clear it from database
      await prisma.stylist.update({
        where: { id: stylist.id },
        data: {
          stripeAccountId: null,
          stripeAccountStatus: null,
        },
      })

      return NextResponse.json({
        hasAccount: false,
        status: 'error',
        canAcceptPayments: false,
        canReceivePayouts: false,
        requiresAction: false,
        error: 'Stripe account not found or invalid',
      })
    }
  } catch (error) {
    console.error('Error checking Stripe Connect status:', error)
    return NextResponse.json({ error: 'Failed to check account status' }, { status: 500 })
  }
}
