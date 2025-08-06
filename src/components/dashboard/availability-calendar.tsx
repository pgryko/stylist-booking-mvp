'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Loader2,
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle,
  MapPin,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

interface Event {
  id: string
  name: string
  slug: string
  description?: string
  venue: string
  address: string
  city: string
  state?: string
  country: string
  postalCode: string
  startDate: string
  endDate: string
  timezone: string
  imageUrl?: string
  isActive: boolean
}

interface Availability {
  id: string
  eventId: string
  date: string
  startTime: string
  endTime: string
  event: Event
  createdAt: string
  updatedAt: string
}

interface AvailabilityForm {
  eventId: string
  date: string
  startTime: string
  endTime: string
}

export function AvailabilityCalendar() {
  const [events, setEvents] = useState<Event[]>([])
  const [selectedEvent, setSelectedEvent] = useState<string>('')
  const [availabilities, setAvailabilities] = useState<Availability[]>([])
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingAvailability, setEditingAvailability] = useState<Availability | null>(null)
  const [formData, setFormData] = useState<AvailabilityForm>({
    eventId: '',
    date: '',
    startTime: '09:00',
    endTime: '17:00',
  })
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Load events on component mount
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/dashboard/events?upcoming=true&active=true')
        if (!response.ok) throw new Error('Failed to fetch events')
        const data = await response.json()
        setEvents(data.events)
        if (data.events.length > 0) {
          setSelectedEvent(data.events[0].id)
        }
      } catch (error) {
        console.error('Error loading events:', error)
        setMessage({ type: 'error', text: 'Failed to load events' })
      } finally {
        setIsLoading(false)
      }
    }
    fetchEvents()
  }, [])

  const loadAvailabilities = useCallback(async () => {
    try {
      const monthStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`
      const response = await fetch(
        `/api/dashboard/availability?eventId=${selectedEvent}&month=${monthStr}`
      )
      if (!response.ok) throw new Error('Failed to fetch availabilities')
      const data = await response.json()
      setAvailabilities(data.availabilities)
    } catch (error) {
      console.error('Error loading availabilities:', error)
      setMessage({ type: 'error', text: 'Failed to load availabilities' })
    }
  }, [selectedEvent, currentMonth])

  // Load availabilities when event or month changes
  useEffect(() => {
    if (selectedEvent) {
      loadAvailabilities()
    }
  }, [selectedEvent, currentMonth, loadAvailabilities])

  const handleAddAvailability = () => {
    setFormData({
      eventId: selectedEvent,
      date: '',
      startTime: '09:00',
      endTime: '17:00',
    })
    setEditingAvailability(null)
    setShowAddDialog(true)
  }

  const handleEditAvailability = (availability: Availability) => {
    setFormData({
      eventId: availability.eventId,
      date: availability.date,
      startTime: availability.startTime,
      endTime: availability.endTime,
    })
    setEditingAvailability(availability)
    setShowAddDialog(true)
  }

  const handleSubmitAvailability = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage(null)

    try {
      let response
      if (editingAvailability) {
        // Update existing availability
        response = await fetch(`/api/dashboard/availability/${editingAvailability.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date: formData.date,
            startTime: formData.startTime,
            endTime: formData.endTime,
          }),
        })
      } else {
        // Create new availability
        response = await fetch('/api/dashboard/availability', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save availability')
      }

      setMessage({
        type: 'success',
        text: editingAvailability
          ? 'Availability updated successfully!'
          : 'Availability added successfully!',
      })
      setShowAddDialog(false)
      loadAvailabilities()
    } catch (error) {
      console.error('Error saving availability:', error)
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to save availability',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteAvailability = async (availability: Availability) => {
    if (
      !confirm(
        `Are you sure you want to delete availability for ${availability.event.name} on ${new Date(availability.date).toLocaleDateString()}?`
      )
    ) {
      return
    }

    try {
      const response = await fetch(`/api/dashboard/availability/${availability.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete availability')
      }

      setMessage({ type: 'success', text: 'Availability deleted successfully!' })
      loadAvailabilities()
    } catch (error) {
      console.error('Error deleting availability:', error)
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to delete availability',
      })
    }
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startDayOfWeek = firstDay.getDay()

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }

  const getAvailabilityForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return availabilities.filter((a) => a.date === dateStr)
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev)
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1)
      } else {
        newMonth.setMonth(prev.getMonth() + 1)
      }
      return newMonth
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        <span className="ml-2 text-gray-600">Loading calendar...</span>
      </div>
    )
  }

  const selectedEventData = events.find((e) => e.id === selectedEvent)
  const monthDays = getDaysInMonth(currentMonth)

  return (
    <div className="space-y-6">
      {message && (
        <Alert className={message.type === 'success' ? 'border-green-200 bg-green-50' : ''}>
          {message.type === 'success' ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertDescription className={message.type === 'success' ? 'text-green-800' : ''}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      {/* Event Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Event</CardTitle>
          <CardDescription>Choose an event to manage your availability</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedEvent} onValueChange={setSelectedEvent}>
            <SelectTrigger>
              <SelectValue placeholder="Select an event" />
            </SelectTrigger>
            <SelectContent>
              {events.map((event) => (
                <SelectItem key={event.id} value={event.id}>
                  <div className="flex items-center space-x-2">
                    <div>
                      <div className="font-medium">{event.name}</div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {event.city}, {event.state || event.country}
                        <span className="ml-2">
                          {new Date(event.startDate).toLocaleDateString()} -{' '}
                          {new Date(event.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedEventData && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900">{selectedEventData.name}</h4>
              <p className="text-sm text-gray-600 mt-1">{selectedEventData.description}</p>
              <div className="flex items-center text-sm text-gray-500 mt-2">
                <MapPin className="h-4 w-4 mr-1" />
                <span>
                  {selectedEventData.venue}, {selectedEventData.address}
                </span>
              </div>
              <div className="flex items-center space-x-4 mt-2">
                <Badge variant="outline">
                  {new Date(selectedEventData.startDate).toLocaleDateString()} -{' '}
                  {new Date(selectedEventData.endDate).toLocaleDateString()}
                </Badge>
                <Badge variant={selectedEventData.isActive ? 'default' : 'secondary'}>
                  {selectedEventData.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Calendar */}
      {selectedEvent && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  <CalendarIcon className="h-5 w-5 mr-2" />
                  Availability Calendar
                </CardTitle>
                <CardDescription>
                  Manage your available time slots for the selected event
                </CardDescription>
              </div>
              <Button onClick={handleAddAvailability}>
                <Plus className="h-4 w-4 mr-2" />
                Add Availability
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-6">
              <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h3 className="text-lg font-semibold">
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h3>
              <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {monthDays.map((day, index) => {
                if (!day) {
                  return <div key={index} className="p-2" />
                }

                const dayAvailabilities = getAvailabilityForDate(day)
                const isToday = day.toDateString() === new Date().toDateString()

                return (
                  <div
                    key={day.toISOString()}
                    className={`
                      min-h-[100px] p-2 border rounded-lg transition-colors cursor-pointer
                      ${isToday ? 'bg-blue-50 border-blue-200' : 'border-gray-200 hover:bg-gray-50'}
                      ${dayAvailabilities.length > 0 ? 'bg-green-50 border-green-200' : ''}
                    `}
                  >
                    <div className="text-sm font-medium text-gray-900 mb-1">{day.getDate()}</div>

                    {dayAvailabilities.map((availability) => (
                      <div
                        key={availability.id}
                        className="text-xs bg-green-100 text-green-800 rounded px-1 py-0.5 mb-1 flex items-center justify-between group"
                      >
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>
                            {availability.startTime}-{availability.endTime}
                          </span>
                        </div>
                        <div className="hidden group-hover:flex items-center space-x-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEditAvailability(availability)
                            }}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Edit className="h-3 w-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteAvailability(availability)
                            }}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Availability Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <form onSubmit={handleSubmitAvailability}>
            <DialogHeader>
              <DialogTitle>
                {editingAvailability ? 'Edit Availability' : 'Add Availability'}
              </DialogTitle>
              <DialogDescription>
                Set your available hours for the selected event and date.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, startTime: e.target.value }))
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData((prev) => ({ ...prev, endTime: e.target.value }))}
                    required
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : editingAvailability ? (
                  'Update'
                ) : (
                  'Add'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
