This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## CI/CD Pipeline

This project includes a comprehensive CI/CD pipeline with GitHub Actions:

### Workflows

- **🔄 CI (`ci.yml`)**: Runs on every push and PR
  - Tests across Node.js 18.x and 20.x
  - Linting and type checking
  - Unit tests with coverage
  - Security audit
  - Code quality analysis with SonarCloud

- **🚀 Deployment (`deployment.yml`)**: Deploys to Vercel on main branch
  - Automatic deployment after successful CI
  - Production environment setup
  - Deployment notifications

- **🔍 PR Checks (`pr-checks.yml`)**: Additional validation for PRs
  - Merge conflict detection
  - Bundle size analysis
  - Accessibility checks
  - PR size validation
  - TODO/FIXME comment detection

- **📦 Release (`release.yml`)**: Automated releases on version tags
  - Changelog generation
  - GitHub release creation
  - Production deployment
  - Slack notifications

### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server

# Testing
npm run test            # Run tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Run tests with coverage
npm run test:ci         # Run tests for CI (no watch)

# Code Quality
npm run lint            # Run ESLint
npm run lint:fix        # Fix ESLint issues
npm run type-check      # Run TypeScript compiler

# Database
npm run db:generate     # Generate Prisma client
npm run db:migrate      # Run database migrations
npm run db:reset        # Reset database
npm run db:seed         # Seed database
npm run db:studio       # Open Prisma Studio

# Security
npm run security:audit  # Run security audit
```

### Setting Up CI/CD

1. **Repository Secrets**: Add these secrets to your GitHub repository:

   ```
   NEXTAUTH_SECRET=your-nextauth-secret
   NEXTAUTH_URL=https://your-domain.com
   VERCEL_TOKEN=your-vercel-token
   ORG_ID=your-vercel-org-id
   PROJECT_ID=your-vercel-project-id
   SONAR_TOKEN=your-sonarcloud-token
   SLACK_WEBHOOK=your-slack-webhook-url
   ```

2. **SonarCloud Setup**:
   - Create account at [sonarcloud.io](https://sonarcloud.io)
   - Import your repository
   - Update `sonar-project.properties` with your project key

3. **Dependabot**: Automatically creates PRs for dependency updates
   - Runs weekly on Mondays
   - Ignores major version updates for core dependencies
   - Includes security updates

### Branch Protection

Recommended branch protection rules for `main`:

- ✅ Require status checks to pass before merging
- ✅ Require branches to be up to date before merging
- ✅ Require pull request reviews before merging
- ✅ Dismiss stale PR approvals when new commits are pushed
- ✅ Restrict pushes that create files larger than 100 MB

### Quality Gates

The CI pipeline enforces:

- 📊 Code coverage minimum (configurable)
- 🔒 Security vulnerability scanning
- 📝 Code quality metrics via SonarCloud
- 🎨 Code formatting with Prettier
- 🔍 Linting with ESLint
- 📦 Bundle size monitoring
- ♿ Accessibility standards
