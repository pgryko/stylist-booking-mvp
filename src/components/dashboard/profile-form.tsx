'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Save, User, Shield, DollarSign, AlertCircle, CheckCircle } from 'lucide-react'

interface ProfileData {
  id: string
  displayName: string
  bio: string
  profileImageUrl?: string
  specialty: string
  yearsExperience?: number
  email: string
  phone: string
  isVerified: boolean
  verifiedAt?: string
  usWorkPermit: boolean
  usWorkPermitVerifiedAt?: string
  fullLegalName?: string
  address?: {
    street?: string
    city?: string
    state?: string
    postalCode?: string
    country?: string
  }
  taxId?: string
  bankDetails?: {
    accountHolderName?: string
    routingNumber?: string
    accountNumber?: string
  }
  stripeAccountId?: string
  stripeAccountStatus?: string
}

interface ProfileFormErrors {
  displayName?: string
  bio?: string
  specialty?: string
  yearsExperience?: string
  profileImageUrl?: string
  fullLegalName?: string
  taxId?: string
  address?: {
    street?: string
    city?: string
    state?: string
    postalCode?: string
    country?: string
  }
  bankDetails?: {
    accountHolderName?: string
    routingNumber?: string
    accountNumber?: string
  }
}

export function ProfileForm() {
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [formData, setFormData] = useState<Partial<ProfileData>>({})
  const [errors, setErrors] = useState<ProfileFormErrors>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  // Load profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/dashboard/profile')
        if (!response.ok) {
          throw new Error('Failed to fetch profile')
        }
        const data = await response.json()
        setProfileData(data)
        setFormData({
          displayName: data.displayName || '',
          bio: data.bio || '',
          specialty: data.specialty || '',
          yearsExperience: data.yearsExperience || 0,
          profileImageUrl: data.profileImageUrl || '',
          usWorkPermit: data.usWorkPermit || false,
          fullLegalName: data.fullLegalName || '',
          taxId: data.taxId || '',
          address: data.address || {
            street: '',
            city: '',
            state: '',
            postalCode: '',
            country: '',
          },
          bankDetails: data.bankDetails || {
            accountHolderName: '',
            routingNumber: '',
            accountNumber: '',
          },
        })
      } catch (error) {
        console.error('Error loading profile:', error)
        setSaveMessage({ type: 'error', message: 'Failed to load profile data' })
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const validateForm = (): boolean => {
    const newErrors: ProfileFormErrors = {}

    if (!formData.displayName || formData.displayName.length < 2) {
      newErrors.displayName = 'Display name must be at least 2 characters'
    }

    if (!formData.bio || formData.bio.length < 10) {
      newErrors.bio = 'Bio must be at least 10 characters'
    } else if (formData.bio.length > 500) {
      newErrors.bio = 'Bio must be under 500 characters'
    }

    if (!formData.specialty || formData.specialty.length < 2) {
      newErrors.specialty = 'Specialty is required'
    }

    if (formData.yearsExperience !== undefined && formData.yearsExperience < 0) {
      newErrors.yearsExperience = 'Years of experience must be 0 or greater'
    }

    if (formData.profileImageUrl && formData.profileImageUrl.length > 0) {
      try {
        new URL(formData.profileImageUrl)
      } catch {
        newErrors.profileImageUrl = 'Must be a valid URL'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof ProfileData, value: string | number | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    // Clear field error when user starts typing
    if (errors[field as keyof ProfileFormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }))
    }
  }

  const handleAddressChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value,
      },
    }))
  }

  const handleBankDetailsChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      bankDetails: {
        ...prev.bankDetails,
        [field]: value,
      },
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSaving(true)
    setSaveMessage(null)

    try {
      const response = await fetch('/api/dashboard/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update profile')
      }

      const updatedData = await response.json()
      setProfileData(updatedData)
      setSaveMessage({ type: 'success', message: 'Profile updated successfully!' })
    } catch (error) {
      console.error('Error updating profile:', error)
      setSaveMessage({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to update profile',
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        <span className="ml-2 text-gray-600">Loading profile...</span>
      </div>
    )
  }

  if (!profileData) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load profile data. Please refresh the page and try again.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {saveMessage && (
        <Alert className={saveMessage.type === 'success' ? 'border-green-200 bg-green-50' : ''}>
          {saveMessage.type === 'success' ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertDescription className={saveMessage.type === 'success' ? 'text-green-800' : ''}>
            {saveMessage.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Public Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            Public Profile
          </CardTitle>
          <CardDescription>
            This information will be visible to potential clients browsing your profile.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="displayName">Display Name *</Label>
              <Input
                id="displayName"
                value={formData.displayName || ''}
                onChange={(e) => handleInputChange('displayName', e.target.value)}
                placeholder="Professional name shown to clients"
              />
              {errors.displayName && (
                <p className="text-sm text-red-600 mt-1">{errors.displayName}</p>
              )}
            </div>
            <div>
              <Label htmlFor="specialty">Specialty *</Label>
              <Input
                id="specialty"
                value={formData.specialty || ''}
                onChange={(e) => handleInputChange('specialty', e.target.value)}
                placeholder="e.g., Ballroom, Latin, Competition"
              />
              {errors.specialty && <p className="text-sm text-red-600 mt-1">{errors.specialty}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="bio">Bio *</Label>
            <Textarea
              id="bio"
              value={formData.bio || ''}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="Tell clients about your experience, style, and what makes you unique..."
              rows={4}
            />
            <p className="text-sm text-gray-500 mt-1">
              {(formData.bio || '').length}/500 characters
            </p>
            {errors.bio && <p className="text-sm text-red-600 mt-1">{errors.bio}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="yearsExperience">Years of Experience</Label>
              <Input
                id="yearsExperience"
                type="number"
                min="0"
                max="50"
                value={formData.yearsExperience || ''}
                onChange={(e) =>
                  handleInputChange('yearsExperience', parseInt(e.target.value) || 0)
                }
              />
              {errors.yearsExperience && (
                <p className="text-sm text-red-600 mt-1">{errors.yearsExperience}</p>
              )}
            </div>
            <div>
              <Label htmlFor="profileImageUrl">Profile Image URL</Label>
              <Input
                id="profileImageUrl"
                type="url"
                value={formData.profileImageUrl || ''}
                onChange={(e) => handleInputChange('profileImageUrl', e.target.value)}
                placeholder="https://example.com/your-photo.jpg"
              />
              {errors.profileImageUrl && (
                <p className="text-sm text-red-600 mt-1">{errors.profileImageUrl}</p>
              )}
            </div>
          </div>

          {/* Verification Status */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Verification Status</h4>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                {profileData.isVerified ? (
                  <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-amber-500 mr-1" />
                )}
                <span className="text-sm text-gray-600">
                  Profile {profileData.isVerified ? 'Verified' : 'Not Verified'}
                </span>
              </div>
              {profileData.verifiedAt && (
                <span className="text-xs text-gray-500">
                  Verified on {new Date(profileData.verifiedAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Compliance & Legal
          </CardTitle>
          <CardDescription>
            Required information for legal compliance and work authorization.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="usWorkPermit"
              checked={formData.usWorkPermit || false}
              onCheckedChange={(checked) => handleInputChange('usWorkPermit', checked)}
            />
            <Label htmlFor="usWorkPermit">I am authorized to work in the United States</Label>
          </div>
          {profileData.usWorkPermitVerifiedAt && (
            <p className="text-xs text-gray-500">
              Work authorization verified on{' '}
              {new Date(profileData.usWorkPermitVerifiedAt).toLocaleDateString()}
            </p>
          )}

          <div>
            <Label htmlFor="fullLegalName">Full Legal Name</Label>
            <Input
              id="fullLegalName"
              value={formData.fullLegalName || ''}
              onChange={(e) => handleInputChange('fullLegalName', e.target.value)}
              placeholder="As appears on government ID"
            />
          </div>

          <div>
            <Label htmlFor="taxId">Tax ID / SSN</Label>
            <Input
              id="taxId"
              value={formData.taxId || ''}
              onChange={(e) => handleInputChange('taxId', e.target.value)}
              placeholder="For tax reporting purposes"
              type="password"
            />
          </div>

          {/* Address */}
          <div>
            <Label className="text-base font-medium">Address</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div className="md:col-span-2">
                <Input
                  placeholder="Street Address"
                  value={formData.address?.street || ''}
                  onChange={(e) => handleAddressChange('street', e.target.value)}
                />
              </div>
              <div>
                <Input
                  placeholder="City"
                  value={formData.address?.city || ''}
                  onChange={(e) => handleAddressChange('city', e.target.value)}
                />
              </div>
              <div>
                <Input
                  placeholder="State/Province"
                  value={formData.address?.state || ''}
                  onChange={(e) => handleAddressChange('state', e.target.value)}
                />
              </div>
              <div>
                <Input
                  placeholder="Postal Code"
                  value={formData.address?.postalCode || ''}
                  onChange={(e) => handleAddressChange('postalCode', e.target.value)}
                />
              </div>
              <div>
                <Input
                  placeholder="Country"
                  value={formData.address?.country || ''}
                  onChange={(e) => handleAddressChange('country', e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Information Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="h-5 w-5 mr-2" />
            Payment Information
          </CardTitle>
          <CardDescription>Bank details for receiving payments from bookings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {profileData.stripeAccountId ? (
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                <span className="text-sm text-green-800">
                  Stripe account connected ({profileData.stripeAccountStatus})
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 p-4 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-4 w-4 text-amber-600 mr-2" />
                <span className="text-sm text-amber-800">
                  No payment method connected. Complete Stripe setup to receive payments.
                </span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="accountHolderName">Account Holder Name</Label>
              <Input
                id="accountHolderName"
                value={formData.bankDetails?.accountHolderName || ''}
                onChange={(e) => handleBankDetailsChange('accountHolderName', e.target.value)}
                placeholder="Name on bank account"
              />
            </div>
            <div>
              <Label htmlFor="routingNumber">Routing Number</Label>
              <Input
                id="routingNumber"
                value={formData.bankDetails?.routingNumber || ''}
                onChange={(e) => handleBankDetailsChange('routingNumber', e.target.value)}
                placeholder="9-digit routing number"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="accountNumber">Account Number</Label>
            <Input
              id="accountNumber"
              type="password"
              value={formData.bankDetails?.accountNumber || ''}
              onChange={(e) => handleBankDetailsChange('accountNumber', e.target.value)}
              placeholder="Bank account number"
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button type="submit" disabled={isSaving} className="px-8">
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Profile
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
