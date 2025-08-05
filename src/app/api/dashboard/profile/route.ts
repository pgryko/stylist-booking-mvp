import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

// Validation schema for profile updates
const profileUpdateSchema = z.object({
  displayName: z.string().min(2, 'Display name must be at least 2 characters'),
  bio: z
    .string()
    .min(10, 'Bio must be at least 10 characters')
    .max(500, 'Bio must be under 500 characters'),
  specialty: z.string().min(2, 'Specialty is required'),
  yearsExperience: z
    .number()
    .min(0, 'Years of experience must be 0 or greater')
    .max(50, 'Years of experience must be realistic')
    .optional(),
  profileImageUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  usWorkPermit: z.boolean(),
  fullLegalName: z.string().optional().or(z.literal('')),
  taxId: z.string().optional().or(z.literal('')),
  address: z
    .object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      postalCode: z.string().optional(),
      country: z.string().optional(),
    })
    .optional(),
  bankDetails: z
    .object({
      accountHolderName: z.string().optional(),
      routingNumber: z.string().optional(),
      accountNumber: z.string().optional(),
    })
    .optional(),
})

// GET /api/dashboard/profile - Get stylist profile
export async function GET() {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== 'STYLIST') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const stylist = await prisma.stylist.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: {
            email: true,
            phone: true,
          },
        },
      },
    })

    if (!stylist) {
      return NextResponse.json({ error: 'Stylist profile not found' }, { status: 404 })
    }

    // Parse JSON fields safely
    const portfolioImages = Array.isArray(stylist.portfolioImages)
      ? stylist.portfolioImages
      : JSON.parse((stylist.portfolioImages as string) || '[]')

    const address = stylist.address
      ? typeof stylist.address === 'string'
        ? JSON.parse(stylist.address)
        : stylist.address
      : null

    const bankDetails = stylist.bankDetails
      ? typeof stylist.bankDetails === 'string'
        ? JSON.parse(stylist.bankDetails)
        : stylist.bankDetails
      : null

    return NextResponse.json({
      id: stylist.id,
      displayName: stylist.displayName,
      bio: stylist.bio,
      profileImageUrl: stylist.profileImageUrl,
      portfolioImages,
      specialty: stylist.specialty,
      yearsExperience: stylist.yearsExperience,
      email: stylist.user.email,
      phone: stylist.user.phone,
      isVerified: stylist.isVerified,
      verifiedAt: stylist.verifiedAt,
      usWorkPermit: stylist.usWorkPermit,
      usWorkPermitVerifiedAt: stylist.usWorkPermitVerifiedAt,
      fullLegalName: stylist.fullLegalName,
      address,
      taxId: stylist.taxId,
      bankDetails,
      stripeAccountId: stylist.stripeAccountId,
      stripeAccountStatus: stylist.stripeAccountStatus,
    })
  } catch (error) {
    console.error('Error fetching stylist profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/dashboard/profile - Update stylist profile
export async function PUT(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== 'STYLIST') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Validate the request body
    const validationResult = profileUpdateSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Find the stylist
    const existingStylist = await prisma.stylist.findUnique({
      where: { userId: session.user.id },
    })

    if (!existingStylist) {
      return NextResponse.json({ error: 'Stylist profile not found' }, { status: 404 })
    }

    // Update the stylist profile
    const updatedStylist = await prisma.stylist.update({
      where: { userId: session.user.id },
      data: {
        displayName: data.displayName,
        bio: data.bio,
        specialty: data.specialty,
        yearsExperience: data.yearsExperience,
        profileImageUrl: data.profileImageUrl || null,
        usWorkPermit: data.usWorkPermit,
        fullLegalName: data.fullLegalName || null,
        taxId: data.taxId || null,
        address: data.address ? JSON.stringify(data.address) : null,
        bankDetails: data.bankDetails ? JSON.stringify(data.bankDetails) : null,
      },
      include: {
        user: {
          select: {
            email: true,
            phone: true,
          },
        },
      },
    })

    // Parse JSON fields for response
    const portfolioImages = Array.isArray(updatedStylist.portfolioImages)
      ? updatedStylist.portfolioImages
      : JSON.parse((updatedStylist.portfolioImages as string) || '[]')

    const address = updatedStylist.address ? JSON.parse(updatedStylist.address as string) : null

    const bankDetails = updatedStylist.bankDetails
      ? JSON.parse(updatedStylist.bankDetails as string)
      : null

    return NextResponse.json({
      id: updatedStylist.id,
      displayName: updatedStylist.displayName,
      bio: updatedStylist.bio,
      profileImageUrl: updatedStylist.profileImageUrl,
      portfolioImages,
      specialty: updatedStylist.specialty,
      yearsExperience: updatedStylist.yearsExperience,
      email: updatedStylist.user.email,
      phone: updatedStylist.user.phone,
      isVerified: updatedStylist.isVerified,
      verifiedAt: updatedStylist.verifiedAt,
      usWorkPermit: updatedStylist.usWorkPermit,
      usWorkPermitVerifiedAt: updatedStylist.usWorkPermitVerifiedAt,
      fullLegalName: updatedStylist.fullLegalName,
      address,
      taxId: updatedStylist.taxId,
      bankDetails,
      stripeAccountId: updatedStylist.stripeAccountId,
      stripeAccountStatus: updatedStylist.stripeAccountStatus,
    })
  } catch (error) {
    console.error('Error updating stylist profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
