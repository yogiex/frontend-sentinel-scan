# Top CVEs Cards Accessibility & Performance Fix - Implementation Plan

**Goal:** Refactor Top CVEs cards section with proper accessibility, CSS-only hover states, URL state sync, and performance improvements.

**Architecture:** Extract CVECard component with `<button>` element for accessibility, replace JS hover handlers with CSS-only Tailwind classes, add URL state synchronization using `useSearchParams`, and reuse existing `SeverityBadge` component.

**Design:** [2026-05-04-top-cves-cards-fix-design.md](../designs/2026-05-04-top-cves-cards-fix-design.md)

---

## Dependency Graph

```
Batch 1 (parallel): 1.1, 1.2 [foundation - no deps]
Batch 2 (parallel): 2.1 [depends on Batch 1]
Batch 3 (parallel): 3.1 [depends on Batch 2]
```

---

## Batch 1: Foundation (parallel - 2 implementers)

All tasks in this batch have NO dependencies and run simultaneously.

### Task 1.1: Extract SeverityBadge Component
**File:** `src/components/dashboard/SeverityBadge.tsx`
**Test:** `src/components/dashboard/SeverityBadge.test.tsx`
**Depends:** none

**Design Decision:** Design says "Reuse SeverityBadge component". The SeverityBadge is currently defined locally in Index.tsx (lines 100-113). I'm extracting it to its own file at `src/components/dashboard/SeverityBadge.tsx` following the existing pattern where dashboard components live in `src/components/dashboard/`.

```typescript
// src/components/dashboard/SeverityBadge.test.tsx
import { render, screen } from '@testing-library/react';
import { SeverityBadge } from './SeverityBadge';

describe('SeverityBadge', () => {
  it('renders critical severity correctly', () => {
    render(<SeverityBadge severity="critical" />);
    expect(screen.getByText('Critical')).toBeInTheDocument();
  });

  it('renders high severity correctly', () => {
    render(<SeverityBadge severity="high" />);
    expect(screen.getByText('High')).toBeInTheDocument();
  });

  it('renders medium severity correctly', () => {
    render(<SeverityBadge severity="medium" />);
    expect(screen.getByText('Medium')).toBeInTheDocument();
  });

  it('renders low severity correctly', () => {
    render(<SeverityBadge severity="low" />);
    expect(screen.getByText('Low')).toBeInTheDocument();
  });

  it('defaults to low severity for unknown values', () => {
    render(<SeverityBadge severity="unknown" />);
    expect(screen.getByText('Low')).toBeInTheDocument();
  });

  it('applies correct CSS variables for critical severity', () => {
    render(<SeverityBadge severity="critical" />);
    const badge = screen.getByText('Critical');
    expect(badge).toHaveStyle({ color: 'var(--danger)' });
  });
});
```

```typescript
// src/components/dashboard/SeverityBadge.tsx
import { Badge } from '@/components/ui/badge';

interface SeverityBadgeProps {
  severity: 'critical' | 'high' | 'medium' | 'low' | string;
}

const severityConfig: Record<string, { label: string; bg: string; text: string; border: string }> = {
  critical: { label: 'Critical', bg: 'rgba(239, 68, 68, 0.1)', text: 'var(--danger)', border: 'var(--danger)' },
  high: { label: 'High', bg: 'rgba(249, 115, 22, 0.1)', text: 'var(--warning)', border: 'var(--warning)' },
  medium: { label: 'Medium', bg: 'rgba(245, 158, 11, 0.1)', text: 'var(--warning)', border: 'var(--warning)' },
  low: { label: 'Low', bg: 'rgba(100, 116, 139, 0.1)', text: 'var(--text-secondary)', border: 'var(--border)' },
};

export function SeverityBadge({ severity }: SeverityBadgeProps) {
  const config = severityConfig[severity] ?? severityConfig.low;
  
  return (
    <Badge
      variant="outline"
      className="text-[10px] font-semibold uppercase tracking-wider"
      style={{
        backgroundColor: config.bg,
        color: config.text,
        borderColor: config.border,
      }}
    >
      {config.label}
    </Badge>
  );
}
```

