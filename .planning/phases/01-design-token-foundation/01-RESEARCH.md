# Phase 1: Design Token Foundation - Research

**Researched:** 2026-01-29
**Domain:** Tailwind CSS v4 Design Tokens, Inter Font Integration, WCAG Accessibility, Skeleton Loading Patterns
**Confidence:** HIGH

## Summary

This phase establishes the visual foundation using Tailwind CSS v4's `@theme` directive to create a modern, accessible design token system. The research confirms that Tailwind CSS v4 (released January 2025) represents a fundamental shift from JavaScript-based configuration (`tailwind.config.js`) to CSS-first theming using the `@theme` directive, which automatically generates CSS custom properties (variables) at runtime.

The standard stack includes Tailwind CSS v4.0+ with `@tailwindcss/postcss`, Next.js 15's `next/font` for Inter variable font optimization, and `react-loading-skeleton` for loading states. The design token system should follow a three-layer architecture: base tokens (primitive values), semantic tokens (design intent), and component-specific tokens.

WCAG 2.1 Level AA compliance requires 4.5:1 contrast for normal text and 3:1 for large text and UI components. The business-critical category colors (blue for 자재비/material, orange for 노무비/labor, green for 식대/food, red for 유류비/fuel) must be preserved while ensuring accessibility. Dark mode implementation uses Tailwind's class strategy with `.dark` selector, requiring separate color definitions for light and dark themes.

**Primary recommendation:** Use Tailwind CSS v4's `@theme` directive with OKLCH color space for better perceptual uniformity, Inter variable font via Next.js `next/font/google`, and `react-loading-skeleton` package for consistent loading states.

## Standard Stack

The established libraries/tools for this domain:

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| **Tailwind CSS** | 4.0.0+ | Utility-first CSS framework with v4 @theme syntax | Industry standard, v4 introduces CSS-first configuration with automatic CSS variable generation |
| **@tailwindcss/postcss** | 4.1.18+ | PostCSS plugin for Tailwind v4 build process | Required for Tailwind v4, replaces traditional Tailwind CLI |
| **Next.js** | 15.1.3+ | React framework with App Router | Built-in font optimization, loading.js convention for skeletons |
| **next/font** | 15.x (built-in) | Font optimization with automatic self-hosting | Zero-runtime font loading, variable font support, eliminates external requests |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **react-loading-skeleton** | Latest | Skeleton screen components | For all indeterminate loading states (data fetching, async operations) |
| **date-fns** | 3.6.0+ | Date utilities (already installed) | When displaying dates in UI, consistent with existing codebase |
| **class-variance-authority** | 0.7.1+ (installed) | Component variant management | For creating themeable UI components with multiple variants |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| react-loading-skeleton | Custom skeleton components | Hand-rolled requires more maintenance, missing accessibility features like aria-label |
| next/font/google Inter | next/font/local Inter | Local requires managing font files, Google Fonts is automatic and optimized |
| Tailwind v4 @theme | CSS variables + custom properties | Manual setup, no auto-generated utilities, harder to maintain |

**Installation:**

```bash
# Core (already installed)
npm install tailwindcss@^4.0.0 @tailwindcss/postcss@^4.1.18 next@^15.1.3

# Skeleton library (new dependency)
npm install react-loading-skeleton

# If choosing local font approach (alternative):
# Download Inter variable font from https://github.com/rsms/inter/tree/main/docs/font-variations
# Place in src/fonts/ directory
# Use next/font/local instead of next/font/google
```

## Architecture Patterns

### Recommended Project Structure

```
src/
├── app/
│   ├── globals.css          # Main @theme block with design tokens
│   └── layout.tsx           # Root layout with Inter font setup
├── components/
│   ├── ui/                  # Shadcn/UI components (existing)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── ...
│   └── loading/             # NEW: Skeleton components
│       ├── card-skeleton.tsx
│       ├── table-skeleton.tsx
│       └── list-skeleton.tsx
└── styles/                  # NEW: Design token organization (optional)
    └── tokens.css           # @theme imports and extensions
```

### Pattern 1: Tailwind CSS v4 @theme Directive

**What:** CSS-first configuration using the `@theme` directive to define design tokens that automatically generate CSS variables and Tailwind utilities.

**When to use:** All new Tailwind v4 projects. Replaces `tailwind.config.js` for theme customization.

**Example:**

