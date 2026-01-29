# Architecture Research: Adaptive UI Design System

**Domain:** SaaS Design System Architecture (Visual/Design Layer)
**Researched:** January 29, 2026
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     Presentation Layer                          │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌───────────┐ │
│  │  Adaptive  │  │    Base    │  │  Semantic  │  │ Component │ │
│  │  Utilities │  │  Tokens    │  │  Tokens    │  │  Variants │ │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘  └─────┬─────┘ │
├────────┼───────────────┼───────────────┼───────────────┼────────┤
│        │               │               │               │        │
├────────┴───────────────┴───────────────┴───────────────┴────────┤
│                    Tailwind CSS v4 Engine                       │
│  (@theme directive → CSS variables → utility generation)         │
├──────────────────────────────────────────────────────────────────┤
│                    Component Layer                               │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Shadcn/UI Components (Radix Primitives + Tailwind)      │   │
│  └──────────────────────────────────────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│                    Application Layer                             │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Next.js 15 Server/Client Components                      │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| **Base Tokens** | Raw design values (colors, spacing, typography) | `@theme` block in globals.css with CSS variables |
| **Semantic Tokens** | Contextual values (primary, secondary, muted) | CSS custom properties mapping to base tokens |
| **Adaptive Utilities** | Input-aware styles (touch vs mouse) | CSS custom variants with `@media (pointer: coarse/fine)` |
| **Component Variants** | Visual states and sizes | CVA (class-variance-authority) patterns |
| **Compound Components** | Multi-part UI elements | Radix primitives with shared context |

## Recommended Project Structure

```
src/
├── app/
│   └── globals.css              # @theme block, base/semantic tokens, custom variants
├── components/
│   ├── ui/                      # Shadcn/UI base components
│   │   ├── button.tsx           # Base component with CVA variants
│   │   ├── input.tsx            # Form components
│   │   └── ...
│   ├── adaptive/                # NEW: Adaptive wrapper components
│   │   ├── AdaptiveButton.tsx   # Touch/mouse-aware button
│   │   ├── AdaptiveInput.tsx    # Input-aware form fields
│   │   └── context.tsx          # Input detection context
│   └── features/                # Feature-specific composed components
│       ├── expense-card/        # Domain-specific components
│       └── labor-log/           # using adaptive primitives
├── styles/
│   ├── tokens/                  # NEW: Design token definitions
│   │   ├── base.css             # Base design tokens (colors, spacing)
│   │   ├── semantic.css         # Semantic tokens (primary, secondary)
│   │   └── adaptive.css         # Adaptive variants (touch, hover)
│   └── components.css           # Component-level overrides
└── lib/
    └── utils.ts                 # cn() helper for class merging
```

### Structure Rationale

- **app/globals.css:** Single source of truth for Tailwind v4 `@theme` configuration. All design tokens defined here become CSS variables automatically.
- **components/ui/:** Shadcn/UI components remain untouched. These are low-level primitives that should NOT contain adaptive logic.
- **components/adaptive/:** NEW layer for adaptive wrappers. These detect input method and apply appropriate variants to base UI components.
- **styles/tokens/:** Organized token definitions. Base tokens are platform-agnostic values. Semantic tokens map base tokens to UI roles. Adaptive tokens adjust for input method.
- **components/features/:** High-level, domain-specific components that compose adaptive + base components.

## Architectural Patterns

### Pattern 1: Tailwind v4 @theme Block

**What:** CSS-first configuration using `@theme` directive that automatically generates CSS variables.

**When to use:** Defining ALL design tokens (colors, spacing, typography, radii, shadows).

**Trade-offs:**
- **Pros:** Zero JavaScript configuration, native CSS variables accessible anywhere, automatic type safety with TypeScript
- **Cons:** Different from v3 mental model (no `tailwind.config.js`), requires learning CSS-first syntax

