# Phase 1: Design Token Foundation - Context

**Gathered:** 2026-01-29
**Status:** Ready for planning

## Phase Boundary

Establish the visual foundation with Tailwind CSS v4 @theme tokens defining colors, spacing, typography, and shadows while preserving business-critical category colors (자재비/blue, 노무비/orange, 식대/green, 유류비/red). This phase creates the design language that all subsequent phases build upon — it does not add new features or workflows.

## Implementation Decisions

### Color system structure
- **Category colors role**: Primary accents — blue/orange/green/red are the primary accent colors
- **Neutral palette**: True grayscale (black to white) for maximum flexibility
- **Semantic colors**: Standard mapping (success=green, warning=yellow, error=red, info=blue)
- **Dark mode**: Yes, include dark mode support from the start with light/dark theme variants

### Typography system
- **Font family**: Inter (classic variable font, widely used in SaaS)
- **Type scale**: 1.333 (perfect fourth) - 12/16/21.33/28.44...
- **Heading levels**: Claude's discretion — choose based on content needs (likely H1-H4 + display variant)

### Spacing rhythm
- **Layout density**: Balanced — moderate spacing with balanced information density
- **Base unit**: Claude's discretion — choose appropriate base (likely 4px Tailwind standard)
- **Component padding**: Claude's discretion — choose based on component type
- **Section spacing**: Claude's discretion — choose based on screen real estate

### Loading state design
- **Animation style**: Subtle gradient animation (Stripe-style)
- **Content fidelity**: High fidelity — skeleton closely matches actual content layout and shapes
- **Loading indicators**: Progress bars for determinate loading (file uploads), skeleton for indeterminate
- **Empty states**: Claude's discretion — choose design based on screen importance (likely distinct empty state with illustration + message)

### Claude's Discretion
- Heading levels (suggest H1-H4 + display variant for hero sections)
- Line heights (suggest generous: body 1.6, headings 1.2-1.3)
- Spacing base unit (suggest 4px = Tailwind default)
- Component padding range (suggest standard 16-24px for cards/panels)
- Section spacing (suggest 48-64px between major sections)
- Empty state design (suggest distinct from loading — illustration + message)
- Exact shadow scale and radius tokens

## Specific Ideas

- "I like Stripe's gradient skeleton animation — subtle and professional"
- "Notion's tight information density is good, but we need more breathing room for gloves-on mode"
- "Category colors must remain visually distinct — this is business-critical for quick recognition"

## Deferred Ideas

None — discussion stayed within phase scope.

---

*Phase: 01-design-token-foundation*
*Context gathered: 2026-01-29*
