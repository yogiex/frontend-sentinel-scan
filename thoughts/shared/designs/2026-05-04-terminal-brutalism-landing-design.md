---
date: 2026-05-04
topic: "Terminal Brutalism Landing Page Redesign"
status: validated
---

## Problem Statement

The SentinelScan landing page has a split personality — terminal brutalism elements are **defined but not activated**. The CSS variables, animations, and TerminalWindow component exist, but the actual implementation uses shadcn's default light theme (indigo primary, white background, Outfit font, rounded corners).

**Goal:** Fully commit to dark terminal brutalism for the landing page, creating a memorable hacker/cybersecurity aesthetic that matches the product's vulnerability scanning purpose.

## Constraints

- Must use existing shadcn/ui components (modify their source in `components/ui/`)
- Tailwind CSS v4 (CSS-first config via `@theme` block)
- Framer Motion available for React animations
- Must maintain accessibility (WCAG compliant, reduced-motion support)
- Landing page is `src/pages/Index/index.tsx` with 8 sections

## Approach

**Chosen approach:** Activate the dormant terminal brutalism by overhauling CSS variables and applying defined animations.

**Why this approach:**
- 80% of the code already exists (animations, colors, TerminalWindow component)
- No need to build from scratch — just unleash what's there
- Maintain shadcn components as the accessible base, layer brutalist styling on top

**Alternatives considered:**
- *Complete rewrite with custom components* — rejected because shadcn provides solid accessibility foundation
- *Hybrid light/dark mode toggle* — rejected because brutalism demands commitment, not options

## Architecture

**Single-page landing** with 8 sections flowing vertically:

```
Navbar (sticky, monospace, terminal green accents)
  ↓
HeroSection (scanlines overlay, glitch heading, TerminalWindow demo)
  ↓
GopherSection → REPLACED with terminal-style "Built with Go" ASCII/diagram
  ↓
StatsSection (raw numbers, no cards, monospace counters)
  ↓
FeaturesSection (border-only boxes, no shadows, harsh grid)
  ↓
CTASection (sharp corners, terminal green borders)
  ↓
FooterSection (dark, minimal, monospace links)
```

**Key design decision:** Monospace-only typography (remove Outfit font entirely). Terminal brutalism = one font family, used everywhere.

## Components

### Modified shadcn Components
- **Button** (`components/ui/button.tsx`) — `rounded-none`, border-2, no transitions
- **Card** (`components/ui/card.tsx`) — Remove shadows, use borders only
- **Badge** (`components/ui/badge.tsx`) — Monospace, sharp corners
- **Input** (if used) — `rounded-none`, terminal green focus ring

### Landing Page Sections (src/pages/Index/index.tsx)

| Section | Component | Brutalist Treatment |
|---------|-----------|---------------------|
| Navbar | Inline in Index | `rounded-none`, JetBrains Mono, terminal green active states |
| HeroSection | Inline | `bg-scanlines` overlay, `animate-glitch-1` on `<h1>`, TerminalWindow demo |
| TerminalWindow | Existing component | Keep as-is, it's already perfect |
| GopherSection | Inline | **REPLACE** with ASCII art or terminal diagram |
| StatsSection | Inline | Remove cards, raw `<div>` with `font-mono` numbers |
| FeaturesSection | Inline | `border-2` boxes in grid, no shadows, `rounded-none` |
| CTASection | Inline | Harsh borders, scanlines overlay |
| FooterSection | Inline | Minimal, monospace, dark bg |

### New/Custom Elements
- **ASCII art or terminal diagram** — Replace GopherSection
- **Scanlines overlay** — Reusable `<div className="bg-scanlines opacity-20" />`
- **Glitch text** — Apply `animate-glitch-1` to key headings

## Data Flow

Not applicable — this is a static landing page with no data fetching. Animations are CSS-only or Framer Motion for React components.

**Animation strategy:**
- **Page load:** Staggered `fadeIn` on sections (already defined in `index.css`)
- **Hero heading:** `animate-glitch-1` (already defined, not used)
- **Terminal cursor:** `animate-cursor-blink` (used sparingly)
- **Background atmosphere:** `bg-scanlines` + `bg-noise` as overlays
- **No hover transitions** — brutalist = instant or nothing

## Error Handling

**Reduced motion support:** Already handled in `index.css:200-207`:
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}
```

**No JavaScript errors expected** — this is a static page with CSS animations and minimal Framer Motion.

## Testing Strategy

- **Visual regression:** Compare before/after screenshots
- **Accessibility:** Run `yarn lint` and manual keyboard navigation
- **Reduced motion:** Test with OS setting enabled
- **Responsive:** Test mobile breakpoint (TerminalWindow hides on mobile anyway)

## Open Questions

None — the direction is clear and the code is mostly there. Execute.
