# EduGuard AI

AI-powered educational platform for personalized learning and academic integrity.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **AI**: Groq SDK
- **Testing**: Vitest + Testing Library

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL

### Setup

```bash
npm install
cp .env.example .env
```

Update `.env` with your database URL and API keys.

```bash
npx prisma generate
npx prisma db push
npm run db:seed
```

### Development

```bash
npm run dev
```

### Database

```bash
npm run db:generate    # Generate Prisma client
npm run db:push        # Push schema to database
npm run db:migrate     # Create and run migrations
npm run db:seed        # Seed database
npm run db:studio      # Open Prisma Studio
```

### Testing

```bash
npm run test           # Run tests in watch mode
npm run test:run       # Run tests once
npm run test:coverage  # Run with coverage
```

### Linting

```bash
npm run lint
```
