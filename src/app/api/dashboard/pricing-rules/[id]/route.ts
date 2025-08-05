import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

// Validation schema for pricing rule updates
const pricingRuleUpdateSchema = z.object({
  name: z
    .string()
    .min(1, 'Rule name is required')
    .max(100, 'Name must be under 100 characters')
    .optional(),
  description: z.string().max(500, 'Description must be under 500 characters').optional(),
  ruleType: z
    .enum([
      'TIME_BASED',
      'ADVANCE_BOOKING',
      'EVENT_BASED',
      'SEASONAL',
      'GROUP_SIZE',
      'DEMAND_BASED',
    ])
    .optional(),
  modifierType: z.enum(['PERCENTAGE', 'FIXED_AMOUNT']).optional(),
  modifierValue: z
    .number()
    .min(-1, 'Modifier value must be greater than -100%')
    .max(10, 'Modifier value must be reasonable')
    .optional(),
  priority: z.number().int().min(0).max(100).optional(),
  isActive: z.boolean().optional(),
  conditions: z.record(z.any()).optional(),
})

interface RouteContext {
  params: Promise<{ id: string }>
}

// PUT /api/dashboard/pricing-rules/[id] - Update pricing rule
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== 'STYLIST') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params
    const body = await request.json()

    // Validate the request body
    const validationResult = pricingRuleUpdateSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    // Find the stylist
    const stylist = await prisma.stylist.findUnique({
      where: { userId: session.user.id },
    })

    if (!stylist) {
      return NextResponse.json({ error: 'Stylist profile not found' }, { status: 404 })
    }

    // Find the pricing rule and verify ownership
    const existingRule = await prisma.pricingRule.findFirst({
      where: {
        id,
        stylistId: stylist.id,
      },
    })

    if (!existingRule) {
      return NextResponse.json({ error: 'Pricing rule not found' }, { status: 404 })
    }

    const updateData = validationResult.data

    // Update the pricing rule
    const updatedRule = await prisma.pricingRule.update({
      where: { id },
      data: {
        ...updateData,
        ...(updateData.conditions && { conditions: JSON.stringify(updateData.conditions) }),
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

    return NextResponse.json({
      ...updatedRule,
      conditions: JSON.parse(updatedRule.conditions),
    })
  } catch (error) {
    console.error('Error updating pricing rule:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/dashboard/pricing-rules/[id] - Delete pricing rule
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== 'STYLIST') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params

    // Find the stylist
    const stylist = await prisma.stylist.findUnique({
      where: { userId: session.user.id },
    })

    if (!stylist) {
      return NextResponse.json({ error: 'Stylist profile not found' }, { status: 404 })
    }

    // Find the pricing rule and verify ownership
    const existingRule = await prisma.pricingRule.findFirst({
      where: {
        id,
        stylistId: stylist.id,
      },
    })

    if (!existingRule) {
      return NextResponse.json({ error: 'Pricing rule not found' }, { status: 404 })
    }

    // Delete the pricing rule
    await prisma.pricingRule.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Pricing rule deleted successfully' })
  } catch (error) {
    console.error('Error deleting pricing rule:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/dashboard/pricing-rules/[id] - Get single pricing rule
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== 'STYLIST') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params

    // Find the stylist
    const stylist = await prisma.stylist.findUnique({
      where: { userId: session.user.id },
    })

    if (!stylist) {
      return NextResponse.json({ error: 'Stylist profile not found' }, { status: 404 })
    }

    // Find the pricing rule and verify ownership
    const pricingRule = await prisma.pricingRule.findFirst({
      where: {
        id,
        stylistId: stylist.id,
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

    if (!pricingRule) {
      return NextResponse.json({ error: 'Pricing rule not found' }, { status: 404 })
    }

    return NextResponse.json({
      ...pricingRule,
      conditions: JSON.parse(pricingRule.conditions),
    })
  } catch (error) {
    console.error('Error fetching pricing rule:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
