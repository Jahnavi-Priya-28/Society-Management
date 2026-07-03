# ResidentFlow AI

The smart society complaint and maintenance platform. ResidentFlow AI is a modern SaaS-style Next.js application for residents and society admins to manage complaints, notices, timelines, analytics, and satisfaction ratings.

## Tech Stack

- Next.js 15 App Router, React 19, TypeScript
- Tailwind CSS v4, Lucide icons, Recharts, TanStack Query
- React Hook Form and Zod validation
- Prisma ORM with PostgreSQL/Neon
- Better Auth-ready schema and route handler
- Cloudinary and Resend service integrations
- Vercel-ready configuration

## Folder Structure

- `app/`: Next.js routes, layouts, loading and error boundaries.
- `components/`: reusable layout and UI primitives.
- `features/`: feature-specific UI for complaints and dashboards.
- `hooks/`: reusable client hooks, including complaint assistant and optimistic mutations.
- `lib/`: Prisma client, auth config, validation schemas, shared utilities.
- `services/`: database and third-party integration services.
- `prisma/`: Prisma schema and seed data.
- `types/`: shared domain types.
- `utils/`: pure business utilities such as keyword-based complaint suggestions.
- `docs/`: API and system design documentation.
- `docs/DEPLOYMENT.md`: production deployment guide for Vercel, Neon, Cloudinary, and Resend.

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` from `.env.example` and set `DATABASE_URL`.

3. Generate Prisma client:

```bash
npm run prisma:generate
```

4. Run migrations and seed demo data:

```bash
npm run prisma:migrate
npm run prisma:seed
```

5. Start the dev server:

```bash
npm run dev
```

## Demo Accounts

The seed creates:

- Resident: `resident@residentflow.ai`
- Admin: `admin@residentflow.ai`

Both demo accounts use password `Password123!`.

## Working Features

- Resident registration, login, logout, and protected resident routes
- Admin login and protected admin routes
- Complaint creation with category, priority, description, location, and optional photo upload
- Cloudinary-backed complaint image upload when Cloudinary keys are configured
- Smart keyword-based category and priority suggestions
- Duplicate complaint detection with a follow-existing-complaint action
- Complaint detail page with full status timeline
- Admin complaint search and filters by status, category, priority, and text
- Admin status updates with immutable history records
- Resident satisfaction rating that closes resolved complaints
- Configurable overdue threshold in admin settings
- Notice board with pinned and important notices
- Resend-backed email hooks for important notices and complaint status changes
- Dashboard cards, category/status charts, monthly trend, empty states, and loading skeletons

## Production Notes

- Configure Neon PostgreSQL in Vercel as `DATABASE_URL`.
- Set `BETTER_AUTH_SECRET` and `BETTER_AUTH_URL`.
- Configure Cloudinary variables before using photo uploads.
- Configure `RESEND_API_KEY` and `NOTICE_FROM_EMAIL` for status-change and important-notice emails.
- Run `npm run build` before deployment.
- Run Prisma migrations against the production database before first use.
- See `docs/DEPLOYMENT.md` for the complete deployment checklist.

## Assignment Coverage

ResidentFlow AI includes resident/admin auth, protected routes, complaint lifecycle tracking, full history, timeline data, photo upload integration, keyword-based smart suggestions, duplicate detection, notice board, email hooks, analytics cards, charts, loading skeletons, empty states, strict validation, reusable hooks, indexed Prisma queries, and deployment documentation.
