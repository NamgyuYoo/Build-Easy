# Project Research Summary

**Project:** Build-Easy Visual Redesign — Adaptive UI for Construction Site Management
**Domain:** SaaS Design System with Adaptive Touch/Mouse Interfaces
**Researched:** 2026-01-29
**Confidence:** MEDIUM

## Executive Summary

Build-Easy is a construction site management SaaS that requires a unique **dual-context adaptive UI** — seamlessly transitioning between gloves-on field use (touch, large targets, high contrast) and office use (mouse, keyboard shortcuts, information density). Research reveals this is NOT a standard responsive design problem. Modern SaaS products like Linear, Stripe, and Notion provide excellent reference patterns for polished micro-interactions and calm interfaces, but none address the specific construction industry requirement of field workers wearing gloves in dusty outdoor environments.

The recommended approach is a **CSS-first adaptive system** using Tailwind CSS v4's `@theme` directive with `@custom-variant` for touch/mouse detection, supplemented by react-pointer-type for JavaScript-level context awareness. CRITICALLY, the redesign must avoid the "Digg Effect" (radical UX overhaul) — preserve all existing user workflows while refreshing visuals. The highest-risk pitfalls are: (1) breaking gloves-on mode by shrinking touch targets, (2) hover state pollution on touch devices requiring double-taps, (3) hiding navigation behind "clean" interfaces that field workers can't navigate.

Key technical decision: **Framer Motion is incompatible with React 19/Next.js 15**. Use GSAP for complex animations and AutoAnimate for micro-interactions. All adaptive styling should prioritize CSS media queries over JavaScript to avoid hydration issues and ensure progressive enhancement.

## Key Findings

### Recommended Stack

**Core technologies:**
- **GSAP 3.x** — Production-grade animation library, React 19 compatible, industry standard for complex timelines and ScrollTrigger
- **AutoAnimate** (@formkit/auto-animate) — Zero-config micro-interactions for list reordering, React 19 confirmed working (Dec 2024)
- **Tailwind CSS v4** with `@theme` directive — CSS-first configuration, automatic CSS variable generation, perfect for design tokens
- **react-pointer-type** — Input modality detection (touch vs mouse), critical for adaptive UI auto-switching
- **React View Transitions API** (experimental) — Native route transitions in React 19, no library needed for basic cross-fades

