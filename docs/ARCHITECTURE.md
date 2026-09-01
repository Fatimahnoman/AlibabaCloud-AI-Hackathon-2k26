# EduGuard AI - Architecture Document

## Current Stack
- **Frontend**: Next.js 14 (App Router) with TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Next.js API Routes (serverless)
- **Database**: SQLite (dev) / PostgreSQL (prod) with Prisma ORM — 77 models
- **AI Provider**: Groq (with abstraction layer)
- **Authentication**: JWT (access + refresh tokens) with bcryptjs
- **Package Manager**: npm
- **Routes**: 154 API routes
- **Testing**: Vitest + React Testing Library — 1010 passing tests

## Architecture Overview

### High-Level Architecture
```
Frontend (Next.js App)
  ↕ AuthProvider (React Context)
API Routes (Next.js) ← Middleware (JWT check, CORS, rate-limit)
  ↕
Service Layer (Auth, Audit, AI, Chat, Education, Fraud, Budget, Study, Teacher, CountryIntelligence, FinancialEducation...)
  ↕
Prisma ORM → Database (SQLite dev / PostgreSQL prod)
  ↕
External APIs (Groq AI, future: voice, email)
```

### Design Principles
1. **Service Layer Isolation** - AI never directly accesses database
2. **Provider Abstraction** - All external services (AI, Voice) are abstracted
3. **Module Separation** - Each product area is independent
4. **Security First** - All inputs validated, files treated as untrusted
5. **Multilingual by Design** - Language support built into core
6. **Consistent Design System** - Centralized CSS classes in `globals.css` for all UI components

### Design System (`src/app/globals.css`)
- **Buttons**: `.btn-primary` (gradient indigo→blue), `.btn-secondary` (white bordered), `.btn-danger` (gradient red→rose), `.btn-ghost`
- **Cards**: `.card` (white rounded-2xl), `.card-hover` (with hover effects), `.glass` (glassmorphism), `.admin-panel` (admin sections)
- **Stat Cards**: `.stat-card` + `.stat-card-blue/green/purple/amber/rose/cyan` (colored top border accent)
- **Badges**: `.badge` + `.badge-success/warning/danger/info/purple`
- **Inputs**: `.input-field` (border-2, rounded-xl, indigo focus ring)
- **Navigation**: `.sidebar-link` + `.sidebar-link-active` (gradient) + `.sidebar-link-inactive`
- **Data Display**: `.progress-bar` + `.progress-bar-fill-*`, `.pulse-dot` + `.pulse-dot-green/red/amber`
- **Animations**: `.animate-fade-in`, `.animate-slide-up`, `.animate-slide-right`, `.animate-scale-in`, `.animate-float`, `.animate-glow`
- **Loading**: `.skeleton` (shimmer loading effect)
- **Overlays**: `.modal-overlay`, `.modal-content`, `.slide-over`

### Authentication Architecture

```
Client (login/register)
  ↓
API Route → Rate Limiter → Zod Validation → AuthService
  ↓
AuthService: hashPassword / comparePassword (bcryptjs, 12 rounds)
  ↓
JWT: generateTokenPair (15min access + 7d refresh)
  ↓
Refresh Token Rotation: old token revoked, new pair issued
  ↓
Middleware: verifyAccessToken on protected routes
  ↓
AuditService: all auth events logged (register, login, logout, password reset/change)
```

**Token Flow:**
- Access token (15min) stored in memory (client state)
- Refresh token (7d) stored in httpOnly cookie (production) or memory (dev)
- Token refresh: validate refresh token → revoke old → issue new pair
- Logout: revoke refresh token in DB

**Password Security:**
- bcryptjs with 12 salt rounds
- Strength validation: 8+ chars, uppercase, lowercase, number, special char
- Password history not tracked (Phase 2 scope)

**Role-Based Access Control:**
- Roles: `user`, `admin`, `teacher`
- Middleware helpers: `authenticate()`, `requireAuth()`, `requireRole()`
- Role checked at middleware + service level (defense in depth)

### Module Structure

