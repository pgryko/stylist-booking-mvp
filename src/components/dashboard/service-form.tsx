'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Clock, DollarSign, Save, X } from 'lucide-react'

interface Service {
  id: string
  name: string
  description?: string | null
  price: number
  duration: number
  isActive: boolean
}

interface ServiceFormProps {
  service?: Service
  onSubmit: (data: ServiceFormData) => Promise<void>
  onCancel: () => void
}

interface ServiceFormData {
  name: string
  description: string
  price: number
  duration: number
  isActive: boolean
}

interface ServiceFormErrors {
  name?: string
  description?: string
  price?: string
  duration?: string
  isActive?: string
}

const COMMON_SERVICES = [
  { name: 'Competition Hair Updo', price: 75, duration: 60 },
  { name: 'Competition Makeup', price: 50, duration: 45 },
  { name: 'Hair & Makeup Package', price: 120, duration: 90 },
  { name: 'Hair Styling', price: 60, duration: 45 },
  { name: 'Airbrush Makeup', price: 65, duration: 50 },
  { name: 'Lash Application', price: 25, duration: 20 },
  { name: 'Nail Art', price: 35, duration: 30 },
  { name: 'Touch-up Service', price: 30, duration: 25 },
]

export function ServiceForm({ service, onSubmit, onCancel }: ServiceFormProps) {
  const [formData, setFormData] = useState<ServiceFormData>({
    name: service?.name || '',
    description: service?.description || '',
    price: service?.price || 0,
    duration: service?.duration || 60,
    isActive: service?.isActive ?? true,
  })

  const [errors, setErrors] = useState<ServiceFormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: ServiceFormErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Service name is required'
    } else if (formData.name.length < 2) {
      newErrors.name = 'Service name must be at least 2 characters'
    } else if (formData.name.length > 100) {
      newErrors.name = 'Service name must be less than 100 characters'
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters'
    }

    if (!formData.price || formData.price <= 0) {
      newErrors.price = 'Price must be greater than 0'
    } else if (formData.price > 1000) {
      newErrors.price = 'Price must be less than $1000'
    }

    if (!formData.duration || formData.duration <= 0) {
      newErrors.duration = 'Duration must be greater than 0'
    } else if (formData.duration > 480) {
      newErrors.duration = 'Duration must be less than 8 hours'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      setIsSubmitting(true)
      await onSubmit(formData)
    } catch (error) {
      console.error('Error submitting service:', error)
      // Error handling is done in the parent component
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleQuickSelect = (template: (typeof COMMON_SERVICES)[0]) => {
    setFormData({
      ...formData,
      name: template.name,
      price: template.price,
      duration: template.duration,
    })
  }

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours === 0) return `${mins}m`
    if (mins === 0) return `${hours}h`
    return `${hours}h ${mins}m`
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Quick Service Templates */}
      {!service && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Quick Templates</label>
          <div className="grid grid-cols-2 gap-2">
            {COMMON_SERVICES.slice(0, 6).map((template, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleQuickSelect(template)}
                className="p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="font-medium text-sm text-gray-900">{template.name}</div>
                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    {template.price}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDuration(template.duration)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Service Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          Service Name *
        </label>
        <Input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Competition Hair Updo"
          className={errors.name ? 'border-red-500' : ''}
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe your service, what's included, any special techniques..."
          rows={3}
          className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
            errors.description ? 'border-red-500' : ''
          }`}
        />
        <div className="flex justify-between mt-1">
          {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
          <p className="text-sm text-gray-500 ml-auto">{formData.description.length}/500</p>
        </div>
      </div>

      {/* Price and Duration */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
            Price (USD) *
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="price"
              type="number"
              min="1"
              max="1000"
              step="0.01"
              value={formData.price || ''}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
              placeholder="75.00"
              className={`pl-10 ${errors.price ? 'border-red-500' : ''}`}
            />
          </div>
          {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
        </div>

        <div>
          <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
            Duration (minutes) *
          </label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="duration"
              type="number"
              min="15"
              max="480"
              step="15"
              value={formData.duration || ''}
              onChange={(e) =>
                setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })
              }
              placeholder="60"
              className={`pl-10 ${errors.duration ? 'border-red-500' : ''}`}
            />
          </div>
          {formData.duration > 0 && (
            <p className="mt-1 text-sm text-gray-500">
              Duration: {formatDuration(formData.duration)}
            </p>
          )}
          {errors.duration && <p className="mt-1 text-sm text-red-600">{errors.duration}</p>}
        </div>
      </div>

      {/* Quick Duration Buttons */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Common Durations</label>
        <div className="flex flex-wrap gap-2">
          {[30, 45, 60, 75, 90, 120].map((minutes) => (
            <button
              key={minutes}
              type="button"
              onClick={() => setFormData({ ...formData, duration: minutes })}
              className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                formData.duration === minutes
                  ? 'bg-purple-100 border-purple-500 text-purple-700'
                  : 'border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {formatDuration(minutes)}
            </button>
          ))}
        </div>
      </div>

      {/* Active Status */}
      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
          />
          <span className="ml-2 text-sm text-gray-700">
            Service is active and available for booking
          </span>
        </label>
        {!formData.isActive && (
          <p className="mt-1 text-sm text-gray-500">
            Inactive services won&apos;t appear in your public profile
          </p>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-gradient-to-r from-purple-600 to-gold-500 hover:from-purple-700 hover:to-gold-600"
        >
          <Save className="h-4 w-4 mr-2" />
          {isSubmitting ? 'Saving...' : service ? 'Update Service' : 'Create Service'}
        </Button>
      </div>
    </form>
  )
}
