import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth

  // Public routes
  const publicRoutes = ['/', '/events', '/stylists', '/login', '/register', '/auth']
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))

  // Role-based routes
  const adminRoutes = ['/admin']
  const stylistRoutes = ['/stylist']
  const dancerRoutes = ['/dancer', '/booking']

  if (!isLoggedIn && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (isLoggedIn) {
    const userRole = req.auth?.user?.role

    // Redirect based on role
    if (adminRoutes.some((route) => pathname.startsWith(route)) && userRole !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', req.url))
    }

    if (stylistRoutes.some((route) => pathname.startsWith(route)) && userRole !== 'STYLIST') {
      return NextResponse.redirect(new URL('/', req.url))
    }

    // Allow dancers to access booking routes
    if (dancerRoutes.some((route) => pathname.startsWith(route)) && userRole !== 'DANCER') {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