```css
/* Source: https://tailwindcss.com/docs/adding-custom-styles */
@import "tailwindcss";

@theme {
  /* Typography */
  --font-family-sans: "Inter", sans-serif;

  /* Type scale using 1.333 ratio (perfect fourth) */
  --text-xs: 0.75rem;     /* 12px */
  --text-sm: 0.875rem;    /* 14px - gloves-on mode minimum */
  --text-base: 1rem;      /* 16px - base */
  --text-lg: 1.333rem;    /* 21.33px */
  --text-xl: 1.777rem;    /* 28.44px */
  --text-2xl: 2.369rem;   /* 37.9px */
  --text-3xl: 3.157rem;   /* 50.5px */
  --text-4xl: 4.209rem;   /* 67.3px */

  /* Spacing scale - 4px base unit */
  --spacing-0: 0;
  --spacing-px: 1px;
  --spacing-0_5: 0.125rem;  /* 2px */
  --spacing-1: 0.25rem;      /* 4px */
  --spacing-2: 0.5rem;       /* 8px */
  --spacing-3: 0.75rem;      /* 12px */
  --spacing-4: 1rem;         /* 16px - minimum touch target */
  --spacing-6: 1.5rem;       /* 24px - component padding */
  --spacing-8: 2rem;         /* 32px */
  --spacing-12: 3rem;        /* 48px - section spacing */
  --spacing-16: 4rem;        /* 64px - major sections */
  --spacing-24: 6rem;        /* 96px */

  /* Border radius */
  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;       /* Default */
  --radius-xl: 0.75rem;
  --radius-2xl: 1rem;

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);

  /* Category colors - OKLCH for perceptual uniformity */
  --color-category-material: oklch(0.55 0.22 264);     /* Blue */
  --color-category-labor: oklch(0.65 0.20 45);         /* Orange */
  --color-category-food: oklch(0.65 0.18 145);         /* Green */
  --color-category-fuel: oklch(0.55 0.22 25);          /* Red */

  /* Semantic colors (derived from category + neutral) */
  --color-primary: var(--color-category-material);
  --color-success: var(--color-category-food);
  --color-warning: oklch(0.80 0.15 85);                /* Yellow */
  --color-error: var(--color-category-fuel);
  --color-info: var(--color-category-material);
}
```

### Pattern 2: Three-Layer Design Token Architecture

**What:** Organize tokens into base (primitives), semantic (intent), and component-specific layers for maintainability and consistency.

**When to use:** All design systems requiring theming and consistency across multiple components.

**Example:**

```css
/* Source: https://www.designsystemscollective.com/design-tokens-in-webstudio-a-practical-implementation-guide-927af8d36f36 */

/* LAYER 1: Base/Primitive Tokens */
@theme {
  /* Raw colors - not used directly in components */
  --color-blue-50: oklch(0.97 0.01 264);
  --color-blue-100: oklch(0.93 0.03 264);
  --color-blue-500: oklch(0.55 0.22 264);
  --color-blue-900: oklch(0.35 0.12 264);

  --color-orange-50: oklch(0.97 0.01 45);
  --color-orange-100: oklch(0.93 0.03 45);
  --color-orange-500: oklch(0.65 0.20 45);
  --color-orange-900: oklch(0.40 0.15 45);

  --color-gray-50: oklch(0.98 0 0);
  --color-gray-100: oklch(0.95 0 0);
  --color-gray-900: oklch(0.15 0 0);

  /* Base spacing */
  --spacing-1: 0.25rem;
  --spacing-2: 0.5rem;
  --spacing-4: 1rem;
}

/* LAYER 2: Semantic Tokens */
:root {
  /* Semantic color names - design intent */
  --color-bg-primary: var(--color-gray-50);
  --color-bg-secondary: var(--color-gray-100);
  --color-text-primary: var(--color-gray-900);
  --color-text-secondary: oklch(0.50 0 0);

  /* Category semantic tokens */
  --color-expense-material: var(--color-blue-500);
  --color-expense-labor: var(--color-orange-500);

  /* UI semantic tokens */
  --color-border-default: var(--color-gray-100);
  --color-border-strong: var(--color-gray-900);
}

/* LAYER 3: Component Tokens (applied per component) */
.card {
  --card-bg: var(--color-bg-primary);
  --card-padding: var(--spacing-4);
  --card-radius: var(--radius-lg);
}
```

### Pattern 3: Inter Variable Font Integration

