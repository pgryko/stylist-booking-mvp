import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { stripeConnect } from '@/lib/stripe'

// POST /api/stripe/connect/onboard - Start Stripe Connect onboarding
export async function POST() {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== 'STYLIST') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find the stylist
    const stylist = await prisma.stylist.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    })

    if (!stylist) {
      return NextResponse.json({ error: 'Stylist profile not found' }, { status: 404 })
    }

    // Check if stylist already has a Stripe account
    if (stylist.stripeAccountId) {
      // If account exists, create a login link or onboarding link based on status
      try {
        const account = await stripeConnect.getAccount(stylist.stripeAccountId)

        if (stripeConnect.isAccountComplete(account)) {
          // Account is complete, create login link
          const loginLink = await stripeConnect.createLoginLink(stylist.stripeAccountId)
          return NextResponse.json({
            url: loginLink.url,
            type: 'login',
            accountId: stylist.stripeAccountId,
          })
        } else {
          // Account exists but incomplete, create onboarding link
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
            accountId: stylist.stripeAccountId,
          })
        }
      } catch (error) {
        console.error('Error handling existing Stripe account:', error)
        // If account is invalid, continue to create a new one
      }
    }

    // Parse stylist name for individual account
    const nameParts = stylist.displayName.split(' ')
    const firstName = nameParts[0] || ''
    const lastName = nameParts.slice(1).join(' ') || ''

    // Default to US, but in production you'd want to get this from stylist profile
    const country = 'US'

    // Create new Stripe Connect account
    const account = await stripeConnect.createConnectAccount({
      email: stylist.user.email,
      firstName,
      lastName,
      country,
    })

    // Update stylist with Stripe account ID
    await prisma.stylist.update({
      where: { id: stylist.id },
      data: {
        stripeAccountId: account.id,
        stripeAccountStatus: 'pending',
      },
    })

    // Create onboarding link
    const refreshUrl = `${process.env.NEXTAUTH_URL}/dashboard/settings?stripe=refresh`
    const returnUrl = `${process.env.NEXTAUTH_URL}/dashboard/settings?stripe=success`

    const accountLink = await stripeConnect.createAccountLink(account.id, refreshUrl, returnUrl)

    return NextResponse.json({
      url: accountLink.url,
      type: 'onboarding',
      accountId: account.id,
    })
  } catch (error) {
    console.error('Error starting Stripe Connect onboarding:', error)
    return NextResponse.json({ error: 'Failed to start onboarding process' }, { status: 500 })
  }
}
