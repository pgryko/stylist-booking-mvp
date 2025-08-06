import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

// Types for pricing rule conditions
interface TimeBasedConditions {
  daysOfWeek?: number[]
  timeRange?: {
    start: string
    end: string
  }
}

interface AdvanceBookingConditions {
  minDays?: number
  maxDays?: number
}

interface EventBasedConditions {
  eventTypes?: string[]
}

interface SeasonalConditions {
  months?: number[]
}

interface GroupSizeConditions {
  minDuration?: number
  maxDuration?: number
}

interface DemandBasedConditions {
  // Future: add demand-based conditions
  [key: string]: unknown
}

type RuleConditions =
  | TimeBasedConditions
  | AdvanceBookingConditions
  | EventBasedConditions
  | SeasonalConditions
  | GroupSizeConditions
  | DemandBasedConditions

interface PricingRule {
  id: string
  serviceId: string
  name: string
  description: string | null
  ruleType: string
  modifierType: string
  modifierValue: number
  priority: number
  isActive: boolean
  conditions: string
}

interface PricingContext {
  serviceId: string
  eventId: string
  date: string
  startTime: string
  endTime: string
  duration: number
  advanceBookingDays: number
  event: {
    id: string
    name: string
    isActive: boolean
  }
  service: {
    id: string
    name: string
    price: number
    isActive: boolean
  }
}

// Validation schema for pricing calculation
const pricingCalculationSchema = z.object({
  serviceId: z.string().min(1, 'Service ID is required'),
  eventId: z.string().min(1, 'Event ID is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Start time must be in HH:MM format'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'End time must be in HH:MM format'),
  advanceBookingDays: z.number().int().min(0).optional().default(0),
})

// Helper function to check if a rule applies based on conditions
function doesRuleApply(rule: PricingRule, context: PricingContext): boolean {
  const conditions = JSON.parse(rule.conditions) as RuleConditions

  switch (rule.ruleType) {
    case 'TIME_BASED':
      return checkTimeBasedRule(conditions as TimeBasedConditions, context)
    case 'ADVANCE_BOOKING':
      return checkAdvanceBookingRule(conditions as AdvanceBookingConditions, context)
    case 'EVENT_BASED':
      return checkEventBasedRule(conditions as EventBasedConditions)
    case 'SEASONAL':
      return checkSeasonalRule(conditions as SeasonalConditions, context)
    case 'GROUP_SIZE':
      return checkGroupSizeRule(conditions as GroupSizeConditions, context)
    case 'DEMAND_BASED':
      return checkDemandBasedRule()
    default:
      return false
  }
}

function checkTimeBasedRule(conditions: TimeBasedConditions, context: PricingContext): boolean {
  const bookingDate = new Date(context.date)
  const dayOfWeek = bookingDate.getDay() // 0 = Sunday, 6 = Saturday
  const hour = parseInt(context.startTime.split(':')[0])

  // Check day of week conditions
  if (conditions.daysOfWeek && conditions.daysOfWeek.length > 0) {
    if (!conditions.daysOfWeek.includes(dayOfWeek)) {
      return false
    }
  }

  // Check time range conditions
  if (conditions.timeRange) {
    const startHour = parseInt(conditions.timeRange.start.split(':')[0])
    const endHour = parseInt(conditions.timeRange.end.split(':')[0])

    if (hour < startHour || hour >= endHour) {
      return false
    }
  }

  return true
}

function checkAdvanceBookingRule(
  conditions: AdvanceBookingConditions,
  context: PricingContext
): boolean {
  const advanceBookingDays = context.advanceBookingDays

  if (conditions.minDays !== undefined && advanceBookingDays < conditions.minDays) {
    return false
  }

  if (conditions.maxDays !== undefined && advanceBookingDays > conditions.maxDays) {
    return false
  }

  return true
}

function checkEventBasedRule(conditions: EventBasedConditions): boolean {
  // For now, just check if the event matches
  if (conditions.eventTypes && conditions.eventTypes.length > 0) {
    // This would need event type information from the event
    return true // Simplified for now
  }

  return true
}