**Verify:** `npx vitest run src/components/dashboard/SeverityBadge.test.tsx`
**Commit:** `feat(dashboard): extract SeverityBadge component to reusable file`

---

### Task 1.2: Add URL State Sync to Index.tsx
**File:** `src/pages/Dashboard/Index.tsx`
**Test:** none (modifying existing file - will be tested via E2E)
**Depends:** none

**Design Decision:** Design requires URL state sync using `useSearchParams` from react-router-dom. I'm adding this to Index.tsx in Batch 1 because it has no dependencies and can be done in parallel with Task 1.1. The `showAllCVEs` state will be read from `?cves=all` query param and updated using `setSearchParams` with `{ replace: true }`.

Changes to Index.tsx:
1. Add `useSearchParams` import from react-router-dom
2. Replace `useState(false)` for `showAllCVEs` with `useSearchParams` logic
3. Update the "View All" / "Show Less" button handler to update URL

```typescript
// Changes to src/pages/Dashboard/Index.tsx

// 1. Update import (line 9):
// FROM: import { useNavigate } from 'react-router-dom';
// TO:
import { useNavigate, useSearchParams } from 'react-router-dom';

// 2. Replace state and add search params (lines 140-141):
// FROM:
// const [showAllCVEs, setShowAllCVEs] = useState(false);
// const navigate = useNavigate();
// TO:
const [searchParams, setSearchParams] = useSearchParams();
const showAllCVEs = searchParams.get('cves') === 'all';
const navigate = useNavigate();

// 3. Update the "View All" / "Show Less" button handler (line 481):
// FROM:
// onClick={() => setShowAllCVEs(!showAllCVEs)}
// TO:
// onClick={() => {
//   const newParams = new URLSearchParams(searchParams);
//   if (showAllCVEs) {
//     newParams.delete('cves');
//   } else {
//     newParams.set('cves', 'all');
//   }
//   setSearchParams(newParams, { replace: true });
// }}
```

**Verify:** Manual test - navigate to `/dashboard?cves=all` and verify all CVEs are shown; click "Show Less" and verify URL updates.
**Commit:** `feat(dashboard): add URL state sync for showAllCVEs with useSearchParams`

---

## Batch 2: Core Component (parallel - 1 implementer)

This task depends on Batch 1 completing (specifically Task 1.1 for SeverityBadge).

### Task 2.1: Create CVECard Component
**File:** `src/components/CVECard.tsx`
**Test:** `src/components/CVECard.test.tsx`
**Depends:** 1.1 (SeverityBadge component)

**Design Decision:** Design requires extracting CVECard component with multiple fixes. I'm combining all CVECard-related tasks (user's tasks 1, 2, 3, 5, 6, 7, 9) into ONE file creation because they all modify the same file. The component will:
- Use `<button>` element for accessibility (not `<div>`)
- Include `role="button"` and `tabIndex={0}` for keyboard accessibility
- Use CSS-only hover states with `group-hover:` and `hover:` utilities
- Replace `transition-all` with explicit properties (`transition-transform`, `transition-width`, `transition-opacity`)
- Add `motion-safe:` prefix for reduced-motion compliance
- Add `line-clamp-2` to description, `tabular-nums` to CVSS score, `text-balance` to title
- Convert "View Details" to `<button>` element (not `<span>`)
- Reuse `SeverityBadge` component
- Add `touch-manipulation` class for touch-action