**Example:**
```css
/* src/app/globals.css */
@import "tailwindcss";

@theme {
  /* Base tokens - raw values */
  --color-brand-50: oklch(0.97 0.01 250);
  --color-brand-500: oklch(0.55 0.20 250);
  --color-brand-900: oklch(0.35 0.15 250);

  --spacing-touch-target: 3.5rem;  /* 56px - minimum touch target */
  --spacing-mouse-target: 2rem;    /* 32px - comfortable mouse click */

  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;

  --font-sans: "Inter", system-ui, sans-serif;
}
```

### Pattern 2: Semantic Token Mapping

**What:** Map base tokens to semantic roles (primary, secondary, destructive) using CSS custom properties.

**When to use:** Whenever you need contextual colors that can be themed or modified.

**Trade-offs:**
- **Pros:** Easy theming, clear intent, single source of truth
- **Cons:** Extra indirection layer

**Example:**
```css
/* src/styles/tokens/semantic.css */
:root {
  /* Semantic tokens map to base tokens */
  --color-primary: var(--color-brand-500);
  --color-primary-foreground: var(--color-white);

  --color-secondary: var(--color-gray-100);
  --color-secondary-foreground: var(--color-gray-900);

  --color-destructive: var(--color-red-600);
  --color-destructive-foreground: var(--color-white);
}

.dark {
  --color-primary: var(--color-brand-400);
  --color-secondary: var(--color-gray-800);
  --color-secondary-foreground: var(--color-gray-100);
}
```

### Pattern 3: Adaptive Custom Variants

**What:** Tailwind v4 `@custom-variant` directive for input-aware styling without JavaScript.

**When to use:** Components that need different styles for touch vs mouse input.

**Trade-offs:**
- **Pros:** Zero JavaScript, works at CSS level, progressive enhancement
- **Cons:** Limited to what CSS media queries can detect (pointer, hover)

**Example:**
```css
/* src/styles/tokens/adaptive.css */
/* Touch-optimized variant */
@custom-variant touch {
  @media (pointer: coarse) {
    @slot;
  }
}

/* Mouse-optimized variant */
@custom-variant mouse {
  @media (pointer: fine) {
    @slot;
  }
}

/* Hover-capable variant */
@custom-variant can-hover {
  @media (hover: hover) {
    @slot;
  }
}

/* Usage in HTML: */
/* <button class="touch:py-16 mouse:py-8 can-hover:hover:bg-gray-100"> */
```

### Pattern 4: Adaptive Component Wrapper

**What:** React component that detects input method and applies appropriate variants to base UI components.

**When to use:** Complex components needing significant behavioral differences between touch and mouse.

**Trade-offs:**
- **Pros:** Full control, can use JavaScript for detection, composable with any component
- **Cons:** Requires client-side JavaScript, hydration mismatch potential

**Example:**
```typescript
// src/components/adaptive/AdaptiveButton.tsx
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

export function AdaptiveButton({ children, ...props }: ButtonProps) {
  const [inputMethod, setInputMethod] = useState<"touch" | "mouse">("mouse")

  useEffect(() => {
    // Detect on first interaction
    const detectInput = (e: Event) => {
      setInputMethod(e.type === "touchstart" ? "touch" : "mouse")
    }
    window.addEventListener("touchstart", detectInput, { once: true })
    window.addEventListener("mouseover", detectInput, { once: true })
    return () => {
      window.removeEventListener("touchstart", detectInput)
      window.removeEventListener("mouseover", detectInput)
    }
  }, [])

  const size = inputMethod === "touch" ? "gloves" : "default"

  return (
    <Button size={size} {...props}>
      {children}
    </Button>
  )
}
```

### Pattern 5: CVA Variants with Adaptive Sizes

**What:** Use class-variance-authority (CVA) to define component variants including adaptive sizes.

**When to use:** Base UI components that need multiple size variants including "gloves" mode.

**Trade-offs:**
- **Pros:** Type-safe variants, composable, works with Shadcn/UI patterns
- **Cons:** Adds dependency, requires explicit variant selection

**Example:**
```typescript
// src/components/ui/button.tsx
import { cva } from "class-variance-authority"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        gloves: "h-14 min-h-14 px-8 text-lg", // NEW: Gloves-on mode
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)
```