**What:** Use Next.js `next/font/google` to load Inter as an optimized variable font with zero external network requests.

**When to use:** All Next.js 15 projects requiring modern typography.

**Example:**

```tsx
// Source: https://nextjs.org/docs/app/getting-started/fonts
// app/layout.tsx
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',           /* Prevents FOIT/FOIT */
  variable: '--font-inter',  /* CSS variable name */
  // Variable font configuration (optional, uses default weights)
  weight: ['400', '500', '600', '700'],
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="ko"
      className={`${inter.variable} antialiased`}
    >
      <body>{children}</body>
    </html>
  )
}
```

```css
/* globals.css */
@import "tailwindcss";

@theme inline {
  /* Map Tailwind's font-sans to Inter variable */
  --font-sans: var(--font-inter);
}
```

### Pattern 4: Dark Mode Implementation

**What:** Use Tailwind's class strategy with `.dark` selector to define separate color palettes for light and dark themes.

**When to use:** All applications requiring dark mode support.

**Example:**

```css
/* Source: https://tailwindcss.com/docs/dark-mode */
@import "tailwindcss";

/* Custom variant for dark mode */
@custom-variant dark (&:is(.dark *));

@theme {
  /* Light mode colors (default) */
  --color-background: oklch(1 0 0);
  --color-foreground: oklch(0.15 0 0);
  --color-card: oklch(1 0 0);
  --color-card-foreground: oklch(0.15 0 0);
}

.dark {
  /* Dark mode colors - override with .dark selector */
  --color-background: oklch(0.15 0 0);
  --color-foreground: oklch(0.98 0 0);
  --color-card: oklch(0.20 0 0);
  --color-card-foreground: oklch(0.98 0 0);
}

/* Usage in components */
/* <div class="bg-background text-foreground dark:bg-background dark:text-foreground"> */
```

### Pattern 5: Skeleton Loading States

**What:** Use `react-loading-skeleton` package with Next.js `loading.js` convention for consistent, accessible loading states.

**When to use:** All indeterminate async operations (data fetching, list loading, card loading).

**Example:**

```tsx
// components/loading/card-skeleton.tsx
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

export function CardSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-6">
      <Skeleton height={56} className="mb-4" /> {/* Title */}
      <Skeleton count={3} className="mb-2" />    {/* Content */}
    </div>
  )
}

// app/(dashboard)/projects/loading.tsx
// Next.js automatically shows this while page.tsx loads
export default function ProjectsLoading() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  )
}
```

### Anti-Patterns to Avoid

- **Hardcoded colors in components:** Never use hex codes directly. Always reference design tokens (e.g., `bg-category-material` not `bg-blue-600`)
- **Inline styles for spacing:** Avoid `style={{ padding: '16px' }}`. Use Tailwind utilities: `className="p-4"`
- **Skipping dark mode validation:** Always test dark mode colors for contrast. Don't assume inverse colors work
- **Manual skeleton components:** Don't build from scratch. Use `react-loading-skeleton` for accessibility and consistency
- **Tailwind v3 patterns in v4:** Don't use `tailwind.config.js` for theme customization. Use `@theme` directive in CSS

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Skeleton loading screens | Custom div shimmer animations | `react-loading-skeleton` package | Built-in ARIA attributes, themeable via CSS vars, handles edge cases (error states, empty states) |
| Font loading and optimization | Manual `<link>` tags or `@font-face` | Next.js `next/font/google` | Automatic font subsetting, self-hosting (zero external requests), preloading, prevents FOUT/FOIT |
| Color contrast validation | Manual calculations or guessing | WebAIM Contrast Checker, Coolors Contrast Checker | Automated WCAG ratio calculation, instant feedback, passes/fails clearly |
| Dark mode toggling | Manual class management | `next-themes` package (if needed) | Handles system preference detection, flash of wrong theme prevention, SSR considerations |
| CSS variable management | Manual `:root` definitions | Tailwind `@theme` directive | Auto-generates utilities, type-safe in IDE, consistent naming convention |

**Key insight:** Design systems have many edge cases (accessibility, theming, SSR, progressive enhancement). Existing solutions have already solved these problems through real-world usage and community feedback.

## Common Pitfalls

### Pitfall 1: OKLCH Color Contrast Issues

**What goes wrong:** OKLCH colors (default in Tailwind v4) may have different perceived brightness than RGB, leading to unexpected contrast failures.

