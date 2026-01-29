# Pitfalls Research

**Domain:** UI/UX Visual Redesign & Adaptive Touch/Mouse Interfaces
**Researched:** 2026-01-29
**Confidence:** MEDIUM

## Critical Pitfalls

### Pitfall 1: The "Digg Effect" - Radical UX Overhaul

**What goes wrong:**
Redesign changes core user workflows, navigation patterns, or business logic all at once. Users who built muscle memory around existing flows suddenly can't complete tasks. This causes immediate backlash, abandonment, and can destroy user trust permanently. Digg lost over 25% of their audience in 2010 after a radical redesign that alienated power users.

**Why it happens:**
Teams focus on "modernizing" visuals without mapping existing user journeys. Designers assume new patterns are "better" without understanding why old patterns existed. Pressure to ship a complete redesign leads to changing everything at once instead of incremental evolution.

**Consequences:**
- Immediate user revolt on social media
- Power users (site managers who use app daily) abandon the product
- Support ticket volume spikes 3-5x
- Revenue/users drop 20-30% within months
- Competitors gain market share

**Prevention:**
- **Map every existing user journey** before changing anything
- **Preserve core workflows** - visual refresh only, behavior unchanged
- **Gradual rollout strategy** - release to 5% of users, monitor metrics
- **Feature flags** for rollback capability
- **Power user advisory group** - test redesign heaviest users first

**Warning signs:**
- Redesign changes "how" users complete tasks, not just "how it looks"
- No user journey documentation exists for current version
- Team discussing "cleaning up" or "simplifying" complex workflows
- No gradual rollout plan - just "flip the switch"
- Leadership pushing "complete overhaul" for marketing press

**Phase to address:**
Phase 1 (Research) - Must audit existing UX before any design work

---

### Pitfall 2: Hover State Pollution on Touch Devices

**What goes wrong:**
Redesign adds hover states for desktop polish, but these persist on touch devices. First tap activates hover (nothing happens), second tap registers click. Users tap twice, get frustrated, think app is broken. Particularly disastrous for construction workers wearing gloves.

**Why it happens:**
Designers prototype on desktop/laptop. Browser media queries (`@media (hover: hover)`) aren't used. Teams assume "responsive" means "works on mobile" without testing actual touch interaction. Touch devices report as having hover capability, so hover states get applied.

**Consequences:**
- Gloved users can't complete actions (need precise double-tap)
- "Rage taps" - users hammering screen thinking it's unresponsive
- Abandoned workflows mid-task
- 1-star reviews complaining "app doesn't work"
- Accessibility violations for motor-impaired users

**Prevention:**
- **`@media (hover: hover)` and `@media (hover: none)`** - conditional CSS for true mouse vs touch
- **Test on actual touch devices** with real users, not just browser devtools
- **Remove hover on buttons** - use focus rings for keyboard navigation instead
- **Touch target size audit** - minimum 44x44px (9mm), 12mm in corners
- **Glove testing** - test with work gloves on real devices

**Warning signs:**
- Design mockups only show desktop hover states
- No touch device testing plan
- Tailwind `hover:` classes used without `@media (hover: hover)` wrapper
- Dev team says "it works on my machine" (laptop)
- User testing done on desktop only

**Phase to address:**
Phase 2 (Design System) - Build hover-free interaction patterns from start

---

### Pitfall 3: Hiding Navigation Behind "Clean" Interfaces

**What goes wrong:**
Redesign buries navigation in hamburger menus, "more" buttons, or progressive disclosure patterns to achieve "minimalist" aesthetic. Site managers can't find worker management, expense entry, or labor logs. Features that were one click become three clicks.

**Why it happens:**
Designers prioritize visual simplicity over functional discoverability. "Clean design" fetish leads to hiding everything behind clicks. References to "modern SaaS" aesthetics that don't account for field use cases. No understanding of construction site workflows - managers need FAST access, not minimal UI.

**Consequences:**
- "Where did X go?" confusion across user base
- Increased time-to-task completion
- Managers revert to pen/paper (defeating product purpose)
- Critical features undiscovered by new users
- Desktop users especially frustrated (hamburger menus on desktop are UX anti-pattern)

**Prevention:**
- **Navigation audit** - list every screen, how accessed currently
- **Visible navigation on desktop** - never hide primary nav behind hamburger on >1024px
- **Persistent action buttons** - "Add Expense", "Log Labor" always visible on mobile
- **Tree testing** - validate users can find features before coding
- **"Five-click rule"** - no feature should be more than 5 taps from anywhere

