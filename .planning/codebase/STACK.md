# Technology Stack

**Analysis Date:** 2026-01-29

## Languages

**Primary:**
- TypeScript 5.x - Core application code with strict typing
- JavaScript - Build tools and configuration

**Secondary:**
- None - Pure TypeScript/JavaScript codebase

## Runtime

**Environment:**
- Node.js 18+ (Next.js requirement)
- Next.js 15.1.3 with App Router

**Package Manager:**
- npm - Primary package manager
- Lockfile: package-lock.json (present)

## Frameworks

**Core:**
- Next.js 15 - Full-stack React framework with Server Components
- React 19 - Frontend library
- App Router - File-based routing system

**Testing:**
- Vitest 4.x - Unit testing framework
- Playwright 1.58 - E2E testing (configured but not actively used)
- React Testing Library - Component testing utilities

**Build/Dev:**
- TypeScript Compiler - Type checking (tsc --noEmit)
- ESLint 9 - Code linting
- PostCSS 8 - CSS processing
- Tailwind CSS v4 - Utility-first CSS framework

## Key Dependencies

**Critical:**
- @supabase/supabase-js 2.46.1 - PostgreSQL database and auth client
- @supabase/ssr 0.5.2 - Server-side rendering auth
- openai 6.16.0 - GPT-4o API for OCR receipt scanning
- zod 3.24.1 - Schema validation for runtime type safety

**UI/UX:**
- @radix-ui/* - Unstyled UI primitives for accessibility
- lucide-react 0.468.0 - Icon library
- class-variance-authority - Component variant management
- tailwind-merge - Tailwind CSS class merging
- react-day-picker - Date picker component
- react-hook-form 7.54.2 - Form handling
- @hookform/resolvers 3.10.0 - Form validation integration

**Utilities:**
- date-fns 3.6.0 - Date manipulation (v3, not v4+)
- clsx - Conditional utility classes

## Configuration

**Environment:**
- Environment variables via .env.local
- Supabase: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
- OpenAI: OPENAI_API_KEY
- App URL: NEXT_PUBLIC_APP_URL

**Build:**
- TypeScript: tsconfig.json with ES2017 target
- Next.js: next.config.ts with image optimization and security headers
- Vitest: vitest.config.ts with jsdom environment
- PostCSS: postcss.config.mjs using Tailwind CSS v4 plugin

## Platform Requirements

**Development:**
- Node.js 18+
- npm

**Production:**
- Node.js 18+ runtime
- Vercel deployment target (optimized for)

---

*Stack analysis: 2026-01-29*
```