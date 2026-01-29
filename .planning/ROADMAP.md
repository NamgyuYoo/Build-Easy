# Roadmap: Build-Easy Visual Redesign

## Overview

Transform Build-Easy from a functional but dated construction site management app into a modern SaaS product with adaptive UI that seamlessly serves both site managers (gloves-on, dusty environments) and office staff (desk-based, data-intensive). The journey establishes a layered design system (tokens → adaptive CSS → wrapper components → screen migration → polish) ensuring every visual change preserves existing workflows while elevating the professional appearance.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Design Token Foundation** - Tailwind CSS v4 @theme block with base, semantic, and category-preserving color tokens
- [ ] **Phase 2: Adaptive CSS Infrastructure** - Touch/mouse detection, hover safeguards, and construction-optimized touch targets
- [ ] **Phase 3: Component Architecture** - Adaptive wrapper components that auto-detect input method
- [ ] **Phase 4: Navigation & Layout** - Modern SaaS navigation with responsive layouts
- [ ] **Phase 5: Screen Migration** - Apply adaptive system to all application screens
- [ ] **Phase 6: Micro-Interactions** - GSAP animations and AutoAnimate transitions
- [ ] **Phase 7: Professional Polish** - Role-based dashboards and trust-building refinements

## Phase Details

### Phase 1: Design Token Foundation

**Goal**: Establish the visual foundation with Tailwind CSS v4 @theme tokens that define colors, spacing, typography, and shadows while preserving business-critical category colors (자재비/blue, 노무비/orange, 식대/green, 유류비/red).

**Depends on**: Nothing (first phase)

**Requirements**: RESP-01, RESP-02, DSYS-01, DSYS-02, POLISH-01, POLISH-02, POLISH-03

**Success Criteria** (what must be TRUE):
1. App renders with new design token system (CSS variables generated correctly)
2. All colors meet WCAG AA contrast standards (verified with contrast checker)
3. Category colors (blue/orange/green/red) remain visually distinct for quick recognition
4. Spacing and typography scales are consistent across all existing screens
5. Loading states display skeleton screens during async operations

**Plans**: TBD

Plans:
- [ ] 01-01: Configure Tailwind CSS v4 @theme block with base tokens
- [ ] 01-02: Define semantic token layer (primary, secondary, muted, etc.)
- [ ] 01-03: Create accessible color system with WCAG AA validation

### Phase 2: Adaptive CSS Infrastructure

**Goal**: Build the CSS-first adaptive system that detects touch vs mouse input and applies appropriate sizing (56px buttons for touch, normal size for mouse) while preventing hover state pollution on touch devices.

**Depends on**: Phase 1 (tokens must exist before adaptive variants)

**Requirements**: RESP-04, ADAP-01, ADAP-02, ANTI-01, ANTI-02

**Success Criteria** (what must be TRUE):
1. Touch devices show 56px minimum touch targets (verified on actual device)
2. Mouse devices show normal-sized interactive elements (no oversized cartoonish feel)
3. Hover states only appear on hover-capable devices (no double-tap required on touch)
4. Construction-optimized layout maintains visibility in outdoor/dusty environments
5. No touch target shrinks below 44px minimum (anti-pattern enforcement)

**Plans**: TBD

Plans:
- [ ] 02-01: Implement @custom-variant for touch/mouse detection using @media (pointer)
- [ ] 02-02: Create adaptive hover states with @media (hover: hover) guards
- [ ] 02-03: Enforce touch target size constraints (56px primary, 44px all interactive)

### Phase 3: Component Architecture

**Goal**: Build adaptive wrapper components that detect input method and apply appropriate variants to Shadcn/UI components without forking or modifying the base library.

**Depends on**: Phase 2 (adaptive CSS must exist before wrapper components)

**Requirements**: DSYS-03, NAV-01

**Success Criteria** (what must be TRUE):
1. AdaptiveButton component renders "gloves" size on touch, normal size on mouse
2. AdaptiveInput, AdaptiveSelect, and other form components follow same adaptive pattern
3. Shadcn/UI components remain unmodified (wrapper pattern verified)
4. Component variants are type-safe with CVA (class-variance-authority)
5. Developer documentation exists with usage examples for all adaptive components

**Plans**: TBD

Plans:
- [ ] 03-01: Create AdaptiveButton with CVA variants (default, gloves, touch)
- [ ] 03-02: Build adaptive form component suite (Input, Select, Textarea, Checkbox)
- [ ] 03-03: Document adaptive component patterns and usage guidelines