**Warning signs:**
- Design mockups show blank screens with "content would go here"
- Navigation items hidden in dropdowns on desktop
- Stakeholders asking "where's the menu?"
- A/B testing not planned for navigation changes
- No navigation testing with actual construction managers

**Phase to address:**
Phase 2 (Design System) - Navigation patterns must serve field use cases

---

### Pitfall 4: Dark Mode Accessibility Collapse

**What goes wrong:**
Redesign introduces dark mode for "modern" feel, but contrast ratios fail WCAG standards. Light text on dark backgrounds creates "halation effect" for astigmatic users (blurred edges). Construction sites with poor lighting become unusable - app looks "cool" but is illegible.

**Why it happens:**
Designers pick colors that "look good" rather than meeting contrast ratios. Dark mode implemented as color inversion rather than designed palette. No accessibility testing with low-vision users. Assumption that "dark mode = better for eyes" without evidence.

**Consequences:**
- Text becomes unreadable for users with astigmatism (30% of population)
- Construction site use in low-light conditions fails
- WCAG 2.1 AA violations (contrast < 4.5:1)
- Legal liability for accessibility non-compliance
- Users forced to use light mode, defeating redesign purpose

**Prevention:**
- **WCAG AA contrast mandatory** - 4.5:1 for normal text, 3:1 for large text
- **Dark mode palette design** - don't invert colors, design separate palette
- **Accessibility testing** - test with screen readers, low-vision users
- **Light mode default** - dark mode is opt-in, never force it
- **Contrast checker in CI** - automated tools reject low-contrast PRs

**Warning signs:**
- Dark mode uses gray-on-gray aesthetics
- No accessibility audit planned
- Design system lacks contrast documentation
- "It looks fine to me" from sighted designers
- No testing with accessibility tools (axe, WAVE)

**Phase to address:**
Phase 2 (Design System) - Accessibility is non-negotiable foundation

---

### Pitfall 5: Touch Target Shrinkage in "Modern" Redesign

**What goes wrong:**
Redesign adopts modern SaaS aesthetics with smaller buttons, compact spacing, and dense information. Existing 56px buttons shrink to 40px. Site workers wearing gloves can't accurately tap targets. Fat-finger errors increase 10x.

**Why it happens:**
Design references modern web apps (Linear, Slack, Notion) used by office workers with mice, not field workers with gloves. "Gloves-on mode" requirements documented in CLAUDE.md get ignored or de-prioritized for aesthetic goals. No testing with actual work gloves.

**Consequences:**
- Mis-taps cause wrong expenses, wrong workers selected
- Managers abandon app in field, revert to paper
- Error rate increases, data quality suffers
- User frustration: "app is unusable with gloves"
- Violates Build-Easy's core value proposition

**Prevention:**
- **Non-negotiable touch targets** - 56px minimum for primary actions, 44px for all interactive elements
- **Glove testing mandatory** - every screen tested with construction gloves
- **Field testing** - test on actual construction sites with real users
- **"Gloves-on Mode" design token** - enforce in design system
- **Visual polish without shrinking** - use better spacing, hierarchy, not smaller targets

**Warning signs:**
- Design mockups show compact buttons < 44px
- "Modern SaaS" references ignore field use case
- No glove testing in user research plan
- Design team hasn't read CLAUDE.md requirements
- Accessibility/wearability de-prioritized for aesthetics

**Phase to address:**
Phase 2 (Design System) - Touch targets are non-negotiable requirement

---

### Pitfall 6: Design System Fragmentation During Migration

**What goes wrong:**
Redesign migrates to new design system incrementally, but old and new components coexist inconsistently. Some screens use new Button component, others use old. Colors, spacing, typography clash across app. Users see jarring inconsistencies - "why does this look different?"

**Why it happens:**
No clear migration strategy. Team builds new components but doesn't deprecate old ones. Feature work takes priority over paying down design debt. No "big bang" migration budget, so gradual migration never completes. Different developers use different component versions.

**Consequences:**
- App feels "half-redesigned" and unfinished
- User confusion: "is this a bug or intentional?"
- Development slows - which component do I use?
- Design system documentation gets out of sync
- Never truly "done" - perpetual migration state

**Prevention:**
- **Semantic versioning for design system** - breaking changes force migration
- **Migration sprints** - dedicated time to migrate entire screens
- **Deprecation warnings** - old components log console warnings
- **Component migration tracker** - which screens use which version
- **"Parallel components" anti-pattern** - never have Button/ButtonNew, migrate all at once

