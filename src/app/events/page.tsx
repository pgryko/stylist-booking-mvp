'use client'

import * as React from 'react'
import { useSearchParams } from 'next/navigation'
import { Navigation } from '@/components/navigation'
import { EventSearch } from '@/components/events/event-search'
import { EventGrid } from '@/components/events/event-grid'
import { PaginatedEvents } from '@/lib/events'
import { CalendarDays, TrendingUp } from 'lucide-react'

export default function EventsPage() {
  const searchParams = useSearchParams()
  const [events, setEvents] = React.useState<PaginatedEvents | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  // Fetch events based on current search params
  const fetchEvents = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const queryString = searchParams.toString()
      const response = await fetch(`/api/events?${queryString}`)

      if (!response.ok) {
        throw new Error('Failed to fetch events')
      }

      const data = await response.json()
      setEvents(data)
    } catch (err) {
      console.error('Error fetching events:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [searchParams])

  // Fetch events when search params change
  React.useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  // Handle page changes
  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', page.toString())
    window.history.pushState(null, '', `?${params.toString()}`)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-purple-600 to-gold-500">
              <CalendarDays className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Dance Events</h1>
              <p className="text-muted-foreground">
                Find competitions and connect with professional stylists
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          {events && (
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                <span>{events.pagination.totalCount} total events</span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                <span>
                  {events.filters.upcoming
                    ? 'Upcoming events only'
                    : 'All events (past and upcoming)'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Search and Filters */}
        <EventSearch className="mb-8" />

        {/* Error State */}
        {error && (
          <div className="mb-8 rounded-lg border border-destructive/20 bg-destructive/5 p-4">
            <div className="flex items-center gap-2 text-destructive">
              <span className="text-sm font-medium">Error loading events:</span>
              <span className="text-sm">{error}</span>
            </div>
            <button onClick={fetchEvents} className="mt-2 text-sm text-destructive hover:underline">
              Try again
            </button>
          </div>
        )}

        {/* Events Grid */}
        {events && (
          <EventGrid
            events={events.events}
            pagination={events.pagination}
            filters={events.filters}
            loading={loading}
            onPageChange={handlePageChange}
          />
        )}

        {/* Loading State (Initial Load) */}
        {loading && !events && (
          <EventGrid
            events={[]}
            pagination={{
              page: 1,
              limit: 12,
              totalCount: 0,
              totalPages: 0,
              hasNextPage: false,
              hasPrevPage: false,
            }}
            filters={{}}
            loading={true}
          />
        )}
      </main>
    </div>
  )
}

// Note: Metadata cannot be exported from client components
// SEO metadata should be handled by a parent server component or layout
