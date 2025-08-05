import React from 'react'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { PortfolioManagement } from '@/components/dashboard/portfolio-management'

export default async function PortfolioPage() {
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
              Portfolio
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your portfolio images to showcase your styling work to potential clients.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-sm text-gray-500">
              <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                <p className="text-blue-800 font-medium">💡 Portfolio Tips</p>
                <ul className="text-blue-700 text-xs mt-1 space-y-1">
                  <li>• Upload high-quality images that showcase your best work</li>
                  <li>• Include variety in styles, events, and dance types</li>
                  <li>• Add descriptive titles and descriptions to each image</li>
                  <li>• Keep your portfolio updated with recent work</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Portfolio Management */}
      <PortfolioManagement />
    </div>
  )
}