**Warning signs:**
- Component names with "New", "V2", "Updated" suffixes
- No migration plan or timeline
- Team says "we'll migrate gradually" without schedule
- Storybook shows old and new versions side-by-side
- Developers asking "which Button should I use?"

**Phase to address:**
Phase 3 (Implementation) - Design system migration before feature work

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| CSS-in-JS overrides for one-off designs | Fast prototype | Impossible to maintain, breaks design system | Never |
| Skipping accessibility audit for "just this screen" | Ship faster | Legal liability, user exclusion | Never |
| Hardcoded values instead of design tokens | Quick layout | Can't theme globally, dark mode breaks | Prototype only |
| Conditional rendering for "responsive" instead of CSS | Quick fix | Performance issues, hard to maintain | Never |
| Reusing old component with "just a few style overrides" | Avoid building new component | Design system inconsistency | Never |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Shadcn/UI | Copying components without customizing for touch targets | Fork components, enforce 44px+ targets |
| Tailwind v4 | Using hover: without @media (hover: hover) | Create touch-safe hover utilities |
| Next.js 15 | Forgetting params is a Promise in dynamic routes | Always `await params` first |
| Supabase Auth | Assuming client-side auth works in server components | Use async createClient() pattern |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Too many client components | Slow initial load, high JS bundle | Use Server Components by default | At 50+ client components |
| Missing image optimization | Slow receipt photo uploads | Use next/image for all images | At 1000+ receipts |
| No route prefetching | Slow navigation between projects | Use Link component properly | At 100+ projects |
| Client-side form validation only | Round-trip errors, poor UX | Validate on server AND client | At high latency connections |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Removing RLS during redesign | Data leaks between users | Never disable RLS, test with multiple users |
| Client-side only permission checks | Users can access others' data | Always verify on server, RLS as defense-in-depth |
| Exposing project IDs in sequential URLs | Users can guess others' projects | Use UUIDs, verify ownership via RLS |
| No rate limiting on OCR endpoint | API abuse, cost overrun | Implement rate limits per user |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Hamburger menu on desktop | Reduces discoverability, increases clicks | Visible navigation on desktop |
| Progressive disclosure hiding features | Power users can't find features | Keep critical features one-click accessible |
| Removing "boring" CRUD screens | Managers can't do their job | Boring screens are the product, don't hide them |
| Modal-heavy navigation | Breaks browser back button, mobile janky | Use page routing, not modals for main flows |
| Removing text labels for icons | Ambiguity, especially non-English users | Always pair icons with text labels |

## "Looks Done But Isn't" Checklist

- [ ] **Gloves-on testing**: Often done only with fingers — verify all flows work with actual work gloves
- [ ] **Dark mode contrast**: Often looks "fine" to sighted designers — verify with WCAG contrast checker and low-vision users
- [ ] **Touch device testing**: Often only tested in Chrome devtools — verify on actual iPads/Android tablets with touch
- [ ] **Field site testing**: Often tested in office — verify on actual construction sites with poor lighting
- [ ] **Korean language support**: Often tested in English only — verify all UI text fits Korean translations
- [ ] **Keyboard navigation**: Often only mouse/touch tested — verify full app works with Tab/Enter/Escape
- [ ] **Screen reader compatibility**: Often never tested — verify with NVDA/VoiceOver
- [ ] **Slow 3G connection**: Often tested on WiFi — verify OCR receipt upload works on cellular

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Radical UX overhaul | HIGH (rollback, redesign) | 1. Feature flag rollback 2. User journey audit 3. Gradual re-release 4. Power user beta testing |
| Hover state pollution | MEDIUM (CSS fixes) | 1. Add @media (hover: hover) 2. Test on touch devices 3. Remove hover from critical buttons |
| Hidden navigation | HIGH (re-architect) | 1. Navigation audit 2. Restore visible nav on desktop 3. Persistent action buttons on mobile 4. Tree test with users |
| Dark mode contrast | MEDIUM (palette) | 1. Contrast audit 2. Redesign dark palette 3. Accessibility testing 4. Make light mode default |
| Touch target shrinkage | MEDIUM (CSS fixes) | 1. Global min-height enforcement 2. Glove testing 3. Design token enforcement |
| Design system fragmentation | HIGH (rewrite) | 1. Component inventory 2. Migration sprint 3. Deprecate old components 4. Update docs |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Radical UX overhaul | Phase 1: Research (user journey audit) | No workflow changes without user testing |
| Hover state pollution | Phase 2: Design System (hover-free patterns) | All hover states in @media (hover: hover) |
| Hidden navigation | Phase 2: Design System (visible nav patterns) | Tree testing shows 100% feature findability |
| Dark mode contrast | Phase 2: Design System (accessibility tokens) | Automated contrast checker in CI |
| Touch target shrinkage | Phase 2: Design System (gloves-on tokens) | Glove testing required for all screens |
| Design system fragmentation | Phase 3: Implementation (migration strategy) | No parallel components, semantic versioning |

