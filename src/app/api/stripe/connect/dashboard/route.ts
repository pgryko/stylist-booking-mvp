import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { stripeConnect } from '@/lib/stripe'

// POST /api/stripe/connect/dashboard - Get Stripe dashboard link
export async function POST() {
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

    if (!stylist.stripeAccountId) {
      return NextResponse.json(
        { error: 'No Stripe account found. Please complete onboarding first.' },
        { status: 400 }
      )
    }

    try {
      // Verify account exists and get status
      const account = await stripeConnect.getAccount(stylist.stripeAccountId)

      if (!stripeConnect.isAccountComplete(account)) {
        // Account is not complete, redirect to onboarding
        const refreshUrl = `${process.env.NEXTAUTH_URL}/dashboard/settings?stripe=refresh`
        const returnUrl = `${process.env.NEXTAUTH_URL}/dashboard/settings?stripe=success`

        const accountLink = await stripeConnect.createAccountLink(
          stylist.stripeAccountId,
          refreshUrl,
          returnUrl
        )

        return NextResponse.json({
          url: accountLink.url,
          type: 'onboarding',
          message: 'Account setup is incomplete. Redirecting to complete onboarding.',
        })
      }

      // Account is complete, create login link
      const loginLink = await stripeConnect.createLoginLink(stylist.stripeAccountId)

      return NextResponse.json({
        url: loginLink.url,
        type: 'dashboard',
        message: 'Redirecting to Stripe dashboard.',
      })
    } catch (error) {
      console.error('Error creating dashboard link:', error)

      // If account is invalid, clear it from database
      await prisma.stylist.update({
        where: { id: stylist.id },
        data: {
          stripeAccountId: null,
          stripeAccountStatus: null,
        },
      })

      return NextResponse.json(
        { error: 'Stripe account not found or invalid. Please restart onboarding.' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error accessing Stripe dashboard:', error)
    return NextResponse.json({ error: 'Failed to access dashboard' }, { status: 500 })
  }
}