**Why it happens:** OKLCH is perceptually uniform but L (lightness) doesn't directly map to WCAG contrast calculations which use relative luminance.

**How to avoid:**
1. Always validate final colors with contrast checker tools (WebAIM, Coolors)
2. Test both light and dark mode variants
3. Don't rely on visual inspection alone
4. Keep color chips with expected contrast ratios documented

**Warning signs:** Text looks "close enough" but fails automated contrast tests, dark mode text harder to read than light mode.

### Pitfall 2: Category Color Distinction Loss

**What goes wrong:** Category colors (blue/orange/green/red) become too similar in saturation or lightness, defeating quick recognition purpose.

**Why it happens:** Over-optimizing for accessibility or aesthetic consistency can reduce color differentiation.

**How to avoid:**
1. Use OKLCH chroma (middle value) to maintain vibrancy while adjusting lightness for contrast
2. Test with color blindness simulators (deuteranopia, protanopia, tritanopia)
3. Maintain minimum 10% difference in chroma between category colors
4. Document exact OKLCH values in RESEARCH for reference

**Warning signs:** Users confuse expense categories, difficulty distinguishing colored badges at glance.

### Pitfall 3: Touch Target Size in "Gloves-on Mode"

**What goes wrong:** Touch targets smaller than 44px × 44px (WCAG 2.1 Level AAA) are hard to tap with gloves.

**Why it happens:** Designing for desktop aesthetics first, not considering construction site context.

**How to avoid:**
1. Minimum button height: `h-14` (56px) per CLAUDE.md requirements
2. Minimum input height: `min-h-12` (48px)
3. Minimum icon tap target: 44px × 44px with padding
4. Test with actual gloves or finger simulator

**Warning signs:** Users miss buttons, accidental taps, frustration with mobile interface.

### Pitfall 4: Skeleton Fidelity Mismatch

**What goes wrong:** Skeleton screens don't match actual content layout, causing jarring shifts when content loads.

**Why it happens:** Building generic skeletons without considering actual component structure.

**How to avoid:**
1. Mirror exact DOM structure in skeleton (same number of lines, similar shapes)
2. Match spacing and padding of actual component
3. Use `react-loading-skeleton`'s `count` prop for multiple lines
4. Test with slow 3G connection to see skeleton → content transition

**Warning signs:** Layout shifts when content loads, skeleton looks nothing like final content, user disorientation.

### Pitfall 5: Inter Font Not Applying

**What goes wrong:** Inter font doesn't load, falls back to system font, typography looks inconsistent.

**Why it happens:** Forgetting to apply font variable to `:root` or `html` element, or CSS variable name mismatch.

**How to avoid:**
1. Always set `className={inter.variable}` on `<html>` tag in layout.tsx
2. Map `--font-sans: var(--font-inter)` in `@theme` block
3. Verify font loads in browser DevTools (Network tab → Font filter)
4. Test with `font-sans` utility class in components

**Warning signs:** Typography looks different on refresh, browser DevTools shows font not loaded, inconsistent font rendering across pages.

### Pitfall 6: Dark Mode Flash

**What goes wrong:** Page flashes white (light mode) before switching to dark mode on initial load.

**Why it happens:** Theme preference not determined before hydration, missing `suppressHydrationWarning`.

**How to avoid:**
1. Use `next-themes` package if implementing theme toggle (not required if dark mode only)
2. Set theme class on `<html>` in `layout.tsx` before React hydration
3. Use `suppressHydrationWarning` on `<html>` if manipulating class
4. Test with hard refresh (Ctrl+Shift+R) to see flash

**Warning signs:** Visible flash of light theme on dark mode load, console warnings about hydration mismatch.

## Code Examples

Verified patterns from official sources:

### Category Color Tokens with WCAG AA Compliance

