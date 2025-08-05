'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Settings,
  User,
  Calendar,
  DollarSign,
  Camera,
  TrendingUp,
  HelpCircle,
  MessageSquare,
  Banknote,
} from 'lucide-react'

const navigation = [
  {
    name: 'Overview',
    href: '/dashboard',
    icon: LayoutDashboard,
    description: 'Dashboard overview and stats',
  },
  {
    name: 'Services',
    href: '/dashboard/services',
    icon: DollarSign,
    description: 'Manage your service offerings',
  },
  {
    name: 'Pricing',
    href: '/dashboard/pricing',
    icon: TrendingUp,
    description: 'Dynamic pricing rules and optimization',
  },
  {
    name: 'Profile',
    href: '/dashboard/profile',
    icon: User,
    description: 'Edit your public profile',
  },
  {
    name: 'Availability',
    href: '/dashboard/availability',
    icon: Calendar,
    description: 'Manage your event availability',
  },
  {
    name: 'Portfolio',
    href: '/dashboard/portfolio',
    icon: Camera,
    description: 'Upload and organize your work',
  },
  {
    name: 'Earnings',
    href: '/dashboard/earnings',
    icon: Banknote,
    description: 'View your earnings and payouts',
  },
  {
    name: 'Messages',
    href: '/dashboard/messages',
    icon: MessageSquare,
    description: 'Client communications',
  },
  {
    name: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
    description: 'Account and notification settings',
  },
]

const supportLinks = [
  {
    name: 'Help Center',
    href: '/help',
    icon: HelpCircle,
  },
]

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:pt-16">
      <div className="flex flex-col flex-grow bg-white border-r border-gray-200 pt-5 pb-4 overflow-y-auto">
        <nav className="flex-1 px-3 space-y-1">
          {/* Main Navigation */}
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                    isActive
                      ? 'bg-purple-50 text-purple-700 border-r-2 border-purple-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                  title={item.description}
                >
                  <Icon
                    className={cn(
                      'mr-3 h-5 w-5 transition-colors',
                      isActive ? 'text-purple-600' : 'text-gray-400 group-hover:text-gray-500'
                    )}
                  />
                  {item.name}
                </Link>
              )
            })}
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 my-4" />

          {/* Support Links */}
          <div className="space-y-1">
            {supportLinks.map((item) => {
              const Icon = item.icon

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="group flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  <Icon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                  {item.name}
                </Link>
              )
            })}
          </div>
        </nav>

        {/* Bottom section */}
        <div className="flex-shrink-0 px-3 py-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            <p>The Independent Studio</p>
            <p>Stylist Dashboard v1.0</p>
          </div>
        </div>
      </div>
    </div>
  )
}
