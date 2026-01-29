# Phase 02: Adaptive CSS Infrastructure - Research

**Researched:** 2026-01-29
**Domain:** Tailwind CSS v4 Custom Variants, CSS Media Queries for Touch/Mouse Detection, Construction Site UX
**Confidence:** HIGH

## Summary

This phase builds an adaptive CSS infrastructure that automatically detects touch vs mouse input and applies appropriate sizing (56px buttons for touch, normal size for mouse) while preventing hover state pollution on touch devices. The research confirms that Tailwind CSS v4.1+ (released April 2025) now includes **native support** for `pointer-fine` and `pointer-coarse` variants, eliminating the need for custom `@custom-variant` implementations for pointer detection.

The standard approach uses CSS `@media (pointer: coarse)` for touch detection and `@media (hover: hover)` for hover capability detection. For construction site contexts, field-first UX principles require minimum touch targets of 56px for primary buttons (gloves-on mode), 48px for inputs, and 44px for all interactive elements to accommodate workers wearing safety gloves in dusty, outdoor environments.

WCAG 2.2 Success Criterion 2.5.8 establishes 24×24 CSS pixels as the minimum (Level AA), but industry best practices and platform guidelines (Apple, Material Design) recommend 44×44px or larger. Dark mode integration with adaptive variants uses Tailwind's existing class strategy (`.dark` selector) combined with new pointer variants.

**Primary recommendation:** Use Tailwind CSS v4.1+ built-in `pointer-coarse` and `pointer-fine` variants with `@media (hover: hover)` hover guards, enforce minimum touch target sizes via CSS custom properties and utility classes, and apply field-first UX principles for construction site visibility and usability.

## Standard Stack

The established libraries/tools for this domain:

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| **Tailwind CSS** | 4.1.0+ | Utility-first CSS with native pointer variants | v4.1+ includes `pointer-coarse` and `pointer-fine` variants, no custom implementation needed |
| **@tailwindcss/postcss** | 4.1.18+ | PostCSS plugin for Tailwind v4 build process | Required for Tailwind v4, compiles custom variants and utilities |
| **Next.js** | 15.1.3+ | React framework with App Router | Built-in dark mode support, CSS optimization, server component architecture |
| **CSS Media Queries** | Native | `@media (pointer: coarse)` and `@media (hover: hover)` | Standard CSS4 media features for input detection |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **@custom-variant directive** | Tailwind v4.0+ | Custom variant definitions | For complex variants like `hover-capable` that combine media queries |
| **CSS custom properties** | Native | Design token inheritance | For enforcing minimum sizes that can't be overridden by utility classes |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Tailwind v4.1 native variants | Custom `@custom-variant pointer-coarse` | Native variants are built-in and maintained, custom requires maintenance |
| CSS media queries | JavaScript detection (`ontouchstart`) | CSS is faster, no JS overhead, works before hydration |
| `@media (hover: hover)` | `@media (hover: none)` overrides | `hover: hover` prevents hover styles on touch, `hover: none` requires overriding all existing hover styles |

**Installation:**

```bash
# Core (already installed)
npm install tailwindcss@^4.1.0 @tailwindcss/postcss@^4.1.18 next@^15.1.3

# No additional dependencies required - using native Tailwind v4.1+ features
```

## Architecture Patterns

### Recommended Project Structure

```
src/
├── app/
│   ├── globals.css          # @custom-variant definitions, @theme extensions
│   └── layout.tsx           # Root layout with dark mode class
├── components/
│   ├── ui/                  # Shadcn/UI components (extend with adaptive variants)
│   │   ├── button.tsx       # Add pointer-coarse sizing
│   │   ├── input.tsx        # Add adaptive touch targets
│   │   └── card.tsx         # Add hover guards
│   └── adaptive/            # NEW: Adaptive component wrappers
│       ├── touch-safe-button.tsx
│       └── hover-guard.tsx
└── styles/                  # NEW: Adaptive CSS layer (optional)
    ├── adaptive.css         # Pointer-based variants
    └── construction.css     # Field-first UX overrides
```