## Data Flow

### Theme Token Flow

```
[@theme Block] → [CSS Variables] → [Tailwind Utilities] → [Component Styles]
     ↓                 ↓                    ↓                    ↓
  Define         Auto-generated      Utility classes       Applied styles
  tokens         as :root {}         reference vars       in components
```

### Adaptive Variant Flow

```
[Component Render] → [Input Detection] → [Variant Selection] → [Style Application]
         ↓                    ↓                    ↓                      ↓
    Base component    Media queries OR    Appropriate CVA        Final classes
    with CVA          JavaScript hook      variant selected      merged via cn()
```

### Key Data Flows

1. **Design Token Resolution:**
   - `@theme` defines `--color-primary: oklch(...)` in globals.css
   - Tailwind generates utility: `.bg-primary { background-color: var(--color-primary); }`
   - Component uses `<Button className="bg-primary">`
   - Runtime CSS resolves `var(--color-primary)` to computed OKLCH value

2. **Adaptive Styling:**
   - User's device/browser emits media query: `(pointer: coarse)` or `(pointer: fine)`
   - CSS variant `@custom-variant touch` activates on touch devices
   - Utility `touch:py-16` applies extra padding for touch targets
   - Component renders with touch-optimized spacing

3. **Component Composition:**
   - Feature component imports AdaptiveButton
   - AdaptiveButton wraps base Button component
   - Input method detected (touch vs mouse)
   - Appropriate size variant passed to Button
   - Final styles merge base + variant + adaptive classes

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-1k users | Single `globals.css` with all tokens, base + adaptive components only |
| 1k-100k users | Split tokens into separate files (base.css, semantic.css, adaptive.css), add component variants |
| 100k+ users | Consider design token management system (Style Dictionary), implement component library with separate package |

### Scaling Priorities

1. **First bottleneck:** Token organization. When you have 50+ design tokens, split them into separate files by category (colors, spacing, typography).
2. **Second bottleneck:** Component variants. When adaptive patterns are needed in 10+ components, create reusable adaptive wrapper components.

## Anti-Patterns

### Anti-Pattern 1: Component-Level Hardcoded Values

**What people do:**
```tsx
// ❌ BAD: Hardcoded values
<button className="h-14 px-8 text-lg">Save</button>
```

**Why it's wrong:** Violates DRY, impossible to update globally, breaks design system consistency.

**Do this instead:**
```tsx
// ✅ GOOD: Semantic token reference
<Button size="gloves">Save</Button>

// In globals.css:
@theme {
  --spacing-touch-target: 3.5rem;
}
```

### Anti-Pattern 2: JavaScript for Purely Adaptive Styles

**What people do:**
```tsx
// ❌ BAD: Unnecessary JavaScript
const [isTouch, setIsTouch] = useState(false)
useEffect(() => {
  setIsTouch('ontouchstart' in window)
}, [])

return <button className={isTouch ? 'h-14' : 'h-10'}>Click</button>
```

**Why it's wrong:** CSS media queries handle this more efficiently, no hydration issues, works before JS loads.

**Do this instead:**
```tsx
// ✅ GOOD: CSS-only adaptive
<button className="touch:h-14 h-10">Click</button>

// In globals.css:
@custom-variant touch { @media (pointer: coarse) { @slot; } }
```

### Anti-Pattern 3: Modifying Shadcn/UI Components Directly

**What people do:**
```tsx
// ❌ BAD: Forking base component
// components/ui/button.tsx (modified Shadcn component)
const Button = ({ className, ...props }) => {
  return (
    <button
      className={cn(
        "h-14 min-h-14", // Gloves mode hardcoded
        className
      )}
      {...props}
    />
  )
}
```

**Why it's wrong:** Breaks ability to update Shadcn/UI, mixes concerns, can't use component without gloves mode.

**Do this instead:**
```tsx
// ✅ GOOD: Adaptive wrapper
// components/adaptive/AdaptiveButton.tsx
import { Button as BaseButton } from "@/components/ui/button"

export function AdaptiveButton(props) {
  return <BaseButton size="gloves" {...props} />
}
```

