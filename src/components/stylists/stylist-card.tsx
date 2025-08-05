'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { MapPin, Clock, DollarSign, Calendar, CheckCircle, User } from 'lucide-react'

interface StylistCardProps {
  stylist: {
    id: string
    displayName: string
    bio: string
    profileImageUrl?: string | null
    specialty: string
    yearsExperience?: number | null
    isVerified: boolean
    portfolioImages: string[]
    services: Array<{
      id: string
      name: string
      price: number
      duration: number
    }>
    nextEvents: Array<{
      id: string
      name: string
      city: string
      state?: string | null
      country: string
      startDate: string
    }>
    completedBookings: number
    activeServices: number
    upcomingAvailability: number
    priceRange?: {
      min: number
      max: number
    } | null
  }
  variant?: 'default' | 'compact'
  showActions?: boolean
}

export function StylistCard({
  stylist,
  variant = 'default',
  showActions = true,
}: StylistCardProps) {
  const {
    id,
    displayName,
    bio,
    profileImageUrl,
    specialty,
    yearsExperience,
    isVerified,
    portfolioImages,
    services,
    nextEvents,
    completedBookings,
    activeServices,
    upcomingAvailability,
    priceRange,
  } = stylist

  const isCompact = variant === 'compact'
  const truncatedBio = isCompact
    ? bio.length > 100
      ? `${bio.substring(0, 100)}...`
      : bio
    : bio.length > 150
      ? `${bio.substring(0, 150)}...`
      : bio

  const nextEvent = nextEvents[0]

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <CardHeader className={`pb-4 ${isCompact ? 'p-4' : ''}`}>
        <div className="flex items-start gap-4">
          {/* Profile Image */}
          <div className="relative flex-shrink-0">
            <div
              className={`relative overflow-hidden rounded-full bg-gray-100 ${isCompact ? 'h-12 w-12' : 'h-16 w-16'}`}
            >
              {profileImageUrl ? (
                <Image
                  src={profileImageUrl}
                  alt={`${displayName}'s profile`}
                  fill
                  className="object-cover"
                  sizes={isCompact ? '48px' : '64px'}
                />
              ) : (
                <div
                  className={`flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-100 to-gold-100 ${isCompact ? 'text-lg' : 'text-xl'}`}
                >
                  <User className={`text-purple-600 ${isCompact ? 'h-6 w-6' : 'h-8 w-8'}`} />
                </div>
              )}
            </div>
            {isVerified && (
              <div className="absolute -bottom-1 -right-1 rounded-full bg-white p-1 shadow-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
            )}
          </div>

          {/* Header Info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <Link href={`/stylists/${id}`}>
                  <h3
                    className={`font-semibold text-gray-900 hover:text-purple-600 transition-colors line-clamp-1 ${isCompact ? 'text-base' : 'text-lg'}`}
                  >
                    {displayName}
                  </h3>
                </Link>
                <p className={`text-purple-600 font-medium ${isCompact ? 'text-sm' : 'text-base'}`}>
                  {specialty}
                </p>
              </div>

              {!isCompact && (
                <div className="flex flex-col items-end gap-1">
                  {priceRange && (
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <DollarSign className="h-4 w-4" />
                      <span>
                        ${priceRange.min}-${priceRange.max}
                      </span>
                    </div>
                  )}
                  {yearsExperience && (
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>{yearsExperience} years</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bio */}
            <p className={`text-gray-600 mt-2 line-clamp-2 ${isCompact ? 'text-sm' : 'text-base'}`}>
              {truncatedBio}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className={`pt-0 ${isCompact ? 'p-4 pt-0' : ''}`}>
        {/* Stats */}
        <div className={`grid grid-cols-3 gap-4 mb-4 ${isCompact ? 'mb-3' : ''}`}>
          <div className="text-center">
            <div className={`font-semibold text-gray-900 ${isCompact ? 'text-sm' : 'text-base'}`}>
              {completedBookings}
            </div>
            <div className={`text-gray-500 ${isCompact ? 'text-xs' : 'text-sm'}`}>Bookings</div>
          </div>
          <div className="text-center">
            <div className={`font-semibold text-gray-900 ${isCompact ? 'text-sm' : 'text-base'}`}>
              {activeServices}
            </div>
            <div className={`text-gray-500 ${isCompact ? 'text-xs' : 'text-sm'}`}>Services</div>
          </div>
          <div className="text-center">
            <div className={`font-semibold text-gray-900 ${isCompact ? 'text-sm' : 'text-base'}`}>
              {upcomingAvailability}
            </div>
            <div className={`text-gray-500 ${isCompact ? 'text-xs' : 'text-sm'}`}>Available</div>
          </div>
        </div>

        {/* Top Services */}
        {!isCompact && services.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Popular Services</h4>
            <div className="flex flex-wrap gap-2">
              {services.slice(0, 3).map((service) => (
                <Badge key={service.id} variant="secondary" className="text-xs">
                  {service.name} - ${service.price}
                </Badge>
              ))}
              {services.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{services.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Next Event */}
        {nextEvent && (
          <div className={`mb-4 ${isCompact ? 'mb-3' : ''}`}>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span className="font-medium">Next Event:</span>
            </div>
            <div className="mt-1">
              <p className={`font-medium text-gray-900 line-clamp-1 ${isCompact ? 'text-sm' : ''}`}>
                {nextEvent.name}
              </p>
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <MapPin className="h-3 w-3" />
                <span>
                  {nextEvent.city}
                  {nextEvent.state && `, ${nextEvent.state}`}
                  {`, ${nextEvent.country}`}
                </span>
              </div>
              <p className={`text-gray-500 ${isCompact ? 'text-xs' : 'text-sm'}`}>
                {new Date(nextEvent.startDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>
        )}

        {/* Portfolio Preview */}
        {!isCompact && portfolioImages.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Portfolio</h4>
            <div className="flex gap-2 overflow-hidden">
              {portfolioImages.slice(0, 4).map((image, index) => (
                <div
                  key={index}
                  className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg"
                >
                  <Image
                    src={image}
                    alt={`Portfolio ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
              ))}
              {portfolioImages.length > 4 && (
                <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 text-xs font-medium text-gray-600">
                  +{portfolioImages.length - 4}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className={`flex gap-2 ${isCompact ? 'flex-col' : ''}`}>
            <Button asChild className="flex-1" variant="default">
              <Link href={`/stylists/${id}`}>View Profile</Link>
            </Button>
            {upcomingAvailability > 0 && (
              <Button asChild className="flex-1" variant="outline">
                <Link href={`/stylists/${id}#book`}>Book Now</Link>
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
