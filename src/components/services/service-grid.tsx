'use client'

import React from 'react'
import { ServiceCard } from './service-card'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
  Search,
  Package,
} from 'lucide-react'

interface ServiceGridProps {
  services: Array<{
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
  }>
  pagination: {
    page: number
    limit: number
    totalCount: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
  onPageChange: (page: number) => void
  isLoading?: boolean
  variant?: 'default' | 'compact'
}

export function ServiceGrid({
  services,
  pagination,
  onPageChange,
  isLoading = false,
  variant = 'default',
}: ServiceGridProps) {
  const { page, totalPages, hasNextPage, hasPrevPage, totalCount } = pagination || {
    page: 1,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
    totalCount: 0,
  }

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      const half = Math.floor(maxVisiblePages / 2)
      let start = Math.max(1, page - half)
      const end = Math.min(totalPages, start + maxVisiblePages - 1)

      if (end - start < maxVisiblePages - 1) {
        start = Math.max(1, end - maxVisiblePages + 1)
      }

      if (start > 1) {
        pages.push(1)
        if (start > 2) pages.push('...')
      }

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      if (end < totalPages) {
        if (end < totalPages - 1) pages.push('...')
        pages.push(totalPages)
      }
    }

    return pages
  }

  const pageNumbers = getPageNumbers()

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div
          className={`grid gap-6 ${
            variant === 'compact'
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
          }`}
        >
          {Array.from({ length: pagination.limit }).map((_, index) => (
            <Card key={index} className="p-6 animate-pulse">
              <div className="flex items-start gap-4">
                <div
                  className={`rounded-full bg-gray-200 ${variant === 'compact' ? 'h-10 w-10' : 'h-12 w-12'}`}
                />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                </div>
                <div className="text-right space-y-1">
                  <div className="h-5 bg-gray-200 rounded w-16" />
                  <div className="h-3 bg-gray-200 rounded w-12" />
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="h-3 bg-gray-200 rounded w-full" />
                <div className="h-3 bg-gray-200 rounded w-2/3" />
              </div>
              <div className="mt-4 flex gap-2">
                <div className="h-8 bg-gray-200 rounded flex-1" />
                <div className="h-8 bg-gray-200 rounded flex-1" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // Empty state
  if (!isLoading && services.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <Package className="h-12 w-12 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No services found</h3>
        <p className="text-gray-500 mb-4">
          Try adjusting your search criteria or filters to find more services.
        </p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          <Search className="h-4 w-4 mr-2" />
          Clear Filters
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Services Grid */}
      <div
        className={`grid gap-6 ${
          variant === 'compact'
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
            : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        }`}
      >
        {services.map((service) => (
          <ServiceCard key={service.id} service={service} variant={variant} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Results Info */}
          <div className="text-sm text-gray-600">
            Showing {(page - 1) * pagination.limit + 1} to{' '}
            {Math.min(page * pagination.limit, totalCount)} of {totalCount} services
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center gap-1">
            {/* First Page */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(1)}
              disabled={!hasPrevPage || isLoading}
              className="hidden sm:flex"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>

            {/* Previous Page */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={!hasPrevPage || isLoading}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline ml-1">Previous</span>
            </Button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              {pageNumbers.map((pageNum, index) => (
                <React.Fragment key={index}>
                  {pageNum === '...' ? (
                    <span className="px-2 py-1 text-gray-500">...</span>
                  ) : (
                    <Button
                      variant={pageNum === page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => onPageChange(pageNum as number)}
                      disabled={isLoading}
                      className="w-10"
                    >
                      {isLoading && pageNum === page ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        pageNum
                      )}
                    </Button>
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Next Page */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={!hasNextPage || isLoading}
            >
              <span className="hidden sm:inline mr-1">Next</span>
              <ChevronRight className="h-4 w-4" />
            </Button>

            {/* Last Page */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(totalPages)}
              disabled={!hasNextPage || isLoading}
              className="hidden sm:flex"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
