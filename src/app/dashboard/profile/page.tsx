import React from 'react'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { ProfileForm } from '@/components/dashboard/profile-form'

export default async function ProfilePage() {
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
              Profile Settings
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your public profile information, compliance details, and payment settings.
            </p>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <ProfileForm />
    </div>
  )
}