function checkSeasonalRule(conditions: SeasonalConditions, context: PricingContext): boolean {
  const bookingDate = new Date(context.date)
  const month = bookingDate.getMonth() + 1 // 1-12

  if (conditions.months && conditions.months.length > 0) {
    return conditions.months.includes(month)
  }

  return true
}

function checkGroupSizeRule(conditions: GroupSizeConditions, context: PricingContext): boolean {
  const duration = context.duration // in minutes

  if (conditions.minDuration !== undefined && duration < conditions.minDuration) {
    return false
  }

  if (conditions.maxDuration !== undefined && duration > conditions.maxDuration) {
    return false
  }

  return true
}

function checkDemandBasedRule(): boolean {
  // This would check current demand/availability
  // For now, always return true (simplified)
  return true
}

// Helper function to apply pricing modifier
function applyModifier(basePrice: number, rule: PricingRule): number {
  if (rule.modifierType === 'PERCENTAGE') {
    return basePrice * (1 + rule.modifierValue)
  } else if (rule.modifierType === 'FIXED_AMOUNT') {
    return basePrice + rule.modifierValue
  }

  return basePrice
}

// POST /api/pricing/calculate - Calculate dynamic pricing
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate the request body
    const validationResult = pricingCalculationSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const { serviceId, eventId, date, startTime, endTime, advanceBookingDays } =
      validationResult.data

    // Find the service
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: {
        stylist: {
          select: {
            id: true,
            displayName: true,
          },
        },
      },
    })

    if (!service || !service.isActive) {
      return NextResponse.json({ error: 'Service not found or inactive' }, { status: 404 })
    }

    // Find the event
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    })

    if (!event || !event.isActive) {
      return NextResponse.json({ error: 'Event not found or inactive' }, { status: 404 })
    }

    // Calculate duration in minutes
    const startDateTime = new Date(`${date}T${startTime}:00`)
    const endDateTime = new Date(`${date}T${endTime}:00`)
    const duration = (endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60)

    // Get all active pricing rules for this service
    const pricingRules = await prisma.pricingRule.findMany({
      where: {
        serviceId,
        isActive: true,
      },
      orderBy: { priority: 'desc' },
    })

    // Build context for rule evaluation
    const context = {
      serviceId,
      eventId,
      date,
      startTime,
      endTime,
      duration,
      advanceBookingDays,
      event,
      service,
    }

    // Apply pricing rules
    let finalPrice = service.price
    const appliedRules: Array<{
      id: string
      name: string
      ruleType: string
      modifierType: string
      modifierValue: number
      previousPrice: number
      newPrice: number
      priceChange: number
    }> = []

    for (const rule of pricingRules) {
      if (doesRuleApply(rule, context)) {
        const previousPrice = finalPrice
        finalPrice = applyModifier(finalPrice, rule)

        appliedRules.push({
          id: rule.id,
          name: rule.name,
          ruleType: rule.ruleType,
          modifierType: rule.modifierType,
          modifierValue: rule.modifierValue,
          previousPrice,
          newPrice: finalPrice,
          priceChange: finalPrice - previousPrice,
        })
      }
    }

    // Ensure price doesn't go below a minimum (e.g., 20% of base price)
    const minimumPrice = service.price * 0.2
    if (finalPrice < minimumPrice) {
      finalPrice = minimumPrice
    }

    // Calculate platform fee (15%)
    const platformFeeRate = 0.15
    const platformFee = finalPrice * platformFeeRate
    const stylistPayout = finalPrice - platformFee

    return NextResponse.json({
      basePrice: service.price,
      finalPrice: Math.round(finalPrice * 100) / 100, // Round to 2 decimal places
      priceChange: Math.round((finalPrice - service.price) * 100) / 100,
      priceChangePercentage:
        Math.round(((finalPrice - service.price) / service.price) * 10000) / 100,
      platformFee: Math.round(platformFee * 100) / 100,
      stylistPayout: Math.round(stylistPayout * 100) / 100,
      appliedRules,
      context: {
        serviceName: service.name,
        stylistName: service.stylist.displayName,
        eventName: event.name,
        duration,
        advanceBookingDays,
      },
    })
  } catch (error) {
    console.error('Error calculating pricing:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
