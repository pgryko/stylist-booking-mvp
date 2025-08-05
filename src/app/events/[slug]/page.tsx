import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getEventBySlug } from '@/lib/events'
import { EventDetailClient } from '@/components/events/event-detail-client'

interface EventDetailPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { slug } = await params

  if (!slug) {
    notFound()
  }

  // Fetch event data on the server
  const event = await getEventBySlug(slug)

  if (!event) {
    notFound()
  }

  return <EventDetailClient event={event} />
}

// Generate metadata for SEO
export async function generateMetadata({ params }: EventDetailPageProps): Promise<Metadata> {
  const { slug } = await params

  if (!slug) {
    return {
      title: 'Event Not Found | The Independent Studio',
    }
  }

  const event = await getEventBySlug(slug)

  if (!event) {
    return {
      title: 'Event Not Found | The Independent Studio',
    }
  }

  const startDate = new Date(event.startDate).toLocaleDateString()
  const endDate = new Date(event.endDate).toLocaleDateString()
  const isMultiDay = startDate !== endDate

  return {
    title: `${event.name} | The Independent Studio`,
    description:
      event.description ||
      `${event.name} at ${event.venue} in ${event.city}, ${event.country}. ${
        isMultiDay ? `${startDate} - ${endDate}` : startDate
      }. Find professional stylists for this dance competition.`,
    openGraph: {
      title: event.name,
      description: event.description || `Dance competition at ${event.venue}`,
      images: event.imageUrl ? [event.imageUrl] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: event.name,
      description: event.description || `Dance competition at ${event.venue}`,
      images: event.imageUrl ? [event.imageUrl] : [],
    },
  }
}
