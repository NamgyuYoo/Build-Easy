# Architecture

**Analysis Date:** 2026-01-29

## Pattern Overview

**Overall:** Full-stack application with Next.js 15 App Router, Server Components, and API routes

**Key Characteristics:**
- Authentication-driven routing with middleware protection
- Supabase backend with Row Level Security (RLS)
- Server Components by default with Client Components when needed
- API routes forced to dynamic mode to prevent build-time evaluation
- OCR integration via OpenAI GPT-4o for receipt scanning

## Layers

**Presentation Layer:**
- Purpose: User interface and server-side rendering
- Location: `src/app/`
- Contains: Next.js App Router pages, layouts, components
- Depends on: `src/lib/` utilities, `src/components/ui/`
- Used by: End users via web browser

**API Layer:**
- Purpose: RESTful API endpoints
- Location: `src/app/api/`
- Contains: Route handlers for all data operations
- Depends on: `src/lib/supabase.ts`, Zod validation
- Used by: Frontend components, external integrations

**Business Logic Layer:**
- Purpose: Core application logic and data transformations
- Location: `src/lib/`, `src/types/`
- Contains: Supabase client creation, type definitions, utilities
- Depends on: External services (Supabase, OpenAI)
- Used by: API layer and presentation layer

**Authentication & Security Layer:**
- Purpose: User authentication and access control
- Location: `src/middleware.ts`, `src/app/auth/`
- Contains: Route protection, auth callbacks
- Depends on: Supabase SSR client
- Used by: All authenticated routes

## Data Flow

**User Authentication Flow:**

1. User attempts to access protected route
2. Middleware checks authentication via `supabase.auth.getUser()`
3. Unauthenticated users redirected to `/login`
4. Authenticated users redirected from `/login` to `/dashboard`
5. Supabase SSR client handles cookie-based session management

**Data Operations Flow:**

1. User action triggers API route
2. API route forces dynamic mode: `export const dynamic = 'force-dynamic'`
3. Authentication verified: `const { data: { user } } = await supabase.auth.getUser()`
4. Input validation with Zod schema
5. Supabase query with RLS enforcement
6. Response formatted with `{ success: boolean, data?: any, error?: string }`

**OCR Receipt Processing Flow:**

1. User uploads receipt image via file input
2. Image uploaded to Supabase Storage
3. API route calls OpenAI GPT-4o for OCR
4. Extracted data validated and stored
5. User redirected to expense list with processed data

## Key Abstractions

**Supabase Client:**
- Purpose: Unified client for both server and client contexts
- Examples: `src/lib/supabase.ts`
- Pattern: Single async `createClient()` function with environment detection

**Route Protection:**
- Purpose: Centralized authentication middleware
- Examples: `src/middleware.ts`
- Pattern: Protected route list with redirect logic

**API Response Format:**
- Purpose: Consistent API response structure
- Pattern: `{ success: boolean, data?: T, error?: string, meta?: object }`

**Dynamic Routes:**
- Purpose: Handle variable URL parameters
- Examples: `src/app/projects/[id]/page.tsx`
- Pattern: `params` prop as Promise, must be awaited

## Entry Points

**Web Application:**
- Location: `src/app/page.tsx`
- Triggers: Root URL access
- Responsibilities: Redirect to login based on auth status

**Dashboard:**
- Location: `src/app/(dashboard)/dashboard/page.tsx`
- Triggers: Authenticated user access
- Responsibilities: Project overview, quick actions, stats summary

**API Endpoints:**
- Location: `src/app/api/`
- Triggers: Frontend fetch calls, form submissions
- Responsibilities: CRUD operations, file uploads, OCR processing

**Authentication:**
- Location: `src/app/(auth)/login/page.tsx`, `src/app/auth/callback/route.ts`
- Triggers: User login attempts
- Responsibilities: Auth form, Supabase auth callbacks

## Error Handling

**Strategy:** Comprehensive error handling with user-friendly messages

**Patterns:**
- API routes return structured errors with appropriate HTTP status codes
- Zod validation errors formatted as user-friendly messages
- Supabase errors caught and transformed
- Global error boundaries implemented at layout level

## Cross-Cutting Concerns

**Logging:** Console logging for debugging, structured error logging
**Validation:** Zod schemas for all API inputs, client-side validation with react-hook-form
**Authentication:** Supabase SSR with cookie-based sessions, route-level protection
**State Management:** Server state via Supabase, client state with React hooks
**Security:** RLS policies on all database tables, input sanitization, CSRF protection

---

*Architecture analysis: 2026-01-29*
```