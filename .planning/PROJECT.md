# Build-Easy Visual Redesign

## What This Is

Build-Easy is a comprehensive visual redesign of an existing Korean construction site accounting platform. The app currently enables OCR receipt scanning, daily labor logging, and real-time budget tracking — but the UI looks outdated and limits daily adoption. This redesign applies modern SaaS aesthetics (Stripe/Linear/Notion style) with adaptive UI that automatically adjusts for site managers wearing gloves at dusty construction sites versus office staff doing accounting work at desks.

## Core Value

**The interface disappears into the work.** Site managers capture expenses and log labor without thinking about UI; office staff review profitability and export insurance data efficiently. Increased daily adoption because the app feels professional, responsive, and purpose-built for each context.

## Requirements

### Validated

- ✓ Authentication and user sessions — existing (Supabase SSR with middleware protection)
- ✓ Project management (CRUD, dashboard, detail views) — existing
- ✓ Expense tracking with 4 categories (자재비/Material, 노무비/Labor, 식대/Food, 유류비/Fuel) — existing
- ✓ OCR receipt scanning via OpenAI GPT-4o — existing
- ✓ Labor management (daily logs, work status) — existing
- ✓ Worker database (resident numbers, daily wages, phone, notes) — existing
- ✓ 4대 보험 export (Korean labor insurance data) — existing
- ✓ Row Level Security (user isolation) — existing
- ✓ Mobile-responsive layout — existing

### Active

- [ ] Modern SaaS visual design system applied across all screens
- [ ] Adaptive UI that auto-detects context (gloves-on/touch vs office/mouse)
- [ ] Improved visual hierarchy and information architecture
- [ ] Polished micro-interactions and transitions
- [ ] Consistent spacing, typography, and color system
- [ ] Optimized layouts for both mobile and desktop contexts
- [ ] Professional "first impression" that builds trust

### Out of Scope

- New functional features (this is visual/UX work, not capability expansion)
- Backend architecture changes (Supabase, RLS, API routes work well)
- Database schema modifications (existing schema supports current features)
- Changes to core business logic (OCR, labor calculations, exports)

## Context

Build-Easy is a working application deployed to Vercel with Next.js 15, Supabase backend, and Tailwind CSS v4. The existing codebase is functional with solid patterns (SSR auth, RLS, structured API responses) but the visual design feels dated. The app serves two distinct user types with different needs:

**Site managers:** Work at dusty construction sites, often wear gloves, need large touch targets and simple flows. They primarily capture expenses (photo receipts) and log daily work.

**Office staff:** Work at desks, need efficient data review and export workflows. They primarily review project profitability, manage worker records, and generate 4대 보험 reports.

The current "gloves-on mode" approach (min 56px buttons, min 48px inputs) works for site managers but creates a cartoonish/oversized experience for office staff on desktop.

## Constraints

- **Tech stack**: Next.js 15, Tailwind CSS v4, Shadcn/UI components — must stay within this ecosystem
- **Timeline**: Not specified — work at sustainable pace, prioritize impact
- **No breaking changes**: Existing functionality must continue working, this is visual layer only
- **Supabase backend**: RLS policies, database schema, and API contracts must remain stable
- **Design reference**: Modern SaaS aesthetic (Stripe, Linear, Notion) — clean, minimal, typographic, purposeful color

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Adaptive UI over separate views | Same pages scale based on device/input context, less code duplication | — Pending |
| Auto-detection over manual toggle | Reduces user cognitive load, works automatically based on device capability | — Pending |
| Full redesign over incremental changes | Current UI has fundamental design issues, piecemeal fixes won't achieve transformation | — Pending |
| Keep existing color categories | 자재비/노무비/식대/유류비 colors (blue/orange/green/red) are business-critical for quick recognition | — Pending |

---
*Last updated: 2026-01-29 after initialization*
