import React from 'react'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { DashboardOverview } from '@/components/dashboard/dashboard-overview'

export default async function DashboardPage() {
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
              Dashboard Overview
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Welcome back! Here&apos;s what&apos;s happening with your business.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <DashboardOverview userId={session.user.id} />
    </div>
  )
}