```typescript
// src/components/CVECard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { CVECard } from './CVECard';

const mockCVE = {
  cveId: 'CVE-2024-3094',
  severity: 'critical' as const,
  cvssScore: 10.0,
  affectedAssets: 23,
  description: 'XZ Utils backdoor in liblzma — remote code execution via SSH',
};

describe('CVECard', () => {
  it('renders CVE ID correctly', () => {
    render(<CVECard cve={mockCVE} />);
    expect(screen.getByText('CVE-2024-3094')).toBeInTheDocument();
  });

  it('renders severity badge', () => {
    render(<CVECard cve={mockCVE} />);
    expect(screen.getByText('Critical')).toBeInTheDocument();
  });

  it('renders CVSS score with tabular-nums', () => {
    render(<CVECard cve={mockCVE} />);
    const score = screen.getByText('10.0');
    expect(score).toHaveClass('tabular-nums');
  });

  it('renders description with line-clamp-2', () => {
    render(<CVECard cve={mockCVE} />);
    const description = screen.getByText(mockCVE.description);
    expect(description).toHaveClass('line-clamp-2');
  });

  it('renders affected assets count', () => {
    render(<CVECard cve={mockCVE} />);
    expect(screen.getByText('23 assets')).toBeInTheDocument();
  });

  it('uses button element for accessibility', () => {
    render(<CVECard cve={mockCVE} />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('has tabIndex={0} for keyboard accessibility', () => {
    render(<CVECard cve={mockCVE} />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('tabindex', '0');
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(<CVECard cve={mockCVE} onClick={onClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('calls onClick when Enter key is pressed', () => {
    const onClick = vi.fn();
    render(<CVECard cve={mockCVE} onClick={onClick} />);
    const button = screen.getByRole('button');
    fireEvent.keyDown(button, { key: 'Enter' });
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('calls onClick when Space key is pressed', () => {
    const onClick = vi.fn();
    render(<CVECard cve={mockCVE} onClick={onClick} />);
    const button = screen.getByRole('button');
    fireEvent.keyDown(button, { key: ' ' });
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('has touch-manipulation class', () => {
    render(<CVECard cve={mockCVE} />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('touch-manipulation');
  });

  it('has group class for CSS hover states', () => {
    render(<CVECard cve={mockCVE} />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('group');
  });

  it('uses transition-transform instead of transition-all', () => {
    render(<CVECard cve={mockCVE} />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('transition-transform');
    expect(button.className).not.toContain('transition-all');
  });

  it('renders View Details as button element', () => {
    render(<CVECard cve={mockCVE} />);
    const viewDetails = screen.getByText('View Details →');
    expect(viewDetails.tagName).toBe('BUTTON');
  });
});
```

```typescript
// src/components/CVECard.tsx
import { SeverityBadge } from '@/components/dashboard/SeverityBadge';

export interface CVECardProps {
  cve: {
    cveId: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    cvssScore: number;
    affectedAssets: number;
    description: string;
  };
  onClick?: () => void;
}

export function CVECard({ cve, onClick }: CVECardProps) {
  const isCritical = cve.severity === 'critical';
  const accentColor = isCritical ? 'var(--danger)' : 'var(--warning)';

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <button
      className="group relative overflow-hidden rounded-xl w-full text-left transition-transform duration-300 hover:translate-x-1 focus:outline-none focus:ring-2 focus:ring-offset-2 touch-manipulation"
      style={{ backgroundColor: 'transparent' }}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      onFocus={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
      }}
      onBlur={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      {/* Gradient accent bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl motion-safe:transition-width duration-300 group-hover:w-1.5"
        style={{ backgroundColor: accentColor, opacity: 0.8 }}
      />

      <div className="pl-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <SeverityBadge severity={cve.severity} />
              <span
                className="font-mono text-xs"
                style={{ color: accentColor, fontFamily: 'Share Tech Mono, monospace' }}
              >
                {cve.cveId}
              </span>
            </div>

            <p className="text-xs leading-relaxed mb-2 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
              {cve.description}
            </p>

            <div className="flex items-center gap-2 text-[10px]" style={{ color: 'var(--text-muted)' }}>
              <span className="flex items-center gap-1">
                <span className="w-1 h-1 rounded-full" style={{ backgroundColor: accentColor }} />
                {cve.affectedAssets} assets
              </span>
            </div>
          </div>

          {/* Large CVSS Score - focal point */}
          <div className="text-right flex-shrink-0">
            <div
              className="text-3xl font-bold leading-none tabular-nums"
              style={{
                color: accentColor,
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 700,
                textShadow: `0 2px 8px ${accentColor}20`,
              }}
            >
              {cve.cvssScore}
            </div>
            <div className="text-[9px] uppercase tracking-widest mt-1" style={{ color: 'var(--text-muted)', fontFamily: 'Outfit, sans-serif' }}>
              CVSS
            </div>
          </div>
        </div>

        <div className="mt-2 opacity-0 motion-safe:transition-opacity duration-300 group-hover:opacity-100">
          <button
            className="text-[10px] flex items-center gap-1 hover:underline"
            style={{ color: 'var(--primary)', fontFamily: 'Outfit, sans-serif' }}
            onClick={(e) => {
              e.stopPropagation();
              onClick?.();
            }}
          >
            View Details →
          </button>
        </div>
      </div>
    </button>
  );
}
```