| Module | Path | Status | Description |
|--------|------|--------|-------------|
| Auth | services/auth/ | ✅ Complete | Registration, login, JWT, password reset, profile |
| Audit | services/audit/ | ✅ Complete | Auth event logging, query by user |
| AI | services/ai/ | ✅ Complete | Groq integration, language/intent detection, usage tracking, safety rules |
| Chat | services/chat/ | ✅ Complete | CRUD, streaming, AI integration, search, archiving, memory, context management |
| Education | services/education/ | ✅ Complete | Courses, universities, scholarships, careers, saved items, checklists |
| Fraud | services/fraud/ | ✅ Complete | Fraud detection pipeline, rule engine, URL analyzer, document processing, AI explanation |
| Budget | services/budget/ | ✅ Complete | Budget profile, income/expense tracking, categories, limits, savings goals, conversational input, analysis |
| Documents | services/documents/ | 🔲 Stub | File upload, processing, analysis |
| Study | services/study/ | ✅ Complete | Learning profiles, study plans, sessions, topics, weak subject analysis, daily schedules, weekly summaries |
| Teacher | services/teacher/ | ✅ Complete | Teacher profiles, lesson plan generation, assessment generation, homework, rubrics |
| Voice | services/voice/ | ✅ Complete | Browser STT/TTS provider with provider abstraction |
| Sources | services/sources/ | ✅ Complete (14 methods) | Source verification, tracking, management |
| Verification | services/verification/ | ✅ Complete (5 methods) | Verification pipeline, log management |
| ChangeDetector | services/sources/ | ✅ Complete (3 methods) | Content change detection for sources |
| Orchestration | services/orchestration/ | ✅ Complete (17 methods) | Multi-domain query orchestration, education planning, unified response building |
| StudentAssistant | services/student-assistant/ | ✅ Complete (8 methods) | Unified student profile, privacy engine, proactive insights, personalized dashboard |

### Folder Structure
```
eduguard-ai/
├── docs/                   # Documentation
├── prisma/                 # Database schema
│   ├── schema.prisma       # 56 models
│   └── dev.db              # SQLite dev database
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── (auth)/         # Login, register, forgot-password, reset-password
│   │   ├── (dashboard)/    # Profile, change-password, chat, fraud, budget, verification, sources, audit...
│   │   ├── api/            # ~98 API route files
│   │   ├── layout.tsx      # Root layout (AuthProvider wrapper)
│   │   └── page.tsx        # Landing page (redirects if authenticated)
│   ├── components/         # UI components
│   │   ├── chat/           # ChatMessage, ChatInput, ChatEmpty, ChatSidebar, ChatSettings
│   │   └── verification/   # VerificationBadge, SourceTracker
│   ├── lib/                # Core libraries
│   │   ├── jwt.ts          # JWT token generation/verification
│   │   ├── password.ts     # bcryptjs hashing, strength validation
│   │   ├── rate-limit.ts   # In-memory rate limiter (auth + chat configs)
│   │   ├── auth-middleware.ts  # Server-side auth helpers
│   │   ├── api-client.ts   # Client-side API helper
│   │   ├── prisma.ts       # Prisma client singleton
│   │   ├── ssrf-protection.ts  # SSRF protection (blocked hosts, private IPs)
│   │   ├── file-validation.ts  # File type/size validation
│   │   ├── credential-redaction.ts  # Sensitive data redaction
│   │   └── utils/          # Validation schemas, API helpers
│   ├── providers/          # React context providers
│   │   └── auth-provider.tsx  # Auth context (login, register, logout, user state)
│   ├── services/           # Business logic
│   │   ├── auth/           # AuthService (JWT, RBAC, password, profile)
│   │   ├── audit/          # AuditService (auth event logging)
│   │   ├── ai/             # AIService, provider, prompts, language/intent detection, usage, education-context
│   │   ├── chat/           # ChatService (CRUD, streaming, AI, memory, context, settings)
│   │   ├── education/      # CourseService, UniversityService, ScholarshipService, CareerGuidanceService, SavedItemsService, ApplicationChecklistService
│   │   ├── fraud/          # FraudService, RuleEngine, UrlAnalyzer, TextAnalyzer, DocumentProcessor, RiskScorer, AiExplainer
│   │   ├── budget/         # BudgetService (profile, income, expense, categories, limits, savings goals, analysis)
│   │   ├── study/          # StudyService (learning profiles, study plans, sessions, topics, schedules, weekly summaries)
│   │   ├── teacher/        # TeacherService (teacher profiles, lesson plans, assessments, homework, rubrics)
│   │   ├── voice/          # BrowserSTTProvider, BrowserTTSProvider
│   │   ├── sources/        # SourceService (CRUD, fetch, verify, search, analytics)
│   │   ├── verification/   # VerificationService (pipeline, logs, status tracking)
│   │   ├── orchestration/  # OrchestratorService, EducationPlanner, ResponseBuilder
│   │   └── student-assistant/  # StudentAssistantService, PrivacyEngine, ProactiveInsights
│   ├── types/              # TypeScript types
│   └── tests/              # Tests (43 test files, 662 test cases)
```