### Anti-Pattern 4: Tailwind v3 Configuration in v4

**What people do:**
```js
// ❌ BAD: tailwind.config.js (v3 pattern)
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#oklch(0.55 0.20 250)',
      }
    }
  }
}
```

**Why it's wrong:** Tailwind v4 uses CSS-first configuration, `tailwind.config.js` is ignored.

**Do this instead:**
```css
/* ✅ GOOD: @theme directive (v4 pattern) */
@theme {
  --color-primary: oklch(0.55 0.20 250);
}
```

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| **Shadcn/UI** | Copy-paste to `components/ui/`, add adaptive wrappers | Don't modify base components, wrap instead |
| **Radix Primitives** | Used by Shadcn/UI, no direct integration needed | Handles accessibility, focus management |
| **Figma Design Tokens** | Export to CSS variables, manually sync to `@theme` | No plugin yet for Tailwind v4 syntax |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| **Base UI ↔ Adaptive** | Props forwarding, composition | Adaptive components wrap base, never modify |
| **Tokens ↔ Components** | CSS variables, utility classes | Components reference tokens via Tailwind classes |
| **Feature ↔ Adaptive** | Import and use | Feature components consume adaptive components |

## Build Order (Implementation Roadmap)

### Phase 1: Token Foundation (DO THIS FIRST)
1. Create `src/styles/tokens/` directory structure
2. Define base tokens in `@theme` block (colors, spacing, typography)
3. Map semantic tokens (primary, secondary, muted, etc.)
4. Verify CSS variables are generated correctly

