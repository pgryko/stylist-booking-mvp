import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

// Validation schema for pricing rule creation/updates
const pricingRuleSchema = z.object({
  serviceId: z.string().min(1, 'Service ID is required'),
  name: z.string().min(1, 'Rule name is required').max(100, 'Name must be under 100 characters'),
  description: z.string().max(500, 'Description must be under 500 characters').optional(),
  ruleType: z.enum([
    'TIME_BASED',
    'ADVANCE_BOOKING',
    'EVENT_BASED',
    'SEASONAL',
    'GROUP_SIZE',
    'DEMAND_BASED',
  ]),
  modifierType: z.enum(['PERCENTAGE', 'FIXED_AMOUNT']),
  modifierValue: z
    .number()
    .min(-1, 'Modifier value must be greater than -100%')
    .max(10, 'Modifier value must be reasonable'),
  priority: z.number().int().min(0).max(100).default(0),
  isActive: z.boolean().default(true),
  conditions: z.record(z.string(), z.any()).default({}),
})

// GET /api/dashboard/pricing-rules - Get pricing rules for stylist
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== 'STYLIST') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const serviceId = searchParams.get('serviceId')

    // Find the stylist
    const stylist = await prisma.stylist.findUnique({
      where: { userId: session.user.id },
    })

    if (!stylist) {
      return NextResponse.json({ error: 'Stylist profile not found' }, { status: 404 })
    }

    // Build query
    const whereClause = {
      stylistId: stylist.id,
      ...(serviceId && { serviceId }),
    }

    const pricingRules = await prisma.pricingRule.findMany({
      where: whereClause,
      include: {
        service: {
          select: {
            id: true,
            name: true,
            price: true,
          },
        },
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    })

    return NextResponse.json({
      pricingRules: pricingRules.map((rule) => ({
        ...rule,
        conditions: JSON.parse(rule.conditions),
      })),
    })
  } catch (error) {
    console.error('Error fetching pricing rules:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/dashboard/pricing-rules - Create new pricing rule
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== 'STYLIST') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Validate the request body
    const validationResult = pricingRuleSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Find the stylist
    const stylist = await prisma.stylist.findUnique({
      where: { userId: session.user.id },
    })

    if (!stylist) {
      return NextResponse.json({ error: 'Stylist profile not found' }, { status: 404 })
    }

    // Verify the service belongs to the stylist
    const service = await prisma.service.findFirst({
      where: {
        id: data.serviceId,
        stylistId: stylist.id,
      },
    })

    if (!service) {
      return NextResponse.json(
        { error: 'Service not found or not owned by stylist' },
        { status: 404 }
      )
    }

    // Create the pricing rule
    const pricingRule = await prisma.pricingRule.create({
      data: {
        ...data,
        stylistId: stylist.id,
        conditions: JSON.stringify(data.conditions),
      },
      include: {
        service: {
          select: {
            id: true,
            name: true,
            price: true,
          },
        },
      },
    })

    return NextResponse.json(
      {
        ...pricingRule,
        conditions: JSON.parse(pricingRule.conditions),
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating pricing rule:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