**Verify:** `npx vitest run src/components/CVECard.test.tsx`
**Commit:** `feat(dashboard): add accessible CVECard component with CSS-only hover states`

---

## Batch 3: Integration (parallel - 1 implementer)

This task depends on Batch 2 completing (CVECard must exist).

### Task 3.1: Update Dashboard Index.tsx to Use CVECard
**File:** `src/pages/Dashboard/Index.tsx`
**Test:** none (integration tested via E2E)
**Depends:** 2.1 (CVECard component), 1.1 (SeverityBadge - for import), 1.2 (URL state sync - already done)

**Design Decision:** Now that CVECard component exists, I'm updating Index.tsx to:
1. Import `CVECard` component
2. Import `SeverityBadge` from the new location
3. Remove the old inline CVE card JSX (lines 491-572)
4. Update the map function to use `<CVECard>`
5. Pass `onClick` handler for navigation
6. Remove the local `SeverityBadge` function definition (lines 100-113)
7. Remove `onMouseEnter`/`onMouseLeave` handlers (no longer needed)
8. Fix "View Details" link (now handled by CVECard)
9. Add `text-balance` to CardTitle (line 480)

```typescript
// Changes to src/pages/Dashboard/Index.tsx

// 1. Update imports (add at top with other imports):
import { CVECard } from '@/components/CVECard';
import { SeverityBadge } from '@/components/dashboard/SeverityBadge';

// 2. Remove the local SeverityBadge function (lines 100-113) - DELETE these lines:
// function SeverityBadge({ severity }: { severity: string }) {
//   const map: Record<string, { label: string; bg: string; text: string; border: string }> = {
//     critical: { label: 'Critical', bg: 'rgba(239, 68, 68, 0.1)', text: 'var(--danger)', border: 'var(--danger)' },
//     high: { label: 'High', bg: 'rgba(249, 115, 22, 0.1)', text: 'var(--warning)', border: 'var(--warning)' },
//     medium: { label: 'Medium', bg: 'rgba(245, 158, 11, 0.1)', text: 'var(--warning)', border: 'var(--warning)' },
//     low: { label: 'Low', bg: 'rgba(100, 116, 139, 0.1)', text: 'var(--text-secondary)', border: 'var(--border)' },
//   };
//   const m = map[severity] ?? map.low;
//   return (
//     <Badge variant="outline" className="text-[10px] font-semibold uppercase tracking-wider" style={{ backgroundColor: m.bg, color: m.text, borderColor: m.border }}>
//       {m.label}
//     </Badge>
//   );
// }

// 3. Update CardTitle to add text-balance (line 480):
// FROM:
// <CardTitle className="text-base font-semibold" style={{ color: 'var(--text-primary)', fontFamily: 'Outfit, sans-serif' }}>Top CVEs</CardTitle>
// TO:
// <CardTitle className="text-base font-semibold text-balance" style={{ color: 'var(--text-primary)', fontFamily: 'Outfit, sans-serif' }}>Top CVEs</CardTitle>

// 4. Replace the entire CVE cards section (lines 486-574) with:
// FROM (lines 486-574):
// {(showAllCVEs ? topCVEs : topCVEs.slice(0, 3)).map((cve) => {
//   const isCritical = cve.severity === 'critical';
//   const accentColor = isCritical ? 'var(--danger)' : 'var(--warning)';
//   
//   return (
//     <div 
//       key={cve.cveId} 
//       className="group relative overflow-hidden rounded-xl transition-all duration-300 cursor-pointer"
//       style={{ 
//         backgroundColor: 'transparent',
//       }}
//       onMouseEnter={(e) => { 
//         e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'; 
//         e.currentTarget.style.transform = 'translateX(4px)';
//       }}
//       onMouseLeave={(e) => { 
//         e.currentTarget.style.backgroundColor = 'transparent'; 
//         e.currentTarget.style.transform = 'translateX(0)';
//       }}
//     >
//       {/* ... rest of old JSX ... */}
//     </div>
//   );
// })}
// TO:
{(showAllCVEs ? topCVEs : topCVEs.slice(0, 3)).map((cve) => (
  <CVECard
    key={cve.cveId}
    cve={cve}
    onClick={() => navigate(`/dashboard/cves/${cve.cveId}`)}
  />
))}
```

