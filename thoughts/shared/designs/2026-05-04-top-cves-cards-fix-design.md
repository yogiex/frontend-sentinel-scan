---
date: 2026-05-04
topic: "Top CVEs Cards Accessibility & Performance Fix"
status: validated
---

## Problem Statement

The Top CVEs cards section in Dashboard/Index.tsx has multiple accessibility, performance, and UX issues:

1. **Inaccessible interactive elements** - CVE cards use `<div>` with `cursor-pointer` but lack proper ARIA roles, keyboard handlers
2. **`transition-all` anti-pattern** - Used multiple times, triggering expensive transitions on all properties
3. **JS-driven hover states** - Inline `onMouseEnter`/`onMouseLeave` handlers that should be CSS-only
4. **No URL state sync** - `showAllCVEs` state not reflected in URL query params
5. **Missing `prefers-reduced-motion`** - Animations play even when users prefer reduced motion
6. **Long description overflow** - CVE descriptions can break layout
7. **Missing `font-variant-numeric: tabular-nums`** - CVSS scores have inconsistent spacing
8. **Non-semantic "View Details"** - Uses `<span>` instead of `<a>` or `<button>`

## Constraints

- Must maintain existing visual design (gradient accent bar, hover effects, CVSS display)
- Use shadcn/ui Card component structure properly
- Follow Vercel React Best Practices (avoid `transition-all`, use `motion-safe:` prefix)
- Comply with Web Interface Guidelines (accessibility, focus states, semantic HTML)
- Keep changes scoped to Top CVEs section (lines 476-575)

## Approach

I'm refactoring the Top CVEs cards with these key changes:

**1. Extract `CVECard` Component**
- Convert from `<div>` to `<button>` element for accessibility
- Add `role="button"`, `tabIndex={0}`, keyboard handlers
- Move inline hover logic to CSS/Tailwind classes

**2. Fix `transition-all` Anti-Pattern**
- Replace `transition-all` with explicit properties:
  - `transition-transform` for translate effects
  - `transition-width` for accent bar width change
  - `transition-opacity` for "View Details" fade-in

**3. Use CSS-Only Hover States**
- Remove `onMouseEnter`/`onMouseLeave` JS handlers
- Use Tailwind `group-hover:` and `hover:` utilities
- Add `motion-safe:` prefix for reduced-motion compliance

**4. Add URL State Sync**
- Use `useSearchParams` from react-router-dom
- Sync `showAllCVEs` to `?cves=all` query param
- Allow deep-linking and browser back/forward

**5. Improve Typography & Overflow**
- Add `line-clamp-2` to CVE description
- Add `tabular-nums` class to CVSS score for consistent digit spacing
- Add `text-balance` to CardTitle

**6. Fix "View Details" Link**
- Convert `<span>` to `<a>` or `<button>` element
- Add proper href or onClick handler

**7. Reuse `SeverityBadge` Component**
- Replace manual severity span with existing `SeverityBadge` component
- Keep consistent styling across dashboard

## Architecture

```
Dashboard/Index.tsx
├── CVECard (new component)
│   ├── Button element (accessible)
│   ├── SeverityBadge (reused)
│   ├── Accent bar (CSS transition)
│   ├── CVE description (line-clamp)
│   ├── CVSS score (tabular-nums)
│   └── View Details link (semantic)
├── URL state sync (useSearchParams)
└── showAllCVEs logic (updated)
```

## Components

### CVECard Component

**Responsibilities:**
- Render individual CVE card with proper semantics
- Handle click/keyboard interactions
- Display severity badge, CVE ID, description, affected assets, CVSS score
- Provide hover effects via CSS (not JS)

**Props:**
```typescript
interface CVECardProps {
  cve: {
    cveId: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    cvssScore: number;
    affectedAssets: number;
    description: string;
  };
  onClick?: () => void;
}
```

### URL State Sync

**Implementation:**
- Use `useSearchParams` from react-router-dom
- Read initial state from `?cves=all` param
- Update URL when toggling "View All" / "Show Less"
- Use `replace: true` to avoid polluting browser history

## Data Flow

1. Component mounts → read URL param `?cves=all`
2. If param exists → set `showAllCVEs = true`
3. User clicks "View All" → update URL + state
4. User clicks CVE card → navigate to CVE detail page
5. User presses browser back → URL param removed → `showAllCVEs = false`

## Error Handling

- **Missing CVE data**: Render fallback UI (shouldn't happen with mock data, but good practice)
- **Invalid URL param**: Ignore and default to `showAllCVEs = false`
- **Navigation error**: Let react-router-dom handle (no special handling needed)

## Testing Strategy

- **Accessibility**: Verify CVE cards are keyboard navigable (Tab, Enter, Space)
- **Reduced motion**: Test with `prefers-reduced-motion: reduce` in dev tools
- **URL sync**: Test deep-linking with `?cves=all` param
- **Hover states**: Verify no JS errors, smooth CSS transitions
- **Description overflow**: Test with very long CVE descriptions

## Open Questions

1. **CVE detail page**: Should "View Details" link to existing page or create new one? (Assume existing for now)
2. **CVSS score formatting**: Should we display as `10.0` or `10.0` with fixed decimal? (Keep as-is, add `tabular-nums`)
3. **Animation duration**: Current `duration-300` - keep or adjust? (Keep for consistency)
