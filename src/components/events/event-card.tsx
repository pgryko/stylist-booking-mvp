import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import { EventWithCounts } from '@/lib/events'
import { CalendarDays, MapPin, Users, Clock } from 'lucide-react'

interface EventCardProps {
  event: EventWithCounts
  className?: string
}

export const EventCard: React.FC<EventCardProps> = ({ event, className }) => {
  const startDate = new Date(event.startDate)
  const endDate = new Date(event.endDate)
  const isMultiDay = startDate.toDateString() !== endDate.toDateString()
  const isUpcoming = startDate > new Date()
  const isPast = endDate < new Date()

  return (
    <Card variant="default" interactive={true} className={className}>
      {/* Event Image */}
      <div className="relative h-48 w-full overflow-hidden rounded-t-xl">
        {event.imageUrl ? (
          <Image
            src={event.imageUrl}
            alt={event.name}
            fill
            className="object-cover transition-transform hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-100 to-gold-100 dark:from-purple-950/20 dark:to-gold-950/20">
            <div className="text-center">
              <CalendarDays className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">{event.name}</p>
            </div>
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          {isPast ? (
            <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800 dark:bg-slate-800 dark:text-slate-200">
              Past Event
            </span>
          ) : isUpcoming ? (
            <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/20 dark:text-green-300">
              Upcoming
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              Live Now
            </span>
          )}
        </div>

        {/* Availability Indicator */}
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-medium text-slate-700 backdrop-blur-sm">
            <Users className="mr-1 h-3 w-3" />
            {event._count.availabilities} stylists
          </span>
        </div>
      </div>

      <CardHeader className="pb-3">
        <CardTitle className="line-clamp-2 text-lg leading-tight">{event.name}</CardTitle>

        {/* Date Range */}
        <div className="flex items-center text-sm text-muted-foreground">
          <CalendarDays className="mr-2 h-4 w-4" />
          {isMultiDay ? (
            <span>
              {formatDate(startDate, { month: 'short', day: 'numeric' })} -{' '}
              {formatDate(endDate, { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          ) : (
            <span>
              {formatDate(startDate, {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          )}
        </div>

        {/* Location */}
        <div className="flex items-center text-sm text-muted-foreground">
          <MapPin className="mr-2 h-4 w-4" />
          <span className="truncate">
            {event.venue}, {event.city}, {event.state ? `${event.state}, ` : ''}
            {event.country}
          </span>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Description */}
        {event.description && (
          <p className="line-clamp-2 text-sm text-muted-foreground leading-relaxed">
            {event.description}
          </p>
        )}

        {/* Stats */}
        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center">
            <Users className="mr-1 h-3 w-3" />
            {event._count.bookings} bookings
          </div>
          <div className="flex items-center">
            <Clock className="mr-1 h-3 w-3" />
            {isMultiDay
              ? `${Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))} days`
              : 'Single day'}
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <div className="flex w-full gap-2">
          <Link href={`/events/${event.slug}`} className="flex-1">
            <Button variant="outline" className="w-full">
              View Details
            </Button>
          </Link>

          {isUpcoming && (
            <Link href={`/events/${event.slug}/book`} className="flex-1">
              <Button variant="gradient" className="w-full">
                Book Stylist
              </Button>
            </Link>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}

EventCard.displayName = 'EventCard'
