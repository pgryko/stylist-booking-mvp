'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Modal } from '@/components/ui/modal'
import { ServiceForm } from '@/components/dashboard/service-form'
import { Plus, Edit, Trash2, Clock, DollarSign, TrendingUp, Eye } from 'lucide-react'

interface Service {
  id: string
  name: string
  description?: string | null
  price: number
  duration: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  _count?: {
    bookings: number
  }
}

interface ServiceStats {
  totalServices: number
  activeServices: number
  totalBookings: number
  totalRevenue: number
}

interface ServiceFormData {
  name: string
  description: string
  price: number
  duration: number
  isActive: boolean
}

interface ServiceManagementProps {
  userId: string
}

export function ServiceManagement({ userId }: ServiceManagementProps) {
  const [services, setServices] = useState<Service[]>([])
  const [stats, setStats] = useState<ServiceStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedService, setSelectedService] = useState<Service | null>(null)

  // Fetch services and stats
  const fetchServices = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/dashboard/services')
      if (!response.ok) {
        throw new Error('Failed to fetch services')
      }

      const data = await response.json()
      setServices(data.services)
      setStats(data.stats)
    } catch (err) {
      console.error('Error fetching services:', err)
      setError('Failed to load services. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchServices()
  }, [userId])

  // Handle service creation
  const handleCreateService = async (serviceData: ServiceFormData) => {
    try {
      const response = await fetch('/api/dashboard/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(serviceData),
      })

      if (!response.ok) {
        throw new Error('Failed to create service')
      }

      await fetchServices() // Refresh the list
      setShowAddModal(false)
    } catch (err) {
      console.error('Error creating service:', err)
      throw err
    }
  }

  // Handle service update
  const handleUpdateService = async (serviceData: ServiceFormData) => {
    if (!selectedService) return

    try {
      const response = await fetch(`/api/dashboard/services/${selectedService.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(serviceData),
      })

      if (!response.ok) {
        throw new Error('Failed to update service')
      }

      await fetchServices() // Refresh the list
      setShowEditModal(false)
      setSelectedService(null)
    } catch (err) {
      console.error('Error updating service:', err)
      throw err
    }
  }

  // Handle service deletion
  const handleDeleteService = async () => {
    if (!selectedService) return

    try {
      const response = await fetch(`/api/dashboard/services/${selectedService.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete service')
      }

      await fetchServices() // Refresh the list
      setShowDeleteModal(false)
      setSelectedService(null)
    } catch (err) {
      console.error('Error deleting service:', err)
      setError('Failed to delete service. Please try again.')
    }
  }

  // Toggle service active status
  const handleToggleStatus = async (service: Service) => {
    try {
      const response = await fetch(`/api/dashboard/services/${service.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !service.isActive }),
      })

      if (!response.ok) {
        throw new Error('Failed to update service status')
      }

      await fetchServices() // Refresh the list
    } catch (err) {
      console.error('Error updating service status:', err)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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

  if (error && !stats) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">{error}</div>
        <Button onClick={fetchServices}>Try Again</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Services</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalServices}</p>
                  <p className="text-xs text-blue-600 mt-1">{stats.activeServices} active</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
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
                  <p className="text-xs text-green-600 mt-1">All time</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Eye className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">${stats.totalRevenue}</p>
                  <p className="text-xs text-purple-600 mt-1">From services</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg. Price</p>
                  <p className="text-2xl font-bold text-gray-900">
                    $
                    {stats.totalServices > 0
                      ? Math.round(stats.totalRevenue / stats.totalServices)
                      : 0}
                  </p>
                  <p className="text-xs text-gold-600 mt-1">Per service</p>
                </div>
                <div className="p-3 bg-gold-100 rounded-full">
                  <TrendingUp className="h-6 w-6 text-gold-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Services List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Your Services</CardTitle>
          <Button
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-purple-600 to-gold-500 hover:from-purple-700 hover:to-gold-600"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Service
          </Button>
        </CardHeader>
        <CardContent>
          {services.length > 0 ? (
            <div className="space-y-4">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-gray-900">{service.name}</h3>
                      <Badge variant={service.isActive ? 'success' : 'secondary'}>
                        {service.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      {service._count && service._count.bookings > 0 && (
                        <Badge variant="outline">{service._count.bookings} bookings</Badge>
                      )}
                    </div>
                    {service.description && (
                      <p className="text-gray-600 mt-1 text-sm">{service.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        <span>${service.price}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>
                          {Math.floor(service.duration / 60)}h {service.duration % 60}m
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleToggleStatus(service)}>
                      {service.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedService(service)
                        setShowEditModal(true)
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedService(service)
                        setShowDeleteModal(true)
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <TrendingUp className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 mb-2">No services yet</p>
              <p className="text-sm text-gray-400 mb-6">
                Create your first service to start accepting bookings
              </p>
              <Button
                onClick={() => setShowAddModal(true)}
                className="bg-gradient-to-r from-purple-600 to-gold-500 hover:from-purple-700 hover:to-gold-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Service
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Service Modal */}
      <Modal open={showAddModal} onOpenChange={setShowAddModal}>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Add New Service</h2>
          <ServiceForm onSubmit={handleCreateService} onCancel={() => setShowAddModal(false)} />
        </div>
      </Modal>

      {/* Edit Service Modal */}
      <Modal
        open={showEditModal}
        onOpenChange={(open) => {
          setShowEditModal(open)
          if (!open) setSelectedService(null)
        }}
      >
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Edit Service</h2>
          {selectedService && (
            <ServiceForm
              service={selectedService}
              onSubmit={handleUpdateService}
              onCancel={() => {
                setShowEditModal(false)
                setSelectedService(null)
              }}
            />
          )}
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={showDeleteModal}
        onOpenChange={(open) => {
          setShowDeleteModal(open)
          if (!open) setSelectedService(null)
        }}
      >
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Delete Service</h2>
          {selectedService && (
            <div className="space-y-4">
              <p className="text-gray-600">
                Are you sure you want to delete &quot;{selectedService.name}&quot;? This action
                cannot be undone.
              </p>
              {selectedService._count && selectedService._count.bookings > 0 && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-800 text-sm">
                    ⚠️ This service has {selectedService._count.bookings} booking(s). Deleting it
                    may affect your booking history.
                  </p>
                </div>
              )}
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDeleteModal(false)
                    setSelectedService(null)
                  }}
                >
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDeleteService}>
                  Delete Service
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}
