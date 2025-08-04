import { prisma } from '../db'

// Mock Prisma Client
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  })),
}))

describe('Database Client', () => {
  it('should export a prisma client instance', () => {
    expect(prisma).toBeDefined()
    expect(typeof prisma).toBe('object')
  })

  it('should have user methods available', () => {
    expect(prisma.user).toBeDefined()
    expect(prisma.user.findUnique).toBeDefined()
    expect(prisma.user.findMany).toBeDefined()
    expect(prisma.user.create).toBeDefined()
    expect(prisma.user.update).toBeDefined()
    expect(prisma.user.delete).toBeDefined()
  })
})
