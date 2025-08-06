'use client'

import React, { useState, useCallback, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ServiceSearch } from '@/components/services/service-search'
import { ServiceGrid } from '@/components/services/service-grid'

// Client-side types for API response
interface ServiceData {
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

interface ServicesResponse {
  services: ServiceData[]
  pagination: {
    page: number
    limit: number
    totalCount: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
  filters: {
    search: string
    stylistId: string
    minPrice?: number
    maxPrice?: number
    minDuration?: number
    maxDuration?: number
    activeOnly: boolean
    sortBy: string
    sortOrder: string
  }
}

interface SearchParams {
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

function ServicesContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Initialize search parameters from URL
  const getSearchParams = useCallback(
    (): SearchParams => ({
      search: searchParams?.get('search') || '',
      stylistId: searchParams?.get('stylistId') || '',
      minPrice: searchParams?.get('minPrice')
        ? parseFloat(searchParams.get('minPrice')!)
        : undefined,
      maxPrice: searchParams?.get('maxPrice')
        ? parseFloat(searchParams.get('maxPrice')!)
        : undefined,
      minDuration: searchParams?.get('minDuration')
        ? parseInt(searchParams.get('minDuration')!)
        : undefined,
      maxDuration: searchParams?.get('maxDuration')
        ? parseInt(searchParams.get('maxDuration')!)
        : undefined,
      active: searchParams?.get('active') !== 'false', // Default to true
      sortBy: searchParams?.get('sortBy') || 'name',
      sortOrder: searchParams?.get('sortOrder') || 'asc',
    }),
    [searchParams]
  )

  const [currentParams, setCurrentParams] = useState<SearchParams>(getSearchParams())
  const [currentPage, setCurrentPage] = useState(1)
  const [servicesData, setServicesData] = useState<ServicesResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Update URL with current search parameters
  const updateURL = useCallback(
    (params: Partial<SearchParams> = {}, page: number = 1) => {
      const newParams = { ...currentParams, ...params }
      const urlParams = new URLSearchParams()

      // Only add non-default parameters to URL
      if (newParams.search) urlParams.set('search', newParams.search)
      if (newParams.stylistId) urlParams.set('stylistId', newParams.stylistId)
      if (newParams.minPrice !== undefined) urlParams.set('minPrice', newParams.minPrice.toString())
      if (newParams.maxPrice !== undefined) urlParams.set('maxPrice', newParams.maxPrice.toString())
      if (newParams.minDuration !== undefined)
        urlParams.set('minDuration', newParams.minDuration.toString())
      if (newParams.maxDuration !== undefined)
        urlParams.set('maxDuration', newParams.maxDuration.toString())
      if (!newParams.active) urlParams.set('active', 'false')
      if (newParams.sortBy !== 'name') urlParams.set('sortBy', newParams.sortBy)
      if (newParams.sortOrder !== 'asc') urlParams.set('sortOrder', newParams.sortOrder)
      if (page > 1) urlParams.set('page', page.toString())

      const newURL = urlParams.toString() ? `?${urlParams.toString()}` : '/services'
      router.push(newURL, { scroll: false })

      setCurrentParams(newParams)
      setCurrentPage(page)
    },
    [currentParams, router]
  )

  // Fetch services data
  const fetchServices = useCallback(async (params: SearchParams, page: number) => {
    try {
      setIsLoading(true)
      setError(null)

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        search: params.search,
        stylistId: params.stylistId,
        active: params.active.toString(),
        sortBy: params.sortBy,
        sortOrder: params.sortOrder,
      })

      // Add optional numeric parameters
      if (params.minPrice !== undefined) {
        queryParams.set('minPrice', params.minPrice.toString())
      }
      if (params.maxPrice !== undefined) {
        queryParams.set('maxPrice', params.maxPrice.toString())
      }
      if (params.minDuration !== undefined) {
        queryParams.set('minDuration', params.minDuration.toString())
      }
      if (params.maxDuration !== undefined) {
        queryParams.set('maxDuration', params.maxDuration.toString())
      }

      const response = await fetch(`/api/services?${queryParams}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: ServicesResponse = await response.json()
      setServicesData(data)
    } catch (err) {
      console.error('Error fetching services:', err)
      setError('Failed to load services. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Handle search parameter changes
  const handleSearchChange = useCallback(
    (params: Partial<SearchParams>) => {
      updateURL(params, 1) // Reset to page 1 when search changes
    },
    [updateURL]
  )

  // Handle page changes
  const handlePageChange = useCallback(
    (page: number) => {
      updateURL({}, page)
    },
    [updateURL]
  )

  // Effect to fetch data when parameters change
  useEffect(() => {
    const params = getSearchParams()
    const page = parseInt(searchParams?.get('page') || '1')

    setCurrentParams(params)
    setCurrentPage(page)
    fetchServices(params, page)
  }, [searchParams, getSearchParams, fetchServices])

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => fetchServices(currentParams, currentPage)}
              className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Browse Professional Services
            </h1>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Discover a wide range of hair and makeup services from verified professionals. Compare
              prices, read reviews, and book the perfect stylist for your next event.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Search and Filters */}
          <ServiceSearch
            searchParams={currentParams}
            onSearchChange={handleSearchChange}
            resultCount={servicesData?.pagination.totalCount || 0}
            isLoading={isLoading}
          />

          {/* Results */}
          <ServiceGrid
            services={servicesData?.services || []}
            pagination={
              servicesData?.pagination || {
                page: 1,
                limit: 20,
                totalCount: 0,
                totalPages: 0,
                hasNextPage: false,
                hasPrevPage: false,
              }
            }
            onPageChange={handlePageChange}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  )
}

export default function ServicesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50">
          <div className="bg-white shadow-sm">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                  Hair & Makeup Services
                </h1>
                <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">Loading services...</p>
              </div>
            </div>
          </div>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            <ServiceGrid
              services={[]}
              pagination={{
                page: 1,
                limit: 20,
                totalCount: 0,
                totalPages: 0,
                hasNextPage: false,
                hasPrevPage: false,
              }}
              onPageChange={() => {}}
              isLoading={true}
            />
          </div>
        </div>
      }
    >
      <ServicesContent />
    </Suspense>
  )
}

// Note: Metadata cannot be exported from client components
// SEO metadata should be handled by a parent server component or layout
