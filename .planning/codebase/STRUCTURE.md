# Codebase Structure

**Analysis Date:** 2026-01-29

## Directory Layout

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout with metadata
│   ├── page.tsx                 # Home page (redirects to login)
│   ├── globals.css              # Global styles with Tailwind v4
│   ├── (auth)/                  # Unauthenticated routes group
│   │   └── login/               # Login page
│   ├── api/                     # API routes
│   │   ├── auth/                # Authentication endpoints
│   │   ├── projects/            # Project CRUD operations
│   │   ├── expenses/            # Expense management
│   │   ├── labor-logs/          # Labor log operations
│   │   ├── workers/             # Worker management
│   │   ├── upload/              # File upload handlers
│   │   └── ocr/                # OCR processing
│   ├── (dashboard)/             # Protected routes group
│   │   ├── layout.tsx           # Dashboard layout
│   │   ├── dashboard/           # Main dashboard
│   │   ├── projects/            # Project management
│   │   │   ├── [id]/           # Project detail pages
│   │   │   └── new/            # New project form
│   │   ├── expenses/            # Expense management
│   │   │   └── new/            # New expense form (OCR)
│   │   └── workers/             # Worker management
│   │       └── new/            # New worker form
│   └── auth/                   # Auth callback routes
├── components/                  # Reusable UI components
│   └── ui/                      # Shadcn/UI primitive components
├── lib/                         # Shared libraries and utilities
│   ├── supabase.ts             # Supabase client factory
│   ├── utils.ts                # Utility functions
│   └── __tests__/             # Library tests
├── types/                       # TypeScript type definitions
│   └── index.ts                # Application interfaces
├── hooks/                       # Custom React hooks
│   ├── use-toast.ts            # Toast notification hook
│   └── __tests__/              # Hook tests
└── test/                        # Test configuration and setup
    ├── setup.ts                 # Test environment setup
    └── vite.d.ts               # Vitest type definitions
```

## Directory Purposes

**`src/app/`:**
- Purpose: Next.js App Router implementation
- Contains: Pages, API routes, layouts, and route groups
- Key files: `layout.tsx`, `page.tsx`, middleware.ts

**`src/app/api/`:**
- Purpose: RESTful API endpoints
- Contains: All server-side data operations
- Key files: `projects/route.ts`, `expenses/route.ts`, `ocr/receipt/route.ts`

**`src/app/(dashboard)/`:**
- Purpose: Protected application routes
- Contains: Main application functionality requiring authentication
- Key files: `dashboard/page.tsx`, `projects/[id]/page.tsx`

**`src/components/ui/`:**
- Purpose: Reusable UI primitives
- Contains: Shadcn/UI components built on Radix
- Key files: `button.tsx`, `input.tsx`, `card.tsx`, `toast.tsx`

**`src/lib/`:**
- Purpose: Core application libraries and utilities
- Contains: Database client, helpers, shared logic
- Key files: `supabase.ts`, `utils.ts`

**`src/types/`:**
- Purpose: TypeScript type definitions
- Contains: Interface definitions for all domain entities
- Key files: `index.ts` (Worker, Project, Expense, LaborLog interfaces)

## Key File Locations

**Entry Points:**
- `src/app/page.tsx`: Application entry point
- `src/app/layout.tsx`: Root layout with metadata
- `src/middleware.ts`: Route protection middleware

**Configuration:**
- `src/app/globals.css`: Global styles with Tailwind v4
- `vitest.config.ts`: Test configuration
- `package.json`: Project dependencies and scripts

**Core Logic:**
- `src/lib/supabase.ts`: Supabase client factory
- `src/types/index.ts`: Application interfaces
- `src/hooks/use-toast.ts`: Notification system

## Naming Conventions

**Files:**
- Pages: `page.tsx` for route components
- Routes: `route.ts` for API handlers
- Layouts: `layout.tsx` for route layouts
- Components: Descriptive names (e.g., `button.tsx`, `card.tsx`)

**Directories:**
- Route groups: `(auth)`, `(dashboard)` for grouping
- Dynamic segments: `[id]` for variable parameters
- Test directories: `__tests__/` for co-located tests

**Variables:**
- Components: PascalCase (e.g., `DashboardPage`)
- Functions: camelCase (e.g., `createClient`)
- Constants: UPPER_SNAKE_CASE (e.g., `NEXT_PUBLIC_SUPABASE_URL`)

## Where to Add New Code

**New Feature:**
- Primary code: `src/app/(dashboard)/[feature-name]/`
- Tests: `src/app/(dashboard)/[feature-name]/__tests__/` (if needed)
- Components: `src/components/ui/[component-name].tsx`

**New API Endpoint:**
- Implementation: `src/app/api/[endpoint]/route.ts`
- Validation: Zod schema at the top of the route file
- Types: Add to `src/types/index.ts` if new interfaces needed

**New Component:**
- Implementation: `src/components/ui/[component-name].tsx`
- Tests: `src/components/ui/__tests__/[component-name].test.tsx`
- Export: Add to barrel file if created

**Utilities:**
- Shared helpers: `src/lib/[helper-name].ts`
- Type definitions: `src/types/[name].ts` if significant
- Tests: `src/lib/__tests__/[helper-name].test.ts`

## Special Directories

**`src/app/(auth)/`:**
- Purpose: Routes that don't require authentication
- Contains: Login page, auth callbacks
- Generated: No
- Committed: Yes

**`src/app/(dashboard)/`:**
- Purpose: Routes requiring authentication
- Contains: Main application functionality
- Generated: No
- Committed: Yes

**`src/components/ui/`:**
- Purpose: Reusable UI primitives from Shadcn/UI
- Generated: No (manually added)
- Committed: Yes

**`src/test/`:**
- Purpose: Test configuration and setup
- Generated: No
- Committed: Yes

---

*Structure analysis: 2026-01-29*
```