### Database Schema (56 Models)

**User Domain (4 models)**
| Model | Purpose |
|-------|---------|
| User | Core user (email, passwordHash, role, preferredLanguage, emailVerified) |
| Profile | Extended profile (bio, phone, educationLevel, occupation) |
| PasswordResetToken | Password reset tokens (hashed, expiry, used flag) |
| EmailVerificationToken | Email verification tokens (hashed, expiry, used flag) |

**Auth Domain (1 model)**
| Model | Purpose |
|-------|---------|
| RefreshToken | Refresh tokens (token, userId, expiresAt, revoked) |

**Chat Domain (3 models)**
| Model | Purpose |
|-------|---------|
| Conversation | Chat sessions with language preference |
| ConversationMessage | Individual messages with role and tokens (updatedAt) |
| ConversationSummary | Compressed summaries for long conversations (importantFacts, updatedAt) |

**User Memory Domain (1 model)**
| Model | Purpose |
|-------|---------|
| UserMemory | Per-user key-value memory (auto-extracted facts from conversations) |

**User Settings Domain (1 model)**
| Model | Purpose |
|-------|---------|
| UserSettings | Per-user settings (language, easyMode, autoRead, memory, theme, fontSize) |

**Education Domain (14 models)**
| Model | Purpose |
|-------|---------|
| University | University info with country, type, rankings |
| Course | Courses linked to universities with fields |
| Degree | Degree programs |
| Scholarship | Scholarships with deadlines and amounts |
| ScholarshipRequirement | Eligibility criteria |
| Country | Country information |
| AdmissionRequirement | Admission requirements per university |
| VisaInformation | Visa requirements per country |
| SavedCourse | User-saved courses |
| SavedUniversity | User-saved universities |
| SavedScholarship | User-saved scholarships |
| ApplicationChecklist | Application task checklists |
| UniversityRanking | QS/THE/CWUR rankings |
| CareerPath | Career paths with skills, roles, certifications |

**Document Domain (2 models)**
| Model | Purpose |
|-------|---------|
| Document | Uploaded documents with analysis status |
| DocumentScan | Scan results per document |

**Fraud Domain (9 models)**
| Model | Purpose |
|-------|---------|
| FraudReport | User-submitted fraud scan reports |
| FraudIndicator | Indicators found in analysis |
| FraudEvidence | Structured evidence per scan |
| FraudRule | Configurable detection rules |
| UrlScan | URL security scan results |
| UrlIndicator | URL-specific indicators |
| DocumentScan | Document scan results |
| CyberAuthority | Government cyber authorities by country |
| ComplaintProcedure | Steps for filing complaints |
| UserReport | User feedback on scan accuracy |

**Budget Domain (6 models)**
| Model | Purpose |
|-------|---------|
| BudgetProfile | User budget settings and currency |
| IncomeRecord | Income entries |
| ExpenseRecord | Expense entries with categories |
| ExpenseCategory | Category definitions (system + custom) |
| Budget | Period-based budget limits |
| SavingsGoal | Savings targets with title, target/current amounts, deadline, monthly contribution |

**Learning Domain (4 models)**
| Model | Purpose |
|-------|---------|
| LearningProfile | Student learning preferences |
| StudyPlan | Study schedules and goals |
| TeacherProfile | Teacher info and subjects |
| StudentProfile | Student academic info |

**Study Domain (3 models)**
| Model | Purpose |
|-------|---------|
| StudySession | Study session logs (subject, topic, duration, rating) |
| StudyTopic | Topic mastery tracking (subject, topic, mastery level, priority) |
| DailySchedule | Daily study schedule entries (date, subject, time slots, activity) |

**Teacher Domain (4 models)**
| Model | Purpose |
|-------|---------|
| TeacherLessonPlan | Generated lesson plans (subject, topic, grade, content, objectives, materials) |
| TeacherAssessment | Generated assessments (subject, topic, difficulty, questions, answer key) |
| TeacherHomework | Homework assignments (subject, topic, grade, title, description, due days) |
| TeacherRubric | Grading rubrics (title, subject, assessment type, criteria, total points) |

**Admin Domain (2 models)**
| Model | Purpose |
|-------|---------|
| AdminUser | Admin role assignments |
| AuditLog | System audit trail |

**Source Domain (2 models)**
| Model | Purpose |
|-------|---------|
| Source | Verified information sources with metadata and status |
| SourceSnapshot | Cached snapshots of source content for change detection |

**Verification Domain (1 model)**
| Model | Purpose |
|-------|---------|
| VerificationLog | Audit trail for all verification actions |

