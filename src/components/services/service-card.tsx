'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Clock, User, CheckCircle, Star, TrendingUp } from 'lucide-react'

interface ServiceCardProps {
  service: {
    id: string
    name: string
    description?: string | null
    price: number
    duration: number
    isActive: boolean
    createdAt: string
    updatedAt: string
    stylist: {
      id: string
      displayName: string
      profileImageUrl?: string | null
      specialty: string
      isVerified: boolean
      user: {
        id: string
      }
    }
    completedBookings: number
    durationHours: number
    durationMinutes: number
  }
  variant?: 'default' | 'compact'
  showActions?: boolean
}

export function ServiceCard({
  service,
  variant = 'default',
  showActions = true,
}: ServiceCardProps) {
  const { name, description, price, stylist, completedBookings, durationHours, durationMinutes } =
    service

  const isCompact = variant === 'compact'
  const truncatedDescription = description
    ? isCompact
      ? description.length > 80
        ? `${description.substring(0, 80)}...`
        : description
      : description.length > 120
        ? `${description.substring(0, 120)}...`
        : description
    : null

  const formatDuration = () => {
    if (durationHours > 0) {
      return durationMinutes > 0 ? `${durationHours}h ${durationMinutes}m` : `${durationHours}h`
    }
    return `${durationMinutes}m`
  }

  const isPopular = completedBookings >= 10 // Arbitrary threshold for "popular"

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 relative">
      {/* Popular Badge */}
      {isPopular && (
        <div className="absolute top-3 right-3 z-10">
          <Badge variant="gradient" className="text-xs">
            <TrendingUp className="h-3 w-3 mr-1" />
            Popular
          </Badge>
        </div>
      )}

      <CardHeader className={`pb-4 ${isCompact ? 'p-4' : ''}`}>
        <div className="flex items-start gap-4">
          {/* Stylist Profile Image */}
          <div className="relative flex-shrink-0">
            <div
              className={`relative overflow-hidden rounded-full bg-gray-100 ${isCompact ? 'h-10 w-10' : 'h-12 w-12'}`}
            >
              {stylist.profileImageUrl ? (
                <Image
                  src={stylist.profileImageUrl}
                  alt={`${stylist.displayName}'s profile`}
                  fill
                  className="object-cover"
                  sizes={isCompact ? '40px' : '48px'}
                />
              ) : (
                <div
                  className={`flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-100 to-gold-100 ${isCompact ? 'text-sm' : 'text-base'}`}
                >
                  <User className={`text-purple-600 ${isCompact ? 'h-5 w-5' : 'h-6 w-6'}`} />
                </div>
              )}
            </div>
            {stylist.isVerified && (
              <div className="absolute -bottom-1 -right-1 rounded-full bg-white p-0.5 shadow-sm">
                <CheckCircle className="h-3 w-3 text-green-500" />
              </div>
            )}
          </div>

          {/* Service Info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h3
                  className={`font-semibold text-gray-900 line-clamp-1 ${isCompact ? 'text-base' : 'text-lg'}`}
                >
                  {name}
                </h3>
                <Link
                  href={`/stylists/${stylist.id}`}
                  className={`text-purple-600 hover:text-purple-700 font-medium transition-colors ${isCompact ? 'text-sm' : 'text-base'}`}
                >
                  by {stylist.displayName}
                </Link>
                <p className={`text-gray-500 ${isCompact ? 'text-xs' : 'text-sm'}`}>
                  {stylist.specialty}
                </p>
              </div>

              {/* Price */}
              <div className="text-right">
                <div className={`font-bold text-gray-900 ${isCompact ? 'text-lg' : 'text-xl'}`}>
                  ${price}
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Clock className="h-3 w-3" />
                  <span>{formatDuration()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className={`pt-0 ${isCompact ? 'p-4 pt-0' : ''}`}>
        {/* Description */}
        {truncatedDescription && (
          <p className={`text-gray-600 mb-4 line-clamp-2 ${isCompact ? 'text-sm' : 'text-base'}`}>
            {truncatedDescription}
          </p>
        )}

        {/* Stats */}
        <div className={`flex items-center justify-between mb-4 ${isCompact ? 'mb-3' : ''}`}>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Star className="h-4 w-4" />
              <span>{completedBookings} completed</span>
            </div>
            {stylist.isVerified && (
              <Badge variant="success" className="text-xs">
                <CheckCircle className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            )}
          </div>
        </div>

        {/* Actions */}
        {showActions && (
          <div className={`flex gap-2 ${isCompact ? 'flex-col' : ''}`}>
            <Button asChild className="flex-1" variant="outline">
              <Link href={`/stylists/${stylist.id}`}>View Stylist</Link>
            </Button>
            <Button className="flex-1 bg-gradient-to-r from-purple-600 to-gold-500 hover:from-purple-700 hover:to-gold-600">
              Book Service
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
