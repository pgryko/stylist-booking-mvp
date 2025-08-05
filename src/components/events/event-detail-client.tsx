'use client'

import * as React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Navigation } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate } from '@/lib/utils'
import {
  CalendarDays,
  MapPin,
  Clock,
  Users,
  Star,
  ArrowLeft,
  ExternalLink,
  Calendar,
  Globe,
  Bookmark,
  Share2,
} from 'lucide-react'

interface Availability {
  id: string
  date: string | Date
  startTime: string
  endTime: string
  stylist: {
    id: string
    displayName: string
    profileImageUrl?: string | null
    specialty: string
    isVerified: boolean
  }
}

interface EventDetailClientProps {
  event: {
    id: string
    name: string
    slug: string
    description?: string | null
    venue: string
    address: string
    city: string
    state?: string | null
    country: string
    postalCode: string
    startDate: string | Date
    endDate: string | Date
    timezone: string
    imageUrl?: string | null
    isActive: boolean
    createdAt: string | Date
    updatedAt: string | Date
    availabilities: Availability[]
    bookings: unknown[]
    _count: {
      availabilities: number
      bookings: number
    }
  }
}

export const EventDetailClient: React.FC<EventDetailClientProps> = ({ event }) => {
  const [isBookmarked, setIsBookmarked] = React.useState(false)

  const startDate = new Date(event.startDate)
  const endDate = new Date(event.endDate)
  const isMultiDay = startDate.toDateString() !== endDate.toDateString()
  const isUpcoming = startDate > new Date()
  const isPast = endDate < new Date()
  const isLive = startDate <= new Date() && endDate >= new Date()

  // Calculate event duration
  const durationInDays = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  )

  // Get event status
  const getEventStatus = () => {
    if (isPast) return { text: 'Past Event', color: 'text-slate-600 bg-slate-100' }
    if (isLive) return { text: 'Live Now', color: 'text-primary bg-primary/10' }
    if (isUpcoming) return { text: 'Upcoming', color: 'text-green-600 bg-green-100' }
    return { text: 'Event', color: 'text-slate-600 bg-slate-100' }
  }

  const status = getEventStatus()

  // Share functionality
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.name,
          text: event.description || `${event.name} at ${event.venue}`,
          url: window.location.href,
        })
      } catch (err) {
        console.log('Error sharing:', err)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      // You could show a toast notification here
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        {/* Back Navigation */}
        <div className="mb-6">
          <Link
            href="/events"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Events
          </Link>
        </div>

        {/* Event Header */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Image */}
            <div className="relative h-64 md:h-80 lg:h-96 w-full overflow-hidden rounded-xl">
              {event.imageUrl ? (
                <Image
                  src={event.imageUrl}
                  alt={event.name}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-100 to-gold-100 dark:from-purple-950/20 dark:to-gold-950/20">
                  <div className="text-center">
                    <CalendarDays className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                    <p className="text-lg text-muted-foreground">{event.name}</p>
                  </div>
                </div>
              )}

              {/* Status Badge */}
              <div className="absolute top-4 left-4">
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${status.color}`}
                >
                  {status.text}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="absolute top-4 right-4 flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsBookmarked(!isBookmarked)}
                  className="backdrop-blur-sm"
                >
                  <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleShare}
                  className="backdrop-blur-sm"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Event Info */}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">{event.name}</h1>

              {event.description && (
                <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                  {event.description}
                </p>
              )}

              {/* Key Details */}
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Date & Time */}
                <div className="flex items-start gap-3">
                  <CalendarDays className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Date & Time</p>
                    {isMultiDay ? (
                      <p className="text-sm text-muted-foreground">
                        {formatDate(startDate, {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                        <br />
                        to{' '}
                        {formatDate(endDate, {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {formatDate(startDate, {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">Timezone: {event.timezone}</p>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-sm text-muted-foreground">
                      {event.venue}
                      <br />
                      {event.address}
                      <br />
                      {event.city}, {event.state && `${event.state}, `}
                      {event.country} {event.postalCode}
                    </p>
                  </div>
                </div>

                {/* Duration */}
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Duration</p>
                    <p className="text-sm text-muted-foreground">
                      {isMultiDay ? `${durationInDays} days` : 'Single day event'}
                    </p>
                  </div>
                </div>

                {/* Availability */}
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Stylists Available</p>
                    <p className="text-sm text-muted-foreground">
                      {event._count.availabilities} stylists, {event._count.bookings} bookings
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Available Stylists */}
            {event.availabilities && event.availabilities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Available Stylists ({event.availabilities.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {event.availabilities.slice(0, 6).map((availability: Availability) => (
                      <div
                        key={availability.id}
                        className="flex items-center gap-3 p-3 border rounded-lg"
                      >
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-600 to-gold-500 flex items-center justify-center">
                          <span className="text-white text-sm font-bold">
                            {availability.stylist.displayName.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {availability.stylist.displayName}
                            {availability.stylist.isVerified && (
                              <Star className="inline h-4 w-4 text-gold-500 ml-1" />
                            )}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {availability.stylist.specialty}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(new Date(availability.date), {
                              month: 'short',
                              day: 'numeric',
                            })}
                            : {availability.startTime} - {availability.endTime}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {event.availabilities.length > 6 && (
                    <div className="mt-4 text-center">
                      <Button variant="outline">
                        View All {event.availabilities.length} Stylists
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Booking CTA */}
            {isUpcoming && (
              <Card variant="gradient">
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <h3 className="text-lg font-semibold">Ready to Book?</h3>
                    <p className="text-sm text-muted-foreground">
                      Connect with professional stylists for this event
                    </p>
                    <Button variant="default" size="lg" className="w-full" asChild>
                      <Link href={`/events/${event.slug}/book`}>Book a Stylist</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Event Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Available Stylists</span>
                  <span className="text-sm font-medium">{event._count.availabilities}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Bookings</span>
                  <span className="text-sm font-medium">{event._count.bookings}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Duration</span>
                  <span className="text-sm font-medium">
                    {isMultiDay ? `${durationInDays} days` : '1 day'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <span className={`text-sm font-medium ${status.color.split(' ')[0]}`}>
                    {status.text}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link
                    href={`https://maps.google.com/?q=${encodeURIComponent(`${event.venue}, ${event.address}, ${event.city}`)}`}
                    target="_blank"
                  >
                    <MapPin className="mr-2 h-4 w-4" />
                    View on Map
                    <ExternalLink className="ml-auto h-4 w-4" />
                  </Link>
                </Button>

                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="mr-2 h-4 w-4" />
                  Add to Calendar
                </Button>

                <Button variant="outline" className="w-full justify-start">
                  <Globe className="mr-2 h-4 w-4" />
                  Event Website
                  <ExternalLink className="ml-auto h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

EventDetailClient.displayName = 'EventDetailClient'