### API Routes

**Phase 2 — Auth (11 endpoints):**

| Endpoint | Method | Auth | Rate Limit | Description |
|----------|--------|------|------------|-------------|
| /api/auth/register | POST | No | 3/15min | User registration |
| /api/auth/login | POST | No | 5/15min | User login |
| /api/auth/logout | POST | Yes | 10/15min | Logout, revoke refresh token |
| /api/auth/me | GET | Yes | — | Get current user |
| /api/auth/refresh | POST | No | 10/15min | Refresh access token |
| /api/auth/forgot-password | POST | No | 3/15min | Request password reset |
| /api/auth/reset-password | POST | No | 3/15min | Execute password reset |
| /api/auth/change-password | POST | Yes | 5/15min | Change password (authenticated) |
| /api/profile | GET | Yes | — | Get profile |
| /api/profile | PATCH | Yes | — | Update profile |
| /api/account/delete | POST | Yes | — | Delete account |

**Phase 3 — Chat (8 endpoints):**

| Endpoint | Method | Auth | Rate Limit | Description |
|----------|--------|------|------------|-------------|
| /api/chat/conversations | GET | Yes | — | List conversations (search, pagination) |
| /api/chat/conversations | POST | Yes | 20/15min | Create conversation (AI title generation) |
| /api/chat/messages | GET | Yes | — | Get messages by conversationId |
| /api/chat/messages | POST | Yes | 30/15min | Send message (returns AI response) |
| /api/chat/stream | POST | Yes | 20/15min | Stream AI response via SSE |
| /api/chat/[id] | GET | Yes | — | Get conversation by ID |
| /api/chat/[id] | PATCH | Yes | — | Update conversation (title, archive) |
| /api/chat/[id] | DELETE | Yes | — | Soft delete conversation |

**Phase 4 — History, Memory, Voice, Settings (6 endpoints):**

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| /api/chat/[id]/regenerate | POST | Yes | Regenerate last AI response |
| /api/chat/export | POST | Yes | Export conversation as TXT |
| /api/chat/delete-all | POST | Yes | Soft-delete all user conversations |
| /api/settings | GET | Yes | Get user settings |
| /api/settings | PATCH | Yes | Update user settings |
| /api/memory | GET | Yes | Get user memory (key-value pairs) |
| /api/memory | POST | Yes | Set user memory |
| /api/memory | DELETE | Yes | Delete user memory (by key or all) |
| /api/voice | GET | Yes | Check voice feature availability |
| /api/voice | POST | Yes | TTS synthesis |

**Phase 5 — Education (14 endpoints):**

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| /api/education/courses | GET | No | Search courses (field, level, country, keyword) |
| /api/education/courses/[id] | GET | No | Course detail with university, requirements |
| /api/education/universities | GET | No | Search universities (country, type, field) |
| /api/education/universities/[id] | GET | No | University detail with courses, rankings |
| /api/education/universities/compare | POST | No | Compare up to 4 universities |
| /api/education/scholarships | GET | No | Search scholarships (country, degree level) |
| /api/education/scholarships/[id] | GET | No | Scholarship detail with requirements |
| /api/education/scholarships/deadlines | GET | No | Upcoming scholarship deadlines |
| /api/education/career-paths | GET | No | Search career paths (field, keyword) |
| /api/education/career-paths/[slug] | GET | No | Career path detail (skills, roles, certs) |
| /api/education/saved | GET/POST/DELETE | Yes | Saved items (courses, universities, scholarships) |
| /api/education/checklist | GET/POST | Yes | Application checklists |
| /api/education/checklist/[id] | PATCH/DELETE | Yes | Update/delete checklist |
| /api/education/search | GET | No | Global education search |

**Phase 6 — Fraud Detection (8 endpoints):**

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| /api/fraud/scan | POST | Yes | Scan text/SMS/email for fraud |
| /api/fraud/scan/url | POST | Yes | Scan URL for security threats |
| /api/fraud/scan/document | POST | Yes | Scan uploaded document |
| /api/fraud/reports | GET | Yes | List user's fraud reports |
| /api/fraud/reports/[id] | GET/DELETE | Yes | Get/delete single report |
| /api/fraud/reports/[id]/feedback | POST | Yes | Submit feedback on accuracy |
| /api/fraud/authorities | GET | No | List cyber authorities |
| /api/fraud/authorities/complaints | GET | No | List complaint procedures |

**Phase 7 — Smart Budget, Study Planner & Teacher Mode (23 endpoints):**

