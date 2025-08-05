'use client'

import React, { useMemo, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible'
import {
  Search,
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  Star,
  CheckCircle,
  Calendar,
} from 'lucide-react'

interface StylistSearchProps {
  searchParams: {
    search: string
    specialty: string
    verified: boolean
    available: boolean
    sortBy: string
    sortOrder: string
  }
  onSearchChange: (params: Partial<StylistSearchProps['searchParams']>) => void
  resultCount?: number
  isLoading?: boolean
}

// Common specialties in the dance industry
const SPECIALTIES = [
  'Hair & Makeup',
  'Hair Styling',
  'Makeup Artist',
  'Competition Hair',
  'Competition Makeup',
  'Ballroom Hair',
  'Latin Hair',
  'Standard Hair',
  'Theater Makeup',
  'Photography Makeup',
  'Bridal Hair',
  'Special Effects',
  'Airbrush Makeup',
  'Extensions & Styling',
  'Color & Highlights',
]

const SORT_OPTIONS = [
  { value: 'createdAt-desc', label: 'Newest First' },
  { value: 'createdAt-asc', label: 'Oldest First' },
  { value: 'displayName-asc', label: 'Name A-Z' },
  { value: 'displayName-desc', label: 'Name Z-A' },
  { value: 'experience-desc', label: 'Most Experience' },
  { value: 'experience-asc', label: 'Least Experience' },
  { value: 'verified-desc', label: 'Verified First' },
]

export function StylistSearch({
  searchParams,
  onSearchChange,
  resultCount = 0,
  isLoading = false,
}: StylistSearchProps) {
  const [isFiltersOpen, setIsFiltersOpen] = React.useState(false)
  const [localSearch, setLocalSearch] = React.useState(searchParams.search)

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
        onSearchChange({ search: searchTerm })
      }, 300)
    },
    [onSearchChange]
  )

  // Handle search input changes
  const handleSearchChange = useCallback(
    (value: string) => {
      setLocalSearch(value)
      handleDebouncedSearch(value)
    },
    [handleDebouncedSearch]
  )

  // Handle filter changes
  const handleFilterChange = useCallback(
    (key: string, value: unknown) => {
      onSearchChange({ [key]: value })
    },
    [onSearchChange]
  )

  // Handle sort changes
  const handleSortChange = useCallback(
    (value: string) => {
      const [sortBy, sortOrder] = value.split('-')
      onSearchChange({ sortBy, sortOrder })
    },
    [onSearchChange]
  )

  // Clear all filters
  const clearFilters = useCallback(() => {
    setLocalSearch('')
    onSearchChange({
      search: '',
      specialty: '',
      verified: false,
      available: false,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    })
  }, [onSearchChange])

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (searchParams.search) count++
    if (searchParams.specialty) count++
    if (searchParams.verified) count++
    if (searchParams.available) count++
    return count
  }, [searchParams])

  const currentSortValue = `${searchParams.sortBy}-${searchParams.sortOrder}`

  return (
    <Card className="p-4 space-y-4">
      {/* Search Bar */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search stylists by name, specialty, or bio..."
            value={localSearch}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setIsFiltersOpen(!isFiltersOpen)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-1">
              {activeFilterCount}
            </Badge>
          )}
          {isFiltersOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          {isLoading
            ? 'Searching...'
            : `${resultCount} stylist${resultCount !== 1 ? 's' : ''} found`}
        </span>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <span>Sort by:</span>
          <Select value={currentSortValue} onValueChange={handleSortChange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active Filters */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-600">Active filters:</span>

          {searchParams.search && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Search className="h-3 w-3" />
              Search: &quot;{searchParams.search}&quot;
              <button
                onClick={() => handleFilterChange('search', '')}
                className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {searchParams.specialty && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Star className="h-3 w-3" />
              {searchParams.specialty}
              <button
                onClick={() => handleFilterChange('specialty', '')}
                className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {searchParams.verified && (
            <Badge variant="success" className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Verified Only
              <button
                onClick={() => handleFilterChange('verified', false)}
                className="ml-1 hover:bg-green-200 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {searchParams.available && (
            <Badge variant="info" className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Available Now
              <button
                onClick={() => handleFilterChange('available', false)}
                className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-gray-500 hover:text-gray-700"
          >
            Clear all
          </Button>
        </div>
      )}

      {/* Collapsible Filters */}
      <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
        <CollapsibleContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Specialty Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <Star className="h-4 w-4" />
                Specialty
              </label>
              <Select
                value={searchParams.specialty}
                onValueChange={(value) => handleFilterChange('specialty', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any specialty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any specialty</SelectItem>
                  {SPECIALTIES.map((specialty) => (
                    <SelectItem key={specialty} value={specialty}>
                      {specialty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Verification Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <CheckCircle className="h-4 w-4" />
                Verification
              </label>
              <Select
                value={searchParams.verified.toString()}
                onValueChange={(value) => handleFilterChange('verified', value === 'true')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="false">All stylists</SelectItem>
                  <SelectItem value="true">Verified only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Availability Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Availability
              </label>
              <Select
                value={searchParams.available.toString()}
                onValueChange={(value) => handleFilterChange('available', value === 'true')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="false">All stylists</SelectItem>
                  <SelectItem value="true">Available now</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
