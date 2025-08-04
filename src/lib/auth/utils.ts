import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { hashPassword, verifyPassword } from '@/lib/password'
import { UserRole } from '@prisma/client'

export { hashPassword, verifyPassword }

export async function getCurrentUser() {
  const session = await auth()

  if (!session?.user?.id) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      dancer: true,
      stylist: true,
      admin: true,
    },
  })

  return user
}

export async function requireAuth() {
  const user = await getCurrentUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  return user
}

export async function requireRole(role: UserRole) {
  const user = await requireAuth()

  if (user.role !== role) {
    throw new Error('Forbidden')
  }

  return user
}

export async function requireAdmin() {
  return requireRole('ADMIN')
}

export async function requireStylist() {
  return requireRole('STYLIST')
}

export async function requireDancer() {
  return requireRole('DANCER')
}