*Budget (8 endpoints):*
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| /api/budget | GET | Yes | Get budget profile |
| /api/budget | POST | Yes | Create/update budget profile |
| /api/budget/income | POST | Yes | Add income record |
| /api/budget/expenses | GET | Yes | Get expenses (paginated, filterable) |
| /api/budget/expenses | POST | Yes | Add expense record |
| /api/budget/categories | GET | Yes | Get expense categories |
| /api/budget/budgets | POST | Yes | Set/update budget limit per category |
| /api/budget/analysis | GET | Yes | Spending analysis (monthly breakdown) |
| /api/budget/savings | GET | Yes | Get savings goals |
| /api/budget/savings | POST | Yes | Create savings goal |
| /api/budget/savings/[id] | PATCH | Yes | Update savings goal |

*Study Planner (8 endpoints):*
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| /api/study | GET | Yes | Get learning profile |
| /api/study | POST | Yes | Create/update learning profile |
| /api/study/plans | GET | Yes | List study plans |
| /api/study/plans | POST | Yes | Create study plan |
| /api/study/plans/[id] | PATCH/DELETE | Yes | Update/delete study plan |
| /api/study/sessions | GET | Yes | List study sessions (paginated) |
| /api/study/sessions | POST | Yes | Log a study session |
| /api/study/topics | GET | Yes | Get study topics |
| /api/study/topics | POST | Yes | Upsert study topic |
| /api/study/weak-subjects | GET | Yes | Get weak subjects (mastery < 50%) |
| /api/study/schedule | GET | Yes | Get daily schedule |
| /api/study/schedule | POST | Yes | Create daily schedule entry |
| /api/study/weekly-summary | GET | Yes | Get weekly study summary |

*Teacher Mode (7 endpoints):*
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| /api/teacher | GET | Yes | Get teacher profile |
| /api/teacher | POST | Yes | Create/update teacher profile |
| /api/teacher/lessons | GET | Yes | List lesson plans (paginated) |
| /api/teacher/lessons | POST | Yes | Generate lesson plan |
| /api/teacher/lessons/[id] | DELETE | Yes | Delete lesson plan |
| /api/teacher/assessments | GET | Yes | List assessments (paginated) |
| /api/teacher/assessments | POST | Yes | Generate assessment |
| /api/teacher/assessments/[id] | DELETE | Yes | Delete assessment |
| /api/teacher/homework | GET | Yes | List homework (paginated) |
| /api/teacher/homework | POST | Yes | Generate homework |
| /api/teacher/rubrics | GET | Yes | List rubrics |
| /api/teacher/rubrics | POST | Yes | Generate rubric |

**Phase 8 — Trust, Verification & Data Intelligence (10 endpoints):**

*Sources (7 endpoints):*
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| /api/sources | GET | Yes | List sources (paginated, filterable) |
| /api/sources | POST | Yes | Create new source |
| /api/sources/[id] | GET | Yes | Get source details |
| /api/sources/[id] | PATCH | Yes | Update source |
| /api/sources/[id] | DELETE | Yes | Delete source |
| /api/sources/[id]/fetch | POST | Yes | Fetch and cache source content |
| /api/sources/verify | POST | Yes | Verify source authenticity |

*Verification (2 endpoints):*
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| /api/verification/logs | GET | Yes | List verification logs |
| /api/verification/logs/[id] | GET | Yes | Get verification log details |

*Audit (1 endpoint):*
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| /api/audit/logs | GET | Yes | List audit logs (admin) |

*Budget (8 endpoints):*
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| /api/budget | GET | Yes | Get budget profile |
| /api/budget | POST | Yes | Create/update budget profile |
| /api/budget/income | POST | Yes | Add income record |
| /api/budget/expenses | GET | Yes | Get expenses (paginated, filterable) |
| /api/budget/expenses | POST | Yes | Add expense record |
| /api/budget/categories | GET | Yes | Get expense categories |
| /api/budget/budgets | POST | Yes | Set/update budget limit per category |
| /api/budget/analysis | GET | Yes | Spending analysis (monthly breakdown) |
| /api/budget/savings | GET | Yes | Get savings goals |
| /api/budget/savings | POST | Yes | Create savings goal |
| /api/budget/savings/[id] | PATCH | Yes | Update savings goal |

