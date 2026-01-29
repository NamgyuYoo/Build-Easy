# Stack Research

**Domain:** Modern SaaS Visual Design & Adaptive UI
**Researched:** 2025-01-29
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **GSAP** | 3.x | Production-grade animation library | Most mature animation library, framework-agnostic, works with React 19/Next.js 15 (with careful setup). 13+ years of battle-testing, superior performance to Framer Motion. Industry standard for complex timelines and ScrollTrigger. |
| **AutoAnimate** | @formkit/auto-animate (latest) | Zero-config micro-interactions | Drop-in animation for list reordering, accordions, toasts. React 19 compatible (confirmed Dec 2024). Perfect for Shadcn components - just wrap with `<AutoAnimate />`. Zero learning curve. |
| **React View Transitions API** | Experimental (React 19) | Native page/route transitions | Built into React 19, no library needed. Experimental but promising for cross-fade animations between routes. Use alongside other animation tools. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **react-pointer-type** | latest | Input modality detection | Tiny (442B), zero-dep hook for touch vs mouse detection. Critical for adaptive UI - swap gloves-on mode for office mode automatically. |
| **clsx** | latest | Conditional className utility | Already in Shadcn stack. Use with Tailwind for adaptive styling: `clsx("base", isTouch && "gloves-mode")` |
| **tailwind-merge** | latest | Merge Tailwind classes | Prevents class conflicts in adaptive components. Part of Shadcn stack (via `cn()` utility). |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| **Tailwind CSS v4 @theme directive** | Design tokens & theming | CSS-first configuration with automatic CSS variable generation. Use `@theme` in globals.css for brand colors, spacing, border-radius. Shadcn UI customization via CSS variables. |
| **Pointer media queries** | Input detection without JS | Use CSS `@media (pointer: coarse)` for touch-first styles, `@media (pointer: fine)` for mouse-first. Fallback for react-pointer-type. |
| **Container queries** | Component-level responsive | Native in Tailwind v4 with `@container`, `@sm:`, `@max-md:` variants. Use for adaptive components that respond to container size, not viewport. |

## Installation