### Pattern 1: Tailwind CSS v4.1 Native Pointer Variants

**What:** Use built-in `pointer-coarse` and `pointer-fine` variants introduced in Tailwind CSS v4.1 (April 2025) to apply different styles based on input device.

**When to use:** All adaptive sizing scenarios where touch vs mouse detection is needed.

**Example:**

```css
/* Source: https://tailwindcss.com/blog/tailwindcss-v4-1 */
/* Usage in HTML - no custom variant needed! */

/* Touch devices (coarse pointer) */
<button class="pointer-coarse:h-14 pointer-coarse:px-6 pointer-coarse:text-lg">
  Save
</button>

/* Mouse devices (fine pointer) */
<button class="pointer-fine:h-10 pointer-fine:px-4 pointer-fine:text-base">
  Save
</button>

/* Combined - progressive enhancement */
<button class="
  h-10 px-4 text-base           /* Default (mouse) */
  pointer-coarse:h-14           /* Touch: larger height */
  pointer-coarse:px-6           /* Touch: more padding */
  pointer-coarse:text-lg        /* Touch: larger text */
">
  Save
</button>
```

**Under the hood, Tailwind generates:**
```css
@media (pointer: coarse) {
  .pointer-coarse\:h-14 {
    height: 3.5rem; /* 56px */
  }
}

@media (pointer: fine) {
  .pointer-fine\:h-10 {
    height: 2.5rem; /* 40px */
  }
}
```

### Pattern 2: Custom `@custom-variant` for Hover Capability

**What:** Create a custom variant that combines `@media (hover: hover)` with `:hover` pseudo-class to prevent hover states on touch devices.

**When to use:** Preventing "sticky hover" states on touch devices where tap activates hover, requiring a second tap to dismiss.

**Example:**

```css
/* Source: Tailwind CSS v4 custom variant documentation */
@import "tailwindcss";

/* Custom variant for hover-capable devices */
@custom-variant hover-capable {
  @media (hover: hover) {
    &:hover {
      @slot;
    }
  }
}

/* Usage in HTML */
<button class="hover-capable:bg-blue-600 bg-blue-500">
  Save
</button>

/* Compiled CSS */
@media (hover: hover) {
  .hover-capable\:bg-blue-600:hover {
    background-color: oklch(0.55 0.22 264); /* blue-600 */
  }
}
/* On touch devices (hover: none), hover styles are NOT generated */
```

### Pattern 3: Minimum Touch Target Enforcement with CSS Custom Properties

**What:** Use CSS custom properties with `!important` or high specificity to enforce minimum touch target sizes that cannot be overridden by utility classes.

**When to use:** Ensuring accessibility compliance (44px minimum) and gloves-on mode requirements (56px primary buttons).

**Example:**

```css
/* Source: WCAG 2.5.8 + Field-first UX best practices */
@import "tailwindcss";

/* Enforce minimum touch targets */
@layer components {
  /* Base button with minimum sizing */
  .btn-base {
    min-height: var(--touch-target-min, 44px);
    min-width: var(--touch-target-min, 44px);
  }

  /* Primary action button (gloves-on mode) */
  .btn-primary {
    --touch-target-min: 56px; /* Cannot be overridden */
    min-height: 56px;
    min-height: var(--touch-target-min);
    min-width: 56px;
    min-width: var(--touch-target-min);
  }

  /* Input fields */
  .input-base {
    min-height: 48px; /* Per CLAUDE.md requirements */
    min-height: var(--input-min, 48px);
  }
}

/* Usage - utilities cannot shrink below minimum */
<button class="btn-base h-8">  <!-- h-8 (32px) ignored, min 44px applied -->
  Click me
</button>

<button class="btn-primary h-10">  <!-- h-10 (40px) ignored, min 56px applied -->
  Save Primary
</button>
```