*Study Planner (8 endpoints):*
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| /api/study | GET | Yes | Get learning profile |
| /api/study | POST | Yes | Create/update learning profile |
| /api/study/plans | GET | Yes | List study plans |
| /api/study/plans | POST | Yes | Create study plan |
| /api/study/plans/[id] | PATCH/DELETE | Yes | Update/delete study plan |
| /api/study/sessions | GET | Yes | List study sessions (paginated) |
| /api/study/sessions | POST | Yes | Log a study session |
| /api/study/topics | GET | Yes | Get study topics |
| /api/study/topics | POST | Yes | Upsert study topic |
| /api/study/weak-subjects | GET | Yes | Get weak subjects (mastery < 50%) |
| /api/study/schedule | GET | Yes | Get daily schedule |
| /api/study/schedule | POST | Yes | Create daily schedule entry |
| /api/study/weekly-summary | GET | Yes | Get weekly study summary |

*Teacher Mode (7 endpoints):*
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| /api/teacher | GET | Yes | Get teacher profile |
| /api/teacher | POST | Yes | Create/update teacher profile |
| /api/teacher/lessons | GET | Yes | List lesson plans (paginated) |
| /api/teacher/lessons | POST | Yes | Generate lesson plan |
| /api/teacher/lessons/[id] | DELETE | Yes | Delete lesson plan |
| /api/teacher/assessments | GET | Yes | List assessments (paginated) |
| /api/teacher/assessments | POST | Yes | Generate assessment |
| /api/teacher/assessments/[id] | DELETE | Yes | Delete assessment |
| /api/teacher/homework | GET | Yes | List homework (paginated) |
| /api/teacher/homework | POST | Yes | Generate homework |
| /api/teacher/rubrics | GET | Yes | List rubrics |
| /api/teacher/rubrics | POST | Yes | Generate rubric |

**Phase 9 — Advanced AI Orchestration (1 endpoint):**

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| /api/orchestrate | POST | Yes | Multi-domain query orchestration |

**Phase 10 — Student Assistant (1 endpoint):**

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| /api/student-assistant | GET | Yes | Get unified student profile, insights, and dashboard summary |

**Orchestration Architecture:**
```
User Query (multi-domain: education + budget + career)
  ↓
Intent Router → orchestration intent (priority 12, multi-domain detection)
  ↓
OrchestratorService.orchestrate()
  ↓ classifyDomains() → [education, budget, scholarship, career]
  ↓ extractEntities() → { field, country, degreeLevel, budgetRange, ... }
  ↓
Parallel Service Queries:
  ├→ EducationPlanner.planEducationPath() → courses, universities, scholarships, careers
  ├→ BudgetService → budget estimate for education
  └→ ScholarshipService → matching scholarships
  ↓
ResponseBuilder.buildResponse()
  ↓ collectSources() → data provenance
  ↓ calculateConfidence() → confidence score
  ↓ estimateBudget() → total cost estimate
  ↓ buildDocumentChecklist() → required documents
  ↓ buildRoadmap() → step-by-step plan
  ↓ determineNextActions() → actionable next steps
  ↓
Unified Structured Response (education context + budget + roadmap + checklist)
```

### Response Format
```json
// Success
{ "success": true, "data": { ... } }

// Error
{ "success": false, "message": "Error description", "code": "ERROR_CODE" }
```

### Security Architecture

**Implemented (Phase 2 + 3 + 4 + 5 + 6 + 7 + 8):**
- ✅ JWT authentication with access + refresh tokens
- ✅ Refresh token rotation with revocation
- ✅ bcryptjs password hashing (12 salt rounds)
- ✅ Password strength validation (8+ chars, mixed case, number, special char)
- ✅ Middleware-level JWT verification on protected routes
- ✅ Role-based access control (user/admin/teacher)
- ✅ Rate limiting (in-memory, per-route configs for auth + chat)
- ✅ Input validation with Zod schemas
- ✅ CORS headers
- ✅ Audit logging for all auth events
- ✅ Security headers (X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Referrer-Policy)
- ✅ Email enumeration prevention (forgot-password always returns success)
- ✅ Timing-safe token comparison (crypto.timingSafeEqual)
- ✅ Token hashing for storage (password reset tokens, email verification)
- ✅ SQL injection prevention (Prisma ORM parameterized queries)
- ✅ XSS protection (React auto-escaping + CSP headers)
- ✅ AI safety rules (credential theft, financial fraud, education scams)
- ✅ Prompt injection defense (system-level instructions, scanned content as data only)
- ✅ AI usage tracking (AIUsageLog with intent, language, tokens)
- ✅ Chat user isolation (users can only access own conversations)
- ✅ SSRF protection (blocked hosts, private IPs, dangerous protocols)
- ✅ File validation (MIME type checking, size limits, extension verification)
- ✅ Credential redaction (OTP, PIN, CVV, password, card numbers before storage)
- ✅ Fraud detection rule engine (25+ configurable rules)
- ✅ URL analysis (lookalike domains, HTTPS, shorteners, TLD reputation)
- ✅ Document processing (PDF/DOCX/TXT extraction, suspicious content detection)
- ✅ Risk scoring (0-100 with severity-based breakdown)
- ✅ AI fraud explanation (evidence-based, no fabrication)
- ✅ Cyber authority database (17 authorities, 9 complaint procedures)
- ✅ Fraud scan user isolation (users can only access own scans)
- ✅ Source verification pipeline (Source → Fetch → Validate → Compare → Change Detection → Verification → Database Update → Audit)
- ✅ Source tracking with snapshots (SourceSnapshot for change detection)
- ✅ Verification logging (VerificationLog audit trail)
- ✅ Verification statuses (VERIFIED, NEEDS_REVIEW, UNVERIFIED, EXPIRED, PENDING)
- ✅ Change detection (content comparison, hash-based diff)
- ✅ Privacy engine (keyword-based financial/security data filtering — only injected when relevant)

