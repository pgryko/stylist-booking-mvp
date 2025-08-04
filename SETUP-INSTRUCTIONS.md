# 🚀 Critical Setup Instructions

## ✅ Completed Tasks

- ✅ Environment variables configured (.env.local created)
- ✅ NextAuth secret generated
- ✅ Database seed script created with comprehensive test data
- ✅ TypeScript dependencies installed

## 🔥 URGENT: Next Steps Required

### 1. Set Up Supabase Database (5 minutes)

**Action Required:**

1. Go to [https://supabase.com](https://supabase.com) and create a free account
2. Create a new project (choose any name, e.g., "stylist-booking-mvp")
3. Wait for project to initialize (~2 minutes)
4. Go to **Settings** → **Database**
5. Copy the **Connection string** (URI format)
6. Replace the DATABASE_URL in `.env.local` with your actual URL

**Example:**

```bash
# Replace this in .env.local:
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# With your actual URL from Supabase:
DATABASE_URL="postgresql://postgres:YourActualPassword@db.abc123defghijk.supabase.co:5432/postgres"
```

### 2. Run Database Migrations (1 command)

Once you have the real DATABASE_URL:

```bash
npx prisma migrate dev --name init
```

This will:

- Connect to your Supabase database
- Create all 13 tables (User, Dancer, Stylist, Event, Booking, etc.)
- Generate Prisma client types

### 3. Seed Test Data (1 command)

```bash
npm run db:seed
```

This creates:

- 3 test users (dancer, stylist, admin)
- 2 sample events (Atlanta, Las Vegas)
- 3 stylist services
- 1 test booking
- Login credentials: `dancer@test.com` / `password123`

### 4. Verify Setup (1 command)

```bash
npm run db:studio
```

Opens Prisma Studio at http://localhost:5555 to browse your data.

## 🎯 After Database Setup

Once the database is connected, you can:

1. **Start development**: `npm run dev`
2. **Run tests**: `npm test`
3. **Begin Phase 2**: Design system development

## 🚨 Common Issues

### "Environment variable not found: DATABASE_URL"

- Make sure `.env.local` exists and has the correct DATABASE_URL
- Restart your development server after changing environment variables

### "Migration failed"

- Double-check your DATABASE_URL is correct
- Ensure your Supabase project is fully initialized
- Try: `npx prisma db push` instead of migrate for first setup

### "Cannot connect to database"

- Verify your Supabase project is running (not paused)
- Check your internet connection
- Confirm the connection string includes the correct password

## ⏱️ Time Estimate

- Total setup time: ~10 minutes
- Supabase setup: 5 minutes
- Database migration: 1 minute
- Seeding data: 30 seconds
- Verification: 30 seconds

## 📞 Need Help?

If you encounter issues:

1. Check the error message carefully
2. Verify your DATABASE_URL format
3. Try the Supabase dashboard to ensure project is active

---

**Once complete, you'll have a fully functional database with test data and can begin development!**