### Pattern 4: Dark Mode with Adaptive Variants

**What:** Combine Tailwind's existing `.dark` class strategy with new pointer variants for context-aware styling in both light and dark modes.

**When to use:** All applications requiring both dark mode and adaptive touch/mouse interfaces.

**Example:**

```css
/* Source: Tailwind CSS v4 dark mode + pointer variants */
@import "tailwindcss";

@custom-variant dark (&:is(.dark *));

@theme {
  /* Light mode colors */
  --color-btn-bg: oklch(0.55 0.22 264);
  --color-btn-text: oklch(0.985 0.002 253.1);
}

.dark {
  /* Dark mode colors */
  --color-btn-bg: oklch(0.65 0.22 264);  /* Lighter for contrast */
  --color-btn-text: oklch(0.15 0 0);
}

/* Combined usage */
<button class="
  bg-[var(--color-btn-bg)]
  text-[var(--color-btn-text)]
  dark:bg-[var(--color-btn-bg)]
  dark:text-[var(--color-btn-text)]
  pointer-coarse:h-14
  pointer-fine:h-10
">
  Adaptive Dark Mode Button
</button>
```

### Pattern 5: Field-First UX for Construction Sites

**What:** Apply construction-specific UX principles: high contrast for outdoor visibility, large touch targets for gloves, and glare-resistant color choices.

**When to use:** Applications targeting construction, field work, or outdoor industrial environments.

**Example:**

```css
/* Source: Field-first UX research (AlterSquare, 2025) */
@import "tailwindcss";

/* Construction-optimized visibility */
@layer components {
  .construction-btn {
    /* High contrast for outdoor visibility */
    background-color: oklch(0.65 0.20 45); /* Orange - high chroma */
    color: oklch(0.15 0 0);                /* Near-black for contrast */
    border: 2px solid oklch(0.55 0.20 45); /* Sharper edge definition */

    /* Glove-friendly sizing */
    min-height: 56px;
    padding: 16px 24px;
    font-size: 18px;
    font-weight: 600;

    /* Touch-only: even larger for gloves */
    @media (pointer: coarse) {
      min-height: 64px;
      padding: 20px 32px;
      font-size: 20px;
    }

    /* Hover only on hover-capable devices */
    @media (hover: hover) {
      &:hover {
        background-color: oklch(0.60 0.20 45);
      }
    }
  }

  /* Avoid blue in bright sunlight - harder to distinguish */
  .category-material {
    /* Use higher chroma for outdoor visibility */
    background-color: oklch(0.60 0.24 264); /* Brighter blue */
  }

  /* Green, cyan, yellow stand out better in sunlight */
  .category-food {
    background-color: oklch(0.70 0.18 145); /* Bright green */
  }
}
```

### Anti-Patterns to Avoid

- **Hover styles without `@media (hover: hover)` guards:** Causes sticky hover on touch devices requiring double-tap
- **Shrinking touch targets below 44px for aesthetics:** Violates WCAG 2.5.8 and makes touch interaction difficult
- **Using blue as primary action color in outdoor apps:** Blue is harder to distinguish in bright sunlight
- **Low contrast for "subtle" design:** Construction sites have poor lighting, dust, and glare - high contrast is essential
- **Assuming all mobile devices = touch:** Some tablets have both touch and mouse (hybrid devices)
- **Hardcoding sizes instead of using variants:** Prevents adaptive sizing based on input device

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Touch device detection in JavaScript | `window.matchMedia('(pointer: coarse)')` or `ontouchstart` sniffing | Native CSS `@media (pointer: coarse)` | CSS is faster, works before hydration, no JS runtime overhead |
| Custom hover state management | Complex `onMouseEnter`/`onTouchStart` handlers | `@media (hover: hover)` CSS media query | Browser handles detection, no event listener overhead |
| Manual touch target enforcement | Inline `minHeight` props or conditional classes | CSS custom properties with `@layer components` | Centralized rules, harder to override, consistent enforcement |
| Dark mode theme switching | Manual class manipulation with `useEffect` | Tailwind's `.dark` class + `next-themes` (if toggle needed) | Avoids flash of wrong theme, handles system preference, SSR-safe |
| Color contrast calculation | Manual WCAG ratio math | WebAIM Contrast Checker tool | Automated validation, instant feedback, catches edge cases |

