# EduGuard AI

**AI-powered education, security & finance platform** for personalized learning, academic integrity, fraud detection, and smart budgeting — with multilingual support and a dark green/black theme.

Built as an **Alibaba Cloud AI Hackathon** project.

![Tech](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![Prisma](https://img.shields.io/badge/Prisma-5.x-2D3748)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-336791)
![License](https://img.shields.io/badge/License-Private-lightgrey)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database](#database)
- [Available Scripts](#available-scripts)
- [Authentication & Security](#authentication--security)
- [AI Providers](#ai-providers)
- [Project Structure](#project-structure)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)

---

## Overview

EduGuard AI is a comprehensive educational platform that combines **personalized learning**, **academic integrity**, and **financial literacy & security**. It helps students discover universities, scholarships, and career paths; plan study and budgets; detect fraud (fake documents, phone scams, phishing URLs); and understand global education costs — all powered by a multi-provider AI engine with a natural fallback chain.

The frontend features a **dark green/black gradient theme** with glass morphism, emerald glow animations, and per-section color variations.

---

## Features

### 🎓 Education
- University / institution directory with search, compare, and detail views
- Scholarship matching, deadlines, and schemes (Pakistan + global focus)
- Career path exploration, internships, and courses
- Study abroad cost planning and country comparisons
- Personalized education roadmaps & recommendations

### 🛡 Fraud Detection & Reporting
- Document fraud scanning (OCR via Tesseract)
- Phone number scams + landline support
- URL / phishing scanner
- Text fraud analysis
- Fraud trend analytics and reporting to authorities

### 💰 Budget & Finance
- Budget profiles, income, expenses, savings goals
- Financial education content
- AI-powered budget advice & analysis

### 📚 Study Planner
- Study plans, topics, revision schedules, quizzes
- Pomodoro-style study timer
- Performance metrics & weak-subject analysis

### 💬 AI Chat & Assistance
- Streaming AI chat with conversational memory
- Department-scoped chats (education, finance, fraud)
- Multi-turn conversations with export

### 🧑‍🏫 Teacher & Student Tools
- Classrooms, lessons, homework, rubrics, assessments
- Student workspace with application checklists

### 👥 Roles & Admin
- User / Student / Teacher / Admin roles
- Admin dashboard: user management, AI monitoring, audit trails, security, system health
- Audit logging across the platform

### ❤ Multilingual
- Preferred-language setting with "auto" detection (default)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 14 (App Router, React 18) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS (emerald/black dark theme) |
| **Database** | PostgreSQL (Neon serverless) + Prisma ORM |
| **Auth** | JWT (access + refresh tokens), bcrypt, cookie-based, CSRF protection |
| **AI** | Groq SDK (primary), Google Gemini, OpenRouter (fallbacks) |
| **Documents** | PDF parse, Mammoth (DOCX), Tesseract.js (OCR) |
| **Email** | Nodemailer (Ethereal in dev / SMTP in prod) |
| **Validation** | Zod |
| **Testing** | Vitest + Testing Library + jsdom |
| **Deploy** | Vercel (GitHub Actions CI available) |

---

## Architecture

The app follows a layered architecture:

```
src/
├── app/                  # Next.js App Router (pages + API routes)
│   ├── (auth)            # Login / register / forgot / reset password
│   ├── (dashboard)       # Authenticated pages (education, fraud, budget, etc.)
│   ├── api/              # REST API route handlers (all under /api/*)
│   └── page.tsx          # Landing page
├── components/           # Reusable UI components (by feature area)
├── services/             # Business logic services (auth, fraud, education, ...)
├── repositories/         # Data access layer
├── lib/                  # Utilities, API client, JWT, Prisma, validation, rate limiting
├── middleware/           # Edge middleware (CORS, JWT verify, CSRF)
├── providers/            # React context providers (auth)
├── types/                # TypeScript type definitions
└── __mocks__/            # Test mocks
```

Flow: **Pages → API routes → Services → Repositories → Prisma/PostgreSQL**, with AI calls going through the provider fallback chain in `services/ai`.

See `docs/ARCHITECTURE.md` for a full deep-dive.

---

## Getting Started

### Prerequisites

- **Node.js** >= 18
- **npm** >= 9
- **PostgreSQL** (for production) — SQLite works for development
- One or more **AI API keys** (Groq recommended)

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Create env file
cp .env.example .env

# 3. Set your DATABASE_URL and API keys in .env (see below)

# 4. Generate Prisma client + push schema
npx prisma generate
npx prisma db push

# 5. (Optional) Seed the database
npm run db:seed
```

### Run Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production Build & Start

```bash
npm run build     # pushes DB schema, then builds
npm start
```

---

## Environment Variables

Create a `.env` file from `.env.example`. The important values:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (or `file:./dev.db` for SQLite dev) |
| `JWT_SECRET` | Secret for signing access tokens |
| `JWT_REFRESH_SECRET` | Separate secret for refresh tokens |
| `JWT_EXPIRES_IN` | Access token TTL (default `15m`) |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token TTL (default `7d`) |
| `GROQ_API_KEY` | Primary AI provider |
| `GROQ_MODEL` | e.g. `openai/gpt-oss-120b` |
| `AI_PROVIDER` | `groq` |
| `GEMINI_API_KEY` / `GEMINI_MODEL` | Fallback AI provider #1 |
| `OPENROUTER_API_KEY` / `OPENROUTER_MODEL` | Fallback AI provider #2 |
| `NEXT_PUBLIC_APP_URL` | Public app URL (e.g. `http://localhost:3000`) |
| `NEXT_PUBLIC_APP_NAME` | App display name |
| `SMTP_*` | Email config (empty = Ethereal dev emails) |

> ⚠️ **Never commit `.env`** — it is git-ignored. Use `.env.example` as a template.

---

## Database

The schema lives in `prisma/schema.prisma` (PostgreSQL provider). Key models include:
User, Profile, Conversation, Document, FraudReport, UrlScan, BudgetProfile, LearningProfile, StudyPlan, Teacher/StudentProfile, AuditLog, RefreshToken, Country, University, Scholarship, Scheme, CareerPath, Institution, and more.

Admin/seed data is populated from `prisma/seed*.ts` files (countries, universities, scholarships, schemes, careers, fraud data, admin user, etc.). A large collection of maintenance scripts lives in `scripts/` (data checks, fixes, migrations, and seed batches).

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | `prisma db push --skip-generate` then `next build` |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run Vitest in watch mode |
| `npm run test:run` | Run tests once |
| `npm run test:coverage` | Run tests with coverage |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to database |
| `npm run db:migrate` | Create/run migrations |
| `npm run db:migrate:prod` | Run migrations in production |
| `npm run db:seed` | Seed database |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:reset` | Reset database |

---

## Authentication & Security

EduGuard AI has a strong security baseline (11 fixes applied across the codebase):

- **JWT auth** — short-lived access token (`15m`) + refresh token (`7d`), JWT secrets validated lazily
- **Cookie-based tokens** — tokens stored in httpOnly-independent cookies on the client with `SameSite=Lax` and `Secure` on HTTPS; sent as `Authorization: Bearer`
- **CSRF protection** — per-session CSRF token in a cookie, validated on mutating requests
- **Password hardening** — bcrypt hashing, strength validation (min 12 chars + special), Zod validation
- **Account lockout** — repeated failed attempts lock accounts temporarily (rate limiting)
- **CORS** — configurable allowed origins; allows all when not set (fixes dev 403s)
- **Content Security Policy (CSP)** — applied via middleware
- **Request size limits** — enforced on uploads
- **API client resilience** — transparent 401 handling: auto-refreshes tokens and retries the request; gracefully handles unauthenticated states on page load

Public routes (auth, health, etc.) are whitelisted in `src/middleware.ts`; all others require a valid token.

---

## AI Providers

AI calls use a **fallback chain** — if the primary provider fails, the next is used automatically:

1. **Groq** (default)
2. **Google Gemini**
3. **OpenRouter**

Only set the keys for providers you intend to use. If a provider is unavailable, the service falls through to the next configured one, so a single working key keeps the app functional.

---

## Project Structure (highlights)

```
├── prisma/
│   ├── schema.prisma        # Database schema
│   ├── seed.ts              # Main seeder
│   └── seed-*.ts            # Domain seeders (countries, unis, scholarships, ...)
├── scripts/                 # Data maintenance & migration scripts
├── docs/                    # Architecture & feature reports
├── src/
│   ├── app/
│   │   ├── (auth)/          # Auth pages
│   │   ├── (dashboard)/     # Authenticated feature pages
│   │   ├── api/             # All REST endpoints
│   │   └── page.tsx         # Landing page
│   ├── components/          # Reusable UI
│   ├── services/            # Business logic
│   ├── repositories/        # Data access
│   ├── lib/                 # Utilities & client
│   ├── middleware/          # Edge middleware
│   └── providers/           # React providers
├── tailwind.config.ts       # Emerald theme + animations
└── package.json
```

---

## Testing

Tests live in `src/tests` (`unit`, `integration`, `api`, `security`) using **Vitest + Testing Library** with jsdom. Mocks are in `src/__mocks__`.

```bash
npm run test:run        # run all tests once
npm run test:coverage   # run with coverage report
```

---

## Deployment

### Vercel

This project is configured to deploy to **Vercel**:

1. Import the repo into Vercel.
2. Set all environment variables from `.env.example` in the Vercel dashboard (auto-detected from `.env.example`).
3. Build command is `npm run build` (which runs `prisma db push --skip-generate` to auto-migrate on deploy).

### Docker

A `Dockerfile` and `docker-compose.yml` are included for containerized runs.

---

## Contributing

1. Fork / clone the repo.
2. Create a feature branch.
3. Make your changes and run `npm run lint` and `npm test`.
4. Open a pull request.

> Consult `docs/DEVELOPMENT_PLAN.md` and `docs/ARCHITECTURE.md` before significant changes.
