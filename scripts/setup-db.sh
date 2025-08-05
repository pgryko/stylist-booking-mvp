#!/bin/bash

# Database Setup Script for The Independent Studio
# Supports both SQLite (local) and PostgreSQL (production)

set -e

echo "🗄️  Setting up database for The Independent Studio..."

# Check if we're using SQLite or PostgreSQL
if [[ $DATABASE_URL == *"file:"* ]]; then
    echo "📱 Detected SQLite database - setting up for local development"
    DB_TYPE="sqlite"
else
    echo "🐘 Detected PostgreSQL database - setting up for production"
    DB_TYPE="postgresql"
fi

# Update Prisma schema based on database type
if [ "$DB_TYPE" = "postgresql" ]; then
    echo "🔄 Switching to PostgreSQL configuration..."
    sed -i '' 's/provider = "sqlite"/provider = "postgresql"/' prisma/schema.prisma
    
    # Restore PostgreSQL-specific types
    sed -i '' 's/price           Float/price           Decimal   @db.Decimal(10, 2)/' prisma/schema.prisma
    sed -i '' 's/servicePrice          Float/servicePrice          Decimal   @db.Decimal(10, 2)/' prisma/schema.prisma
    sed -i '' 's/platformFee           Float/platformFee           Decimal   @db.Decimal(10, 2)/' prisma/schema.prisma
    sed -i '' 's/stylistPayout         Float/stylistPayout         Decimal   @db.Decimal(10, 2)/' prisma/schema.prisma
    sed -i '' 's/amount                Float/amount                Decimal   @db.Decimal(10, 2)/' prisma/schema.prisma
else
    echo "🔄 Using SQLite configuration..."
    sed -i '' 's/provider = "postgresql"/provider = "sqlite"/' prisma/schema.prisma
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Run migrations
echo "🚀 Running database migrations..."
if [ "$DB_TYPE" = "sqlite" ]; then
    npx prisma migrate dev --name init
else
    npx prisma migrate deploy
fi

echo "✅ Database setup complete!"
echo ""
echo "🎯 Next steps:"
echo "   • Run 'npm run dev' to start the development server"
echo "   • Visit 'http://localhost:3000' to see your app"
echo "   • Use 'npx prisma studio' to view/edit database"
echo ""