```bash
# Core animation libraries
npm install gsap
npm install @formkit/auto-animate

# Input detection
npm install react-pointer-type

# Dev dependencies (if not already installed)
npm install -D @types/gsap
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| **GSAP** | Framer Motion | NEVER - Framer Motion is NOT compatible with React 19/Next.js 15 (GitHub issue #2668). GSAP is the only production-ready alternative for complex animations. |
| **AutoAnimate** | Motion One | Motion One has smaller bundle size but less mature ecosystem. AutoAnimate has better React 19 support confirmation and simpler API. |
| **React View Transitions** | Page transition libraries | View Transitions API is native to React 19. Third-party libraries add unnecessary overhead for basic cross-fades. |
| **react-pointer-type** | Custom useMediaQuery hook | Build custom hook only if you need complex detection logic (e.g., hybrid touch+mouse devices). react-pointer-type handles 95% of cases. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| **Framer Motion** | INCOMPATIBLE with React 19/Next.js 15. GitHub issue #2668 confirms no React 19 support. Migration to `motion/react` package doesn't solve this. | GSAP for complex animations, AutoAnimate for simple transitions |
| **Motion One** | Less mature than GSAP, fewer examples, uncertain React 19 support. | AutoAnimate for zero-config, GSAP for timelines |
| **React Spring** | Not actively maintained for React 19, heavier bundle than alternatives. | GSAP (better performance) or AutoAnimate (simpler) |
| **Tailwind v3 config patterns** | You're on Tailwind v4 - old `tailwind.config.js` patterns don't apply. Use `@theme` directive instead. | `@theme` directive in globals.css with CSS variables |
| **Hardcoded device detection** | `navigator.userAgent` is unreliable, doesn't detect hybrid devices (Surface Pro, iPad with keyboard). | Pointer media queries + react-pointer-type for input capability detection |
| **Animation libraries requiring "use client"** | Next.js 15 Server Components by default. Avoid unnecessary client components. | AutoAnimate (works in Client Components), GSAP with `useGSAP` hook, or View Transitions API |

## Stack Patterns by Variant

**If implementing micro-interactions (button presses, hover states, list reordering):**
- Use **AutoAnimate** for zero-config layout animations
- Wrap Shadcn components: `<AutoAnimate><ul>{items}</ul></AutoAnimate>`
- Because: Simplest API, React 19 compatible, perfect for existing component trees

**If implementing complex timelines (hero animations, scroll-based storytelling, multi-step sequences):**
- Use **GSAP** with ScrollTrigger plugin
- Use `useGSAP` hook for cleanup: `useGSAP(() => { gsap.to(...) }, [])`
- Because: Only production-ready solution for complex sequences in React 19 ecosystem

**If implementing route transitions:**
- Use **React View Transitions API** (experimental) with `<ViewTransition>` component
- For non-experimental: Use GSAP with Next.js route event listeners
- Because: Native to React 19, no additional dependencies for basic cross-fades

**If implementing adaptive UI (gloves-on vs office mode):**
- Use **react-pointer-type** hook to detect `coarse` (touch) vs `fine` (mouse) pointer
- Combine with Tailwind conditional classes: `cn("base-styles", isTouch && "text-lg min-h-14")`
- Fallback to CSS `@media (pointer: coarse)` for initial render
- Because: Detects actual input capability, not device type. Works for hybrid devices (iPad Pro, Surface)

**If customizing Shadcn UI with Tailwind v4:**
- Use **@theme directive** in globals.css for design tokens
- Override Shadcn CSS variables: `--primary: oklch(0.5 0.2 250);`
- Because: Tailwind v4 auto-exposes `@theme` values as CSS variables, which Shadcn already uses

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| **gsap@3.x** | React 19, Next.js 15 | Framework-agnostic, works but requires careful cleanup with `useGSAP` hook. `@gsap/react` hook has compatibility issues - use core GSAP with custom hook or `useGSAP`. |
| **@formkit/auto-animate@latest** | React 19 | Confirmed working via GitHub issue #218 (Dec 9, 2024). No peer dependency conflicts. |
| **react-pointer-type@latest** | React 19, Next.js 15 | Zero dependencies, framework-agnostic hook. Safe for Server Components (only runs on client). |
| **React View Transitions API** | React 19 (experimental) | Built into React 19, enabled via Next.js `viewTransition` config flag. May change before stable release. |
| **Tailwind CSS v4** | Next.js 15 | Full support via `@import "tailwindcss"` and `@theme` directive. Shadcn UI has official Tailwind v4 docs. |

## Implementation Examples

### Adaptive UI Pattern (Gloves-on vs Office Mode)

```typescript
// app/components/AdaptiveButton.tsx
"use client"

import { usePointerType } from 'react-pointer-type'
import { cn } from '@/lib/utils'

export function AdaptiveButton({ children, ...props }) {
  const pointerType = usePointerType()
  const isTouch = pointerType === 'coarse'

  return (
    <button
      className={cn(
        "bg-blue-600 text-white rounded-lg",
        // Office mode: normal sizing
        "h-10 px-4 text-sm",
        // Gloves-on mode: larger touch targets
        isTouch && "h-14 min-h-14 px-6 text-lg"
      )}
      {...props}
    >
      {children}
    </button>
  )
}
```

### Shadcn + Tailwind v4 Customization

```css
/* app/globals.css */
@import "tailwindcss";

@theme {
  /* Brand colors (Build-Easy palette) */
  --color-primary-50: oklch(0.95 0.02 250);
  --color-primary-500: oklch(0.5 0.2 250);
  --color-primary-600: oklch(0.45 0.22 250);

  /* Spacing for gloves-on mode */
  --spacing-touch-target: 3.5rem; /* 56px minimum */

  /* Border radius for modern SaaS feel */
  --radius-lg: 0.75rem;
  --radius-full: 9999px;

  /* Animation easing */
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
}
```

```typescript
// Overriding Shadcn CSS variables
// In your component or globals.css:
:root {
  --primary: var(--color-primary-500);
  --primary-foreground: oklch(0.98 0 0);
  --radius: var(--radius-lg);
}
```

### AutoAnimate with Shadcn Components

```typescript
// app/projects/[id]/labor/page.tsx
"use client"

