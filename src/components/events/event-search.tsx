'use client'

import * as React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Search, Filter, X, MapPin, Calendar, SortAsc, SortDesc } from 'lucide-react'

interface EventSearchProps {
  className?: string
}

interface FilterOption {
  value: string
  label: string
  count?: number
}

export const EventSearch: React.FC<EventSearchProps> = ({ className }) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Current filter states
  const [search, setSearch] = React.useState(searchParams?.get('search') || '')
  const [country, setCountry] = React.useState(searchParams?.get('country') || '')
  const [state, setState] = React.useState(searchParams?.get('state') || '')
  const [city, setCity] = React.useState(searchParams?.get('city') || '')
  const [upcoming, setUpcoming] = React.useState(searchParams?.get('upcoming') === 'true')
  const [sortBy, setSortBy] = React.useState(searchParams?.get('sortBy') || 'startDate')
  const [sortOrder, setSortOrder] = React.useState(searchParams?.get('sortOrder') || 'asc')
  const [showFilters, setShowFilters] = React.useState(false)

  // Available filter options (these could be fetched from API)
  const [countries] = React.useState<FilterOption[]>([
    { value: 'USA', label: 'United States', count: 12 },
    { value: 'Canada', label: 'Canada', count: 3 },
    { value: 'UK', label: 'United Kingdom', count: 2 },
  ])

  const [states] = React.useState<FilterOption[]>([
    { value: 'CA', label: 'California', count: 4 },
    { value: 'NY', label: 'New York', count: 3 },
    { value: 'TX', label: 'Texas', count: 2 },
    { value: 'FL', label: 'Florida', count: 2 },
    { value: 'GA', label: 'Georgia', count: 1 },
  ])

  const sortOptions = [
    { value: 'startDate', label: 'Start Date' },
    { value: 'name', label: 'Name' },
    { value: 'city', label: 'Location' },
    { value: 'createdAt', label: 'Recently Added' },
  ]

  // Update URL with new parameters
  const updateURL = React.useCallback(
    (updates: Record<string, string | boolean>) => {
      const params = new URLSearchParams(searchParams.toString())

      Object.entries(updates).forEach(([key, value]) => {
        if (value === '' || value === false) {
          params.delete(key)
        } else {
          params.set(key, value.toString())
        }
      })

      // Reset to page 1 when filters change
      params.delete('page')

      router.push(`/events?${params.toString()}`)
    },
    [router, searchParams]
  )

  // Track timeout for cleanup
  const timeoutRef = React.useRef<NodeJS.Timeout | undefined>(undefined)

  const handleDebouncedSearch = React.useCallback(
    (searchTerm: string) => {
      // Clear previous timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // Set new timeout
      timeoutRef.current = setTimeout(() => {
        updateURL({ search: searchTerm })
      }, 300)
    },
    [updateURL]
  )

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setSearch(value)
    handleDebouncedSearch(value)
  }

  // Handle filter changes
  const handleCountryChange = (value: string) => {
    setCountry(value)
    setState('') // Reset state when country changes
    setCity('') // Reset city when country changes
    updateURL({ country: value, state: '', city: '' })
  }

  const handleStateChange = (value: string) => {
    setState(value)
    setCity('') // Reset city when state changes
    updateURL({ state: value, city: '' })
  }

  const handleCityChange = (value: string) => {
    setCity(value)
    updateURL({ city: value })
  }

  const handleUpcomingChange = (checked: boolean) => {
    setUpcoming(checked)
    updateURL({ upcoming: checked })
  }

  const handleSortChange = (field: string) => {
    const newOrder = field === sortBy && sortOrder === 'asc' ? 'desc' : 'asc'
    setSortBy(field)
    setSortOrder(newOrder)
    updateURL({ sortBy: field, sortOrder: newOrder })
  }

  // Clear all filters
  const clearFilters = () => {
    setSearch('')
    setCountry('')
    setState('')
    setCity('')
    setUpcoming(false)
    setSortBy('startDate')
    setSortOrder('asc')
    router.push('/events')
  }

  // Check if any filters are active
  const hasActiveFilters = search || country || state || city || upcoming

  return (
    <div className={className}>
      {/* Main Search Bar */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search events, venues, or locations..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="px-3">
          <Filter className="h-4 w-4" />
          <span className="ml-2 hidden sm:inline">Filters</span>
          {hasActiveFilters && <span className="ml-1 flex h-2 w-2 rounded-full bg-primary" />}
        </Button>

        {hasActiveFilters && (
          <Button variant="ghost" onClick={clearFilters} className="px-3">
            <X className="h-4 w-4" />
            <span className="ml-2 hidden sm:inline">Clear</span>
          </Button>
        )}
      </div>

      {/* Expanded Filters */}
      {showFilters && (
        <Card className="mb-4">
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Location Filters */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center">
                  <MapPin className="mr-2 h-4 w-4" />
                  Location
                </label>

                <select
                  value={country}
                  onChange={(e) => handleCountryChange(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">All Countries</option>
                  {countries.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label} ({option.count})
                    </option>
                  ))}
                </select>

                {country && (
                  <select
                    value={state}
                    onChange={(e) => handleStateChange(e.target.value)}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">All States/Provinces</option>
                    {states.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label} ({option.count})
                      </option>
                    ))}
                  </select>
                )}

                {state && (
                  <Input
                    placeholder="Enter city name..."
                    value={city}
                    onChange={(e) => handleCityChange(e.target.value)}
                  />
                )}
              </div>

              {/* Date Filters */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  Date Range
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={upcoming}
                    onChange={(e) => handleUpcomingChange(e.target.checked)}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm">Upcoming events only</span>
                </label>
              </div>

              {/* Sort Options */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center">
                  {sortOrder === 'asc' ? (
                    <SortAsc className="mr-2 h-4 w-4" />
                  ) : (
                    <SortDesc className="mr-2 h-4 w-4" />
                  )}
                  Sort By
                </label>

                <div className="flex flex-wrap gap-1">
                  {sortOptions.map((option) => (
                    <Button
                      key={option.value}
                      variant={sortBy === option.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleSortChange(option.value)}
                      className="text-xs"
                    >
                      {option.label}
                      {sortBy === option.value && (
                        <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mb-4 flex flex-wrap gap-2">
          {search && (
            <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              Search: &quot;{search}&quot;
              <button onClick={() => handleSearchChange('')} className="ml-2 hover:text-primary/80">
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {country && (
            <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              {countries.find((c) => c.value === country)?.label}
              <button
                onClick={() => handleCountryChange('')}
                className="ml-2 hover:text-primary/80"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {state && (
            <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              {states.find((s) => s.value === state)?.label}
              <button onClick={() => handleStateChange('')} className="ml-2 hover:text-primary/80">
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {upcoming && (
            <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              Upcoming Only
              <button
                onClick={() => handleUpcomingChange(false)}
                className="ml-2 hover:text-primary/80"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  )
}

EventSearch.displayName = 'EventSearch'
