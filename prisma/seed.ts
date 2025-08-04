import { PrismaClient, UserRole } from '@prisma/client'
import { hashPassword } from '../src/lib/password'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Clean existing data (in development only)
  if (process.env.NODE_ENV === 'development') {
    console.log('🧹 Cleaning existing data...')
    await prisma.booking.deleteMany()
    await prisma.availability.deleteMany()
    await prisma.service.deleteMany()
    await prisma.payout.deleteMany()
    await prisma.earning.deleteMany()
    await prisma.event.deleteMany()
    await prisma.auditLog.deleteMany()
    await prisma.session.deleteMany()
    await prisma.account.deleteMany()
    await prisma.dancer.deleteMany()
    await prisma.stylist.deleteMany()
    await prisma.admin.deleteMany()
    await prisma.user.deleteMany()
  }

  // Create test users
  console.log('👥 Creating test users...')

  // Test dancer
  const dancerUser = await prisma.user.create({
    data: {
      email: 'dancer@test.com',
      phone: '+1234567890',
      password: await hashPassword('password123'),
      role: UserRole.DANCER,
      consentDate: new Date(),
      consentVersion: '1.0',
    },
  })

  await prisma.dancer.create({
    data: {
      userId: dancerUser.id,
      firstName: 'Emma',
      lastName: 'Johnson',
      dateOfBirth: new Date('2005-03-15'),
    },
  })

  // Test stylist
  const stylistUser = await prisma.user.create({
    data: {
      email: 'stylist@test.com',
      phone: '+1234567891',
      password: await hashPassword('password123'),
      role: UserRole.STYLIST,
      consentDate: new Date(),
      consentVersion: '1.0',
    },
  })

  const stylist = await prisma.stylist.create({
    data: {
      userId: stylistUser.id,
      displayName: "Sarah's Beauty Studio",
      bio: 'Professional hair and makeup artist specializing in competition looks. 10+ years experience with dancers of all levels.',
      specialty: 'Competition Hair & Makeup',
      yearsExperience: 10,
      isVerified: true,
      verifiedAt: new Date(),
      usWorkPermit: true,
      portfolioImages: JSON.stringify([
        'https://example.com/portfolio1.jpg',
        'https://example.com/portfolio2.jpg',
      ]),
    },
  })

  // Test admin
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@test.com',
      phone: '+1234567892',
      password: await hashPassword('password123'),
      role: UserRole.ADMIN,
      consentDate: new Date(),
      consentVersion: '1.0',
    },
  })

  await prisma.admin.create({
    data: {
      userId: adminUser.id,
      permissions: JSON.stringify(['users:read', 'users:write', 'events:write']),
    },
  })

  // Create test events
  console.log('🎪 Creating test events...')

  const event1 = await prisma.event.create({
    data: {
      name: 'Southeast Regional Dance Competition',
      slug: 'southeast-regional-2024',
      description:
        'Annual regional competition featuring solo, duo, and group performances across all age divisions.',
      venue: 'Atlanta Convention Center',
      address: '285 Andrew Young International Blvd NW',
      city: 'Atlanta',
      state: 'GA',
      country: 'USA',
      postalCode: '30313',
      startDate: new Date('2024-09-15T08:00:00Z'),
      endDate: new Date('2024-09-17T20:00:00Z'),
      timezone: 'America/New_York',
      imageUrl: 'https://example.com/event1.jpg',
    },
  })

  const event2 = await prisma.event.create({
    data: {
      name: 'National Championship Finals',
      slug: 'nationals-2024',
      description:
        'The ultimate dance competition bringing together the best dancers from across the country.',
      venue: 'Las Vegas Convention Center',
      address: '3150 Paradise Rd',
      city: 'Las Vegas',
      state: 'NV',
      country: 'USA',
      postalCode: '89109',
      startDate: new Date('2024-11-20T08:00:00Z'),
      endDate: new Date('2024-11-24T22:00:00Z'),
      timezone: 'America/Los_Angeles',
      imageUrl: 'https://example.com/event2.jpg',
    },
  })

  // Create services
  console.log('💄 Creating stylist services...')

  const service1 = await prisma.service.create({
    data: {
      stylistId: stylist.id,
      name: 'Competition Hair Styling',
      description:
        'Professional updo with curls, bobby pins, and competition-grade hairspray. Includes hair consultation.',
      price: 75.0,
      duration: 45, // minutes
    },
  })

  const service2 = await prisma.service.create({
    data: {
      stylistId: stylist.id,
      name: 'Full Competition Makeup',
      description:
        'Stage-ready makeup including foundation, contouring, eye makeup, lashes, and lips. Perfect for competition lighting.',
      price: 65.0,
      duration: 30,
    },
  })

  const service3 = await prisma.service.create({
    data: {
      stylistId: stylist.id,
      name: 'Hair & Makeup Package',
      description:
        'Complete competition look with professional hair styling and full makeup. Best value for complete transformation.',
      price: 120.0,
      duration: 75,
    },
  })

  // Create availability
  console.log('📅 Creating stylist availability...')

  await prisma.availability.create({
    data: {
      stylistId: stylist.id,
      eventId: event1.id,
      date: new Date('2024-09-15'),
      startTime: '07:00',
      endTime: '18:00',
    },
  })

  await prisma.availability.create({
    data: {
      stylistId: stylist.id,
      eventId: event1.id,
      date: new Date('2024-09-16'),
      startTime: '07:00',
      endTime: '18:00',
    },
  })

  // Create a sample booking
  console.log('📋 Creating sample booking...')

  const booking = await prisma.booking.create({
    data: {
      dancerId: dancerUser.id,
      stylistId: stylist.id,
      eventId: event1.id,
      serviceId: service3.id,
      date: new Date('2024-09-15'),
      startTime: new Date('2024-09-15T10:00:00Z'),
      endTime: new Date('2024-09-15T11:15:00Z'),
      servicePrice: 120.0,
      platformFee: 30.0, // 25% of service price
      stylistPayout: 90.0, // 75% of service price
      currency: 'USD',
      paymentStatus: 'SUCCEEDED',
      paidAt: new Date(),
      status: 'CONFIRMED',
    },
  })

  // Create earning record
  await prisma.earning.create({
    data: {
      stylistId: stylist.id,
      year: 2024,
      month: 9,
      amount: 90.0,
      currency: 'USD',
      country: 'USA',
    },
  })

  // Create audit log entry
  await prisma.auditLog.create({
    data: {
      userId: dancerUser.id,
      action: 'BOOKING_CREATED',
      entityType: 'BOOKING',
      entityId: booking.id,
      details: JSON.stringify({
        serviceId: service3.id,
        eventId: event1.id,
        amount: 120.0,
      }),
      ipAddress: '127.0.0.1',
      userAgent: 'Seed Script',
    },
  })

  console.log('✅ Database seeding completed!')
  console.log(`
📊 Created:
  • 3 users (dancer, stylist, admin)
  • 2 events (Atlanta, Las Vegas)
  • 3 services (hair, makeup, package)
  • 1 booking (confirmed)
  • 2 availability slots
  • 1 earning record
  • 1 audit log entry

🔐 Test Login Credentials:
  Dancer: dancer@test.com / password123
  Stylist: stylist@test.com / password123
  Admin: admin@test.com / password123
  `)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