**Verify:** 
1. `npm run dev` and navigate to Dashboard
2. Verify CVE cards render correctly with new CVECard component
3. Test keyboard navigation (Tab, Enter, Space) on CVE cards
4. Test hover effects (CSS-only, no JS handlers)
5. Test URL state sync: navigate to `?cves=all` and verify all CVEs shown
6. Test "View Details" button navigates correctly
7. Test with `prefers-reduced-motion: reduce` in dev tools

**Commit:** `refactor(dashboard): use CVECard component in Index.tsx and remove old JSX`

---

## Summary

| Batch | Tasks | Files Created/Modified | Dependencies |
|-------|-------|------------------------|--------------|
| 1 | 1.1, 1.2 | `SeverityBadge.tsx`, `Index.tsx` | none |
| 2 | 2.1 | `CVECard.tsx` | Batch 1 (1.1) |
| 3 | 3.1 | `Index.tsx` | Batch 2 (2.1) |

**Total micro-tasks:** 4 (1.1, 1.2, 2.1, 3.1)
**Total files created:** 3 (`SeverityBadge.tsx`, `CVECard.tsx`, `SeverityBadge.test.tsx`, `CVECard.test.tsx`)
**Total files modified:** 1 (`Index.tsx`)

---

## Mapping to User's 9 Micro-Tasks

| User Task | Implementation Task | Status |
|-----------|---------------------|--------|
| 1. Extract CVECard component | Task 2.1 | ✅ Included |
| 2. Fix transition-all anti-pattern | Task 2.1 (CVECard), Task 3.1 (Index.tsx) | ✅ Included |
| 3. Convert to CSS-only hover states | Task 2.1 | ✅ Included |
| 4. Add URL state sync | Task 1.2 | ✅ Included |
| 5. Improve typography & overflow | Task 2.1 | ✅ Included |
| 6. Fix "View Details" link | Task 2.1 | ✅ Included |
| 7. Reuse SeverityBadge component | Task 1.1, Task 2.1, Task 3.1 | ✅ Included |
| 8. Update Dashboard Index.tsx | Task 3.1 | ✅ Included |
| 9. Add touch-action | Task 2.1 | ✅ Included |

All 9 user tasks are covered in the 4 implementation tasks above.
