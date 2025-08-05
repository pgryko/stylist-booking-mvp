import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { cloudinaryHelpers } from '@/lib/cloudinary'

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

// GET /api/dashboard/portfolio - Get stylist portfolio images
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

    // Parse portfolio images from JSON
    const portfolioImages = Array.isArray(stylist.portfolioImages)
      ? stylist.portfolioImages
      : JSON.parse((stylist.portfolioImages as string) || '[]')

    // Generate optimized URLs for each image
    const imagesWithUrls = portfolioImages.map((image: PortfolioImage) => ({
      ...image,
      thumbnailUrl: image.public_id
        ? cloudinaryHelpers.getThumbnailUrl(image.public_id, 300)
        : image.secure_url,
      optimizedUrl: image.public_id
        ? cloudinaryHelpers.getOptimizedUrl(image.public_id, { width: 800, height: 600 })
        : image.secure_url,
    }))

    return NextResponse.json({
      images: imagesWithUrls,
      total: imagesWithUrls.length,
    })
  } catch (error) {
    console.error('Error fetching portfolio:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/dashboard/portfolio - Upload new portfolio image
export async function POST(request: NextRequest) {
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

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('image') as File
    const title = formData.get('title') as string
    const description = formData.get('description') as string

    if (!file) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 })
    }

    // Validate file
    const validation = cloudinaryHelpers.validateImageFile(file)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    // Convert file to base64
    const base64Data = await cloudinaryHelpers.fileToBase64(file)

    // Upload to Cloudinary
    const uploadResult = await cloudinaryHelpers.uploadPortfolioImage(
      base64Data,
      stylist.id,
      file.name
    )

    // Get current portfolio images
    const currentImages = Array.isArray(stylist.portfolioImages)
      ? stylist.portfolioImages
      : JSON.parse((stylist.portfolioImages as string) || '[]')

    // Add new image to portfolio
    const newImage = {
      id: Date.now().toString(), // Simple ID for now
      public_id: uploadResult.public_id,
      secure_url: uploadResult.secure_url,
      width: uploadResult.width,
      height: uploadResult.height,
      format: uploadResult.format,
      bytes: uploadResult.bytes,
      title: title || '',
      description: description || '',
      uploaded_at: new Date().toISOString(),
    }

    const updatedImages = [...currentImages, newImage]

    // Update stylist portfolio in database
    await prisma.stylist.update({
      where: { id: stylist.id },
      data: {
        portfolioImages: JSON.stringify(updatedImages),
      },
    })

    // Return the new image with optimized URLs
    const imageWithUrls = {
      ...newImage,
      thumbnailUrl: cloudinaryHelpers.getThumbnailUrl(uploadResult.public_id, 300),
      optimizedUrl: cloudinaryHelpers.getOptimizedUrl(uploadResult.public_id, {
        width: 800,
        height: 600,
      }),
    }

    return NextResponse.json(
      {
        image: imageWithUrls,
        message: 'Image uploaded successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error uploading portfolio image:', error)
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 })
  }
}
