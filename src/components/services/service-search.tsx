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
  DollarSign,
  Clock,
  User,
  CheckCircle,
} from 'lucide-react'

interface ServiceSearchProps {
  searchParams: {
    search: string
    stylistId: string
    minPrice?: number
    maxPrice?: number
    minDuration?: number
    maxDuration?: number
    active: boolean
    sortBy: string
    sortOrder: string
  }
  onSearchChange: (params: Partial<ServiceSearchProps['searchParams']>) => void
  resultCount?: number
  isLoading?: boolean
}

const SORT_OPTIONS = [
  { value: 'name-asc', label: 'Name A-Z' },
  { value: 'name-desc', label: 'Name Z-A' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'duration-asc', label: 'Duration: Short to Long' },
  { value: 'duration-desc', label: 'Duration: Long to Short' },
  { value: 'stylistName-asc', label: 'Stylist A-Z' },
  { value: 'createdAt-desc', label: 'Newest First' },
]

const PRICE_RANGES = [
  { label: 'Under $50', min: 0, max: 49 },
  { label: '$50 - $100', min: 50, max: 100 },
  { label: '$100 - $200', min: 100, max: 200 },
  { label: '$200 - $300', min: 200, max: 300 },
  { label: '$300+', min: 300, max: 9999 },
]

const DURATION_RANGES = [
  { label: 'Under 30 min', min: 0, max: 29 },
  { label: '30-60 min', min: 30, max: 60 },
  { label: '1-2 hours', min: 60, max: 120 },
  { label: '2-3 hours', min: 120, max: 180 },
  { label: '3+ hours', min: 180, max: 480 },
]

export function ServiceSearch({
  searchParams,
  onSearchChange,
  resultCount = 0,
  isLoading = false,
}: ServiceSearchProps) {
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

  // Handle price range selection
  const handlePriceRangeChange = useCallback(
    (range: { min: number; max: number }) => {
      onSearchChange({
        minPrice: range.min,
        maxPrice: range.max === 9999 ? undefined : range.max,
      })
    },
    [onSearchChange]
  )

  // Handle duration range selection
  const handleDurationRangeChange = useCallback(
    (range: { min: number; max: number }) => {
      onSearchChange({
        minDuration: range.min,
        maxDuration: range.max === 480 ? undefined : range.max,
      })
    },
    [onSearchChange]
  )

  // Clear all filters
  const clearFilters = useCallback(() => {
    setLocalSearch('')
    onSearchChange({
      search: '',
      stylistId: '',
      minPrice: undefined,
      maxPrice: undefined,
      minDuration: undefined,
      maxDuration: undefined,
      active: true,
      sortBy: 'name',
      sortOrder: 'asc',
    })
  }, [onSearchChange])

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (searchParams.search) count++
    if (searchParams.stylistId) count++
    if (searchParams.minPrice !== undefined) count++
    if (searchParams.maxPrice !== undefined) count++
    if (searchParams.minDuration !== undefined) count++
    if (searchParams.maxDuration !== undefined) count++
    if (!searchParams.active) count++
    return count
  }, [searchParams])

  const currentSortValue = `${searchParams.sortBy}-${searchParams.sortOrder}`

  // Get current price range label
  const getCurrentPriceRangeLabel = () => {
    if (searchParams.minPrice === undefined && searchParams.maxPrice === undefined) {
      return 'Any price'
    }
    const range = PRICE_RANGES.find(
      (r) =>
        r.min === searchParams.minPrice &&
        (r.max === searchParams.maxPrice || (r.max === 9999 && searchParams.maxPrice === undefined))
    )
    return range ? range.label : `$${searchParams.minPrice || 0} - $${searchParams.maxPrice || '∞'}`
  }

  // Get current duration range label
  const getCurrentDurationRangeLabel = () => {
    if (searchParams.minDuration === undefined && searchParams.maxDuration === undefined) {
      return 'Any duration'
    }
    const range = DURATION_RANGES.find(
      (r) =>
        r.min === searchParams.minDuration &&
        (r.max === searchParams.maxDuration ||
          (r.max === 480 && searchParams.maxDuration === undefined))
    )
    return range
      ? range.label
      : `${searchParams.minDuration || 0} - ${searchParams.maxDuration || '∞'} min`
  }

  return (
    <Card className="p-4 space-y-4">
      {/* Search Bar */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search services by name, description, or stylist..."
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
            : `${resultCount} service${resultCount !== 1 ? 's' : ''} found`}
        </span>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <span>Sort by:</span>
          <Select value={currentSortValue} onValueChange={handleSortChange}>
            <SelectTrigger className="w-48">
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

          {searchParams.stylistId && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <User className="h-3 w-3" />
              Specific Stylist
              <button
                onClick={() => handleFilterChange('stylistId', '')}
                className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {(searchParams.minPrice !== undefined || searchParams.maxPrice !== undefined) && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              {getCurrentPriceRangeLabel()}
              <button
                onClick={() => {
                  handleFilterChange('minPrice', undefined)
                  handleFilterChange('maxPrice', undefined)
                }}
                className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {(searchParams.minDuration !== undefined || searchParams.maxDuration !== undefined) && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {getCurrentDurationRangeLabel()}
              <button
                onClick={() => {
                  handleFilterChange('minDuration', undefined)
                  handleFilterChange('maxDuration', undefined)
                }}
                className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {!searchParams.active && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Include Inactive
              <button
                onClick={() => handleFilterChange('active', true)}
                className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
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
            {/* Price Range Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                Price Range
              </label>
              <Select
                value={getCurrentPriceRangeLabel()}
                onValueChange={(value) => {
                  const range = PRICE_RANGES.find((r) => r.label === value)
                  if (range) handlePriceRangeChange(range)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any price" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Any price">Any price</SelectItem>
                  {PRICE_RANGES.map((range) => (
                    <SelectItem key={range.label} value={range.label}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Duration Range Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Duration Range
              </label>
              <Select
                value={getCurrentDurationRangeLabel()}
                onValueChange={(value) => {
                  const range = DURATION_RANGES.find((r) => r.label === value)
                  if (range) handleDurationRangeChange(range)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Any duration">Any duration</SelectItem>
                  {DURATION_RANGES.map((range) => (
                    <SelectItem key={range.label} value={range.label}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Active Status Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <CheckCircle className="h-4 w-4" />
                Status
              </label>
              <Select
                value={searchParams.active.toString()}
                onValueChange={(value) => handleFilterChange('active', value === 'true')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Active services only</SelectItem>
                  <SelectItem value="false">Include inactive services</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
