'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { UserRole } from '@prisma/client'

interface NavigationProps {
  className?: string
}

const Navigation: React.FC<NavigationProps> = ({ className }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const pathname = usePathname()
  const { data: session, status } = useSession()

  const isAuthenticated = status === 'authenticated'
  const user = session?.user
  const userRole = user?.role as UserRole | undefined

  // Navigation items based on user role
  const getNavigationItems = () => {
    const commonItems = [
      { href: '/', label: 'Home', icon: '🏠' },
      { href: '/events', label: 'Events', icon: '🎪' },
    ]

    if (!isAuthenticated) {
      return [
        ...commonItems,
        { href: '/stylists', label: 'Find Stylists', icon: '💄' },
        { href: '/about', label: 'About', icon: 'ℹ️' },
      ]
    }

    switch (userRole) {
      case 'DANCER':
        return [
          ...commonItems,
          { href: '/stylists', label: 'Find Stylists', icon: '💄' },
          { href: '/bookings', label: 'My Bookings', icon: '📋' },
          { href: '/profile', label: 'Profile', icon: '👤' },
        ]
      case 'STYLIST':
        return [
          ...commonItems,
          { href: '/dashboard', label: 'Dashboard', icon: '📊' },
          { href: '/services', label: 'My Services', icon: '✨' },
          { href: '/bookings', label: 'Bookings', icon: '📋' },
          { href: '/calendar', label: 'Calendar', icon: '📅' },
          { href: '/profile', label: 'Profile', icon: '👤' },
        ]
      case 'ADMIN':
        return [
          ...commonItems,
          { href: '/admin', label: 'Admin Panel', icon: '⚙️' },
          { href: '/admin/users', label: 'Users', icon: '👥' },
          { href: '/admin/events', label: 'Manage Events', icon: '🎪' },
          { href: '/admin/reports', label: 'Reports', icon: '📈' },
        ]
      default:
        return commonItems
    }
  }

  const navigationItems = getNavigationItems()

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
  }

  return (
    <nav className={cn('bg-background border-b border-border sticky top-0 z-40', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
          >
            <div className="h-8 w-8 bg-gradient-to-r from-purple-600 to-gold-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">IS</span>
            </div>
            <span className="font-script text-xl font-semibold bg-gradient-to-r from-purple-600 to-gold-500 bg-clip-text text-transparent">
              The Independent Studio
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'px-3 py-2 rounded-md text-sm font-medium transition-colors relative',
                  pathname === item.href
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                )}
              >
                <span className="hidden sm:inline mr-1">{item.icon}</span>
                {item.label}
                {pathname === item.href && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                )}
              </Link>
            ))}
          </div>

          {/* Auth Section */}
          <div className="flex items-center space-x-2">
            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                {/* User Info */}
                <div className="hidden sm:flex items-center space-x-2 px-3 py-1 rounded-lg bg-secondary">
                  <div className="h-6 w-6 bg-gradient-to-r from-purple-600 to-gold-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {user?.email?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="text-sm">
                    <p className="font-medium">{user?.email}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {userRole?.toLowerCase()}
                    </p>
                  </div>
                </div>

                {/* Sign Out */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  className="hidden sm:flex"
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="gradient" size="sm">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'block px-3 py-2 rounded-md text-base font-medium transition-colors',
                    pathname === item.href
                      ? 'text-primary bg-primary/10'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </Link>
              ))}

              {isAuthenticated && (
                <>
                  <div className="px-3 py-2 text-sm text-muted-foreground border-t border-border mt-2 pt-3">
                    <p className="font-medium">{user?.email}</p>
                    <p className="text-xs capitalize">{userRole?.toLowerCase()}</p>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left px-3 py-2 text-base font-medium text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export { Navigation }