```css
/* Source: Based on WCAG 2.1 guidelines + OKLCH color space */
@theme {
  /* Category colors - adjusted for WCAG AA 4.5:1 contrast on white */
  /* Material (자재비) - Blue */
  --color-category-material-50: oklch(0.97 0.01 264);
  --color-category-material-100: oklch(0.93 0.03 264);
  --color-category-material-500: oklch(0.55 0.22 264);  /* Primary badge */
  --color-category-material-700: oklch(0.45 0.20 264);  /* Text on white */

  /* Labor (노무비) - Orange */
  --color-category-labor-50: oklch(0.97 0.01 45);
  --color-category-labor-100: oklch(0.93 0.03 45);
  --color-category-labor-500: oklch(0.65 0.20 45);     /* Primary badge */
  --color-category-labor-700: oklch(0.55 0.18 45);     /* Text on white */

  /* Food (식대) - Green */
  --color-category-food-50: oklch(0.97 0.01 145);
  --color-category-food-100: oklch(0.93 0.03 145);
  --color-category-food-500: oklch(0.65 0.18 145);     /* Primary badge */
  --color-category-food-700: oklch(0.55 0.16 145);     /* Text on white */

  /* Fuel (유류비) - Red */
  --color-category-fuel-50: oklch(0.97 0.01 25);
  --color-category-fuel-100: oklch(0.93 0.03 25);
  --color-category-fuel-500: oklch(0.55 0.22 25);      /* Primary badge */
  --color-category-fuel-700: oklch(0.45 0.20 25);      /* Text on white */

  /* Dark mode adjustments - lighter for contrast on dark bg */
  --color-category-material-dm: oklch(0.70 0.18 264);
  --color-category-labor-dm: oklch(0.75 0.16 45);
  --color-category-food-dm: oklch(0.75 0.14 145);
  --color-category-fuel-dm: oklch(0.70 0.18 25);
}

.dark {
  --color-category-material: var(--color-category-material-dm);
  --color-category-labor: var(--color-category-labor-dm);
  --color-category-food: var(--color-category-food-dm);
  --color-category-fuel: var(--color-category-fuel-dm);
}
```

### Spacing Scale with 4px Base Unit

```css
/* Source: Tailwind CSS default spacing scale */
@theme {
  /* 4px base unit (Tailwind standard) */
  --spacing-0: 0;
  --spacing-px: 1px;
  --spacing-0_5: 0.125rem;   /* 2px */
  --spacing-1: 0.25rem;      /* 4px */
  --spacing-1_5: 0.375rem;   /* 6px */
  --spacing-2: 0.5rem;       /* 8px */
  --spacing-2_5: 0.625rem;   /* 10px */
  --spacing-3: 0.75rem;      /* 12px */
  --spacing-3_5: 0.875rem;   /* 14px - minimum text size */
  --spacing-4: 1rem;         /* 16px - minimum touch target */
  --spacing-5: 1.25rem;      /* 20px */
  --spacing-6: 1.5rem;       /* 24px - component padding */
  --spacing-7: 1.75rem;      /* 28px */
  --spacing-8: 2rem;         /* 32px */
  --spacing-9: 2.25rem;      /* 36px */
  --spacing-10: 2.5rem;      /* 40px */
  --spacing-11: 2.75rem;     /* 44px - WCAG touch target */
  --spacing-12: 3rem;        /* 48px - minimum button height */
  --spacing-14: 3.5rem;      /* 56px - gloves-on button */
  --spacing-16: 4rem;        /* 64px - section spacing */
  --spacing-20: 5rem;        /* 80px */
  --spacing-24: 6rem;        /* 96px */
}
```

### Typography Scale with 1.333 Ratio (Perfect Fourth)

```css
/* Source: Based on CONTEXT.md type scale requirement */
@theme {
  /* 1.333 ratio (perfect fourth) starting at 12px */
  --font-size-xs: 0.75rem;      /* 12px */
  --font-size-sm: 0.875rem;     /* 14px - gloves-on minimum */
  --font-size-base: 1rem;       /* 16px - body text */
  --font-size-lg: 1.333rem;     /* 21.33px - subtitle */
  --font-size-xl: 1.777rem;     /* 28.44px - h3 */
  --font-size-2xl: 2.369rem;    /* 37.9px - h2 */
  --font-size-3xl: 3.157rem;    /* 50.5px - h1 */
  --font-size-4xl: 4.209rem;    /* 67.3px - display */

  /* Line heights - generous for readability */
  --leading-xs: 1rem;           /* 16px */
  --leading-sm: 1.25rem;        /* 20px */
  --leading-base: 1.6rem;       /* 25.6px - 1.6 ratio */
  --leading-lg: 1.75rem;        /* 28px */
  --leading-xl: 2rem;           /* 32px */
  --leading-2xl: 2.5rem;        /* 40px */
  --leading-3xl: 3rem;          /* 48px */
}
```

### Responsive Breakpoints (Mobile-First)

