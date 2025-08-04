# Quick Start Guide - The Independent Studio MVP

## 🚀 Immediate Setup (Next 2 Hours)

### 1. Database Setup (CRITICAL)

```bash
# 1. Create Supabase account at https://supabase.com
# 2. Create new project, copy database URL
# 3. Add to .env.local:
DATABASE_URL="postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"

# 4. Run migrations
npx prisma migrate dev --name init
npx prisma generate

# 5. Verify connection
npm run db:studio
```

### 2. Stripe Connect Setup (HIGH PRIORITY)

```bash
# 1. Create Stripe account at https://stripe.com
# 2. Get API keys from dashboard
# 3. Add to .env.local:
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# 4. Configure Connect platform in Stripe dashboard
# 5. Enable Express accounts for stylists
```

## 📋 Environment Variables Checklist

```env
# Database (REQUIRED)
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Authentication (CONFIGURED)
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Stripe (REQUIRED)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Email (MEDIUM PRIORITY)
RESEND_API_KEY="re_..."
FROM_EMAIL="noreply@yourapp.com"

# Images (MEDIUM PRIORITY)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Monitoring (LOW PRIORITY)
NEXT_PUBLIC_SENTRY_DSN="https://...@sentry.io/..."
```

## 🎯 Development Workflow

### Daily Commands

```bash
# Start development
npm run dev

# Run tests
npm run test:watch

# Check types
npm run type-check

# Lint and format
npm run lint:fix

# Database operations
npm run db:studio      # Open Prisma Studio
npm run db:migrate     # Run new migrations
npm run db:reset       # Reset database
```

### Git Workflow

```bash
# Feature branch
git checkout -b feature/task-name
git add .
git commit -m "feat: descriptive commit message"

# Pre-commit hooks will run automatically:
# - ESLint --fix
# - Prettier formatting
# - Type checking
# - Tests
```

## 🏗️ Architecture Overview

### Key Directories

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── login/             # Authentication pages
│   └── (dashboard)/       # Protected routes
├── components/            # Reusable UI components
│   ├── auth/              # Authentication components
│   └── ui/                # Design system components
├── lib/                   # Utility functions
│   ├── auth/              # Authentication logic
│   ├── db.ts              # Database client
│   └── password.ts        # Password utilities
├── types/                 # TypeScript definitions
└── middleware.ts          # Route protection
```

### Database Models (Prisma)

- **User** - Base user with role (DANCER/STYLIST/ADMIN)
- **Dancer** - Dancer profile and preferences
- **Stylist** - Stylist profile and business info
- **Event** - Competition events and venues
- **Service** - Stylist services (hair, makeup, etc.)
- **Booking** - Service bookings between dancers and stylists
- **Availability** - Stylist availability for events
- **Payout** - Payment records and tax reporting

## 🧪 Testing Strategy

### Running Tests

```bash
npm run test              # Run all tests
npm run test:coverage     # With coverage report
npm run test:ci           # CI optimized (no watch)
```

### Test Structure

```
src/
├── components/
│   └── __tests__/        # Component tests
├── lib/
│   └── __tests__/        # Utility function tests
└── __mocks__/            # Mock configurations
```

### Writing Tests

```typescript
// Component test example
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Button } from '../Button'

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })
})
```

## 🎨 UI Development

### Design System (Phase 2)

```typescript
// Component structure
components/
├── ui/                    # Core design system
│   ├── Button.tsx        # Button variants
│   ├── Input.tsx         # Form inputs
│   ├── Card.tsx          # Content containers
│   └── Modal.tsx         # Dialogs and modals
└── forms/                # Form patterns
    ├── LoginForm.tsx     # Authentication
    ├── RegisterForm.tsx  # User registration
    └── ProfileForm.tsx   # Profile management
```

### Styling Guidelines

- Use Tailwind CSS classes
- Create reusable component variants
- Follow mobile-first responsive design
- Maintain WCAG 2.1 AA accessibility standards

## 🚨 Common Issues & Solutions

### Database Connection Issues

```bash
# If migrations fail
npx prisma db push --force-reset
npx prisma generate
npm run db:seed
```

### Authentication Issues

```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

### Build Issues

```bash
# Clear all caches
rm -rf .next node_modules
npm install
npm run build
```

### Type Errors

```bash
# Regenerate Prisma types
npx prisma generate
npm run type-check
```

## 📞 Support & Resources

### Documentation

- [Next.js 14 Docs](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js v5](https://authjs.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Development Tools

- [Prisma Studio](http://localhost:5555) - Database GUI
- [Storybook](http://localhost:6006) - Component playground (Phase 2)
- [GitHub Actions](https://github.com/your-repo/actions) - CI/CD pipeline

### Getting Help

1. Check existing GitHub issues
2. Review error logs in terminal
3. Use `npm run type-check` for TypeScript issues
4. Check browser console for runtime errors

---

## 📈 Next Steps Priority Order

1. **🔥 URGENT:** Set up Supabase database connection
2. **🔥 HIGH:** Configure Stripe Connect for payments
3. **📊 MEDIUM:** Set up email service (Resend)
4. **📊 MEDIUM:** Configure image uploads (Cloudinary)
5. **🎯 NEXT PHASE:** Begin design system development

**Time Estimate:** 1-2 days for critical items, 1 week for complete Phase 1