import { useAutoAnimate } from '@formkit/auto-animate/react'
import { LaborLogList } from './labor-log-list'

export function LaborLogSection() {
  const [parent] = useAutoAnimate()

  return (
    <div ref={parent}>
      <LaborLogList />
      {/* Adding/removing items animates automatically */}
    </div>
  )
}
```

### GSAP Timeline for Hero Animation

```typescript
// app/components/HeroAnimation.tsx
"use client"

import { useGSAP } from '@gsap/react'
import gsap from 'gsap'

export function HeroAnimation() {
  useGSAP(() => {
    const tl = gsap.timeline()

    tl.from(".hero-title", { y: 50, opacity: 0, duration: 0.8 })
      .from(".hero-subtitle", { y: 30, opacity: 0, duration: 0.6 }, "-=0.4")
      .from(".hero-cta", { scale: 0.9, opacity: 0, duration: 0.5 }, "-=0.3")

    return () => tl.kill() // Cleanup
  }, [])

  return (
    <div>
      <h1 className="hero-title">Build-Easy</h1>
      <p className="hero-subtitle">Site settlement automation</p>
      <button className="hero-cta">Get Started</button>
    </div>
  )
}
```

## Sources

### Official Documentation
- [Tailwind CSS v4.0 Blog Post](https://tailwindcss.com/blog/tailwindcss-v4) — Verified `@theme` directive, CSS variables, container queries, OKLCH color space (HIGH confidence)
- [Motion.dev Upgrade Guide](https://motion.dev/docs/react-upgrade-guide) — Confirmed Motion 12.23.24, no React 19 support mentioned, migration to `motion/react` (HIGH confidence)
- [React Labs: View Transitions](https://react.dev/blog/2025/04/23/react-labs-view-transitions-activity-and-more) — Official React 19 experimental feature announcement (HIGH confidence)
- [Shadcn UI Tailwind v4 Docs](https://ui.shadcn.com/docs/tailwind-v4) — Official Tailwind v4 integration guide with `@theme` directive (HIGH confidence)

### Community & Verification
- [GSAP Community Forums - Next.js 15 Compatibility](https://gsap.com/community/forums/topic/44521-why-isnt-gsap-working-properly-in-nextjs-15/) — Discusses ScrollTrigger fixes for Next.js 15 SPA behavior (MEDIUM confidence)
- [AutoAnimate GitHub Issue #218](https://github.com/formkit/auto-animate/issues/218) — User confirms React 19 compatibility (Dec 9, 2024) (HIGH confidence)
- [react-pointer-type GitHub](https://github.com/AndrewPrifer/react-pointer-type) — Zero-dep hook for pointer type detection (MEDIUM confidence)

### Web Research (2025)
- [GSAP React 19 Next.js 15 Search](https://gsap.com/community/forums/topic/44521-why-isnt-gsap-working-properly-in-nextjs-15/) — Found known compatibility issues with `@gsap/react` hook, framework-agnostic core works
- [AutoAnimate React 19 Search](https://github.com/formkit/auto-animate/issues/218) — Confirmed React 19 usage in production
- [React View Transitions API Search](https://react.dev/blog/2025/04/23/react-labs-view-transitions-activity-and-more) — Experimental but actively developed in React 19
- [Shadcn Tailwind v4 Search](https://dev.to/darshan_bajgain/setting-up-2025-nextjs-15-with-shadcn-tailwind-css-v4-no-config-needed-dark-mode-5kl) — 2025 setup guides confirm `@theme` approach
- [Touch Detection React Hook Search](https://github.com/AndrewPrifer/react-pointer-type) — Pointer media query approach is 2025 best practice
- [Micro-interactions SaaS Search](https://www.betasofttechnology.com/motion-ui-trends-and-micro-interactions/) — 2025 trends emphasize accessibility and brand-safe motion

### Critical Finding - Framer Motion Incompatibility
- **GitHub Issue #2668** (via WebSearch) — Framer Motion does NOT support React 19/Next.js 15. This is the primary reason for recommending GSAP as alternative.

---
*Stack research for: Modern SaaS Visual Design & Adaptive UI*
*Researched: 2025-01-29*