### Phase 4: Navigation & Layout

**Goal**: Implement modern SaaS navigation patterns (sidebar on desktop, bottom nav on mobile) with clear information architecture that keeps all features accessible without hidden menus.

**Depends on**: Phase 3 (adaptive components needed for navigation elements)

**Requirements**: NAV-01, NAV-02, NAV-03, ANTI-03

**Success Criteria** (what must be TRUE):
1. Desktop shows persistent sidebar navigation (all features visible)
2. Mobile shows bottom navigation with primary actions (no hamburger menu hiding)
3. All screens have clear visual hierarchy (headings, body, captions properly distinguished)
4. Navigation flows match existing user workflows (no radical changes)
5. Information architecture is consistent across all screens (no buried features)

**Plans**: TBD

Plans:
- [ ] 04-01: Design responsive navigation structure (sidebar/desktop, bottom-nav/mobile)
- [ ] 04-02: Implement navigation with adaptive components
- [ ] 04-03: Audit information architecture across all screens

### Phase 5: Screen Migration

**Goal**: Migrate all application screens to use the new adaptive component system while preserving existing functionality and workflows.

**Depends on**: Phase 4 (navigation must be complete before screen migration)

**Requirements**: ADAP-03

**Success Criteria** (what must be TRUE):
1. Dashboard screen uses adaptive components and adjusts layout for touch vs mouse
2. Project detail views (P&L, labor logs) render responsively on all screen sizes
3. Expense scanning flow maintains gloves-on mode (56px buttons, large inputs)
4. Worker management screens use adaptive tables (cards on mobile, table on desktop)
5. All existing user workflows remain functional (no broken journeys)

**Plans**: TBD

Plans:
- [ ] 05-01: Migrate dashboard screen with adaptive components
- [ ] 05-02: Migrate project detail and P&L views
- [ ] 05-03: Migrate expense scanning and labor logging screens
- [ ] 05-04: Migrate worker management with adaptive tables

### Phase 6: Micro-Interactions

**Goal**: Add polished micro-interactions using GSAP for complex animations and AutoAnimate for list transitions, creating the modern SaaS feel without sacrificing performance.

**Depends on**: Phase 5 (all screens must be migrated before adding animations)

**Requirements**: MICRO-01, MICRO-02, MICRO-03

**Success Criteria** (what must be TRUE):
1. Button hover, active, and disabled states provide clear visual feedback
2. List item additions/removals animate smoothly with AutoAnimate
3. Page transitions use GSAP or React View Transitions (cross-fade effect)
4. Form submissions show loading states with skeleton screens
5. All animations run at 60fps on target devices (performance verified)

**Plans**: TBD

Plans:
- [ ] 06-01: Install and configure GSAP with React 19 cleanup pattern
- [ ] 06-02: Integrate AutoAnimate for list micro-interactions
- [ ] 06-03: Implement button state feedback (hover, active, disabled)
- [ ] 06-04: Add page transition animations

### Phase 7: Professional Polish

**Goal**: Deliver role-based dashboard views and final polish touches that create trust and differentiate Build-Easy as a professional construction industry tool.

**Depends on**: Phase 6 (core functionality complete before role-based enhancements)

**Requirements**: POLISH-04, ANTI-04

**Success Criteria** (what must be TRUE):
1. Site managers see role-appropriate dashboard (quick actions, daily tasks)
2. Office staff see data-rich dashboard (P&L summaries, export links)
3. App feels professional on first load (no "cartoonish" oversized elements on desktop)
4. All anti-patterns prevented (no hover pollution, no hidden navigation, no workflow breaks)
5. Visual design matches modern SaaS aesthetic (Stripe/Linear/Notion reference)

**Plans**: TBD

Plans:
- [ ] 07-01: Implement role-based dashboard views
- [ ] 07-02: Polish first impression (loading states, hero section, typography)
- [ ] 07-03: Final anti-pattern audit and validation

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Design Token Foundation | 0/TBD | Not started | - |
| 2. Adaptive CSS Infrastructure | 0/TBD | Not started | - |
| 3. Component Architecture | 0/TBD | Not started | - |
| 4. Navigation & Layout | 0/TBD | Not started | - |
| 5. Screen Migration | 0/TBD | Not started | - |
| 6. Micro-Interactions | 0/TBD | Not started | - |
| 7. Professional Polish | 0/TBD | Not started | - |
