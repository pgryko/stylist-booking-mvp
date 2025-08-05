'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  MapPin,
  Clock,
  DollarSign,
  Calendar,
  CheckCircle,
  User,
  Mail,
  Share2,
  Bookmark,
  ExternalLink,
  ChevronLeft,
  Camera,
} from 'lucide-react'

interface StylistProfileClientProps {
  stylist: {
    id: string
    displayName: string
    bio: string
    profileImageUrl?: string | null
    portfolioImages: string[]
    specialty: string
    yearsExperience?: number | null
    isVerified: boolean
    verifiedAt?: string | null
    user: {
      id: string
      email: string
      createdAt: string
    }
    services: Array<{
      id: string
      name: string
      description?: string | null
      price: number
      duration: number
      createdAt: string
      updatedAt: string
    }>
    availabilities: Array<{
      id: string
      date: string
      startTime: string
      endTime: string
      event: {
        id: string
        name: string
        slug: string
        venue: string
        city: string
        state?: string | null
        country: string
        startDate: string
        endDate: string
        imageUrl?: string | null
      }
    }>
    recentWork: Array<{
      id: string
      date: string
      service: {
        name: string
      }
      event: {
        name: string
        city: string
        state?: string | null
      }
    }>
    completedBookings: number
    activeServices: number
    upcomingAvailability: number
    upcomingEvents: Array<{
      id: string
      name: string
      slug: string
      venue: string
      city: string
      state?: string | null
      country: string
      startDate: string
      endDate: string
      imageUrl?: string | null
    }>
    priceRange?: {
      min: number
      max: number
    } | null
  }
}

