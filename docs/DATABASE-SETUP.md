# Database Setup Guide

The Independent Studio supports both **SQLite** (local development) and **PostgreSQL** (production) databases.

## 🚀 Quick Start (SQLite)

For immediate local development:

```bash
# 1. Database is already configured for SQLite
# 2. Run migrations (already done)
DATABASE_URL="file:./prisma/dev.db" npx prisma migrate dev --name init

# 3. Start the app
npm run dev
```

**✅ Ready!** Visit `http://localhost:3000`

## 🔄 Database Configuration Options

### Option 1: SQLite (Local Development)

**Pros:** No setup required, instant start, perfect for development  
**Cons:** Single file database, not suitable for production

```bash
# .env.local
DATABASE_URL="file:./prisma/dev.db"

# prisma/schema.prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

### Option 2: PostgreSQL (Production)

**Pros:** Production-ready, better performance, advanced features  
**Cons:** Requires external service setup

```bash
# .env.local
DATABASE_URL="postgresql://user:password@host:5432/database"
DIRECT_URL="postgresql://user:password@host:5432/database"

# prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

## 🔧 Switching Between Databases

### SQLite → PostgreSQL

1. **Set up PostgreSQL** (Supabase, Railway, etc.)
2. **Update environment:**
   ```bash
   # .env.local
   DATABASE_URL="postgresql://..."
   DIRECT_URL="postgresql://..."
   ```
3. **Update schema:**

   ```bash
   # Change provider in prisma/schema.prisma
   provider = "postgresql"

   # Restore Decimal types for better precision
   price           Decimal   @db.Decimal(10, 2)
   servicePrice    Decimal   @db.Decimal(10, 2)
   # ... etc
   ```

4. **Run migrations:**
   ```bash
   npx prisma migrate deploy
   npx prisma db seed
   ```

### PostgreSQL → SQLite

1. **Update environment:**
   ```bash
   # .env.local
   DATABASE_URL="file:./prisma/dev.db"
   ```
2. **Update schema:**

   ```bash
   # Change provider in prisma/schema.prisma
   provider = "sqlite"

   # Use Float instead of Decimal
   price           Float
   servicePrice    Float
   # ... etc
   ```

3. **Run migrations:**
   ```bash
   npx prisma migrate dev --name switch_to_sqlite
   ```

## 📊 Database Models

The application includes **13 models** with full relationships:

### Core Models

- **User** - Base user accounts with role-based access
- **Dancer** - Dancer profiles and preferences
- **Stylist** - Stylist profiles, verification, and business data
- **Admin** - Administrative users with permissions

### Business Models

- **Event** - Dance competitions and events
- **Service** - Stylist service offerings
- **Availability** - Stylist availability at events
- **Booking** - Service bookings with full lifecycle

### Financial Models

- **Payout** - Stylist payment processing
- **Earning** - Monthly earning aggregates

### System Models

- **AuditLog** - Security and compliance tracking
- **Account** - NextAuth provider accounts
- **Session** - User session management

## 🌱 Sample Data

The database includes comprehensive seed data:

### Test Users

- **Dancer:** `dancer@test.com` / `password123`
- **Stylist:** `stylist@test.com` / `password123`
- **Admin:** `admin@test.com` / `password123`

### Sample Events

- **Starpower Dance Competition** (Atlanta, GA)
- **Nuvo Convention** (Las Vegas, NV)

### Stylist Services

- **Updo Styling** - $75 (60 min)
- **Competition Makeup** - $50 (45 min)
- **Hair & Makeup Package** - $120 (90 min)

## 🛠️ Database Tools

### Prisma Studio

Visual database browser and editor:

```bash
npx prisma studio
# Opens http://localhost:5555
```

### Migration Management

```bash
# Create new migration
npx prisma migrate dev --name description

# Apply migrations (production)
npx prisma migrate deploy

# Reset database (development)
npx prisma migrate reset
```

### Seeding

```bash
# Run seed script
npx prisma db seed

# Seed script location
prisma/seed.ts
```

## 🔐 Security Considerations

### SQLite Security

- Database file should be in `.gitignore`
- Suitable only for development
- No network access required

### PostgreSQL Security

- Use connection pooling (Supabase/Railway provide this)
- Enable Row Level Security (RLS)
- Rotate passwords regularly
- Use environment variables for credentials

## 🚀 Production Deployment

### Recommended Services

1. **Supabase** - PostgreSQL with built-in auth/storage
2. **Railway** - Simple PostgreSQL hosting
3. **Neon** - Serverless PostgreSQL
4. **PlanetScale** - MySQL alternative (requires schema changes)

### Migration Strategy

1. Set up production database
2. Run `npx prisma migrate deploy`
3. Update environment variables
4. Test connection with read-only operations
5. Deploy application

## 🐛 Troubleshooting

### Common Issues

**"Environment variable not found: DATABASE_URL"**

```bash
# Solution: Set explicit DATABASE_URL
DATABASE_URL="file:./prisma/dev.db" npx prisma [command]
```

**"SQLite does not support Decimal type"**

```bash
# Solution: Use Float for SQLite, Decimal for PostgreSQL
# See schema switching guide above
```

**"Migration conflicts"**

```bash
# Solution: Reset migrations for development
npx prisma migrate reset
```

**"Connection timeout"**

```bash
# Solution: Check PostgreSQL connection string
# Verify database is running and accessible
```

---

**Need Help?** Check the main README or create an issue for database-specific problems.