**Planned (Future Phases):**
- 🔲 CSRF protection (SameSite cookies)
- 🔲 Secure file uploads (MIME validation, size limits)
- 🔲 Email verification flow
- 🔲 Account lockout after failed attempts
- ✅ Session management dashboard

### Student Assistant Architecture

```
GET /api/student-assistant
  ↓
StudentAssistantService.getDashboardSummary()
  ↓ buildUnifiedProfile() → 16 parallel Prisma queries (profile, study, budget, education, etc.)
  ↓ buildAssistantContext() → privacy-filtered context for AI
  ↓ ProactiveInsights.generateInsights() → contextual nudges
  ↓
PrivacyEngine.filterProfile()
  ↓ Financial data (budget, savings) → only if keywords detected: budget, money, savings, expense, income, finance, cost, spend
  ↓ Security data (fraud reports, scan history) → only if keywords detected: fraud, scam, phishing, suspicious, hack, report, security
  ↓
Response → { profile, insights, recentActivity, quickActions, stats }
```

**Privacy Architecture:**
- Financial/sensitive data (budget profiles, savings goals, expense records) only injected into AI context when user query contains financial keywords
- Security data (fraud reports, scan history) only injected when user query contains security-related keywords
- `PrivacyEngine.shouldInjectDomain()` checks query against keyword lists before data inclusion
- `PrivacyEngine.formatFilteredContext()` returns redacted placeholders for excluded domains
- Student profile queries use 16 parallel Prisma calls aggregated via `Promise.all()` for performance

### AI Architecture

**Provider Layer:**
- `AIProvider` interface with `complete()` and `stream()` methods
- `GroqProvider` implementation (switchable via environment)
- `getAIProvider()` singleton — throws if `GROQ_API_KEY` missing

**AI Service Pipeline:**
```
User Message
  ↓
Language Detection (unicode + regex → english/roman_urdu/urdu/mixed)
  ↓
Intent Detection (18 intents, priority-scored, confidence 0.5–1.0)
  ↓
Context Building (system prompt + domain rules + language mirroring)
  ↓
AI Call (Groq complete or stream)
  ↓
Response + Usage Logging (AIUsageLog table)
```

**System Prompts:**
- Base prompt — EduGuard AI identity, language mirroring, response length control
- Safety rules — credential theft, financial fraud, education scams
- Domain prompts — education, fraud, budget, study planner, title generation, budgetAnalysis, studyPlannerPrompt, teacherAssistant, orchestrationPrompt, studentAssistantPrompt

**Context Management:**
- `ContextManager` service builds full AI context for each message
- Recent messages (last 10) included in prompt
- Conversation summaries auto-generated after 20+ messages (with important facts extraction)
- User memory (key-value pairs auto-extracted from conversations) included in context
- User profile (education level, occupation, country) included when available
- Student assistant context dynamically injected into AI conversations (privacy-filtered profile via ContextManager)

### Verification & Source Intelligence

**Phase 8 Verification Workflow:**
```
Source Registration
  ↓
Content Fetching (cached snapshots)
  ↓
Validation (schema, authenticity checks)
  ↓
Comparison (content hash, snapshot diff)
  ↓
Change Detection (hash comparison, content diff)
  ↓
Verification Status Assignment
  ↓
Database Update (if verified)
  ↓
Audit Log Entry
```

**Verification Statuses:**
| Status | Description |
|--------|-------------|
| VERIFIED | Source content confirmed accurate and current |
| NEEDS_REVIEW | Content changed or flagged for manual review |
| UNVERIFIED | New source not yet validated |
| EXPIRED | Source content outdated or stale |
| PENDING | Verification in progress |