```css
/* Source: Tailwind CSS default breakpoints */
@theme {
  /* Mobile-first breakpoints */
  --breakpoint-sm: 40rem;    /* 640px - Small tablets */
  --breakpoint-md: 48rem;    /* 768px - Tablets */
  --breakpoint-lg: 64rem;    /* 1024px - Small laptops */
  --breakpoint-xl: 80rem;    /* 1280px - Desktops */
  --breakpoint-2xl: 96rem;   /* 1536px - Large screens */
}

/* Usage: sm:text-lg md:text-xl lg:text-2xl */
```

### Skeleton Component with Animation

```tsx
// Source: react-loading-skeleton package documentation
// components/loading/table-skeleton.tsx
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex gap-4 border-b pb-4 mb-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} height={20} width="25%" />
        ))}
      </div>

      {/* Rows */}
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="flex gap-4 py-3 border-b">
          <Skeleton height={20} width="20%" />
          <Skeleton height={20} width="30%" />
          <Skeleton height={20} width="25%" />
          <Skeleton height={20} width="15%" />
          <Skeleton height={32} width={56} borderRadius={8} /> {/* Action button */}
        </div>
      ))}
    </div>
  )
}
```

### Gloves-on Mode Button

```tsx
// Source: CLAUDE.md gloves-on mode requirements
// components/ui/button.tsx (extend existing)
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(
          // Base styles - minimum 56px height for gloves
          "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          "disabled:pointer-events-none disabled:opacity-50",
          // Size variants - ensure minimum 56px
          size === "default" && "h-14 px-6 py-3",           /* 56px height */
          size === "sm" && "h-12 px-4 py-2",                /* 48px minimum */
          size === "lg" && "h-16 px-8 py-4",                /* 64px height */
          // Touch target minimum 44x44px
          "min-h-[44px] min-w-[44px]",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `tailwind.config.js` for theme | `@theme` directive in CSS | Tailwind v4 (January 2025) | No more JS config, CSS-first theming, automatic CSS variable generation |
| RGB/Hex colors | OKLCH color space | Tailwind v4 (January 2025) | Better perceptual uniformity, easier color manipulation, wider gamut |
| `@tailwindcss/forms` plugin | Form styles built-in | Tailwind v4 (January 2025) | No plugin needed, form reset included by default |
| Manual font loading with `<link>` | `next/font` for optimization | Next.js 13 (2022) | Zero external requests, automatic font subsetting, prevents FOUT |
| Custom skeleton components | `react-loading-skeleton` package | 2021-2024 trend | Industry standard, accessible, themeable via CSS vars |
| Three-level headings (H1-H3) | H1-H4 + display variant | Modern design systems (2024+) | More flexibility, better hierarchy for complex layouts |

**Deprecated/outdated:**
- **`tailwind.config.js` theme customization:** Replaced by `@theme` directive in CSS files
- **`@apply` directive for everything:** Still works but prefer CSS variables for design tokens, `@apply` for component-specific utilities
- **Manual font subsetting:** `next/font` handles this automatically
- **RGB colors for design tokens:** OKLCH is default in Tailwind v4 for better color manipulation
- **Media query dark mode:** Class strategy (`.dark`) is preferred for user control, though media query still works for system preference

## Open Questions

Things that couldn't be fully resolved:

1. **Exact OKLCH values for WCAG AA compliance**
   - What we know: OKLCH requires contrast validation, WCAG uses relative luminance calculations
   - What's unclear: Whether OKLCH lightness (L) directly correlates to WCAG ratios without testing
   - Recommendation: Must validate all color combinations with WebAIM Contrast Checker before finalizing

2. **Inter font variable subset configuration**
   - What we know: `next/font/google` supports `subsets` and `weight` options
   - What's unclear: Optimal weight range for Korean + English mixed content
   - Recommendation: Start with standard weights [400, 500, 600, 700], add 300 if light weight needed for Korean

3. **Category color differentiation in dark mode**
   - What we know: Dark mode requires lighter colors for contrast
   - What's unclear: Whether increased lightness maintains sufficient chroma difference between categories
   - Recommendation: Test dark mode colors with color blindness simulators, adjust chroma if needed

4. **Skeleton animation performance**
   - What we know: `react-loading-skeleton` uses CSS animations
   - What's unclear: Performance impact on low-end mobile devices (common for construction workers)
   - Recommendation: Test on actual mobile devices, provide `enableAnimation={false}` prop option for performance

5. **Inter font CJK (Chinese/Japanese/Korean) character coverage**
   - What we know: Inter primarily covers Latin script
   - What's unclear: Whether Inter handles Korean characters or falls back to system fonts
   - Recommendation: Verify Korean character rendering, may need `Noto Sans KR` as fallback for CJK characters

## Sources

### Primary (HIGH confidence)

- **/tailwindlabs/tailwindcss.com** - Tailwind CSS official documentation
  - Topics: `@theme` directive syntax, design tokens, CSS variables, spacing, typography, shadows, dark mode
  - URLs: https://tailwindcss.com/docs/theme, https://tailwindcss.com/docs/adding-custom-styles, https://tailwindcss.com/docs/dark-mode

- **/websites/nextjs** - Next.js official documentation
  - Topics: `next/font/google` Inter integration, font optimization, variable fonts, Tailwind CSS integration
  - URLs: https://nextjs.org/docs/app/getting-started/fonts, https://nextjs.org/docs/app/api-reference/components/font

- **WebAIM Contrast Checker** - Official WCAG contrast validation tool
  - Topics: WCAG 2.1 Level AA requirements (4.5:1 normal text, 3:1 large text)
  - URL: https://webaim.org/resources/contrastchecker/

### Secondary (MEDIUM confidence)

- **Tailwind CSS v4.0 Announcement** (January 2025) - Official release notes
  - Topics: `@theme` directive, CSS variable generation, OKLCH color space
  - URL: https://tailwindcss.com/blog/tailwindcss-v4

- **Next.js Font Optimization Documentation** (Updated January 15, 2026)
  - Topics: Variable fonts, next/font/local vs next/font/google, Tailwind CSS integration
  - URL: https://nextjs.org/docs/app/building-your-application/optimizing/fonts

- **Best Practices for Loading States in Next.js** (Fishtank, August 2024)
  - Topics: `react-loading-skeleton` package, Next.js loading.js convention
  - URL: https://www.getfishtank.com/insights/best-practices-for-loading-states-in-nextjs

- **Design Tokens in Webstudio: A Practical Implementation Guide** (January 16, 2026)
  - Topics: Three-layer token architecture (base → semantic → component), CSS custom properties
  - URL: https://www.designsystemscollective.com/design-tokens-in-webstudio-a-practical-implementation-guide-927af8d36f36

- **The Developer's Guide to Design Tokens and CSS Variables** (December 4, 2025)
  - Topics: Platform-agnostic tokens vs CSS variables, implementation layer
  - URL: https://penpot.app/blog/the-developers-guide-to-design-tokens-and-css-variables/

### Tertiary (LOW confidence)

- **Tailwind CSS 4 @theme: The Future of Design Tokens** (Medium, 2025 guide)
  - Topics: @theme directive usage, design token patterns
  - URL: https://medium.com/@sureshdotariya/tailwind-css-4-theme-the-future-of-design-tokens-at-2025-guide-48305a26af06

- **How to Fix Dark Classes Not Applying in Tailwind CSS v4** (December 10, 2025)
  - Topics: Dark mode custom variants, CSS variable strategies
  - URL: https://www.sujalvanjare.com/blog/fix-dark-class-not-applying-tailwind-css-v4

- **Color Consistency in Design Systems** (UXPin)
  - Topics: WCAG 2.0 Level AA guidelines, brand color preservation
  - URL: https://www.uxpin.com/studio/blog/color-consistency-design-systems/

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official documentation from Tailwind CSS and Next.js, current versions verified
- Architecture: HIGH - Context7 official docs, verified with current release notes
- Pitfalls: MEDIUM - Based on official docs + common design system patterns, some specific to Korean construction context

**Research date:** 2026-01-29
**Valid until:** 2026-03-01 (30 days - Tailwind v4 is stable but ecosystem still evolving)

**Researcher notes:**
- Tailwind CSS v4 is a major shift from v3 - ensure all documentation referenced is v4-specific
- OKLCH color space is new - must validate contrast ratios empirically, not theoretically
- Korean language support (CJK characters) needs verification with Inter font - may need fallback
- Gloves-on mode requirements from CLAUDE.md are non-negotiable - minimum 56px buttons, 48px inputs
- Category colors are business-critical - preserve visual distinction even while improving aesthetics
