# External Integrations

**Analysis Date:** 2026-01-29

## APIs & External Services

**OCR & AI:**
- OpenAI GPT-4o Vision - Extracts receipt data from images (amount, vendor, date, category)
  - SDK/Client: openai 6.16.0
  - Auth: OPENAI_API_KEY environment variable
  - Usage: `/api/ocr/receipt` endpoint

## Data Storage

**Databases:**
- Supabase PostgreSQL - Primary database for projects, expenses, workers, labor logs
  - Connection: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
  - Client: @supabase/supabase-js with SSR support
  - Auth: Built-in authentication with Row Level Security (RLS)
  - Storage: File storage for receipt images (receipts bucket)

**File Storage:**
- Supabase Storage - Receipt image storage with RLS policies
  - Connection: Integrated with Supabase client
  - Bucket: 'receipts' (configured via SQL migrations)

**Caching:**
- None detected

## Authentication & Identity

**Auth Provider:**
- Supabase Auth - Built-in authentication solution
  - Implementation: JWT-based with server-side rendering support
  - Middleware: `/src/middleware.ts` protects dashboard routes
  - Features: Email/password authentication, session management

## Monitoring & Observability

**Error Tracking:**
- Not detected (no Sentry or similar integrations)

**Logs:**
- Console.log statements (detected in code)
- Structured error responses in API routes

## CI/CD & Deployment

**Hosting:**
- Vercel - Optimized deployment platform for Next.js

**CI Pipeline:**
- Not explicitly configured (assumes Vercel automated deployment)

## Environment Configuration

**Required env vars:**
- NEXT_PUBLIC_SUPABASE_URL - Supabase project URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY - Supabase public API key
- OPENAI_API_KEY - OpenAI API key for OCR functionality
- NEXT_PUBLIC_APP_URL - Application base URL

**Secrets location:**
- .env.local file (committed as .env.local.example)

## Webhooks & Callbacks

**Incoming:**
- Not detected (no webhook endpoints)

**Outgoing:**
- Not detected (no outgoing webhooks)

---

*Integration audit: 2026-01-29*
```