**Key insight:** CSS media queries and Tailwind's built-in variants handle input device detection reliably and performantly. JavaScript-based detection adds complexity, slows initial render, and can't match CSS's pre-hydration speed.

## Common Pitfalls

### Pitfall 1: Hover State Pollution on Touch Devices

**What goes wrong:** Hover styles activate on first tap, requiring a second tap to dismiss the hover state before the actual click action. This makes the interface feel unresponsive and broken.

**Why it happens:** Touch devices emulate hover on tap to support hover-dependent websites, but this conflicts with touch-optimized interfaces.

**How to avoid:**
1. Wrap all `:hover` styles in `@media (hover: hover)` media query
2. Use Tailwind's `@custom-variant hover-capable` for reusable hover guards
3. Test on actual touch devices (iPhone, Android, iPad) not just browser dev tools
4. Never use `:hover` alone without hover capability detection

**Warning signs:** Users complain about needing to "tap twice" on buttons, hover styles appear after tapping on mobile, inconsistent behavior between desktop and mobile.

### Pitfall 2: Ignoring Hybrid Devices (Touch + Mouse)

**What goes wrong:** Tablets and laptops with both touchscreen and mouse input get stuck in one mode (usually touch), making mouse interaction feel oversized and cartoonish.

**Why it happens:** `pointer: coarse` only detects the presence of a coarse input, not whether it's currently being used.

**How to avoid:**
1. Use `pointer: fine` for mouse-optimized sizing (not just absence of `pointer: coarse`)
2. Consider `any-pointer: coarse` if you want to detect hybrid capability
3. Test on actual hybrid devices (Surface Pro, iPad with keyboard/trackpad)
4. Provide user preference override if adaptive sizing causes issues

**Warning signs:** App looks "cartoonish" on laptop with touchscreen, users complain about oversized buttons on desktop, inconsistent sizing across devices.

### Pitfall 3: Touch Target Shrinking via Utility Override

**What goes wrong:** Developer applies `h-8` (32px) utility to button, overriding the minimum 44px touch target, violating accessibility requirements.

**Why it happens:** Tailwind utilities have normal specificity, can be overridden by later classes or inline styles.

**How to avoid:**
1. Use CSS custom properties with `!important` for minimum sizes
2. Apply minimum sizing in `@layer components` with higher specificity than utilities
3. Use `min-height` and `min-width` instead of `height` and `width` for base sizing
4. Add lint rule or automated check to catch violations in PRs

**Warning signs:** Touch targets smaller than 44px in production, accessibility audits fail, users complain about "tiny buttons" on mobile.

### Pitfall 4: Outdoor Visibility Issues in Construction Context

**What goes wrong:** Interface designed for office environment becomes unreadable in bright sunlight on construction sites.

**Why it happens:** Designers test indoors or on calibrated monitors, not in outdoor conditions with glare and dust.

**How to avoid:**
1. Use high contrast ratios (4.5:1 minimum, higher for outdoor use)
2. Avoid blue as primary action color in bright sunlight (harder to distinguish)
3. Prefer cyan, green, yellow, orange for outdoor visibility
4. Test on actual devices in outdoor conditions
5. Use sharp edges and avoid subtle shadows that wash out in glare

**Warning signs:** Workers shade screens with hands to read, complaints about "can't see outside", increased errors in outdoor conditions.

### Pitfall 5: Gloves-on Mode Not Tested with Actual Gloves

**What goes wrong:** Touch targets designed for "gloves-on" use but never tested with actual work gloves, leading to missed touches and frustration.

