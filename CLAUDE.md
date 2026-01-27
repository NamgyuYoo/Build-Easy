# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Build-Easy** is a "Site Settlement Automation Platform" for Korean construction and interior firms. The target users are site managers who work in dusty environments and may wear gloves - the UX prioritizes extreme simplicity with large touch targets ("Gloves-on Mode").

**Core Value**: Simplify construction site accounting through OCR receipt scanning, daily labor logs, and real-time budget tracking.

## Commands

```bash
# Development
npm run dev              # Start dev server on http://localhost:3000
npm run build           # Build for production
npm run start           # Start production server
npm run lint            # Run ESLint

# Database Setup (first time only)
# Run the contents of supabase/migrations/001_initial_schema.sql in Supabase SQL Editor
# Create a public 'receipts' bucket in Supabase Storage with RLS policies
```

## Architecture

### Tech Stack
- **Next.js 15** with App Router (Server Components by default)
- **Supabase** for PostgreSQL, Auth, Storage, and Row Level Security (RLS)
- **Tailwind CSS v4** with `@import "tailwindcss"` syntax (no tailwind.config.js)
- **Shadcn/UI** components (Radix UI primitives)
- **OpenAI GPT-4o** for OCR receipt scanning
- **Vercel** for deployment

### Key Patterns

#### Supabase Client (`src/lib/supabase.ts`)
- Single async `createClient()` function that works in both server and client contexts
- Uses `cookies()` from `next/headers` for server-side, `window` check for client-side
- Always await the client: `const supabase = await createClient();`

#### Authentication & Middleware
- Middleware (`src/middleware.ts`) protects all routes under `/dashboard`, `/projects`, `/expenses`, `/workers`
- Redirects unauthenticated users to `/login`, authenticated users at `/login` to `/dashboard`
- Uses Supabase SSR client with async `cookies()`
- Protected route list is centralized in middleware - add new routes there

#### API Routes (`src/app/api/**/route.ts`)
- All API routes must export `export const dynamic = 'force-dynamic'` to prevent build-time evaluation
- Return structured errors: `{ success: false, error: string }`
- Always verify user authentication: `const { data: { user } } = await supabase.auth.getUser();`
- For routes that access user-owned data (projects, expenses, labor_logs), verify ownership through RLS or explicit checks

#### Dynamic Routes with Next.js 15
- `params` prop is a Promise: `params: Promise<{ id: string }>`
- Await params: `const { id } = await params;`
- For client components, use useEffect to resolve params: `params.then((p) => setProjectId(p.id))`

#### Row Level Security (RLS)
- All tables have RLS enabled with policies based on `auth.uid()`
- Direct tables (projects, workers): check `auth.uid() = user_id`
- Indirect tables (expenses, labor_logs): check through parent project ownership
- When adding new tables, mirror the RLS policy pattern from existing tables

### Directory Structure

```
src/app/
├── (auth)/login/           # Unauthenticated routes
├── (dashboard)/            # Protected routes (require auth)
│   ├── dashboard/          # Main dashboard with project list
│   ├── projects/
│   │   ├── [id]/           # Project detail with P&L
│   │   └── [id]/labor/      # Labor management & export
│   ├── expenses/new/       # OCR receipt scanner
│   └── workers/            # Worker management
└── api/                    # API routes (dynamic by default)
```

### "Gloves-on Mode" UI Requirements

When creating or modifying UI:
- **Buttons**: Minimum `h-14` (56px) for primary actions (Save, Photo, Add)
- **Inputs**: Minimum `min-h-12` (48px) with `text-base` or `text-lg`
- **Touch targets**: Minimum 44px x 44px
- **Colors**:
  - 자재비 (Material): `blue-600`
  - 노무비 (Labor): `orange-600`
  - 식대 (Food): `green-600`
  - 유류비 (Fuel): `red-600`
- **Camera**: Use `<input type="file" capture="environment">` for direct mobile camera access
- **Bottom navigation**: Fixed action buttons should be at bottom with `fixed bottom-0`

### Database Schema Reference

```
projects (id, user_id, name, start_date, budget, status)
  ├─ expenses (id, project_id, image_url, category, amount, vendor_name, expense_date)
  └─ labor_logs (id, project_id, worker_id, work_date, status)

workers (id, user_id, name, daily_wage, phone, resident_number, notes)
  └─ labor_logs (worker_id)
```

Key relationships:
- `expenses.project_id → projects.id`
- `labor_logs.project_id → projects.id`
- `labor_logs.worker_id → workers.id`
- All user-owned via `user_id`

### Development Notes

- **Tailwind CSS v4**: Uses `@import "tailwindcss"` and `@theme {}` in globals.css, NOT traditional tailwind.config.js
- **Toast notifications**: Use `useToast()` hook from `src/hooks/use-toast.ts`, supports `variant: "destructive"`
- **Date handling**: Use `date-fns` v3, NOT v4+
- **Form validation**: Zod schemas in API routes for runtime validation
- **OCR route**: Initializes OpenAI client inside the handler to avoid build-time errors