**Source Intelligence Services:**
- `SourceService` (14 methods) — CRUD, fetch, verify, search, analytics
- `VerificationService` (5 methods) — Pipeline execution, log management, status tracking
- `ChangeDetector` (3 methods) — Content comparison, hash diff, snapshot management

**New UI Pages:**
- Verification Dashboard — Overview of all verifications, status distribution
- Source Management — CRUD for sources, bulk operations
- Audit Logs — System-wide audit trail with filtering
- Student Dashboard (`/student`) — Comprehensive overview with stats, insights, applications, quick actions

**New Components:**
- `VerificationBadge` — Visual status indicator for education content
- `SourceTracker` — Source provenance tracking widget

**Education Pages Updated:**
- 6 education pages now display `VerificationBadge` on data sources

**Rate Limits:**
| Endpoint | Limit | Window |
|----------|-------|--------|
| Message send | 30 | 15 min |
| Stream | 20 | 15 min |
| Create conversation | 20 | 15 min |

### External Service Architecture

All external services are abstracted:
- AI: GroqProvider (switchable)
- Voice: BrowserSTTProvider, BrowserTTSProvider (with provider abstraction for cloud STT/TTS)
- Memory: MemoryService with sensitive data blocking and auto fact extraction
- Settings: SettingsService with user preferences and bulk operations
- Database: Prisma (SQLite dev / PostgreSQL prod)
- Email: Console logging (dev), configurable provider (future)
- File Storage: Local (Phase 1), S3-compatible (future)
- URL Reputation: Configurable via URL_REPUTATION_PROVIDER env (future)
- Malware Scanner: Configurable via MALWARE_SCANNER_PROVIDER env (future)
- OCR: Configurable via OCR_PROVIDER env (future)

### Test Coverage

| Test File | Tests | Type |
|-----------|-------|------|
| password.test.ts | 7 | Unit |
| jwt.test.ts | 7 | Unit |
| rate-limit.test.ts | 4 | Unit |
| auth-schemas.test.ts | 9 | Unit |
| validation.test.ts | 9 | Unit |
| utils.test.ts | 10 | Unit |
| auth-security.test.ts | 21 | Security |
| ai-provider.test.ts | 6 | Unit (config-only) |
| ai-prompts.test.ts | 18 | Unit |
| language-detection.test.ts | 17 | Unit |
| intent-detection.test.ts | 18 | Unit |
| ai-safety.test.ts | 21 | Security |
| context-manager.test.ts | 10 | Unit |
| memory-service.test.ts | 15 | Unit |
| settings-service.test.ts | 6 | Unit |
| voice-service.test.ts | 9 | Unit |
| course-service.test.ts | 12 | Unit |
| university-service.test.ts | 14 | Unit |
| scholarship-service.test.ts | 9 | Unit |
| career-service.test.ts | 10 | Unit |
| saved-items-service.test.ts | 21 | Unit |
| checklist-service.test.ts | 9 | Unit |
| education-context.test.ts | 8 | Unit |
| seed-data.test.ts | 9 | Unit (DB) |
| ssrf-protection.test.ts | 32 | Security |
| file-validation.test.ts | 37 | Security |
| credential-redaction.test.ts | 19 | Security |
| rule-engine.test.ts | 21 | Unit |
| url-analyzer.test.ts | 30 | Unit |
| risk-scorer.test.ts | 13 | Unit |
| fraud-security.test.ts | 28 | Security |
| budget-service-v2.test.ts | 33 | Unit |
| study-service-v2.test.ts | 33 | Unit |
| teacher-service-v2.test.ts | 33 | Unit |
| phase7-integration.test.ts | 25 | Unit |
| orchestrator-service.test.ts | 12 | Unit |
| education-planner.test.ts | 10 | Unit |
| response-builder.test.ts | 10 | Unit |
| auth.test.ts | 7 | Integration (requires running server) |
| student-assistant-service.test.ts | 15 | Unit |
| privacy-engine.test.ts | 12 | Unit |
| proactive-insights.test.ts | 10 | Unit |
| workspace-service.test.ts | 30 | Unit |
| document-intelligence.test.ts | 28 | Unit |
| performance-intelligence.test.ts | 21 | Unit |
| teacher-workspace.test.ts | 25 | Unit |
| notification-service.test.ts | 32 | Unit |
| country-intelligence.test.ts | 26 | Unit |
| **Total** | **850** | |

### Future Implementation Phases

See DEVELOPMENT_PLAN.md for detailed phase breakdown.
