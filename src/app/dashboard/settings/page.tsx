import React from 'react'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { StripeConnect } from '@/components/dashboard/stripe-connect'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { User, Bell, Shield, CreditCard } from 'lucide-react'

export default async function SettingsPage() {
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
              Settings
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your account settings, payment information, and preferences.
            </p>
          </div>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Settings</CardTitle>
              <CardDescription>Choose a category to manage</CardDescription>
            </CardHeader>
            <CardContent>
              <nav className="space-y-2">
                <div className="flex items-center px-3 py-2 text-sm font-medium text-purple-700 bg-purple-50 rounded-md">
                  <CreditCard className="h-4 w-4 mr-3" />
                  Payment Account
                  <Badge className="ml-auto" variant="secondary">
                    Active
                  </Badge>
                </div>
                <div className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 cursor-not-allowed opacity-50">
                  <User className="h-4 w-4 mr-3" />
                  Account Information
                  <Badge className="ml-auto" variant="outline">
                    Coming Soon
                  </Badge>
                </div>
                <div className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 cursor-not-allowed opacity-50">
                  <Bell className="h-4 w-4 mr-3" />
                  Notifications
                  <Badge className="ml-auto" variant="outline">
                    Coming Soon
                  </Badge>
                </div>
                <div className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 cursor-not-allowed opacity-50">
                  <Shield className="h-4 w-4 mr-3" />
                  Privacy & Security
                  <Badge className="ml-auto" variant="outline">
                    Coming Soon
                  </Badge>
                </div>
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-2">
          {/* Stripe Connect Section */}
          <StripeConnect />
        </div>
      </div>
    </div>
  )
}