## Additional Build-Easy Specific Warnings

### Context Switching Between Office and Site

**Problem:** Office users (accountants, management) want dense data views. Site users (managers) want large touch targets. Redesign optimizes for one context, breaking the other.

**Prevention:**
- **Adaptive UI** - detect device and context, serve appropriate interface
- **User preferences** - let users choose "dense" vs "touch" mode regardless of device
- **Separate concerns** - office screens (reports, exports) vs site screens (data entry)
- **Test both contexts** - never design for just office or just site

### Korean Language Layout Issues

**Problem:** Design mocked up in English, Korean text breaks layouts. Korean words are often shorter than English, but can be longer for technical terms.

**Prevention:**
- **Korean-first design** - mock up in Korean first, English second
- **Flexible layouts** - use flex/grid, not fixed widths
- **Real translation testing** - use actual Korean UI text, not lorem ipsum
- **Font testing** - verify Korean fonts at all sizes (Noto Sans KR, etc.)

### Receipt OCR Workflow Disruption

**Problem:** Redesign changes photo capture flow (e.g., moves from direct camera to gallery selection). Site managers rely on rapid receipt scanning - any friction causes abandonment.

**Prevention:**
- **Preserve direct camera access** - `<input type="file" capture="environment">`
- **Minimize taps to submit** - photo → review → submit (3 taps max)
- **Offline-first testing** - verify works without reliable internet
- **Glove-friendly capture** - large capture button, not tiny icon

## Sources

### High Confidence (Official/Authoritative)
- [Nielsen Norman Group - Top 10 Enduring Web-Design Mistakes](https://www.nngroup.com/articles/top-10-enduring/)
- [Nielsen Norman Group - Touch Targets on Touchscreens](https://www.nngroup.com/articles/touch-target-size/)
- [Nielsen Norman Group - Hamburger Menu Icon Recognizability](https://www.nngroup.com/articles/hamburger-menu-icon-recognizability/)
- [Nielsen Norman Group - State of UX 2026](https://www.nngroup.com/articles/state-of-ux-2026/)
- [UXPin - Responsive Design for Touch Devices](https://www.uxpin.com/design-knowledge-base/responsive-design-for-touch-devices)
- [Raven SEO - Responsive Web Design Best Practices](https://raven-seo.com/responsive-web-design-best-practices/)
- [Zeroheight - Handling Breaking Changes in Design Systems](https://www.zeroheight.com/blog/handling-breaking-changes-in-a-design-system-without-causing-chaos/)

### Medium Confidence (Verified Community Sources)
- [Fast Company - Digg Redesigns, Loses More Than a Quarter of Audience](https://www.fastcompany.com/1690829/digg-redesigns-loses-more-quarter-audience/)
- [The Guardian - Digg Users Revolt After Redesign](https://www.theguardian.com/technology/pda/2010/aug/31/digg-redesign-revolt)
- [SitePoint - 3 Painfully Public Site Redesign Disasters](https://www.sitepoint.com/3-painfully-site-redesign-disasters/)
- [Adrian Roselli - Avoid the Hamburger Menu for Desktop Layouts](https://adrianroselli.com/2016/01/avoid-the-hamburger-menu-for-desktop-layouts.html)
- [UXPin - Component Versioning vs Design System Versioning](https://www.uxpin.com/studio/blog/component-versioning-vs-design-system-versioning/)
- [Netguru - Frontend Design Patterns That Actually Work in 2026](https://www.netguru.com/blog/frontend-design-patterns-that-actually-work-in-2026)
- [Altersquare - Field-First UX: Designing Cloud AEC Interfaces](https://www.altersquare.com/blog/field-first-ux-designing-cloud-aec-interfaces)

### Low Confidence (Single Sources - Verify Before Trusting)
- Various 2026 UX trend articles (general advice, not Build-Easy specific)
- Individual blog posts about redesign mistakes (anecdotal, not research-backed)
- Social media discussions about redesign backlash (unverified user reports)

---

*Pitfalls research for: UI/UX Visual Redesign & Adaptive Touch/Mouse Interfaces*
*Researched: 2026-01-29*
*Project: Build-Easy Visual Redesign*
