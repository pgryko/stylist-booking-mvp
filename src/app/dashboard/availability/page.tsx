import React from 'react'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AvailabilityCalendar } from '@/components/dashboard/availability-calendar'

export default async function AvailabilityPage() {
  const session = await auth()

  if (!session?.user || session.user.role !== 'STYLIST') {
    redirect('/login')
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-gray-200 pb-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl">
              Availability Management
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Set your available time slots for upcoming dance events and competitions.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-500">
              Timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone}
            </span>
          </div>
        </div>
      </div>

      {/* Availability Calendar */}
      <AvailabilityCalendar />
    </div>
  )
}
