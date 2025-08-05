import React from 'react'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { PricingManagement } from '@/components/dashboard/pricing-management'

export default async function PricingPage() {
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
              Dynamic Pricing
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Set up pricing rules that automatically adjust your service prices based on demand,
              timing, and market conditions.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-sm text-gray-500">
              <div className="bg-purple-50 border border-purple-200 rounded-lg px-3 py-2">
                <p className="text-purple-800 font-medium">💡 Pricing Tips</p>
                <ul className="text-purple-700 text-xs mt-1 space-y-1">
                  <li>• Start with simple time-based rules (weekends, peak hours)</li>
                  <li>• Use advance booking discounts to encourage early reservations</li>
                  <li>• Monitor rule performance and adjust modifier values</li>
                  <li>• Set rule priorities to control which rules apply first</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Management */}
      <PricingManagement />
    </div>
  )
}