**Why it happens:** Theoretical sizing (56px) doesn't account for glove thickness, dexterity reduction, and screen protector interference.

**How to avoid:**
1. Test with actual construction gloves (safety gear, not thin cotton gloves)
2. Verify touch responsiveness with screen protectors (common on rugged tablets)
3. Add generous padding between touch targets (minimum 8px, preferably 12px+)
4. Consider "Glove Mode" device settings that boost touchscreen sensitivity
5. Test button placements with one-handed operation while holding tools

**Warning signs:** Workers remove gloves to use app, missed touches requiring multiple taps, accidental activations, frustration with mobile interface.

### Pitfall 6: Dark Mode Color Contrast Degrades on Touch Devices

**What goes wrong:** Dark mode colors that pass contrast tests on desktop monitors become unreadable on lower-quality mobile screens common in construction.

**Why it happens:** Mobile displays (especially rugged tablets) have lower contrast ratios and color accuracy than desktop monitors.

**How to avoid:**
1. Test dark mode on actual rugged tablets (not just high-end phones)
2. Use higher contrast in dark mode than light mode (invert with higher lightness)
3. Avoid subtle gray-on-gray combinations in dark mode
4. Verify category colors remain distinct in dark mode with color blindness simulators
5. Consider "high contrast" mode option for outdoor use

**Warning signs:** Dark mode text hard to read on tablets, category colors blend together in dark mode, complaints about "can't read in dark mode" on mobile.

## Code Examples

Verified patterns from official sources:

### Tailwind v4.1 Native Pointer Variants

```css
/* Source: https://tailwindcss.com/blog/tailwindcss-v4-1 */
/* NO CUSTOM VARIANT NEEDED - use built-in variants */

/* Touch device sizing */
<button class="pointer-coarse:h-14 pointer-coarse:px-6 pointer-coarse:text-lg">
  Touch-optimized
</button>

/* Mouse device sizing */
<button class="pointer-fine:h-10 pointer-fine:px-4 pointer-fine:text-base">
  Mouse-optimized
</button>

/* Combined - progressive enhancement from mouse default to touch override */
<button class="
  h-10 px-4 text-base           /* Default: mouse-sized */
  pointer-coarse:h-14           /* Touch: override to 56px */
  pointer-coarse:px-6           /* Touch: more horizontal padding */
  pointer-coarse:text-lg        /* Touch: larger text */
">
  Adaptive Button
</button>
```

### Custom Hover Guard Variant

```css
/* Source: https://tailwindcss.com/docs/adding-custom-styles */
@import "tailwindcss";

/* Define hover-capable variant (only applies hover on devices that support it) */
@custom-variant hover-capable {
  @media (hover: hover) {
    &:hover {
      @slot;
    }
  }
}

/* Usage - hover styles only appear on hover-capable devices */
<button class="
  bg-blue-500
  hover-capable:bg-blue-600     /* Only applies on devices with hover */
  hover-capable:shadow-lg
">
  Save
</button>

/* Compiled CSS */
@media (hover: hover) {
  .hover-capable\:bg-blue-600:hover {
    background-color: oklch(0.50 0.22 264);
  }
}
/* On touch devices, no :hover styles are generated at all */
```

### Minimum Touch Target Enforcement

```css
/* Source: WCAG 2.5.8 + gloves-on mode requirements */
@import "tailwindcss";

/* Enforce minimums in components layer (higher specificity than utilities) */
@layer components {
  /* Base touch target - cannot be shrunk below 44px */
  .touch-safe {
    min-height: 44px;
    min-width: 44px;
    /* Prevent utilities from overriding */
    &.h-8, &.h-9, &.h-10 {
      min-height: 44px !important;
    }
  }

  /* Primary action - gloves-on mode minimum 56px */
  .touch-primary {
    min-height: 56px;
    min-width: 56px;
    &.h-10, &.h-11, &.h-12 {
      min-height: 56px !important;
    }
  }

  /* Input fields - minimum 48px per CLAUDE.md */
  .input-safe {
    min-height: 48px;
    &.h-8, &.h-9, &.h-10 {
      min-height: 48px !important;
    }
  }
}

/* Usage - utilities cannot shrink below enforced minimums */
<button class="touch-safe h-10">  <!-- h-10 (40px) ignored, min 44px applied -->
  Safe Button
</button>

<button class="touch-primary h-12">  <!-- h-12 (48px) ignored, min 56px applied -->
  Gloves-on Button
</button>

<input class="input-safe h-10" />  <!-- h-10 (40px) ignored, min 48px applied -->
```

