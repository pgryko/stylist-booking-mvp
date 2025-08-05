'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { StylistSearch } from '@/components/stylists/stylist-search'
import { StylistGrid } from '@/components/stylists/stylist-grid'
import { Metadata } from 'next'

// Client-side types for API response
interface StylistData {
  id: string
  displayName: string
  bio: string
  profileImageUrl?: string | null
  specialty: string
  yearsExperience?: number | null
  isVerified: boolean
  portfolioImages: string[]
  services: Array<{
    id: string
    name: string
    price: number
    duration: number
  }>
  nextEvents: Array<{
    id: string
    name: string
    city: string
    state?: string | null
    country: string
    startDate: string
  }>
  completedBookings: number
  activeServices: number
  upcomingAvailability: number
  priceRange?: {
    min: number
    max: number
  } | null
}

interface StylistsResponse {
  stylists: StylistData[]
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
    specialty: string
    verifiedOnly: boolean
    hasAvailability: boolean
    sortBy: string
    sortOrder: string
  }
}

interface SearchParams {
  search: string
  specialty: string
  verified: boolean
  available: boolean
  sortBy: string
  sortOrder: string
}

export default function StylistsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Initialize search parameters from URL
  const getSearchParams = useCallback(
    (): SearchParams => ({
      search: searchParams?.get('search') || '',
      specialty: searchParams?.get('specialty') || '',
      verified: searchParams?.get('verified') === 'true',
      available: searchParams?.get('available') === 'true',
      sortBy: searchParams?.get('sortBy') || 'createdAt',
      sortOrder: searchParams?.get('sortOrder') || 'desc',
    }),
    [searchParams]
  )

  const [currentParams, setCurrentParams] = useState<SearchParams>(getSearchParams())
  const [currentPage, setCurrentPage] = useState(1)
  const [stylistsData, setStylistsData] = useState<StylistsResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Update URL with current search parameters
  const updateURL = useCallback(
    (params: Partial<SearchParams> = {}, page: number = 1) => {
      const newParams = { ...currentParams, ...params }
      const urlParams = new URLSearchParams()

      // Only add non-default parameters to URL
      if (newParams.search) urlParams.set('search', newParams.search)
      if (newParams.specialty) urlParams.set('specialty', newParams.specialty)
      if (newParams.verified) urlParams.set('verified', 'true')
      if (newParams.available) urlParams.set('available', 'true')
      if (newParams.sortBy !== 'createdAt') urlParams.set('sortBy', newParams.sortBy)
      if (newParams.sortOrder !== 'desc') urlParams.set('sortOrder', newParams.sortOrder)
      if (page > 1) urlParams.set('page', page.toString())

      const newURL = urlParams.toString() ? `?${urlParams.toString()}` : '/stylists'
      router.push(newURL, { scroll: false })

      setCurrentParams(newParams)
      setCurrentPage(page)
    },
    [currentParams, router]
  )

  // Fetch stylists data
  const fetchStylists = useCallback(async (params: SearchParams, page: number) => {
    try {
      setIsLoading(true)
      setError(null)

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        search: params.search,
        specialty: params.specialty,
        verified: params.verified.toString(),
        available: params.available.toString(),
        sortBy: params.sortBy,
        sortOrder: params.sortOrder,
      })

      const response = await fetch(`/api/stylists?${queryParams}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: StylistsResponse = await response.json()
      setStylistsData(data)
    } catch (err) {
      console.error('Error fetching stylists:', err)
      setError('Failed to load stylists. Please try again.')
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
    fetchStylists(params, page)
  }, [searchParams, getSearchParams, fetchStylists])

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => fetchStylists(currentParams, currentPage)}
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
              Find Professional Stylists
            </h1>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Connect with verified hair and makeup artists at dance competitions worldwide. Browse
              portfolios, read reviews, and book your perfect stylist.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Search and Filters */}
          <StylistSearch
            searchParams={currentParams}
            onSearchChange={handleSearchChange}
            resultCount={stylistsData?.pagination.totalCount || 0}
            isLoading={isLoading}
          />

          {/* Results */}
          <StylistGrid
            stylists={stylistsData?.stylists || []}
            pagination={
              stylistsData?.pagination || {
                page: 1,
                limit: 12,
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

// Metadata for SEO
export const metadata: Metadata = {
  title: 'Professional Dance Stylists | The Independent Studio',
  description:
    'Find and book verified hair and makeup artists for dance competitions. Browse portfolios, compare prices, and connect with professional stylists worldwide.',
  keywords:
    'dance stylists, competition hair, makeup artists, dance competitions, professional stylists',
  openGraph: {
    title: 'Professional Dance Stylists | The Independent Studio',
    description: 'Find and book verified hair and makeup artists for dance competitions.',
    type: 'website',
  },
}
