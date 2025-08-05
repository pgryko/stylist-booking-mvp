'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Loader2,
  Upload,
  Image as ImageIcon,
  Edit,
  Trash2,
  Eye,
  Plus,
  AlertCircle,
  CheckCircle,
  X,
  Camera,
} from 'lucide-react'

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
  thumbnailUrl?: string
  optimizedUrl?: string
  fullUrl?: string
}

interface UploadForm {
  image: File | null
  title: string
  description: string
}

export function PortfolioManagement() {
  const [images, setImages] = useState<PortfolioImage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [selectedImage, setSelectedImage] = useState<PortfolioImage | null>(null)
  const [uploadForm, setUploadForm] = useState<UploadForm>({
    image: null,
    title: '',
    description: '',
  })
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
  })
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load portfolio images on component mount
  useEffect(() => {
    loadImages()
  }, [])

  const loadImages = async () => {
    try {
      const response = await fetch('/api/dashboard/portfolio')
      if (!response.ok) throw new Error('Failed to fetch portfolio images')
      const data = await response.json()
      setImages(data.images)
    } catch (error) {
      console.error('Error loading images:', error)
      setMessage({ type: 'error', text: 'Failed to load portfolio images' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'File size must be less than 5MB' })
      return
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setMessage({ type: 'error', text: 'File must be a JPEG, PNG, or WebP image' })
      return
    }

    setUploadForm((prev) => ({ ...prev, image: file }))

    // Create preview URL
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!uploadForm.image) return

    setIsUploading(true)
    setMessage(null)

    try {
      const formData = new FormData()
      formData.append('image', uploadForm.image)
      formData.append('title', uploadForm.title)
      formData.append('description', uploadForm.description)

      const response = await fetch('/api/dashboard/portfolio', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to upload image')
      }

      const data = await response.json()
      setImages((prev) => [...prev, data.image])
      setMessage({ type: 'success', text: 'Image uploaded successfully!' })
      setShowUploadDialog(false)
      resetUploadForm()
    } catch (error) {
      console.error('Error uploading image:', error)
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to upload image',
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedImage) return

    setIsUploading(true)
    setMessage(null)

    try {
      const response = await fetch(`/api/dashboard/portfolio/${selectedImage.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update image')
      }

      const data = await response.json()
      setImages((prev) => prev.map((img) => (img.id === selectedImage.id ? data.image : img)))
      setMessage({ type: 'success', text: 'Image updated successfully!' })
      setShowEditDialog(false)
      setSelectedImage(null)
    } catch (error) {
      console.error('Error updating image:', error)
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to update image',
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (image: PortfolioImage) => {
    if (!confirm(`Are you sure you want to delete "${image.title || 'this image'}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/dashboard/portfolio/${image.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete image')
      }

      setImages((prev) => prev.filter((img) => img.id !== image.id))
      setMessage({ type: 'success', text: 'Image deleted successfully!' })
    } catch (error) {
      console.error('Error deleting image:', error)
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to delete image',
      })
    }
  }

  const openEditDialog = (image: PortfolioImage) => {
    setSelectedImage(image)
    setEditForm({
      title: image.title,
      description: image.description,
    })
    setShowEditDialog(true)
  }

  const openViewDialog = (image: PortfolioImage) => {
    setSelectedImage(image)
    setShowViewDialog(true)
  }

  const resetUploadForm = () => {
    setUploadForm({
      image: null,
      title: '',
      description: '',
    })
    setPreviewUrl('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        <span className="ml-2 text-gray-600">Loading portfolio...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {message && (
        <Alert className={message.type === 'success' ? 'border-green-200 bg-green-50' : ''}>
          {message.type === 'success' ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertDescription className={message.type === 'success' ? 'text-green-800' : ''}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Camera className="h-5 w-5 mr-2" />
                Portfolio Management
              </CardTitle>
              <CardDescription>
                Upload and manage your portfolio images to showcase your work to potential clients
              </CardDescription>
            </div>
            <Button onClick={() => setShowUploadDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Upload Image
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>{images.length} images in portfolio</span>
            <span>Maximum 20 images allowed</span>
          </div>
        </CardContent>
      </Card>

      {/* Portfolio Grid */}
      {images.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No portfolio images yet</h3>
              <p className="text-gray-500 mb-4">
                Start building your portfolio by uploading your best work
              </p>
              <Button onClick={() => setShowUploadDialog(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Your First Image
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {images.map((image) => (
            <Card key={image.id} className="overflow-hidden">
              <div className="relative aspect-square">
                <img
                  src={image.thumbnailUrl || image.secure_url}
                  alt={image.title || 'Portfolio image'}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                  <div className="opacity-0 hover:opacity-100 transition-opacity duration-200 flex space-x-2">
                    <Button size="sm" variant="secondary" onClick={() => openViewDialog(image)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => openEditDialog(image)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => handleDelete(image)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <CardContent className="p-4">
                <h4 className="font-medium text-gray-900 truncate">{image.title || 'Untitled'}</h4>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                  {image.description || 'No description'}
                </p>
                <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                  <span>
                    {image.width} × {image.height}
                  </span>
                  <span>{formatFileSize(image.bytes)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Portfolio Image</DialogTitle>
            <DialogDescription>
              Add a new image to your portfolio. Images will be optimized automatically.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUploadSubmit} className="space-y-4">
            <div>
              <Label htmlFor="image">Image File</Label>
              <Input
                ref={fileInputRef}
                id="image"
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileSelect}
                required
              />
              <p className="text-xs text-gray-500 mt-1">JPEG, PNG, or WebP. Maximum 5MB.</p>
            </div>

            {previewUrl && (
              <div className="relative">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="absolute top-2 right-2"
                  onClick={resetUploadForm}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            <div>
              <Label htmlFor="title">Title (Optional)</Label>
              <Input
                id="title"
                value={uploadForm.title}
                onChange={(e) => setUploadForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Give your image a title"
                maxLength={100}
              />
            </div>

            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={uploadForm.description}
                onChange={(e) =>
                  setUploadForm((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Describe the styling work shown in this image"
                rows={3}
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">
                {uploadForm.description.length}/500 characters
              </p>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowUploadDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isUploading || !uploadForm.image}>
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Image Details</DialogTitle>
            <DialogDescription>
              Update the title and description for this portfolio image.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={editForm.title}
                onChange={(e) => setEditForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Give your image a title"
                maxLength={100}
              />
            </div>

            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editForm.description}
                onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the styling work shown in this image"
                rows={3}
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">
                {editForm.description.length}/500 characters
              </p>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isUploading}>
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedImage?.title || 'Portfolio Image'}</DialogTitle>
          </DialogHeader>

          {selectedImage && (
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={
                    selectedImage.fullUrl || selectedImage.optimizedUrl || selectedImage.secure_url
                  }
                  alt={selectedImage.title || 'Portfolio image'}
                  className="w-full max-h-[60vh] object-contain rounded-lg"
                />
              </div>

              {selectedImage.description && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                  <p className="text-gray-600">{selectedImage.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                <div>
                  <span className="font-medium">Dimensions:</span> {selectedImage.width} ×{' '}
                  {selectedImage.height}
                </div>
                <div>
                  <span className="font-medium">Size:</span> {formatFileSize(selectedImage.bytes)}
                </div>
                <div>
                  <span className="font-medium">Format:</span> {selectedImage.format.toUpperCase()}
                </div>
                <div>
                  <span className="font-medium">Uploaded:</span>{' '}
                  {new Date(selectedImage.uploaded_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => selectedImage && openEditDialog(selectedImage)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Details
            </Button>
            <Button variant="outline" onClick={() => setShowViewDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
