'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DollarSign,
  Calendar,
  TrendingUp,
  Users,
  Clock,
  Plus,
  Eye,
  Settings,
  ArrowUpRight,
  MapPin,
} from 'lucide-react'

interface DashboardStats {
  totalEarnings: number
  monthlyEarnings: number
  totalBookings: number
  completedBookings: number
  upcomingBookings: number
  activeServices: number
  profileViews: number
  upcomingEvents: number
}

interface RecentBooking {
  id: string
  date: string
  service: {
    name: string
    price: number
  }
  dancer: {
    name: string
  }
  event: {
    name: string
    city: string
    state?: string
  }
  status: string
}

interface UpcomingEvent {
  id: string
  name: string
  city: string
  state?: string
  startDate: string
  availabilityDate: string
  timeSlot: string
}

interface DashboardData {
  stats: DashboardStats
  recentBookings: RecentBooking[]
  upcomingEvents: UpcomingEvent[]
}

interface DashboardOverviewProps {
  userId: string
}

export function DashboardOverview({ userId }: DashboardOverviewProps) {
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch('/api/dashboard/overview')
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data')
        }

        const dashboardData: DashboardData = await response.json()
        setData(dashboardData)
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
        setError('Failed to load dashboard data. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [userId])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">{error}</div>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    )
  }

  if (!data) {
    return <div className="text-center py-12">No data available</div>
  }

  const { stats, recentBookings, upcomingEvents } = data

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Earnings</p>
                <p className="text-2xl font-bold text-gray-900">${stats.monthlyEarnings}</p>
                <p className="text-xs text-green-600 mt-1">+12% from last month</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
                <p className="text-xs text-blue-600 mt-1">{stats.upcomingBookings} upcoming</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Profile Views</p>
                <p className="text-2xl font-bold text-gray-900">{stats.profileViews}</p>
                <p className="text-xs text-purple-600 mt-1">Last 30 days</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Eye className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Services</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeServices}</p>
                <p className="text-xs text-gold-600 mt-1">
                  {stats.upcomingEvents} events scheduled
                </p>
              </div>
              <div className="p-3 bg-gold-100 rounded-full">
                <Users className="h-6 w-6 text-gold-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button asChild variant="outline" className="h-16 flex-col">
              <Link href="/dashboard/services">
                <Plus className="h-5 w-5 mb-1" />
                Add Service
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-16 flex-col">
              <Link href="/dashboard/availability">
                <Calendar className="h-5 w-5 mb-1" />
                Set Availability
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-16 flex-col">
              <Link href="/dashboard/profile">
                <Eye className="h-5 w-5 mb-1" />
                Update Profile
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-16 flex-col">
              <Link href="/dashboard/portfolio">
                <TrendingUp className="h-5 w-5 mb-1" />
                Upload Photos
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Bookings</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/bookings">
                View All
                <ArrowUpRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentBookings.length > 0 ? (
                recentBookings.slice(0, 5).map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-900">{booking.service.name}</h4>
                        <Badge
                          variant={
                            booking.status === 'COMPLETED'
                              ? 'success'
                              : booking.status === 'CONFIRMED'
                                ? 'default'
                                : 'secondary'
                          }
                        >
                          {booking.status.toLowerCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {booking.dancer.name} • {booking.event.name}
                      </p>
                      <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                        <MapPin className="h-3 w-3" />
                        {booking.event.city}
                        {booking.event.state && `, ${booking.event.state}`}
                      </div>
                      <p className="text-xs text-gray-500">
                        {new Date(booking.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">${booking.service.price}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <p>No recent bookings</p>
                  <p className="text-sm">
                    Your bookings will appear here once clients book your services.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Upcoming Events</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/availability">
                Manage
                <ArrowUpRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.slice(0, 5).map((event) => (
                  <div key={event.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{event.name}</h4>
                        <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                          <MapPin className="h-3 w-3" />
                          {event.city}
                          {event.state && `, ${event.state}`}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                          <Clock className="h-3 w-3" />
                          {event.timeSlot}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(event.startDate).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-purple-600">Available</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <p>No upcoming events</p>
                  <p className="text-sm">
                    Set your availability for events to start getting bookings.
                  </p>
                  <Button asChild size="sm" className="mt-4">
                    <Link href="/dashboard/availability">Set Availability</Link>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
