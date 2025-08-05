import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
})

// Stripe Connect helper functions
export const stripeConnect = {
  // Create a Stripe Connect account for a stylist
  async createConnectAccount(stylistData: {
    email: string
    firstName?: string
    lastName?: string
    country: string
  }) {
    try {
      const account = await stripe.accounts.create({
        type: 'express',
        country: stylistData.country,
        email: stylistData.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: 'individual',
        individual: {
          first_name: stylistData.firstName,
          last_name: stylistData.lastName,
          email: stylistData.email,
        },
        settings: {
          payouts: {
            schedule: {
              interval: 'weekly',
              weekly_anchor: 'friday',
            },
          },
        },
      })

      return account
    } catch (error) {
      console.error('Error creating Stripe Connect account:', error)
      throw error
    }
  },

  // Create an account link for onboarding
  async createAccountLink(accountId: string, refreshUrl: string, returnUrl: string) {
    try {
      const accountLink = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: refreshUrl,
        return_url: returnUrl,
        type: 'account_onboarding',
      })

      return accountLink
    } catch (error) {
      console.error('Error creating account link:', error)
      throw error
    }
  },

  // Get account details
  async getAccount(accountId: string) {
    try {
      const account = await stripe.accounts.retrieve(accountId)
      return account
    } catch (error) {
      console.error('Error retrieving Stripe account:', error)
      throw error
    }
  },

  // Create login link for existing accounts
  async createLoginLink(accountId: string) {
    try {
      const loginLink = await stripe.accounts.createLoginLink(accountId)
      return loginLink
    } catch (error) {
      console.error('Error creating login link:', error)
      throw error
    }
  },

  // Check if account is fully onboarded
  isAccountComplete(account: Stripe.Account): boolean {
    return !!(account.details_submitted && account.charges_enabled && account.payouts_enabled)
  },

  // Get account status
  getAccountStatus(account: Stripe.Account): {
    status: 'incomplete' | 'pending' | 'active' | 'restricted'
    requiresAction: boolean
    canAcceptPayments: boolean
    canReceivePayouts: boolean
  } {
    const requiresAction =
      account.requirements?.currently_due?.length > 0 ||
      account.requirements?.eventually_due?.length > 0

    let status: 'incomplete' | 'pending' | 'active' | 'restricted' = 'incomplete'

    if (account.charges_enabled && account.payouts_enabled) {
      status = 'active'
    } else if (account.details_submitted) {
      status = 'pending'
    } else if (account.requirements?.disabled_reason) {
      status = 'restricted'
    }

    return {
      status,
      requiresAction,
      canAcceptPayments: account.charges_enabled || false,
      canReceivePayouts: account.payouts_enabled || false,
    }
  },
}

// Payment processing functions
export const stripePayments = {
  // Create a payment intent for a booking
  async createPaymentIntent(options: {
    amount: number // in cents
    currency: string
    connectedAccountId: string
    applicationFeeAmount: number // in cents (platform fee)
    transferGroup?: string
    metadata?: Record<string, string>
  }) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: options.amount,
        currency: options.currency,
        application_fee_amount: options.applicationFeeAmount,
        transfer_data: {
          destination: options.connectedAccountId,
        },
        transfer_group: options.transferGroup,
        metadata: options.metadata,
      })

      return paymentIntent
    } catch (error) {
      console.error('Error creating payment intent:', error)
      throw error
    }
  },

  // Confirm a payment intent
  async confirmPaymentIntent(paymentIntentId: string, paymentMethodId: string) {
    try {
      const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
        payment_method: paymentMethodId,
      })

      return paymentIntent
    } catch (error) {
      console.error('Error confirming payment intent:', error)
      throw error
    }
  },

  // Refund a payment
  async refundPayment(paymentIntentId: string, amount?: number) {
    try {
      const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount,
        refund_application_fee: true,
        reverse_transfer: true,
      })

      return refund
    } catch (error) {
      console.error('Error processing refund:', error)
      throw error
    }
  },

  // Get payment intent details
  async getPaymentIntent(paymentIntentId: string) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
      return paymentIntent
    } catch (error) {
      console.error('Error retrieving payment intent:', error)
      throw error
    }
  },
}

// Webhook handling
export const stripeWebhooks = {
  // Construct and verify webhook event
  constructEvent(payload: string | Buffer, signature: string, secret: string) {
    try {
      const event = stripe.webhooks.constructEvent(payload, signature, secret)
      return event
    } catch (error) {
      console.error('Error verifying webhook signature:', error)
      throw error
    }
  },
}

export default stripe
