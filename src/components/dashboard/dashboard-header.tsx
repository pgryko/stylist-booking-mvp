'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Bell, Menu, X, User, Settings, LogOut, Eye, ChevronDown } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface DashboardHeaderProps {
  user: {
    id: string
    email?: string | null
    role: string
    name?: string | null
    image?: string | null
  }
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
  }

  // Mock notifications for now
  const notifications = [
    {
      id: 1,
      title: 'New booking request',
      message: 'Sarah Johnson wants to book your makeup service',
      time: '5 minutes ago',
      unread: true,
    },
    {
      id: 2,
      title: 'Payment processed',
      message: 'Your payout of $180 has been processed',
      time: '2 hours ago',
      unread: true,
    },
    {
      id: 3,
      title: 'Profile view',
      message: 'Your profile was viewed 15 times today',
      time: '1 day ago',
      unread: false,
    },
  ]

  const unreadCount = notifications.filter((n) => n.unread).length

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        {/* Left section */}
        <div className="flex items-center">
          {/* Mobile menu button */}
          <button
            type="button"
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            {showMobileMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          {/* Logo */}
          <Link href="/dashboard" className="flex items-center">
            <div className="ml-4 lg:ml-0">
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-gold-500 bg-clip-text text-transparent">
                The Independent Studio
              </h1>
              <div className="text-xs text-gray-500">Stylist Dashboard</div>
            </div>
          </Link>
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-4">
          {/* View Public Profile */}
          <Button variant="ghost" size="sm" asChild>
            <Link href="/stylists/profile" className="hidden sm:flex items-center">
              <Eye className="h-4 w-4 mr-2" />
              View Profile
            </Link>
          </Button>

          {/* Notifications */}
          <div className="relative">
            <button
              type="button"
              className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-md relative"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 text-xs flex items-center justify-center"
                >
                  {unreadCount}
                </Badge>
              )}
            </button>

            {/* Notifications dropdown */}
            {showNotifications && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowNotifications(false)} />
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-20">
                  <div className="p-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Notifications</h3>
                    <div className="space-y-3">
                      {notifications.slice(0, 3).map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-3 rounded-md ${
                            notification.unread ? 'bg-purple-50' : 'bg-gray-50'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {notification.title}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                              <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                            </div>
                            {notification.unread && (
                              <div className="w-2 h-2 bg-purple-600 rounded-full ml-2 mt-1" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <Button variant="ghost" size="sm" className="w-full justify-center">
                        View all notifications
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User menu */}
          <div className="relative">
            <button
              type="button"
              className="flex items-center space-x-3 p-2 text-sm rounded-md hover:bg-gray-100 transition-colors"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className="flex items-center space-x-2">
                {user.image ? (
                  <Image
                    src={user.image}
                    alt="Profile"
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-gold-100 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-purple-600" />
                  </div>
                )}
                <span className="hidden sm:block text-gray-700">
                  {user.name || (user.email ? user.email.split('@')[0] : 'User')}
                </span>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </div>
            </button>

            {/* User dropdown */}
            {showUserMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-20">
                  <div className="py-1">
                    <div className="px-4 py-2 text-sm text-gray-500 border-b border-gray-200">
                      {user.email || 'No email'}
                    </div>
                    <Link
                      href="/dashboard/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <User className="h-4 w-4 mr-3" />
                      Edit Profile
                    </Link>
                    <Link
                      href="/dashboard/settings"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Settings className="h-4 w-4 mr-3" />
                      Settings
                    </Link>
                    <div className="border-t border-gray-200">
                      <button
                        onClick={handleSignOut}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {showMobileMenu && (
        <div className="lg:hidden border-t border-gray-200 bg-white">
          {/* Mobile navigation will be added here if needed */}
          <div className="px-4 py-3">
            <div className="text-sm text-gray-600">
              <p className="font-medium">
                {user.name || (user.email ? user.email.split('@')[0] : 'User')}
              </p>
              <p className="text-xs capitalize">{user.role?.toLowerCase()}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