### Phase 2: Adaptive Variants
1. Create `@custom-variant` definitions for touch/mouse/hover
2. Test on actual touch devices (emulators aren't enough)
3. Document minimum touch target sizes (44x44px recommended, 56px for gloves)

### Phase 3: Base Component Enhancement
1. Add "gloves" size variant to existing Shadcn/UI components using CVA
2. Add other adaptive variants as needed (hover states, focus indicators)
3. Test with both touch and mouse input

### Phase 4: Adaptive Wrapper Components
1. Create `src/components/adaptive/` directory
2. Build AdaptiveButton, AdaptiveInput, etc. as wrappers
3. Implement input detection hook (if needed beyond CSS media queries)
4. Test across devices

### Phase 5: Feature Component Migration
1. Update existing feature components to use adaptive components
2. Remove hardcoded "gloves-mode" classes from feature components
3. Test user flows on actual devices

## Critical Success Factors

1. **Don't modify Shadcn/UI components directly.** Use wrapper pattern instead.
2. **CSS media queries over JavaScript** for adaptive detection when possible.
3. **Test on real touch devices**, not just browser devtools emulation.
4. **Keep tokens semantic.** Use "primary" instead of "blue" in components.
5. **Document the "why"** behind adaptive variants (e.g., "gloves mode for dusty construction sites").

## Sources

### Tailwind CSS v4 Architecture
- [Tailwind CSS v4.0 Announcement](https://tailwindcss.com/blog/tailwindcss-v4) (HIGH confidence - official docs)
- [Adding Custom Styles - Tailwind CSS Docs](https://tailwindcss.com/docs/adding-custom-styles) (HIGH confidence - official docs)
- [Tailwind CSS Best Practices 2025-2026: Design System Patterns](https://www.frontendtools.tech/blog/tailwind-css-best-practices-design-system-patterns) (MEDIUM confidence - verified with official docs)
- [Building a Production Design System with Tailwind CSS v4](https://dev.to/saswatapal/building-a-production-design-system-with-tailwind-css-v4-1d9e) (MEDIUM confidence - practical guide)
- [Exploring Typesafe Design Tokens in Tailwind 4](https://dev.to/wearethreebears/exploring-typesafe-design-tokens-in-tailwind-4-372d) (MEDIUM confidence - technical deep dive)

### Design Token Organization
- [The Developer's Guide to Design Tokens and CSS Variables](https://penpot.app/blog/the-developers-guide-to-design-tokens-and-css-variables/) (MEDIUM confidence - verified practical guide)
- [The Ultimate Guide to Design Token Organization](https://medium.com/@uxfella/how-to-organize-design-tokens-advanced-naming-convention-for-efficiency-and-scalability-8c6275d43949) (MEDIUM confidence - comprehensive)
- [Systematic Taxonomy in Design Tokens](https://www.designsystemscollective.com/systematic-taxonomy-in-design-tokens-a-framework-for-scalable-ui-architecture-45cc6f2c7686) (HIGH confidence - Design Systems Collective is authoritative)
- [Design Tokens Explained (Contentful)](https://www.contentful.com/blog/design-token-system/) (HIGH confidence - established design system)
- [CSS Architecture: From BEM to Tailwind to Tokens](https://www.superflex.ai/blog/css-architecture) (LOW confidence - single source)

### Adaptive UI Patterns
- [Detecting Hover-Capable Devices](https://css-irl.info/detecting-hover-capable-devices/) (HIGH confidence - CSS-IRC is reputable CSS blog)
- [Handling Hover States on Touch Screens](https://haver.codes/posts/hover-states-and-touch-screens) (MEDIUM confidence - practical guide with references)
- [Build user-adaptive interfaces with preference media queries](https://codelabs.developers.google.com/codelabs/user-adaptive-interfaces) (HIGH confidence - Google official codelab)
- [MDN: Using Media Queries](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Media_queries/Using) (HIGH confidence - official MDN docs)
- [Adaptive UI in React: Self-Configuring Components](https://dev.to/raajaryan/adaptive-ui-in-react-constructing-self-configuring-and-context-aware-components-1e7n) (MEDIUM confidence - recent practical guide)

### Modern SaaS Design Systems
- [9 New Design System Examples to Scale Brands in 2026](https://www.superside.com/blog/design-systems-examples) (MEDIUM confidence - industry survey)
- [Future-Proof UI and UX Design for SaaS Products 2026](https://www.solutionsloft.com/blogs/ui-and-ux-design-in-saas-products-2026) (LOW confidence - marketing content)
- [B2B SaaS UX Design in 2026: Challenges & Patterns](https://www.onething.design/post/b2b-saas-ux-design) (MEDIUM confidence - design agency insights)
- [Building a Design System in 2026](https://engineering.udacity.com/building-a-design-system-in-2026-5cfd8d85043c) (MEDIUM confidence - engineering blog post)

### Shadcn/UI Customization
- [Shadcn UI Official Documentation](https://ui.shadcn.com/) (HIGH confidence - official docs)
- [Shadcn UI Customizer Template](https://shadcn.io/template/railly-shadcn-ui-customizer) (MEDIUM confidence - community tool)
- [Top 10 shadcn/ui Libraries of 2026](https://dev.to/vaibhavg/top-shadcn-ui-libraries-every-developer-should-know-1ffh) (LOW confidence - listicle)
- [Shadcn Figma Design System](https://shadcnstudio.com/figma) (HIGH confidence - official Figma kit)

### Next.js 15 Integration
- [Modern Full Stack Application Architecture Using Next.js 15+](https://softwaremill.com/modern-full-stack-application-architecture-using-next-js-15/) (MEDIUM confidence - architecture guide)
- [Design Patterns in Next.js 15 with React 19](https://blog.stackademic.com/design-patterns-in-next-js-15-with-new-features-and-hooks-from-react-19-be19f0bebbd0) (MEDIUM confidence - practical patterns)
- [Next.js 15 Official Release](https://nextjs.org/blog/next-15) (HIGH confidence - official announcement)
- [SaaS Architecture Patterns with Next.js](https://vladimirsedykh.com/blog/saas-architecture-patterns-nextjs) (MEDIUM confidence - implementation patterns)

---

*Architecture research for: Build-Easy Visual Redesign*
*Focus: Adaptive UI component patterns and design token architecture*
*Researched: January 29, 2026*
