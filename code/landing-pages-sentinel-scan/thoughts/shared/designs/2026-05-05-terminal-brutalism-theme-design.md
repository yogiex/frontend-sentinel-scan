---
date: 2026-05-05
topic: "Terminal Brutalism Theme for Sentinel Scan Landing Page"
status: validated
---

# Terminal Brutalism Theme Design for Sentinel Scan Landing Page

## Problem Statement

The landing-pages-sentinel-scan project currently uses a standard modern design (gradients, rounded corners, shadows, Geist font) that doesn't align with the terminal brutalism aesthetic already implemented in the main frontend project. We need to apply the same terminal brutalism design language to create visual consistency and a distinctive hacker/terminal aesthetic.

## Constraints

- Must use Next.js 16 with Tailwind CSS v4 (already configured)
- Must maintain the existing section structure (Hero, Features, HowItWorks, etc.)
- Must be accessible (respect `prefers-reduced-motion`)
- Must work with current Tailwind config approach (not legacy)
- Cannot use `tailwind.config.ts` if Next.js version uses inline config

## Approach

**Chosen Approach: Direct CSS Variables + Tailwind v4 Theme Extension**

I'm applying the terminal brutalism theme by:
1. Importing JetBrains Mono font (matching frontend project)
2. Defining CSS custom properties in `:root` (same as frontend)
3. Forcing monospace font on all elements
4. Removing all transitions (`transition: none !important`)
5. Using sharp corners (`rounded-none` or default)
6. Adding terminal-specific animations (scanlines, cursor-blink)
7. Updating all components to use the new design tokens

### Alternative Considered
- **Tailwind v3 config approach:** Rejected because Next.js 16 uses Tailwind v4 with CSS-based config, not `tailwind.config.ts`

## Architecture

### Design System Structure

```
src/
├── app/
│   ├── globals.css          # Terminal brutalism theme (main file)
│   └── layout.tsx          # Font imports
├── components/
│   ├── sections/            # All sections updated to use brutalism
│   │   ├── Hero.tsx
│   │   ├── Features.tsx
│   │   ├── HowItWorks.tsx
│   │   ├── Testimonials.tsx
│   │   ├── Pricing.tsx
│   │   ├── FAQ.tsx
│   │   ├── CTA.tsx
│   │   └── Footer.tsx
│   └── ui/                 # UI components updated
│       ├── Button.tsx
│       ├── Card.tsx
│       └── Badge.tsx
```

### CSS Theme Architecture

The `globals.css` will contain:

1. **Font imports** - JetBrains Mono (400, 500, 700, 800)
2. **Tailwind v4 theme block** - `@theme { }` with CSS variables
3. **`:root` custom properties** - Same as frontend project
4. **Base styles** - Body, monospace forcing, selection colors
5. **Brutalist overrides** - No transitions, sharp corners
6. **Terminal animations** - Scanlines, cursor-blink, glitch, noise
7. **Custom scrollbar** - Brutalist style (8px wide, solid colors)

## Components

### Core Design Tokens

**Colors (from frontend project):**
```css
--bg-primary: #ffffff;
--bg-secondary: #f8fafc;
--bg-card: #ffffff;
--primary: #4f46e5;
--primary-dark: #4338ca;
--text-primary: #0f172a;
--text-secondary: #64748b;
--text-muted: #94a3b8;
--border: #e2e8f0;
--danger: #ef4444;
--warning: #f59e0b;
--success: #10b981;
--info: #3b82f6;
```

**Typography:**
- Font family: `'JetBrains Mono', ui-monospace, monospace`
- No font mixing - brutalist commits to one font

**Spacing & Radius:**
- Border radius: `0` (none) or use Tailwind default
- Spacing: Standard Tailwind scale

### Component Updates

**Button (`src/components/ui/Button.tsx`):**
- Remove `rounded-md`, use `rounded-none`
- Remove `transition-colors`, add `transition-none`
- Force monospace font
- Use CSS variables for colors

**Card (`src/components/ui/Card.tsx`):**
- Remove `rounded-lg`, use `rounded-none`
- Remove shadows, use `border-2 border-[var(--border)]`
- Solid backgrounds, no gradients

**Badge (`src/components/ui/Badge.tsx`):**
- Rectangular shape (no pill)
- Monospace text
- High contrast colors

**TerminalWindow Component (New):**
- Create `src/components/TerminalWindow.tsx` (adapted from frontend)
- Reusable terminal mockup for Hero/Features sections
- Scanlines overlay option
- Title bar with traffic lights

## Data Flow

Not applicable - this is a pure design/theme implementation with no data flow changes.

## Error Handling

Not applicable - this is a CSS/design implementation.

## Testing Strategy

1. **Visual Testing:**
   - Compare with frontend project's terminal brutalism
   - Check all sections render correctly
   - Verify monospace font applied everywhere
   - Confirm no transitions on interactive elements

2. **Accessibility:**
   - Test with `prefers-reduced-motion: reduce`
   - Verify color contrast ratios
   - Check focus indicators are visible

3. **Responsive:**
   - Test on mobile (320px+)
   - Test on tablet (768px+)
   - Test on desktop (1024px+)

## Open Questions

None - the design is clear and the source (frontend project) provides all needed reference implementations.