**Critical version compatibility:**
- Framer Motion is **INCOMPATIBLE** with React 19/Next.js 15 (GitHub issue #2668)
- AutoAnimate React 19 compatibility confirmed Dec 9, 2024
- GSAP works but requires careful cleanup with custom hook (not `@gsap/react` which has issues)

### Expected Features

**Must have (table stakes):**
- Responsive breakpoints — Non-negotiable foundation (<480px mobile, 481-768px tablet, 769px+ desktop)
- Auto-detecting adaptive UI — Seamlessly transitions between gloves-on (mobile/field) and precision (desktop/office) modes
- Gloves-on mode with dignity — 56px minimum buttons, refined aesthetic to avoid cartoonish feel
- Construction-specific navigation — Uses industry terms (RFIs, Submittals, Daily Reports)
- Role-based dashboards — Auto-assign based on user role (superintendent vs PM)
- Offline-first data capture — Cache data, sync when connected (critical for job sites)
- Accessible color contrast — WCAG AA compliance, sunlight-optimized option

**Should have (competitive):**
- Sunlight-optimized contrast mode — High-contrast mode for outdoor use on construction sites
- Adaptive typography — Font size adjusts based on device and context
- Thumb-zone navigation — Primary actions in bottom 30% for one-handed use
- Voice input for field reporting — Dictate notes when hands are occupied or wearing gloves
- Micro-interaction feedback — Subtle animations confirm actions without modal interruptions

**Defer (v2+):**
- Manual light/dark toggle — Automatic time-based themes are better UX
- Customizable dashboards — Most users never customize, leads to decision paralysis
- Real-time chat/messaging — Turns SaaS into Slack clone, notification fatigue
- Multi-language support (v1) — English-only for MVP, add i18n post-validation if demand confirmed
- Advanced reporting dashboards — Simple CSV exports suffice, integrate with existing tools

### Architecture Approach

The recommended architecture is a **layered design system** with clear separation between base UI components (Shadcn/UI, untouched) and adaptive wrapper components that detect input method and apply appropriate variants. The foundation is Tailwind CSS v4's `@theme` directive which defines all design tokens as CSS variables automatically. Three token layers exist: base tokens (raw values like colors, spacing), semantic tokens (contextual mappings like primary/secondary), and adaptive variants (touch vs mouse adjustments).

**Major components:**
1. **Base Tokens** — Raw design values defined in `@theme` block (colors, spacing, typography, radii)
2. **Semantic Tokens** — Contextual values (primary, secondary, muted) mapping base tokens to UI roles
3. **Adaptive Utilities** — Input-aware styles using `@custom-variant` with `@media (pointer: coarse/fine)`
4. **Component Variants** — CVA-based size variants including "gloves" mode (56px min-height)
5. **Adaptive Wrappers** — React components that detect input method and apply variants to base UI components

**Critical anti-patterns to avoid:**
- Modifying Shadcn/UI components directly — use wrapper pattern instead
- JavaScript for purely adaptive styles — use CSS media queries
- Hardcoded values in components — reference design tokens
- Tailwind v3 config patterns — use `@theme` directive in v4

### Critical Pitfalls

1. **The "Digg Effect" (Radical UX Overhaul)** — Redesign changes core user workflows, navigation patterns, or business logic all at once. Users who built muscle memory suddenly can't complete tasks. Prevention: Map every existing user journey before changing anything, preserve core workflows, gradual rollout with feature flags.

2. **Hover State Pollution on Touch Devices** — First tap activates hover (nothing happens), second tap registers click. Gloved users must double-tap precisely, causing frustration. Prevention: Use `@media (hover: hover)` for conditional hover states, test on actual touch devices with gloves, remove hover from buttons entirely.

3. **Hiding Navigation Behind "Clean" Interfaces** — Buried navigation in hamburger menus or "more" buttons to achieve minimalist aesthetic. Site managers can't find worker management, expense entry. Prevention: Visible navigation on desktop, persistent action buttons on mobile, "five-click rule" for feature access.

4. **Touch Target Shrinkage in "Modern" Redesign** — Existing 56px buttons shrink to 40px to match modern SaaS aesthetics. Workers wearing gloves can't accurately tap targets. Prevention: Non-negotiable 56px minimum for primary actions, mandatory glove testing, "Gloves-on Mode" design token enforcement.

5. **Design System Fragmentation During Migration** — Old and new components coexist inconsistently, some screens use new Button, others use old. Prevention: Semantic versioning for design system, migration sprints, deprecation warnings, no parallel components (Button/ButtonNew).

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Research & Discovery
**Rationale:** Must audit existing UX before any design work to avoid "Digg Effect" (radical overhaul that alienates users). Research identifies Pitfall 1 (Radical UX Overhaul) as highest-risk — can't prevent what hasn't been documented.

**Delivers:**
- Complete user journey inventory for all existing workflows
- Navigation audit listing every screen and access patterns
- Current touch target size audit (verify gloves-on mode compliance)
- Component inventory (which components exist, which need adaptive variants)
- Accessibility audit of current implementation

**Addresses:**
- FEATURES.md: Table stakes validation (what users already expect)
- PITFALLS.md: Pitfall 1 prevention (user journey mapping)

**Avoids:**
- Changing any workflows before documenting current state
- Making visual design decisions without understanding usage patterns

### Phase 2: Design Token Foundation
**Rationale:** Architecture research establishes `@theme` directive as foundation — must define base tokens before building adaptive variants. This is pure configuration work, no visible changes yet, allowing safe iteration.

**Delivers:**
- `src/app/globals.css` with `@theme` block defining all base tokens (colors, spacing, typography, radii)
- `src/styles/tokens/base.css` — Base design tokens
- `src/styles/tokens/semantic.css` — Semantic token mappings
- Token documentation (what each token represents, when to use)
- Verification that CSS variables are generated correctly

**Addresses:**
- ARCHITECTURE.md: Pattern 1 (Tailwind v4 @theme block)
- ARCHITECTURE.md: Pattern 2 (Semantic token mapping)
- STACK.md: Tailwind CSS v4 implementation

**Uses:**
- Tailwind CSS v4 `@theme` directive
- OKLCH color space for modern color system

### Phase 3: Adaptive Variants & Component Enhancements
**Rationale:** Once tokens exist, add adaptive capabilities. This phase delivers the core "gloves-on mode" functionality. Build incrementally: CSS variants first (safer), then JavaScript detection where needed.

**Delivers:**
- `@custom-variant` definitions for touch/mouse/hover in CSS
- "Gloves" size variant added to all Shadcn/UI components using CVA
- Adaptive hover states wrapped in `@media (hover: hover)`
- Touch target size enforcement (56px minimum for primary, 44px for all interactive)
- Component variant documentation

**Addresses:**
- FEATURES.md: Gloves-on mode with dignity
- FEATURES.md: Adaptive touch targets
- PITFALLS.md: Pitfall 2 (hover state pollution), Pitfall 5 (touch target shrinkage)

**Uses:**
- Tailwind CSS v4 `@custom-variant` directive
- class-variance-authority (CVA) for type-safe variants

**Implements:**
- ARCHITECTURE.md: Pattern 3 (Adaptive custom variants)
- ARCHITECTURE.md: Pattern 5 (CVA variants with adaptive sizes)

### Phase 4: Adaptive Wrapper Components
**Rationale:** Foundation exists, now build developer-facing adaptive components. This layer detects input method and applies appropriate variants to base UI components. Separation allows independent testing and easier migration.

**Delivers:**
- `src/components/adaptive/` directory with wrapper components
- AdaptiveButton, AdaptiveInput, AdaptiveSelect, etc.
- Input detection context using react-pointer-type
- Adaptive component documentation and usage examples
- Storybook stories demonstrating touch vs mouse variants

**Addresses:**
- FEATURES.md: Auto-detecting adaptive UI
- ARCHITECTURE.md: Pattern 4 (Adaptive component wrapper)

**Uses:**
- react-pointer-type for JavaScript-level detection
- Context API for input method state sharing

**Avoids:**
- Modifying Shadcn/UI components directly (ARCHITECTURE.md anti-pattern 3)

### Phase 5: Feature Component Migration
**Rationale:** Infrastructure complete, now migrate actual application screens. This is where users see changes. Use phased rollout to detect issues early.

**Delivers:**
- Updated expense-card, labor-log, worker-management components using adaptive components
- Removal of hardcoded "gloves-mode" classes from feature components
- Responsive tables (cards on mobile, table on desktop)
- Construction-specific navigation updates (RFIs, Submittals, Daily Reports)
- Migration tracker (which screens migrated, which remaining)

**Addresses:**
- FEATURES.md: Construction-specific navigation, responsive tables, loading states
- PITFALLS.md: Pitfall 3 (hidden navigation), Pitfall 6 (design system fragmentation)

**Avoids:**
- Breaking existing workflows (PITFALLS.md: Pitfall 1)

### Phase 6: Micro-Interactions & Polish
**Rationale:** Core functionality works, now add delight. This phase is "nice to have" but creates modern SaaS feel. Can be deferred if timeline tight, but strongly recommended for differentiation.

**Delivers:**
- AutoAnimate integration for list reordering, accordions, toasts
- GSAP hero animation (if applicable)
- Context-aware feedback messages ("Daily report logged" not "Task completed")
- Loading states with skeleton screens
- Form validation with inline errors
- Route transition animations (React View Transitions API if stable)

**Addresses:**
- FEATURES.md: Micro-interaction feedback, context-aware feedback, loading states, form validation
- STACK.md: AutoAnimate, GSAP, React View Transitions API

**Uses:**
- AutoAnimate for zero-config micro-interactions
- GSAP for complex timelines (if needed)
- React View Transitions API for route transitions

### Phase 7: Role-Based Dashboards & Advanced Features
**Rationale:** Highest complexity, lowest urgency. Requires role detection, conditional rendering, and sophisticated data aggregation. Can ship in v1.x after core adaptive system validates.

**Delivers:**
- Role-based dashboard personalization (superintendents see crew/weather, PMs see budgets)
- Quick-action home screen with one-tap access to frequent field tasks
- Offline-first data capture with service worker (if not implemented earlier)
- Sunlight-optimized contrast mode toggle
- Voice input for field reporting (if validated)

**Addresses:**
- FEATURES.md: Role-based dashboards, quick-action home screen, offline-first, sunlight-optimized contrast, voice input

**Implements:**
- ARCHITECTURE.md: Pattern 4 (adaptive wrapper with role detection)

### Phase Ordering Rationale

**Why this order:**
- **Phase 1 must come first** — Can't avoid breaking workflows if we don't know what they are. Research is cheap, fixing broken workflows is expensive.
- **Phases 2-3 are foundation** — Tokens before variants, CSS before JavaScript. Each layer depends on the previous. Trying to build adaptive components without tokens is technical debt.
- **Phases 4-5 are implementation** — Wrappers before features allows independent testing and easier rollback. Migrating feature components after wrappers are tested reduces integration risk.
- **Phase 6 is polish** — Micro-interactions add delight but don't affect functionality. Can be deferred if timeline constrained.
- **Phase 7 is advanced** — Role-based features and offline-first are high-complexity, can ship incrementally after MVP validation.

**Why this grouping:**
- **Phases 1-3 (Infrastructure)** — No visible changes to users, safe to deploy incrementally. Can be done in parallel by different developers.
- **Phases 4-5 (Implementation)** — User-visible changes, requires careful coordination. Feature-flag rollout recommended.
- **Phases 6-7 (Enhancement)** — Competitive differentiators, not blockers for launch validation.

**How this avoids pitfalls:**
- **Phase 1 prevents Pitfall 1** (Radical UX Overhaul) by documenting existing workflows
- **Phases 2-3 prevent Pitfall 5** (Touch Target Shrinkage) by enforcing gloves-on tokens
- **Phase 3 prevents Pitfall 2** (Hover State Pollution) by using `@media (hover: hover)`
- **Phase 4 prevents Pitfall 3** (Hidden Navigation) by keeping navigation visible
- **Phase 5 prevents Pitfall 6** (Design System Fragmentation) by complete migration, not parallel components

### Research Flags

**Phases likely needing deeper research during planning:**
- **Phase 3:** Adaptive variants implementation — CSS `@custom-variant` syntax is new in Tailwind v4, may need research into specific syntax and browser compatibility
- **Phase 4:** react-pointer-type integration — Need to verify behavior with hybrid devices (iPad Pro, Surface) that support both touch and mouse
- **Phase 5:** Feature component migration — Need to audit current component usage patterns, may uncover technical debt not visible in research
- **Phase 7:** Offline-first architecture — Service worker patterns with Supabase/Next.js 15 need research, conflict resolution strategies unclear

**Phases with standard patterns (skip research-phase):**
- **Phase 1:** UX research methods are well-established, no niche research needed
- **Phase 2:** Tailwind v4 `@theme` directive is well-documented in official docs
- **Phase 6:** AutoAnimate and GSAP have extensive documentation and examples

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Official documentation verified (Tailwind v4, GSAP, AutoAnimate React 19 compatibility confirmed) |
| Features | MEDIUM | WebSearch verified for 2026 SaaS trends, but limited official design system documentation (Stripe/Linear/Notion docs not public) |
| Architecture | HIGH | Tailwind v4 architecture from official docs, adaptive UI patterns from reputable sources (CSS-IRC, MDN) |
| Pitfalls | MEDIUM | Historical case studies (Digg) well-documented, but Build-Easy specific construction industry patterns inferred from general UX principles |

**Overall confidence:** MEDIUM

Stack and architecture recommendations are highly confident based on official documentation. Feature recommendations are medium confidence because modern SaaS design patterns are inferred from public observations — official design systems (Stripe, Linear, Notion) are not publicly accessible. Pitfall research is solid on historical disasters (Digg) but construction-specific risks are extrapolated from general UX principles.

### Gaps to Address

**Gaps requiring validation during implementation:**

1. **Gloves-on touch target size** — Research recommends 56px minimum, but no academic studies specifically for construction workers with gloves. Mitigation: Field testing with actual construction workers and work gloves.

2. **Hybrid device behavior** — react-pointer-type behavior on devices like iPad Pro and Surface (support both touch and mouse simultaneously) unclear. Mitigation: Test on actual hybrid devices, implement fallback to manual mode toggle.

3. **Korean language layout** — All research assumed English. Korean text may behave differently (word lengths, font rendering). Mitigation: Korean-first design mockups, real translation testing.

4. **Offline sync conflict resolution** — Limited documentation on Supabase + Next.js 15 offline-first patterns. Mitigation: Research phase for Phase 7, may need `/gsd:research-phase`.

5. **React View Transitions API stability** — Experimental feature, may change before stable release. Mitigation: Use GSAP for route transitions if API not stable by implementation time.

6. **Sunlight-optimized contrast implementation** — No clear standards for "high contrast mode for outdoor use". Mitigation: User testing on actual construction sites, WCAG AAA baseline (7:1 contrast).

## Sources

### Primary (HIGH confidence)
- [Tailwind CSS v4.0 Blog Post](https://tailwindcss.com/blog/tailwindcss-v4) — Verified `@theme` directive, CSS variables, container queries, OKLCH color space
- [Shadcn UI Tailwind v4 Docs](https://ui.shadcn.com/docs/tailwind-v4) — Official Tailwind v4 integration guide
- [React Labs: View Transitions](https://react.dev/blog/2025/04/23/react-labs-view-transitions-activity-and-more) — Official React 19 experimental feature
- [MDN: Using Media Queries](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Media_queries/Using) — Official MDN docs
- [Nielsen Norman Group - Touch Targets on Touchscreens](https://www.nngroup.com/articles/touch-target-size/) — UX research authority
- [Nielsen Norman Group - Top 10 Enduring Web-Design Mistakes](https://www.nngroup.com/articles/top-10-enduring/) — UX pitfalls verified
- [Google Codelab: User-Adaptive Interfaces](https://codelabs.developers.google.com/codelabs/user-adaptive-interfaces) — Official Google patterns

### Secondary (MEDIUM confidence)
- [GSAP Community Forums - Next.js 15 Compatibility](https://gsap.com/community/forums/topic/44521-why-isnt-gsap-working-properly-in-nextjs-15/) — Community verification
- [AutoAnimate GitHub Issue #218](https://github.com/formkit/auto-animate/issues/218) — React 19 compatibility confirmation
- [CSS-IRC: Detecting Hover-Capable Devices](https://css-irl.info/detecting-hover-capable-devices/) — Reputable CSS blog
- [Fast Company - Digg Redesign Disaster](https://www.fastcompany.com/1690829/digg-redesigns-loses-more-quarter-audience/) — Historical case study
- [The Guardian - Digg User Revolt](https://www.theguardian.com/technology/pda/2010/aug/31/digg-redesign-revolt) — Contemporary reporting
- [Adrian Roselli - Avoid Hamburger Menu for Desktop](https://adrianroselli.com/2016/01/avoid-the-hamburger-menu-for-desktop-layouts.html) — Accessibility expert
- [UXPin - Responsive Design for Touch Devices](https://www.uxpin.com/design-knowledge-base/responsive-design-for-touch-devices) — UX design resource
- [Design Systems Collective - Systematic Taxonomy in Design Tokens](https://www.designsystemscollective.com/systematic-taxonomy-in-design-tokens-a-framework-for-scalable-ui-architecture-45cc6f2c7686) — Authoritative source
- [Contentful - Design Token System](https://www.contentful.com/blog/design-token-system/) — Established design system

### Tertiary (LOW confidence)
- [Tubik Studio - UI Design Trends 2026](https://blog.tubikstudio.com/ui-design-trends-2026/) — 2026 trend analysis
- [UXDesign.cc - 10 UX Design Shifts for 2026](https://uxdesign.cc/10-ux-design-shifts-you-cant-ignore-in-2026-8f0da1c6741d) — Enterprise UX perspective
- [AlterSquare - Construction SaaS UX](https://altersquare.medium.com/your-construction-saas-looks-like-every-other-tool-7-ux-fixes-that-actually-win-rfps-90c1ca4d77c9) — Construction-specific UX (single source)
- [react-pointer-type GitHub](https://github.com/AndrewPrifer/react-pointer-type) — Small library, limited adoption
- Various 2026 UX trend articles — General advice, not Build-Easy specific

---

*Research completed: 2026-01-29*
*Ready for roadmap: yes*
*Next step: Phase planning with `/gsd:roadmap`*