export function StylistProfileClient({ stylist }: StylistProfileClientProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<'services' | 'portfolio' | 'availability' | 'reviews'>(
    'services'
  )

  const {
    displayName,
    bio,
    profileImageUrl,
    portfolioImages,
    specialty,
    yearsExperience,
    isVerified,
    services,
    availabilities,
    recentWork,
    completedBookings,
    activeServices,
    upcomingAvailability,
    upcomingEvents,
    priceRange,
  } = stylist

  const joinedDate = new Date(stylist.user.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  const handleShare = async (): Promise<void> => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${displayName} - ${specialty}`,
          text: `Check out ${displayName}'s profile on The Independent Studio`,
          url: window.location.href,
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      // Fallback to copying URL
      navigator.clipboard.writeText(window.location.href)
    }
  }

  return (
    <>
      {/* Header Section */}
      <div className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          {/* Back Button */}
          <div className="mb-6">
            <Link
              href="/stylists"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to All Stylists
            </Link>
          </div>

          {/* Profile Header */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Profile Image */}
            <div className="flex-shrink-0">
              <div className="relative">
                <div className="h-32 w-32 lg:h-40 lg:w-40 relative overflow-hidden rounded-full bg-gray-100">
                  {profileImageUrl ? (
                    <Image
                      src={profileImageUrl}
                      alt={`${displayName}'s profile`}
                      fill
                      className="object-cover"
                      priority
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-100 to-gold-100">
                      <User className="h-16 w-16 text-purple-600" />
                    </div>
                  )}
                </div>
                {isVerified && (
                  <div className="absolute -bottom-2 -right-2 rounded-full bg-white p-2 shadow-md">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  </div>
                )}
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 truncate">{displayName}</h1>
                  <p className="text-xl text-purple-600 font-medium mt-1">{specialty}</p>

                  {/* Verification and Experience */}
                  <div className="flex flex-wrap items-center gap-4 mt-3">
                    {isVerified && (
                      <Badge variant="success" className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Verified Stylist
                      </Badge>
                    )}
                    {yearsExperience && (
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>{yearsExperience} years experience</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>Joined {joinedDate}</span>
                    </div>
                  </div>

                  {/* Price Range */}
                  {priceRange && (
                    <div className="flex items-center gap-1 text-lg font-semibold text-gray-900 mt-2">
                      <DollarSign className="h-5 w-5" />
                      <span>
                        ${priceRange.min} - ${priceRange.max}
                      </span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button variant="outline" size="sm" onClick={handleShare}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  <Button variant="outline" size="sm">
                    <Bookmark className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  {upcomingAvailability > 0 && (
                    <Button className="bg-gradient-to-r from-purple-600 to-gold-500 hover:from-purple-700 hover:to-gold-600">
                      Book Now
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Bio and Stats */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bio */}
            <Card>
              <CardHeader>
                <CardTitle>About {displayName}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{bio}</p>
              </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-2xl font-bold text-gray-900 mb-1">{completedBookings}</div>
                  <div className="text-sm text-gray-600">Completed Bookings</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-2xl font-bold text-gray-900 mb-1">{activeServices}</div>
                  <div className="text-sm text-gray-600">Active Services</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {upcomingAvailability}
                  </div>
                  <div className="text-sm text-gray-600">Upcoming Events</div>
                </CardContent>
              </Card>
            </div>

            {/* Tabbed Content */}
            <Card>
              <CardHeader>
                <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                  {[
                    { key: 'services', label: 'Services', icon: DollarSign },
                    { key: 'portfolio', label: 'Portfolio', icon: Camera },
                    { key: 'availability', label: 'Availability', icon: Calendar },
                  ].map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      onClick={() =>
                        setActiveTab(key as 'services' | 'portfolio' | 'availability' | 'reviews')
                      }
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        activeTab === key
                          ? 'bg-white text-purple-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </button>
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                {/* Services Tab */}
                {activeTab === 'services' && (
                  <div className="space-y-4">
                    {services.length > 0 ? (
                      services.map((service) => (
                        <div
                          key={service.id}
                          className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">{service.name}</h4>
                              {service.description && (
                                <p className="text-gray-600 mt-1">{service.description}</p>
                              )}
                              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {Math.floor(service.duration / 60)}h {service.duration % 60}m
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xl font-bold text-gray-900">
                                ${service.price}
                              </div>
                              <Button size="sm" className="mt-2">
                                Book Service
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">No services listed yet</div>
                    )}
                  </div>
                )}

                {/* Portfolio Tab */}
                {activeTab === 'portfolio' && (
                  <div>
                    {portfolioImages.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {portfolioImages.map((image, index) => (
                          <div
                            key={index}
                            className="relative aspect-square overflow-hidden rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => setSelectedImageIndex(index)}
                          >
                            <Image
                              src={image}
                              alt={`Portfolio ${index + 1}`}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 50vw, 33vw"
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No portfolio images available
                      </div>
                    )}
                  </div>
                )}

                {/* Availability Tab */}
                {activeTab === 'availability' && (
                  <div className="space-y-4">
                    {availabilities.length > 0 ? (
                      availabilities.slice(0, 10).map((availability) => (
                        <div key={availability.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                {availability.event.name}
                              </h4>
                              <div className="flex items-center gap-1 text-gray-600 mt-1">
                                <MapPin className="h-4 w-4" />
                                <span>
                                  {availability.event.venue}, {availability.event.city}
                                  {availability.event.state && `, ${availability.event.state}`}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                <span>{new Date(availability.date).toLocaleDateString()}</span>
                                <span>
                                  {availability.startTime} - {availability.endTime}
                                </span>
                              </div>
                            </div>
                            <Button size="sm" variant="outline" asChild>
                              <Link href={`/events/${availability.event.slug}`}>View Event</Link>
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">No upcoming availability</div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <Card>
              <CardHeader>
                <CardTitle>Get in Touch</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingAvailability > 0 ? (
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-gold-500 hover:from-purple-700 hover:to-gold-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    Book Consultation
                  </Button>
                ) : (
                  <Button variant="outline" className="w-full" disabled>
                    <Calendar className="h-4 w-4 mr-2" />
                    Currently Unavailable
                  </Button>
                )}
                <Button variant="outline" className="w-full">
                  <Mail className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            {upcomingEvents.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Events</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {upcomingEvents.slice(0, 3).map((event) => (
                    <div key={event.id} className="flex items-start gap-3">
                      {event.imageUrl && (
                        <div className="relative h-12 w-12 overflow-hidden rounded-lg flex-shrink-0">
                          <Image
                            src={event.imageUrl}
                            alt={event.name}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/events/${event.slug}`}
                          className="font-medium text-gray-900 hover:text-purple-600 line-clamp-2"
                        >
                          {event.name}
                        </Link>
                        <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                          <MapPin className="h-3 w-3" />
                          <span>
                            {event.city}
                            {event.state && `, ${event.state}`}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">
                          {new Date(event.startDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {upcomingEvents.length > 3 && (
                    <Link
                      href="/events"
                      className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
                    >
                      View all events
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Recent Work */}
            {recentWork.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Work</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recentWork.slice(0, 5).map((work) => (
                    <div key={work.id} className="text-sm">
                      <div className="font-medium text-gray-900">{work.service.name}</div>
                      <div className="text-gray-600">
                        {work.event.name} • {work.event.city}
                        {work.event.state && `, ${work.event.state}`}
                      </div>
                      <div className="text-gray-500">
                        {new Date(work.date).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Portfolio Modal */}
      {selectedImageIndex !== null && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImageIndex(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <Image
              src={portfolioImages[selectedImageIndex]}
              alt={`Portfolio ${selectedImageIndex + 1}`}
              width={800}
              height={600}
              className="object-contain max-h-[90vh]"
            />
            <button
              onClick={() => setSelectedImageIndex(null)}
              className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  )
}
