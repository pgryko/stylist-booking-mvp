import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
if (!process.env.CLOUDINARY_CLOUD_NAME) {
  throw new Error('CLOUDINARY_CLOUD_NAME is not set in environment variables')
}

if (!process.env.CLOUDINARY_API_KEY) {
  throw new Error('CLOUDINARY_API_KEY is not set in environment variables')
}

if (!process.env.CLOUDINARY_API_SECRET) {
  throw new Error('CLOUDINARY_API_SECRET is not set in environment variables')
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Upload options for different image types
export const uploadPresets = {
  portfolio: {
    folder: 'stylists/portfolio',
    transformation: [
      { width: 1200, height: 800, crop: 'fill', quality: 'auto:good' },
      { format: 'auto' },
    ],
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    max_file_size: 5000000, // 5MB in bytes
  },
  profile: {
    folder: 'stylists/profiles',
    transformation: [
      { width: 400, height: 400, crop: 'fill', quality: 'auto:good' },
      { format: 'auto' },
    ],
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    max_file_size: 2000000, // 2MB in bytes
  },
}

// Cloudinary helper functions
export const cloudinaryHelpers = {
  // Upload image from buffer/base64
  async uploadImage(
    imageData: string | Buffer,
    options: {
      folder: string
      public_id?: string
      transformation?: Record<string, string | number>[]
      tags?: string[]
    }
  ) {
    try {
      const result = await cloudinary.uploader.upload(imageData, {
        folder: options.folder,
        public_id: options.public_id,
        transformation: options.transformation,
        tags: options.tags,
        resource_type: 'image',
      })

      return {
        public_id: result.public_id,
        secure_url: result.secure_url,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
        created_at: result.created_at,
      }
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error)
      throw error
    }
  },

  // Delete image by public_id
  async deleteImage(publicId: string) {
    try {
      const result = await cloudinary.uploader.destroy(publicId)
      return result
    } catch (error) {
      console.error('Error deleting from Cloudinary:', error)
      throw error
    }
  },

  // Upload portfolio image
  async uploadPortfolioImage(imageData: string | Buffer, stylistId: string, filename?: string) {
    const public_id = filename
      ? `${stylistId}/${filename.replace(/\.[^/.]+$/, '')}`
      : `${stylistId}/${Date.now()}`

    return this.uploadImage(imageData, {
      folder: uploadPresets.portfolio.folder,
      public_id,
      transformation: uploadPresets.portfolio.transformation,
      tags: ['portfolio', `stylist_${stylistId}`],
    })
  },

  // Upload profile image
  async uploadProfileImage(imageData: string | Buffer, stylistId: string) {
    return this.uploadImage(imageData, {
      folder: uploadPresets.profile.folder,
      public_id: `${stylistId}_profile`,
      transformation: uploadPresets.profile.transformation,
      tags: ['profile', `stylist_${stylistId}`],
    })
  },

  // Get optimized image URL
  getOptimizedUrl(
    publicId: string,
    options: {
      width?: number
      height?: number
      crop?: string
      quality?: string
      format?: string
    } = {}
  ) {
    return cloudinary.url(publicId, {
      width: options.width,
      height: options.height,
      crop: options.crop || 'fill',
      quality: options.quality || 'auto:good',
      format: options.format || 'auto',
    })
  },

  // Generate thumbnail URL
  getThumbnailUrl(publicId: string, size: number = 150) {
    return cloudinary.url(publicId, {
      width: size,
      height: size,
      crop: 'fill',
      quality: 'auto:good',
      format: 'auto',
    })
  },

  // Validate image file
  validateImageFile(file: File): { valid: boolean; error?: string } {
    // Check file size (5MB limit for portfolio, 2MB for profile)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File size must be less than ${maxSize / (1024 * 1024)}MB`,
      }
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'File must be a JPEG, PNG, or WebP image',
      }
    }

    return { valid: true }
  },

  // Convert file to base64 for upload
  async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => reject(error)
    })
  },
}

export default cloudinary
