import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { cloudinaryHelpers } from '@/lib/cloudinary'
import { z } from 'zod'

interface PortfolioImage {
  id: string
  public_id: string
  secure_url: string
  width: number
  height: number
  format: string
  bytes: number
  title: string
  description: string
  uploaded_at: string
  updated_at?: string
}

// Validation schema for portfolio image updates
const portfolioUpdateSchema = z.object({
  title: z.string().max(100, 'Title must be under 100 characters').optional(),
  description: z.string().max(500, 'Description must be under 500 characters').optional(),
})

interface RouteContext {
  params: Promise<{ id: string }>
}

// PUT /api/dashboard/portfolio/[id] - Update portfolio image metadata
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== 'STYLIST') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params
    const body = await request.json()

    // Validate the request body
    const validationResult = portfolioUpdateSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.issues },
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

    // Get current portfolio images
    const currentImages = Array.isArray(stylist.portfolioImages)
      ? stylist.portfolioImages
      : JSON.parse((stylist.portfolioImages as string) || '[]')

    // Find the image to update
    const imageIndex = currentImages.findIndex((img: PortfolioImage) => img.id === id)
    if (imageIndex === -1) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 })
    }

    // Update the image metadata
    const updatedImage = {
      ...currentImages[imageIndex],
      ...validationResult.data,
      updated_at: new Date().toISOString(),
    }

    // Update the images array
    const updatedImages = [...currentImages]
    updatedImages[imageIndex] = updatedImage

    // Update stylist portfolio in database
    await prisma.stylist.update({
      where: { id: stylist.id },
      data: {
        portfolioImages: JSON.stringify(updatedImages),
      },
    })

    // Return the updated image with optimized URLs
    const imageWithUrls = {
      ...updatedImage,
      thumbnailUrl: updatedImage.public_id
        ? cloudinaryHelpers.getThumbnailUrl(updatedImage.public_id, 300)
        : updatedImage.secure_url,
      optimizedUrl: updatedImage.public_id
        ? cloudinaryHelpers.getOptimizedUrl(updatedImage.public_id, { width: 800, height: 600 })
        : updatedImage.secure_url,
    }

    return NextResponse.json({
      image: imageWithUrls,
      message: 'Image updated successfully',
    })
  } catch (error) {
    console.error('Error updating portfolio image:', error)
    return NextResponse.json({ error: 'Failed to update image' }, { status: 500 })
  }
}

// DELETE /api/dashboard/portfolio/[id] - Delete portfolio image
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

    // Get current portfolio images
    const currentImages = Array.isArray(stylist.portfolioImages)
      ? stylist.portfolioImages
      : JSON.parse((stylist.portfolioImages as string) || '[]')

    // Find the image to delete
    const imageToDelete = currentImages.find((img: PortfolioImage) => img.id === id)
    if (!imageToDelete) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 })
    }

    // Delete from Cloudinary if it has a public_id
    if (imageToDelete.public_id) {
      try {
        await cloudinaryHelpers.deleteImage(imageToDelete.public_id)
      } catch (cloudinaryError) {
        console.error('Error deleting from Cloudinary:', cloudinaryError)
        // Continue with database deletion even if Cloudinary deletion fails
      }
    }

    // Remove the image from the array
    const updatedImages = currentImages.filter((img: PortfolioImage) => img.id !== id)

    // Update stylist portfolio in database
    await prisma.stylist.update({
      where: { id: stylist.id },
      data: {
        portfolioImages: JSON.stringify(updatedImages),
      },
    })

    return NextResponse.json({
      message: 'Image deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting portfolio image:', error)
    return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 })
  }
}

// GET /api/dashboard/portfolio/[id] - Get single portfolio image
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

    // Get current portfolio images
    const currentImages = Array.isArray(stylist.portfolioImages)
      ? stylist.portfolioImages
      : JSON.parse((stylist.portfolioImages as string) || '[]')

    // Find the specific image
    const image = currentImages.find((img: PortfolioImage) => img.id === id)
    if (!image) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 })
    }

    // Return the image with optimized URLs
    const imageWithUrls = {
      ...image,
      thumbnailUrl: image.public_id
        ? cloudinaryHelpers.getThumbnailUrl(image.public_id, 300)
        : image.secure_url,
      optimizedUrl: image.public_id
        ? cloudinaryHelpers.getOptimizedUrl(image.public_id, { width: 800, height: 600 })
        : image.secure_url,
      fullUrl: image.public_id
        ? cloudinaryHelpers.getOptimizedUrl(image.public_id, { width: 1200, height: 800 })
        : image.secure_url,
    }

    return NextResponse.json({
      image: imageWithUrls,
    })
  } catch (error) {
    console.error('Error fetching portfolio image:', error)
    return NextResponse.json({ error: 'Failed to fetch image' }, { status: 500 })
  }
}