### Dark Mode with Adaptive Sizing

```css
/* Source: Tailwind CSS v4 dark mode documentation */
@import "tailwindcss";

@custom-variant dark (&:is(.dark *));

/* Theme tokens */
@theme {
  --color-btn-bg-light: oklch(0.55 0.22 264);
  --color-btn-bg-dark: oklch(0.65 0.22 264);
}

:root {
  --color-btn-bg: var(--color-btn-bg-light);
}

.dark {
  --color-btn-bg: var(--color-btn-bg-dark);
}

/* Adaptive button with dark mode */
<button class="
  bg-[var(--color-btn-bg)]
  text-white
  dark:bg-[var(--color-btn-bg)]
  h-10                          /* Default: mouse height */
  pointer-coarse:h-14            /* Touch: gloves-on height */
">
  Dark Mode Adaptive Button
</button>
```

### Construction-Optimized Category Colors

```css
/* Source: Field-first UX research + WCAG contrast requirements */
@import "tailwindcss";

@theme {
  /* Category colors - adjusted for outdoor visibility */
  /* Blue (자재비/Material) - higher chroma for sunlight */
  --color-category-material: oklch(0.60 0.24 264);  /* Brighter, more saturated */

  /* Orange (노무비/Labor) - stands out well in sunlight */
  --color-category-labor: oklch(0.70 0.20 45);

  /* Green (식대/Food) - excellent visibility in bright light */
  --color-category-food: oklch(0.70 0.18 145);

  /* Red (유류비/Fuel) - use higher chroma for outdoor use */
  --color-category-fuel: oklch(0.60 0.24 25);
}

.dark {
  /* Dark mode - lighter for contrast on dark background */
  --color-category-material: oklch(0.70 0.20 264);
  --color-category-labor: oklch(0.75 0.18 45);
  --color-category-food: oklch(0.75 0.16 145);
  --color-category-fuel: oklch(0.70 0.20 25);
}

/* Usage with adaptive touch targets */
<button class="
  bg-[var(--color-category-material)]
  text-white
  h-10
  pointer-coarse:h-14            /* Gloves-on mode */
  pointer-coarse:px-6
">
  자재비 (Material)
</button>
```

### Hybrid Device Handling (Touch + Mouse)

