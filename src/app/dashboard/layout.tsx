import React from 'react'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { DashboardNav } from '@/components/dashboard/dashboard-nav'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const session = await auth()

  // Redirect if not authenticated or not a stylist
  if (!session?.user) {
    redirect('/login')
  }

  if (session.user.role !== 'STYLIST') {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <DashboardHeader user={session.user} />

      <div className="flex">
        {/* Sidebar Navigation */}
        <DashboardNav />

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  )
}