```css
/* Source: CSS any-pointer media query for hybrid detection */
@import "tailwindcss";

/* Detect if device has BOTH touch and mouse */
@custom-variant hybrid {
  @media (pointer: fine) and (any-pointer: coarse) {
    @slot;
  }
}

/* Usage - special handling for hybrid devices */
<body class="
  /* Default styling */
  bg-white
  /* Hybrid devices: show both touch and mouse hints */
  hybrid:cursor-help
  hybrid:after:content-['Touch+mouse detected']
">

/* Alternatively, use fine-pointer as default since it's more precise */
<button class="
  /* Default to mouse-optimized (more common for hybrid users) */
  h-10 px-4
  /* Only enlarge if ONLY coarse pointer available (not hybrid) */
  @[pointer:coarse]:not-[any-pointer:fine]:h-14
">
  Hybrid-Aware Button
</button>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Custom `@custom-variant pointer-*` | Native `pointer-coarse`/`pointer-fine` variants | Tailwind v4.1 (April 2025) | No custom variant needed, built-in and maintained by Tailwind team |
| JavaScript touch detection (`ontouchstart`) | CSS `@media (pointer: coarse)` | CSS4 Media Queries (2020+) | Faster, works before hydration, no JS runtime overhead |
| Global hover styles | `@media (hover: hover)` hover guards | CSS4 Media Queries (2020+) | Prevents sticky hover on touch, no double-tap required |
| Manual dark mode class management | Tailwind `.dark` class strategy | Tailwind v3-v4 evolution | Consistent API, SSR-safe, no flash of wrong theme |
| RGB colors for outdoor visibility | OKLCH with higher chroma for sunlight | Tailwind v4 (January 2025) | Better perceptual uniformity, easier color manipulation for visibility adjustments |

**Deprecated/outdated:**
- **JavaScript touch device sniffing:** `('ontouchstart' in window)` - Replaced by CSS `@media (pointer: coarse)` for styling purposes
- **Custom pointer variants in Tailwind v4.0:** Tailwind v4.1+ includes native variants, no need for `@custom-variant` definitions
- **Universal hover styles:** Applying `:hover` without `@media (hover: hover)` guard - causes issues on touch devices
- **`hover: none` override approach:** Instead of applying hover then overriding, use `hover: hover` to conditionally apply in first place
- **Manual min-height enforcement via JS:** CSS custom properties with `@layer components` is more maintainable and performant

## Open Questions

Things that couldn't be fully resolved:

1. **Exact Tailwind v4.1 release date and browser support**
   - What we know: Tailwind v4.1 blog post (April 2025) announces native pointer variants
   - What's unclear: Whether v4.1 is stable/production-ready or still in beta
   - Recommendation: Check `package.json` for installed Tailwind version, if <4.1 use custom `@custom-variant` fallback

2. **Hybrid device user preference**
   - What we know: Devices can have both touch and mouse, `any-pointer` detects hybrid capability
   - What's unclear: Whether users on hybrid devices prefer touch-optimized or mouse-optimized UI
   - Recommendation: Default to mouse-optimized (more precise), add user preference toggle if feedback indicates need

3. **Glove thickness impact on touch target size**
   - What we know: Construction gloves vary in thickness (lightweight vs heavy-duty)
   - What's unclear: Whether 56px is sufficient for heavy-duty gloves or if 64px+ is needed
   - Recommendation: Test with actual work gloves used on construction sites, adjust if higher failure rate observed

4. **Outdoor color contrast requirements beyond WCAG**
   - What we know: WCAG 2.1 Level AA requires 4.5:1 contrast
   - What's unclear: Whether higher contrast (5:1 or 6:1) is needed for bright sunlight readability
   - Recommendation: Aim for 6:1 or higher for primary actions, test on actual devices in outdoor conditions

5. **Screen brightness impact on color perception**
   - What we know: Rugged tablets have lower max brightness than consumer devices
   - What's unclear: How lower brightness affects color distinction and contrast perception
   - Recommendation: Test on actual rugged tablets used in construction (Getac, Panasonic Toughbook, etc.)

## Sources

### Primary (HIGH confidence)

- **Tailwind CSS Official Documentation** - Adding custom styles, v4.1 release notes
  - Topics: `@custom-variant` directive syntax, native `pointer-coarse`/`pointer-fine` variants in v4.1
  - URLs: https://tailwindcss.com/docs/adding-custom-styles, https://tailwindcss.com/blog/tailwindcss-v4-1

- **CSS Media Queries Level 4** - W3C Specification
  - Topics: `@media (pointer: coarse)`, `@media (pointer: fine)`, `@media (hover: hover)`, `@media (any-pointer)`
  - URL: https://www.w3.org/TR/mediaqueries-4/

- **MDN Web Docs** - CSS @media hover and pointer features
  - Topics: Hover media query, pointer media query, browser compatibility
  - URL: https://developer.mozilla.org/en-US/docs/Web/CSS/@media/hover, https://developer.mozilla.org/en-US/docs/Web/CSS/@media/pointer

- **WCAG 2.2 Success Criterion 2.5.8** - Target Size (Minimum)
  - Topics: 24×24 CSS pixel minimum for Level AA, 44×44px recommended for Level AAA
  - URL: https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html

### Secondary (MEDIUM confidence)

- **Field-First UX: Designing Cloud AEC Interfaces** (AlterSquare, June 2025)
  - Topics: Construction site UX principles, outdoor visibility, gloves-on interaction, 25% efficiency boost from field-first design
  - URL: https://altersquare.medium.com/field-first-ux-designing-cloud-aec-interfaces-that-actually-work-on-construction-sites-a932b40b28d0

- **CSS-Tricks: Solving Sticky Hover States** (2022)
  - Topics: `@media (hover: hover)` to prevent hover on touch devices, double-tap problem
  - URL: https://css-tricks.com/solving-sticky-hover-states-with-media-hover-hover/

- **Smashing Magazine: Guide to Hover and Pointer Media Queries** (March 2022)
  - Topics: `@media (pointer: coarse)` vs `(pointer: fine)`, `any-pointer` for hybrid devices
  - URL: https://www.smashingmagazine.com/2022/03/guide-hover-pointer-media-queries/

- **Nielsen Norman Group: Touch Target Size** (2024 update)
  - Topics: Minimum 1cm × 1cm (0.4in) touch targets, spacing requirements
  - URL: https://www.nngroup.com/articles/touch-target-size/

- **Flexible Dark Mode with Tailwind CSS v4 Custom Variants** (May 2025)
  - Topics: Creating custom dark mode variants with `@custom-variant`, respecting system preferences
  - URL: https://schoen.world/n/tailwind-dark-mode-custom-variant

### Tertiary (LOW confidence)

- **UX Stack Exchange: Tablet interface design outdoors** (Q&A discussion)
  - Topics: Bright sunlight UI design, glare reduction, high contrast recommendations
  - URL: https://ux.stackexchange.com/questions/10075/tablet-interface-design-when-used-outdoors-handling-bright-light

- **Best Rugged Tablets for Field Work** (Waysion, 2025)
  - Topics: Rugged tablet specifications, sunlight-readable displays, touch sensitivity
  - URL: https://www.waysion.com/blog/best-rugged-tablets-field-work-2025/

- **Touch Devices Should Not Be Judged By Their Size** (CSS-Tricks, 2021)
  - Topics: Why device size doesn't indicate touch capability, hybrid device considerations
  - URL: https://css-tricks.com/touch-devices-not-judged-size/

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Tailwind v4.1 official documentation confirms native pointer variants
- Architecture: HIGH - Official Tailwind CSS docs, CSS media query specifications, field-first UX research
- Pitfalls: MEDIUM - Based on official docs + field UX research, some construction-specific scenarios untested

**Research date:** 2026-01-29
**Valid until:** 2026-03-01 (30 days - Tailwind v4.1 is new but stable, CSS media queries are W3C standard)

**Researcher notes:**
- **Critical discovery:** Tailwind CSS v4.1 (April 2025) added **native** `pointer-coarse` and `pointer-fine` variants. This eliminates the need for custom `@custom-variant` implementations for pointer detection.
- **Verification needed:** Check if project is running Tailwind v4.1+. If not, include custom variant fallback or upgrade Tailwind.
- **Construction context:** Field-first UX research emphasizes high contrast (avoid blue in sunlight), large touch targets (56px for gloves), and generous spacing (12px+ between targets).
- **Hybrid devices:** Tablets/laptops with both touch and mouse are common in construction (e.g., Surface Pro, iPad with keyboard). Default to mouse-optimized UI for hybrid users.
- **Testing required:** Must test on actual touch devices (iPhone, Android, iPad) and rugged tablets (Getac, Panasonic) in outdoor conditions.
- **Dark mode integration:** Existing `.dark` class strategy from Phase 1 works seamlessly with new pointer variants. No changes needed to dark mode implementation.
