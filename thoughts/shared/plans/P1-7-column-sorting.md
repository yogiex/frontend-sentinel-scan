# P1-7: Column Sorting Implementation Plan

**Goal:** Add clickable column sorting to all table-based pages with support for severity, priority, and date sorting.

**Architecture:** Create a reusable `useSortableData` hook with 3-state cycle (none → asc → desc → none), special comparators for severity/priority/date fields, and clickable table headers with sort indicator icons (ArrowUpDown/ArrowUp/ArrowDown from lucide-react).

**Design:** This plan implements column sorting across 5 pages with a shared generic hook.

---

## Dependency Graph

```
Batch 1 (parallel): 1.1, 1.2, 1.3, 1.4 [foundation - no deps]
Batch 2 (parallel): 2.1, 2.2, 2.3, 2.4, 2.5 [page implementations - depends on batch 1]
```

---

## Batch 1: Foundation (parallel - 4 implementers)

All tasks in this batch have NO dependencies and run simultaneously.

### Task 1.1: Create Sort Utilities
**File:** `src/lib/sort-utils.ts`
**Test:** `src/lib/sort-utils.test.ts`
**Depends:** none

**Design Decision:** Creating standalone utility functions for severity/priority comparators and date parsing. These are imported by the hook and pages as needed. This keeps the hook generic and testable.

```typescript
// src/lib/sort-utils.ts
/**
 * SentinelScan Sort Utilities
 * Path: src/lib/sort-utils.ts
 *
 * Utility functions for special sorting cases:
 * - Severity ordering (critical > high > medium > low > info)
 * - Priority ordering (critical > high > medium > low)
 * - Date parsing for sorting
 */

/**
 * Severity sort order: lower number = higher severity
 */
export const SEVERITY_ORDER: Record<string, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
  info: 4,
};

/**
 * Priority sort order: lower number = higher priority
 */
export const PRIORITY_ORDER: Record<string, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

/**
 * Compare two severity values.
 * Returns negative if a < b (a is more severe), positive if a > b.
 */
export function compareSeverity(a: string, b: string): number {
  const orderA = SEVERITY_ORDER[a] ?? 99;
  const orderB = SEVERITY_ORDER[b] ?? 99;
  return orderA - orderB;
}

/**
 * Compare two priority values.
 * Returns negative if a < b (a is higher priority), positive if a > b.
 */
export function comparePriority(a: string, b: string): number {
  const orderA = PRIORITY_ORDER[a] ?? 99;
  const orderB = PRIORITY_ORDER[b] ?? 99;
  return orderA - orderB;
}

/**
 * Try to parse a value as a Date.
 * Returns Date object if valid, null otherwise.
 */
export function tryParseDate(value: unknown): Date | null {
  if (value instanceof Date) return value;
  if (typeof value !== 'string' && typeof value !== 'number') return null;

  const date = new Date(value);
  if (isNaN(date.getTime())) return null;
  return date;
}

/**
 * Default comparison function for generic values.
 * Handles: null/undefined, dates, strings, numbers.
 * Returns negative if a < b, positive if a > b, 0 if equal.
 */
export function defaultCompare(a: unknown, b: unknown): number {
  // Handle null/undefined
  if (a == null && b == null) return 0;
  if (a == null) return -1;
  if (b == null) return 1;

  // Try date parsing
  const aDate = tryParseDate(a);
  const bDate = tryParseDate(b);
  if (aDate && bDate) {
    return aDate.getTime() - bDate.getTime();
  }

  // String comparison
  if (typeof a === 'string' && typeof b === 'string') {
    return a.localeCompare(b);
  }

  // Numeric comparison
  if (typeof a === 'number' && typeof b === 'number') {
    return a - b;
  }

  // Fallback: convert to string
  return String(a).localeCompare(String(b));
}
```

```typescript
// src/lib/sort-utils.test.ts
/**
 * Tests for Sort Utilities
 * Path: src/lib/sort-utils.test.ts
 */
import { describe, it, expect } from 'vitest';
import { compareSeverity, comparePriority, tryParseDate, defaultCompare, SEVERITY_ORDER, PRIORITY_ORDER } from './sort-utils';

describe('compareSeverity', () => {
  it('should order critical before high', () => {
    expect(compareSeverity('critical', 'high')).toBeLessThan(0);
  });

  it('should order high before medium', () => {
    expect(compareSeverity('high', 'medium')).toBeLessThan(0);
  });

  it('should order medium before low', () => {
    expect(compareSeverity('medium', 'low')).toBeLessThan(0);
  });

  it('should order low before info', () => {
    expect(compareSeverity('low', 'info')).toBeLessThan(0);
  });

  it('should return 0 for same severity', () => {
    expect(compareSeverity('high', 'high')).toBe(0);
  });

  it('should handle unknown severity as lowest', () => {
    expect(compareSeverity('unknown' as any, 'critical')).toBeGreaterThan(0);
  });
});

describe('comparePriority', () => {
  it('should order critical before high', () => {
    expect(comparePriority('critical', 'high')).toBeLessThan(0);
  });

  it('should order high before medium', () => {
    expect(comparePriority('high', 'medium')).toBeLessThan(0);
  });

  it('should order medium before low', () => {
    expect(comparePriority('medium', 'low')).toBeLessThan(0);
  });

  it('should return 0 for same priority', () => {
    expect(comparePriority('low', 'low')).toBe(0);
  });
});

describe('tryParseDate', () => {
  it('should parse ISO date strings', () => {
    const result = tryParseDate('2026-05-01T10:00:00Z');
    expect(result).toBeInstanceOf(Date);
    expect(result?.getFullYear()).toBe(2026);
  });

  it('should parse simple date strings', () => {
    const result = tryParseDate('2026-05-01');
    expect(result).toBeInstanceOf(Date);
    expect(result?.getMonth()).toBe(4); // May = 4 (0-indexed)
  });

  it('should return null for invalid dates', () => {
    expect(tryParseDate('not a date')).toBeNull();
  });

  it('should return null for non-string/number values', () => {
    expect(tryParseDate(null)).toBeNull();
    expect(tryParseDate(undefined)).toBeNull();
    expect(tryParseDate({})).toBeNull();
  });
});

describe('defaultCompare', () => {
  it('should compare strings lexicographically', () => {
    expect(defaultCompare('apple', 'banana')).toBeLessThan(0);
    expect(defaultCompare('banana', 'apple')).toBeGreaterThan(0);
    expect(defaultCompare('apple', 'apple')).toBe(0);
  });

  it('should compare numbers numerically', () => {
    expect(defaultCompare(1, 2)).toBeLessThan(0);
    expect(defaultCompare(2, 1)).toBeGreaterThan(0);
    expect(defaultCompare(1, 1)).toBe(0);
  });

  it('should compare dates correctly', () => {
    const dateA = '2026-05-01';
    const dateB = '2026-05-02';
    expect(defaultCompare(dateA, dateB)).toBeLessThan(0);
    expect(defaultCompare(dateB, dateA)).toBeGreaterThan(0);
  });

  it('should handle null/undefined', () => {
    expect(defaultCompare(null, 'value')).toBeLessThan(0);
    expect(defaultCompare('value', null)).toBeGreaterThan(0);
    expect(defaultCompare(null, null)).toBe(0);
  });
});
```

**Verify:** `npx vitest run src/lib/sort-utils.test.ts`
**Commit:** `feat(sort): add sort utility functions for severity, priority, and date`

---

### Task 1.2: Create useSortableData Hook
**File:** `src/hooks/useSortableData.ts`
**Test:** `src/hooks/useSortableData.test.ts`
**Depends:** none

**Design Decision:** The hook manages sortConfig internally (uncontrolled component pattern). It accepts an options object with custom comparators for special fields. The 3-state cycle is: null (no sort) → asc → desc → null.

```typescript
// src/hooks/useSortableData.ts
/**
 * SentinelScan useSortableData Hook
 * Path: src/hooks/useSortableData.ts
 *
 * Reusable generic hook for client-side table sorting.
 * Features:
 * - 3-state cycle: none → asc → desc → none
 * - Custom comparators for special field types
 * - Default comparison for strings, numbers, dates
 * - Sort works on a copy (doesn't mutate original data)
 *
 * @example
 * const { sortedData, requestSort, sortConfig } = useSortableData(scans, {
 *   comparators: {
 *     severity: (a, b) => compareSeverity(a, b),
 *     priority: (a, b) => comparePriority(a, b),
 *   }
 * });
 */
import { useState, useMemo } from 'react';
import { defaultCompare } from '@/lib/sort-utils';

export type SortConfig<T> = {
  key: keyof T;
  direction: 'asc' | 'desc';
} | null;

export interface UseSortableDataOptions<T> {
  /**
   * Custom comparators for specific fields.
   * The comparator should return negative if a < b, positive if a > b, 0 if equal.
   */
  comparators?: Partial<Record<keyof T, (a: T[keyof T], b: T[keyof T]) => number>>;
}

export function useSortableData<T>(
  data: T[],
  options?: UseSortableDataOptions<T>
) {
  const [sortConfig, setSortConfig] = useState<SortConfig<T>>(null);

  /**
   * Request sorting for a key. Implements 3-state cycle:
   * null (no sort) → asc → desc → null
   */
  const requestSort = (key: keyof T) => {
    setSortConfig((prevConfig) => {
      // If clicking the same column
      if (prevConfig && prevConfig.key === key) {
        // Cycle: asc → desc → null
        if (prevConfig.direction === 'asc') {
          return { key, direction: 'desc' };
        }
        // desc → null (no sort)
        return null;
      }
      // New column → start with asc
      return { key, direction: 'asc' };
    });
  };

  /**
   * Sorted data (memoized).
   * Returns sorted copy of data, or original if no sort config.
   */
  const sortedData = useMemo(() => {
    if (!sortConfig) return data;

    const { key, direction } = sortConfig;
    const comparator = options?.comparators?.[key];

    const sorted = [...data].sort((a, b) => {
      let comparison: number;

      if (comparator) {
        // Use custom comparator
        comparison = comparator(a[key], b[key]);
      } else {
        // Use default comparison
        comparison = defaultCompare(a[key], b[key]);
      }

      // Apply direction
      return direction === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [data, sortConfig, options?.comparators]);

  return {
    sortedData,
    requestSort,
    sortConfig,
  };
}
```

```typescript
// src/hooks/useSortableData.test.ts
/**
 * Tests for useSortableData Hook
 * Path: src/hooks/useSortableData.test.ts
 */
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSortableData } from './useSortableData';
import { compareSeverity } from '@/lib/sort-utils';

interface TestItem {
  name: string;
  age: number;
  severity: string;
  date: string;
}

const mockData: TestItem[] = [
  { name: 'Charlie', age: 30, severity: 'low', date: '2026-05-03' },
  { name: 'Alice', age: 25, severity: 'critical', date: '2026-05-01' },
  { name: 'Bob', age: 35, severity: 'high', date: '2026-05-02' },
];

describe('useSortableData', () => {
  it('should return unsorted data when sortConfig is null', () => {
    const { result } = renderHook(() => useSortableData(mockData));
    expect(result.current.sortedData).toEqual(mockData);
    expect(result.current.sortConfig).toBeNull();
  });

  it('should sort ascending on first click', () => {
    const { result } = renderHook(() => useSortableData(mockData));

    act(() => {
      result.current.requestSort('name');
    });

    expect(result.current.sortConfig).toEqual({ key: 'name', direction: 'asc' });
    expect(result.current.sortedData.map(d => d.name)).toEqual(['Alice', 'Bob', 'Charlie']);
  });

  it('should sort descending on second click (same column)', () => {
    const { result } = renderHook(() => useSortableData(mockData));

    act(() => {
      result.current.requestSort('name'); // asc
    });
    act(() => {
      result.current.requestSort('name'); // desc
    });

    expect(result.current.sortConfig).toEqual({ key: 'name', direction: 'desc' });
    expect(result.current.sortedData.map(d => d.name)).toEqual(['Charlie', 'Bob', 'Alice']);
  });

  it('should clear sort on third click (3-state cycle)', () => {
    const { result } = renderHook(() => useSortableData(mockData));

    act(() => result.current.requestSort('name')); // asc
    act(() => result.current.requestSort('name')); // desc
    act(() => result.current.requestSort('name')); // null

    expect(result.current.sortConfig).toBeNull();
    expect(result.current.sortedData).toEqual(mockData); // back to unsorted
  });

  it('should switch to new column on click (different column)', () => {
    const { result } = renderHook(() => useSortableData(mockData));

    act(() => result.current.requestSort('name')); // sort by name asc
    expect(result.current.sortConfig?.key).toBe('name');

    act(() => result.current.requestSort('age')); // switch to age asc
    expect(result.current.sortConfig).toEqual({ key: 'age', direction: 'asc' });
    expect(result.current.sortedData.map(d => d.age)).toEqual([25, 30, 35]);
  });

  it('should use custom comparator for special fields', () => {
    const { result } = renderHook(() =>
      useSortableData(mockData, {
        comparators: {
          severity: (a, b) => compareSeverity(a as string, b as string),
        },
      })
    );

    act(() => {
      result.current.requestSort('severity');
    });

    // critical < high < low
    expect(result.current.sortedData.map(d => d.severity)).toEqual(['critical', 'high', 'low']);
  });

  it('should sort numbers correctly', () => {
    const { result } = renderHook(() => useSortableData(mockData));

    act(() => {
      result.current.requestSort('age');
    });

    expect(result.current.sortedData.map(d => d.age)).toEqual([25, 30, 35]);
  });

  it('should sort dates correctly using default comparison', () => {
    const { result } = renderHook(() => useSortableData(mockData));

    act(() => {
      result.current.requestSort('date');
    });

    expect(result.current.sortedData.map(d => d.date)).toEqual(['2026-05-01', '2026-05-02', '2026-05-03']);
  });
});
```

**Verify:** `npx vitest run src/hooks/useSortableData.test.ts`
**Commit:** `feat(sort): add useSortableData generic sorting hook`

---

### Task 1.3: Create SortableHeader Component
**File:** `src/components/ui/SortableHeader.tsx`
**Test:** `src/components/ui/SortableHeader.test.tsx`
**Depends:** none

**Design Decision:** Creating a reusable `SortableHeader` component that renders a clickable table header with sort indicator icons. This reduces duplication across pages. The component uses `ArrowUpDown` (muted), `ArrowUp` (primary), and `ArrowDown` (primary) icons from lucide-react.

```typescript
// src/components/ui/SortableHeader.tsx
/**
 * SentinelScan SortableHeader Component
 * Path: src/components/ui/SortableHeader.tsx
 *
 * Reusable table header component with sort indicators.
 * Shows:
 * - ArrowUpDown (muted) when not sorted
 * - ArrowUp (primary) when sorted ascending
 * - ArrowDown (primary) when sorted descending
 *
 * 3-state cycle on click: none → asc → desc → none
 */
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { type SortConfig } from '@/hooks/useSortableData';

interface SortableHeaderProps<T> {
  /** Column key (used for sorting) */
  columnKey: keyof T;
  /** Current sort config (from useSortableData) */
  sortConfig: SortConfig<T>;
  /** Function to call when header is clicked (from useSortableData.requestSort) */
  onSort: (key: keyof T) => void;
  /** Display label for the header */
  label: string;
  /** Additional CSS classes */
  className?: string;
}

export function SortableHeader<T>({
  columnKey,
  sortConfig,
  onSort,
  label,
  className = '',
}: SortableHeaderProps<T>) {
  const isSorted = sortConfig?.key === columnKey;
  const direction = sortConfig?.direction;

  // Determine icon and color
  const getIcon = () => {
    if (!isSorted) return <ArrowUpDown className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />;
    if (direction === 'asc') return <ArrowUp className="w-3.5 h-3.5" style={{ color: 'var(--primary)' }} />;
    return <ArrowDown className="w-3.5 h-3.5" style={{ color: 'var(--primary)' }} />;
  };

  return (
    <th
      className={`text-left py-3 px-4 font-medium cursor-pointer hover:bg-slate-50 transition-colors select-none ${className}`}
      style={{ color: 'var(--text-muted)' }}
      onClick={() => onSort(columnKey)}
    >
      <div className="flex items-center gap-2">
        <span>{label}</span>
        {getIcon()}
      </div>
    </th>
  );
}
```

```typescript
// src/components/ui/SortableHeader.test.tsx
/**
 * Tests for SortableHeader Component
 * Path: src/components/ui/SortableHeader.test.tsx
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SortableHeader } from './SortableHeader';
import { SortConfig } from '@/hooks/useSortableData';

interface TestData {
  name: string;
}

describe('SortableHeader', () => {
  it('should render label correctly', () => {
    const onSort = vi.fn();
    render(
      <table>
        <thead>
          <tr>
            <SortableHeader<TestData>
              columnKey="name"
              sortConfig={null}
              onSort={onSort}
              label="Name"
            />
          </tr>
        </thead>
      </table>
    );

    expect(screen.getByText('Name')).toBeInTheDocument();
  });

  it('should show ArrowUpDown icon when not sorted', () => {
    const onSort = vi.fn();
    render(
      <table>
        <thead>
          <tr>
            <SortableHeader<TestData>
              columnKey="name"
              sortConfig={null}
              onSort={onSort}
              label="Name"
            />
          </tr>
        </thead>
      </table>
    );

    // ArrowUpDown icon should be present (check for SVG)
    const header = screen.getByText('Name').closest('th');
    expect(header).toBeInTheDocument();
  });

  it('should call onSort when clicked', () => {
    const onSort = vi.fn();
    render(
      <table>
        <thead>
          <tr>
            <SortableHeader<TestData>
              columnKey="name"
              sortConfig={null}
              onSort={onSort}
              label="Name"
            />
          </tr>
        </thead>
      </table>
    );

    const header = screen.getByText('Name').closest('th')!;
    fireEvent.click(header);
    expect(onSort).toHaveBeenCalledWith('name');
  });

  it('should show ArrowUp icon when sorted ascending', () => {
    const onSort = vi.fn();
    const sortConfig: SortConfig<TestData> = { key: 'name', direction: 'asc' };
    render(
      <table>
        <thead>
          <tr>
            <SortableHeader<TestData>
              columnKey="name"
              sortConfig={sortConfig}
              onSort={onSort}
              label="Name"
            />
          </tr>
        </thead>
      </table>
    );

    const header = screen.getByText('Name').closest('th')!;
    expect(header).toBeInTheDocument();
  });

  it('should show ArrowDown icon when sorted descending', () => {
    const onSort = vi.fn();
    const sortConfig: SortConfig<TestData> = { key: 'name', direction: 'desc' };
    render(
      <table>
        <thead>
          <tr>
            <SortableHeader<TestData>
              columnKey="name"
              sortConfig={sortConfig}
              onSort={onSort}
              label="Name"
            />
          </tr>
        </thead>
      </table>
    );

    const header = screen.getByText('Name').closest('th')!;
    expect(header).toBeInTheDocument();
  });
});
```

**Verify:** `npx vitest run src/components/ui/SortableHeader.test.tsx`
**Commit:** `feat(sort): add SortableHeader component with sort indicators`

---

### Task 1.4: Create SortableHeaderSimple (Non-generic Version)
**File:** `src/components/ui/SortableHeaderSimple.tsx`
**Test:** none (simple wrapper)
**Depends:** none

**Design Decision:** The generic `SortableHeader<T>` requires specifying the type parameter `T` everywhere, which is verbose. Creating a simpler non-generic version that just accepts string keys for pages that don't want to specify types. However, after consideration, I'll skip this and just use the generic version directly since all pages have well-defined types.

Actually, let me reconsider. The `SortableHeader` component is generic, but when used in a page, the type `T` can be inferred from the props. So we don't need a "simple" version. Let me remove this task and update the plan.

**UPDATE:** Task 1.4 is removed. The generic `SortableHeader<T>` is sufficient.

---

## Batch 2: Page Implementations (parallel - 5 implementers)

All tasks in this batch depend on Batch 1 completing (useSortableData hook + SortableHeader component).

### Task 2.1: Add Sorting to AllScans.tsx
**File:** `src/pages/Dashboard/Scans/AllScans.tsx`
**Test:** `src/pages/Dashboard/Scans/AllScans.test.tsx` (update existing)
**Depends:** 1.2, 1.3

**Design Decision:** AllScans uses the `Scan` type from `scan-store.ts`. The columns are: Target, Status, Type, Findings, Severity, Duration, Date. Severity needs custom comparator. Date column uses `createdAt` field. Duration is displayed as formatted string but we'll sort by `createdAt` for the Date column.

Key changes:
1. Import `useSortableData`, `SortableHeader`, `compareSeverity`
2. Create sort config with custom comparator for `severity` (using `getSeverityFromFindings`)
3. Sort the `filteredScans` (after filtering, before rendering)
4. Replace static `<th>` elements with `<SortableHeader>` components

```typescript
// Key changes to src/pages/Dashboard/Scans/AllScans.tsx
// (showing only the modified/added parts)

import { useState, useEffect, useMemo } from 'react';  // Added useMemo
import { useSortableData, SortConfig } from '@/hooks/useSortableData';  // Added
import { SortableHeader } from '@/components/ui/SortableHeader';  // Added
import { compareSeverity } from '@/lib/sort-utils';  // Added

export function AllScans() {
  const navigate = useNavigate();
  const [scans, setScans] = useState<Scan[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'running' | 'completed' | 'failed'>('all');
  const [loading] = useState(false);

  // ... useEffect and other functions remain the same ...

  // Helper to get sortable severity value from scan
  const getSeverityValue = (scan: Scan): string => {
    return getSeverityFromFindings(scan); // returns 'critical' | 'high' | 'medium' | 'low' | 'info'
  };

  // Create a transformed array with pre-computed severity for sorting
  const scansWithSeverity = useMemo(() => {
    return filteredScans.map(scan => ({
      ...scan,
      _severity: getSeverityValue(scan),
    }));
  }, [filteredScans]);

  // Use sortable data hook
  const { sortedData: sortedScans, requestSort, sortConfig } = useSortableData(
    scansWithSeverity,
    {
      comparators: {
        _severity: (a, b) => compareSeverity(a as string, b as string),
      },
    }
  );

  // ... rest of the component

  // In the table header, replace static th elements with SortableHeader:
  // OLD:
  // <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--text-muted)' }}>Target</th>
  
  // NEW:
  // <SortableHeader columnKey="target" sortConfig={sortConfig} onSort={requestSort} label="Target" />
  // <SortableHeader columnKey="status" sortConfig={sortConfig} onSort={requestSort} label="Status" />
  // <SortableHeader columnKey="scanType" sortConfig={sortConfig} onSort={requestSort} label="Type" />
  // <SortableHeader columnKey="findings.length" sortConfig={sortConfig} onSort={requestSort} label="Findings" />
  // <SortableHeader columnKey="_severity" sortConfig={sortConfig} onSort={requestSort} label="Severity" />
  // <SortableHeader columnKey="createdAt" sortConfig={sortConfig} onSort={requestSort} label="Date" />

  // In the tbody, iterate over sortedScans instead of filteredScans
  // OLD: {filteredScans.map((scan) => (
  // NEW: {sortedScans.map((scan) => (
}
```

**Full modified file:**

```typescript
/**
 * SentinelScan All Scans Page
 * Path: src/pages/Dashboard/Scans/AllScans.tsx
 *
 * Displays all scans across the system with filtering and sorting.
 * Includes loading and empty states.
 */
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusChip } from '@/components/dashboard/StatusChip';
import { SeverityChip } from '@/components/dashboard/SeverityChip';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { EmptyState } from '@/components/ui/EmptyState';
import { Scan as ScanIcon } from 'lucide-react';
import { scanStore, type Scan } from '@/lib/scan-store';
import { useSortableData } from '@/hooks/useSortableData';
import { SortableHeader } from '@/components/ui/SortableHeader';
import { compareSeverity } from '@/lib/sort-utils';

export function AllScans() {
  const navigate = useNavigate();
  const [scans, setScans] = useState<Scan[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'running' | 'completed' | 'failed'>('all');
  const [loading] = useState(false);

  useEffect(() => {
    const loadScans = () => {
      const allScans = scanStore.getScans();
      setScans(allScans);
    };

    // Initial load
    loadScans();

    // Subscribe to store changes
    const unsubscribe = scanStore.subscribe(loadScans);

    return () => unsubscribe();
  }, []);

  const filteredScans = scans.filter((scan) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'running') return ['pending', 'queued', 'initializing', 'discovering', 'scanning', 'analyzing'].includes(scan.status);
    return scan.status === activeFilter;
  });

  const getSeverityFromFindings = (scan: Scan): string => {
    if (scan.findings.some(f => f.severity === 'critical')) return 'critical';
    if (scan.findings.some(f => f.severity === 'high')) return 'high';
    if (scan.findings.some(f => f.severity === 'medium')) return 'medium';
    if (scan.findings.some(f => f.severity === 'low')) return 'low';
    return 'info';
  };

  const formatDuration = (scan: Scan): string => {
    if (scan.duration) return scan.duration;
    if (scan.startedAt && scan.status !== 'completed') {
      const start = new Date(scan.startedAt).getTime();
      const now = Date.now();
      const diff = Math.floor((now - start) / 1000);
      return `${Math.floor(diff / 60)}m ${diff % 60}s`;
    }
    return '—';
  };

  // Transform scans with pre-computed severity for sorting
  const scansWithSeverity = useMemo(() => {
    return filteredScans.map(scan => ({
      ...scan,
      _severity: getSeverityFromFindings(scan),
      _findingsCount: scan.findings.length,
    }));
  }, [filteredScans]);

  // Use sortable data hook
  const { sortedData: sortedScans, requestSort, sortConfig } = useSortableData(
    scansWithSeverity,
    {
      comparators: {
        _severity: (a, b) => compareSeverity(a as string, b as string),
        _findingsCount: (a, b) => (a as number) - (b as number),
      },
    }
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>All Scans</h1>
          <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>View and manage all vulnerability scans</p>
        </div>
        <Button 
          className="text-white"
          style={{ backgroundColor: 'var(--primary)' }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(79, 70, 229, 0.9)' }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--primary)' }}
          onClick={() => navigate('/dashboard/scans/new')}
        >
          🔍 New Scan
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(['all', 'running', 'completed', 'failed'] as const).map((filter) => (
          <Button
            key={filter}
            variant={activeFilter === filter ? 'default' : 'outline'}
            size="sm"
            className={activeFilter === filter ? '' : 'border-slate-700 text-slate-300 hover:bg-slate-800'}
            onClick={() => setActiveFilter(filter)}
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
            {filter !== 'all' && (
              <span className="ml-2 px-1.5 py-0.5 rounded-full text-xs bg-slate-700">
                {filter === 'running' 
                  ? scans.filter(s => ['pending', 'queued', 'initializing', 'discovering', 'scanning', 'analyzing'].includes(s.status)).length
                  : scans.filter(s => s.status === filter).length
                }
              </span>
            )}
          </Button>
        ))}
      </div>

      {/* Loading State */}
      {loading && <SkeletonLoader rows={6} columns={7} />}

      {/* Empty State */}
      {!loading && filteredScans.length === 0 && (
        <EmptyState
          title="No scans found"
          description={`No scans match the "${activeFilter}" filter. Try a different filter or create a new scan.`}
          actionText="Create Scan"
          onAction={() => navigate('/dashboard/scans/new')}
          icon={<ScanIcon className="w-12 h-12" />}
        />
      )}

      {/* Scans Table */}
      {!loading && filteredScans.length > 0 && (
        <Card style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', border: '1px solid' }}>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <SortableHeader
                      columnKey="target"
                      sortConfig={sortConfig}
                      onSort={requestSort}
                      label="Target"
                    />
                    <SortableHeader
                      columnKey="status"
                      sortConfig={sortConfig}
                      onSort={requestSort}
                      label="Status"
                    />
                    <SortableHeader
                      columnKey="scanType"
                      sortConfig={sortConfig}
                      onSort={requestSort}
                      label="Type"
                    />
                    <SortableHeader
                      columnKey="_findingsCount"
                      sortConfig={sortConfig}
                      onSort={requestSort}
                      label="Findings"
                    />
                    <SortableHeader
                      columnKey="_severity"
                      sortConfig={sortConfig}
                      onSort={requestSort}
                      label="Severity"
                    />
                    <SortableHeader
                      columnKey="createdAt"
                      sortConfig={sortConfig}
                      onSort={requestSort}
                      label="Date"
                    />
                  </tr>
                </thead>
                <tbody>
                  {sortedScans.map((scan) => (
                    <tr 
                      key={scan.id} 
                      className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors cursor-pointer"
                      onClick={() => {
                        if (scan.status === 'completed' || scan.status === 'failed') {
                          navigate(`/dashboard/scans/${scan.id}`);
                        } else {
                          navigate(`/dashboard/scans/${scan.id}/progress`);
                        }
                      }}
                    >
                      <td className="py-3 px-4 font-mono text-white">{scan.target}</td>
                      <td className="py-3 px-4">
                        <StatusChip status={scan.status as any} />
                      </td>
                      <td className="py-3 px-4 text-slate-300">{scan.scanType}</td>
                      <td className="py-3 px-4">
                        <span className={scan.findings.length > 0 ? 'text-red-400 font-semibold' : 'text-slate-500'}>
                          {scan.findings.length}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <SeverityChip severity={getSeverityFromFindings(scan) as any} size="sm" />
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {new Date(scan.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

**Verify:** `npx vitest run src/pages/Dashboard/Scans/AllScans.test.tsx`
**Commit:** `feat(sort): add column sorting to AllScans page`

---

### Task 2.2: Add Sorting to MyScans.tsx
**File:** `src/pages/Dashboard/Scans/MyScans.tsx`
**Test:** none (uses mock data)
**Depends:** 1.2, 1.3

**Design Decision:** MyScans uses a simpler data structure with fields: target, status, vulnerabilities, severity, duration, date. Need to add sorting for all columns. Severity needs custom comparator. Date column uses `date` field.

```typescript
/**
 * SentinelScan My Scans Page
 * Path: src/pages/Dashboard/Scans/MyScans.tsx
 *
 * Displays scans owned by the current user.
 * Includes loading and empty states.
 */
import { useState, useMemo } from 'react';  // Added useMemo
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusChip } from '@/components/dashboard/StatusChip';
import { SeverityChip } from '@/components/dashboard/SeverityChip';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { EmptyState } from '@/components/ui/EmptyState';
import { Scan } from 'lucide-react';
import { useSortableData } from '@/hooks/useSortableData';  // Added
import { SortableHeader } from '@/components/ui/SortableHeader';  // Added
import { compareSeverity } from '@/lib/sort-utils';  // Added

// Mock data - only current user's scans
const myScans = [
  {
    id: '1',
    target: '192.168.1.0/24',
    status: 'completed',
    vulnerabilities: 23,
    severity: 'high',
    duration: '45 min',
    date: '2026-05-01',
  },
  {
    id: '2',
    target: 'example.com',
    status: 'running',
    vulnerabilities: 0,
    severity: 'medium',
    duration: '—',
    date: '2026-05-01',
  },
  {
    id: '4',
    target: 'api.example.com',
    status: 'failed',
    vulnerabilities: 0,
    severity: 'high',
    duration: '—',
    date: '2026-04-30',
  },
];

export function MyScans() {
  const navigate = useNavigate();
  const [loading] = useState(false);

  // Use sortable data hook
  const { sortedData: sortedScans, requestSort, sortConfig } = useSortableData(
    myScans,
    {
      comparators: {
        severity: (a, b) => compareSeverity(a as string, b as string),
        vulnerabilities: (a, b) => (a as number) - (b as number),
      },
    }
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
       <div className="flex items-center justify-between">
         <div>
           <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>My Scans</h1>
           <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>Scans created by you</p>
         </div>
         <Button 
           className="text-white"
           style={{ backgroundColor: 'var(--primary)' }}
           onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(79, 70, 229, 0.9)' }}
           onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--primary)' }}
           onClick={() => navigate('/dashboard/scans/new')}
         >
           🔍 New Scan
         </Button>
       </div>

      {/* Loading State */}
      {loading && <SkeletonLoader rows={4} columns={6} />}

      {/* Empty State */}
      {!loading && myScans.length === 0 && (
        <EmptyState
          title="No scans yet"
          description="You haven't created any scans. Start by creating your first vulnerability scan."
          actionText="Create Scan"
          onAction={() => navigate('/dashboard/scans/new')}
          icon={<Scan className="w-12 h-12" />}
        />
      )}

      {/* Stats Summary + Table */}
      {!loading && myScans.length > 0 && (
        <>
       {/* Stats Summary */}
        <div className="grid grid-cols-4 gap-4">
          <Card style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', border: '1px solid' }}>
            <CardContent className="p-4">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Total</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{myScans.length}</p>
            </CardContent>
          </Card>
          <Card style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', border: '1px solid' }}>
            <CardContent className="p-4">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Completed</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--success)' }}>
                {myScans.filter(s => s.status === 'completed').length}
              </p>
            </CardContent>
          </Card>
          <Card style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', border: '1px solid' }}>
            <CardContent className="p-4">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Running</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>
                {myScans.filter(s => s.status === 'running').length}
              </p>
            </CardContent>
          </Card>
          <Card style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', border: '1px solid' }}>
            <CardContent className="p-4">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Failed</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--danger)' }}>
                {myScans.filter(s => s.status === 'failed').length}
              </p>
            </CardContent>
          </Card>
        </div>

       {/* Scans Table */}
        <Card style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', border: '1px solid' }}>
          <CardHeader>
            <CardTitle style={{ color: 'var(--text-primary)' }}>Your Scans</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <SortableHeader
                      columnKey="target"
                      sortConfig={sortConfig}
                      onSort={requestSort}
                      label="Target"
                    />
                    <SortableHeader
                      columnKey="status"
                      sortConfig={sortConfig}
                      onSort={requestSort}
                      label="Status"
                    />
                    <SortableHeader
                      columnKey="vulnerabilities"
                      sortConfig={sortConfig}
                      onSort={requestSort}
                      label="Vulns"
                    />
                    <SortableHeader
                      columnKey="severity"
                      sortConfig={sortConfig}
                      onSort={requestSort}
                      label="Severity"
                    />
                    <SortableHeader
                      columnKey="duration"
                      sortConfig={sortConfig}
                      onSort={requestSort}
                      label="Duration"
                    />
                    <SortableHeader
                      columnKey="date"
                      sortConfig={sortConfig}
                      onSort={requestSort}
                      label="Date"
                    />
                  </tr>
                </thead>
                <tbody>
                  {sortedScans.map((scan) => (
                    <tr 
                      key={scan.id} 
                      style={{ borderBottom: '1px solid var(--border)' }}
                      className="transition-colors cursor-pointer"
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(79, 70, 229, 0.05)' }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                      onClick={() => navigate(`/dashboard/scans/${scan.id}`)}
                    >
                      <td className="py-3 px-4">
                        <span className="font-mono text-sm" style={{ color: 'var(--text-primary)' }}>{scan.target}</span>
                      </td>
                      <td className="py-3 px-4">
                        <StatusChip status={scan.status as any} size="sm" />
                      </td>
                      <td className="py-3 px-4 font-semibold" style={{ color: 'var(--text-primary)' }}>{scan.vulnerabilities}</td>
                      <td className="py-3 px-4">
                        <SeverityChip severity={scan.severity as any} size="sm" />
                      </td>
                      <td className="py-3 px-4" style={{ color: 'var(--text-secondary)' }}>{scan.duration}</td>
                      <td className="py-3 px-4" style={{ color: 'var(--text-secondary)' }}>{scan.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        </>
      )}
    </div>
  );
}
```

**Verify:** Manual testing in browser
**Commit:** `feat(sort): add column sorting to MyScans page`

---

### Task 2.3: Add Sorting to TrashScans.tsx
**File:** `src/pages/Dashboard/Scans/TrashScans.tsx`
**Test:** none (uses mock data)
**Depends:** 1.2, 1.3

**Design Decision:** TrashScans has columns: Target, Status, Vulns, Severity, Deleted By, Deleted At. Need sorting for all columns. Severity needs custom comparator. Date column uses `deletedAt` field.

```typescript
/**
 * SentinelScan Trash Scans Page
 * Path: src/pages/Dashboard/Scans/TrashScans.tsx
 *
 * Displays deleted scans that can be restored or permanently removed.
 * Includes loading and empty states.
 */
import { useState, useMemo } from 'react';  // Added useMemo
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { StatusChip } from '@/components/dashboard/StatusChip';
import { SeverityChip } from '@/components/dashboard/SeverityChip';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { EmptyState } from '@/components/ui/EmptyState';
import { Trash2 } from 'lucide-react';
import { useSortableData } from '@/hooks/useSortableData';  // Added
import { SortableHeader } from '@/components/ui/SortableHeader';  // Added
import { compareSeverity } from '@/lib/sort-utils';  // Added

// Mock data - deleted scans
const trashScans = [
  {
    id: '7',
    target: 'old-server.local',
    status: 'completed',
    vulnerabilities: 12,
    severity: 'medium',
    duration: '30 min',
    date: '2026-04-15',
    deletedAt: '2026-04-20',
    deletedBy: 'admin',
  },
  {
    id: '8',
    target: 'test.example.com',
    status: 'failed',
    vulnerabilities: 0,
    severity: 'low',
    duration: '—',
    date: '2026-04-10',
    deletedAt: '2026-04-18',
    deletedBy: 'user1',
  },
  {
    id: '9',
    target: 'legacy.internal',
    status: 'completed',
    vulnerabilities: 56,
    severity: 'critical',
    duration: '2h 15min',
    date: '2026-03-28',
    deletedAt: '2026-04-12',
    deletedBy: 'admin',
  },
];

export function TrashScans() {
  const [selectedScans, setSelectedScans] = useState<string[]>([]);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; scanIds: string[] }>({ open: false, scanIds: [] });
  const [loading] = useState(false);

  // Use sortable data hook
  const { sortedData: sortedScans, requestSort, sortConfig } = useSortableData(
    trashScans,
    {
      comparators: {
        severity: (a, b) => compareSeverity(a as string, b as string),
        vulnerabilities: (a, b) => (a as number) - (b as number),
      },
    }
  );

  const toggleSelect = (id: string) => {
    setSelectedScans(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedScans(selectedScans.length === trashScans.length ? [] : trashScans.map(s => s.id));
  };

  const handlePermanentDelete = (scanIds: string[]) => {
    setDeleteDialog({ open: true, scanIds });
  };

  const confirmPermanentDelete = () => {
    // TODO: Implement permanent delete logic
    console.log('Permanently delete scans:', deleteDialog.scanIds);
    setSelectedScans(prev => prev.filter(id => !deleteDialog.scanIds.includes(id)));
    setDeleteDialog({ open: false, scanIds: [] });
  };

  const handleEmptyTrash = () => {
    setDeleteDialog({ open: true, scanIds: trashScans.map(s => s.id) });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Trash</h1>
          <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>Deleted scans - will be permanently removed after 30 days</p>
        </div>
        <div className="flex gap-2">
          {selectedScans.length > 0 && (
            <>
              <Button
                variant="outline"
                className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
              >
                ↩️ Restore ({selectedScans.length})
              </Button>
              <Button
                variant="outline"
                className="border-red-600 text-red-600 hover:bg-red-50"
                onClick={() => handlePermanentDelete(selectedScans)}
              >
                🗑️ Delete Forever
              </Button>
            </>
          )}
          <Button
            variant="outline"
            style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
            onClick={handleEmptyTrash}
          >
            🗑️ Empty Trash
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {loading && <SkeletonLoader rows={4} columns={7} />}

      {/* Empty State */}
      {!loading && trashScans.length === 0 && (
        <EmptyState
          title="Trash is empty"
          description="No deleted scans. Scans you delete will appear here for 30 days."
          icon={<Trash2 className="w-12 h-12" />}
        />
      )}

      {/* Warning Banner + Table */}
      {!loading && trashScans.length > 0 && (
        <>
      {/* Warning Banner */}
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-700">
          ⚠️ Scans in trash will be permanently deleted after 30 days. Restore them before then if needed.
        </p>
      </div>

      {/* Trash Table */}
      <Card style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', border: '1px solid' }}>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle style={{ color: 'var(--text-primary)' }}>Deleted Scans ({trashScans.length})</CardTitle>
          <button
            onClick={selectAll}
            className="text-sm hover:opacity-80"
            style={{ color: 'var(--primary)' }}
          >
            {selectedScans.length === trashScans.length ? 'Deselect All' : 'Select All'}
          </button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th className="text-left py-3 px-4 w-10">
                    <input
                      type="checkbox"
                      checked={selectedScans.length === trashScans.length}
                      onChange={selectAll}
                      style={{ accentColor: 'var(--primary)' }}
                    />
                  </th>
                  <SortableHeader
                    columnKey="target"
                    sortConfig={sortConfig}
                    onSort={requestSort}
                    label="Target"
                  />
                  <SortableHeader
                    columnKey="status"
                    sortConfig={sortConfig}
                    onSort={requestSort}
                    label="Status"
                  />
                  <SortableHeader
                    columnKey="vulnerabilities"
                    sortConfig={sortConfig}
                    onSort={requestSort}
                    label="Vulns"
                  />
                  <SortableHeader
                    columnKey="severity"
                    sortConfig={sortConfig}
                    onSort={requestSort}
                    label="Severity"
                  />
                  <SortableHeader
                    columnKey="deletedBy"
                    sortConfig={sortConfig}
                    onSort={requestSort}
                    label="Deleted By"
                  />
                  <SortableHeader
                    columnKey="deletedAt"
                    sortConfig={sortConfig}
                    onSort={requestSort}
                    label="Deleted At"
                  />
                </tr>
              </thead>
              <tbody>
                {sortedScans.map((scan) => (
                  <tr
                    key={scan.id}
                    style={{ borderBottom: '1px solid var(--border)' }}
                    className="hover:bg-opacity-5 transition-colors"
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(79, 70, 229, 0.05)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                  >
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={selectedScans.includes(scan.id)}
                        onChange={() => toggleSelect(scan.id)}
                        style={{ accentColor: 'var(--primary)' }}
                      />
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-sm line-through" style={{ color: 'var(--text-primary)', opacity: 0.6 }}>
                        {scan.target}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <StatusChip status={scan.status as any} size="sm" />
                    </td>
                    <td className="py-3 px-4 font-semibold" style={{ color: 'var(--text-primary)' }}>{scan.vulnerabilities}</td>
                    <td className="py-3 px-4">
                      <SeverityChip severity={scan.severity as any} size="sm" />
                    </td>
                    <td className="py-3 px-4" style={{ color: 'var(--text-secondary)' }}>{scan.deletedBy}</td>
                    <td className="py-3 px-4" style={{ color: 'var(--text-secondary)' }}>{scan.deletedAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Permanent Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, scanIds: [] })}
        title="Permanently Delete Scans"
        description={
          deleteDialog.scanIds.length > 0
            ? `Are you sure you want to permanently delete ${deleteDialog.scanIds.length} scan(s)? This action cannot be undone.`
            : ''
        }
        confirmLabel="Delete Forever"
        variant="destructive"
        onConfirm={confirmPermanentDelete}
      />
      </>
      )}
    </div>
  );
}
```

**Verify:** Manual testing in browser
**Commit:** `feat(sort): add column sorting to TrashScans page`

---

### Task 2.4: Add Sorting to Users.tsx
**File:** `src/pages/Dashboard/Users/Users.tsx`
**Test:** none (uses mock data)
**Depends:** 1.2, 1.3

**Design Decision:** Users page has columns: User (name), Role, Status, SEC (security score), Comp (compliance), Activity (lastLogin). Need to add sorting for: Name, Role, Status, Last Login. The table currently shows User as a combined column with name + email, but we'll sort by the `name` field.

```typescript
// Key changes to src/pages/Dashboard/Users/Users.tsx
// (showing only the modified parts in the UserManagement component)

import { useState, useMemo } from 'react';  // Added useMemo
// ... other imports
import { useSortableData } from '@/hooks/useSortableData';  // Added
import { SortableHeader } from '@/components/ui/SortableHeader';  // Added

// In the UserManagement component:
export function UserManagement() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<Role | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Confirmation dialogs state
  const [suspendDialog, setSuspendDialog] = useState<{ open: boolean; user: User | null }>({ open: false, user: null });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; user: User | null }>({ open: false, user: null });
  
  // In real app, this would come from Redux store
  const users = MOCK_USERS;

  const filtered = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    const matchStatus = statusFilter === 'all' || u.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  // Use sortable data hook
  const { sortedData: sortedUsers, requestSort, sortConfig } = useSortableData(
    filtered,
    {
      comparators: {
        securityScore: (a, b) => (a as number) - (b as number),
      },
    }
  );

  // ... rest of the component

  // In the table header, replace static th elements with SortableHeader:
  // The columns to make sortable: User (name), Role, Status, Activity (lastLogin)
  // SEC and Comp are computed values, so we'll sort by securityScore and complianceStatus

  // Replace the thead section:
  /*
  <thead>
    <tr style={{ borderBottom: '2px solid var(--border)', backgroundColor: 'var(--bg-secondary)' }}>
      <SortableHeader<User>
        columnKey="name"
        sortConfig={sortConfig}
        onSort={requestSort}
        label="User"
      />
      <SortableHeader<User>
        columnKey="role"
        sortConfig={sortConfig}
        onSort={requestSort}
        label="Role"
      />
      <SortableHeader<User>
        columnKey="status"
        sortConfig={sortConfig}
        onSort={requestSort}
        label="Status"
      />
      <th className="text-left py-3 px-6 font-medium text-[0.65rem] font-mono uppercase tracking-wider text-slate-400">SEC</th>
      <th className="text-left py-3 px-6 font-medium text-[0.65rem] font-mono uppercase tracking-wider text-slate-400">Comp</th>
      <SortableHeader<User>
        columnKey="lastLogin"
        sortConfig={sortConfig}
        onSort={requestSort}
        label="Activity"
      />
      <th className="text-right py-3 px-6 font-medium text-[0.65rem] font-mono uppercase tracking-wider text-slate-400">Actions</th>
    </tr>
  </thead>
  */

  // In the tbody, iterate over sortedUsers instead of filtered
}
```

**Full modified file (key section - table rendering):**

```typescript
{/* Users Table */}
<Card style={{ 
  backgroundColor: 'var(--bg-card)', 
  borderColor: 'var(--border)', 
  border: '1px solid',
  borderRadius: '8px',
}}>
  <CardContent className="p-0">
    {sortedUsers.length === 0 ? (
      <div className="py-16 text-center animate-fade-in">
        <Users className="w-12 h-12 mx-auto mb-4 text-slate-300" />
        <p className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>No users found</p>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Try adjusting your search or filters</p>
      </div>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ 
              borderBottom: '2px solid var(--border)', 
              backgroundColor: 'var(--bg-secondary)',
            }}>
              <SortableHeader<User>
                columnKey="name"
                sortConfig={sortConfig}
                onSort={requestSort}
                label="User"
              />
              <SortableHeader<User>
                columnKey="role"
                sortConfig={sortConfig}
                onSort={requestSort}
                label="Role"
              />
              <SortableHeader<User>
                columnKey="status"
                sortConfig={sortConfig}
                onSort={requestSort}
                label="Status"
              />
              <th className="text-left py-3 px-6 font-medium text-[0.65rem] font-mono uppercase tracking-wider text-slate-400">SEC</th>
              <th className="text-left py-3 px-6 font-medium text-[0.65rem] font-mono uppercase tracking-wider text-slate-400">Comp</th>
              <SortableHeader<User>
                columnKey="lastLogin"
                sortConfig={sortConfig}
                onSort={requestSort}
                label="Activity"
              />
              <th className="text-right py-3 px-6 font-medium text-[0.65rem] font-mono uppercase tracking-wider text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedUsers.map((user) => (
              <tr
                key={user.id}
                style={{ borderBottom: '1px solid var(--border)' }}
                className="transition-colors hover:bg-slate-50"
              >
                {/* ... rest of the row content stays the same ... */}
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div 
                        className="w-9 h-9 rounded-md flex items-center justify-center font-bold shadow-sm"
                        style={{ 
                          background: 'linear-gradient(135deg, var(--primary), #4338ca)', 
                          color: '#fff',
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: '0.8rem',
                        }}
                      >
                        {user.avatar}
                      </div>
                      {user.twoFactor && (
                        <div 
                          className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-md flex items-center justify-center"
                          style={{ backgroundColor: '#10b981', borderColor: 'var(--bg-card)' }}
                        >
                          <CheckCircle className="w-2 h-2" style={{ color: '#fff' }} />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{user.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <p className="text-[0.7rem]" style={{ color: 'var(--text-secondary)' }}>{user.email}</p>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <RoleBadge role={user.role} />
                </td>
                <td className="py-4 px-6">
                  <StatusBadge status={user.status} />
                </td>
                <td className="py-4 px-6">
                  <SecurityScore score={user.securityScore} />
                </td>
                <td className="py-4 px-6">
                  <ComplianceBadge status={user.complianceStatus} />
                </td>
                <td className="py-4 px-6">
                  <div className="text-[0.7rem]" style={{ color: 'var(--text-secondary)' }}>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {user.lastLogin}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <Globe className="w-3 h-3 text-slate-400" />
                      {user.lastLoginIP}
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button 
                      className="p-1.5 border rounded-md transition-all hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50" 
                      style={{ 
                        color: 'var(--text-muted)', 
                        borderColor: 'transparent',
                      }} 
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      className="p-1.5 border rounded-md transition-all hover:text-red-600 hover:border-red-200 hover:bg-red-50" 
                      style={{ 
                        color: 'var(--text-muted)', 
                        borderColor: 'transparent',
                      }}
                      onClick={() => setSuspendDialog({ open: true, user })}
                    >
                      {user.status === 'active' ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                    </button>
                    <button 
                      className="p-1.5 border rounded-md transition-all hover:text-red-700 hover:border-red-300 hover:bg-red-50" 
                      style={{ 
                        color: 'var(--text-muted)', 
                        borderColor: 'transparent',
                      }}
                      onClick={() => setDeleteDialog({ open: true, user })}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </CardContent>
</Card>
```

**Verify:** Manual testing in browser
**Commit:** `feat(sort): add column sorting to Users page`

---

### Task 2.5: Refactor TicketTable to Use HTML Table with Sorting
**File:** `src/pages/Dashboard/Tickets/components/TicketTable.tsx`
**Test:** none
**Depends:** 1.2, 1.3

**Design Decision:** The current `TicketTable` uses `TicketCard` components, not an HTML table. Per requirements, the list view should have columns: ID, Title, Priority, Status, Due Date. Need to completely refactor `TicketTable` to use an HTML `<table>` element with `SortableHeader` components. The parent `TicketList.tsx` passes `tickets` to `TicketTable`, so sorting should happen in `TicketTable` using the hook.

```typescript
// src/pages/Dashboard/Tickets/components/TicketTable.tsx
/**
 * Ticket Table Component (List View)
 * Path: src/pages/Dashboard/Tickets/components/TicketTable.tsx
 *
 * Displays tickets in a table with sortable columns.
 * Columns: ID, Title, Priority, Status, Due Date
 */
import { useMemo } from 'react';
import { Ticket, TicketPriority } from '@/types/ticket';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSortableData } from '@/hooks/useSortableData';
import { SortableHeader } from '@/components/ui/SortableHeader';
import { comparePriority } from '@/lib/sort-utils';
import { PriorityBadge } from '@/components/dashboard/PriorityBadge';
import { StatusBadge } from '@/components/dashboard/StatusBadge';

interface TicketTableProps {
  tickets: Ticket[];
  onTicketClick?: (ticketId: string) => void;
}

export function TicketTable({ tickets, onTicketClick }: TicketTableProps) {
  // Use sortable data hook
  const { sortedData: sortedTickets, requestSort, sortConfig } = useSortableData(
    tickets,
    {
      comparators: {
        priority: (a, b) => comparePriority(a as string, b as string),
      },
    }
  );

  if (sortedTickets.length === 0) {
    return (
      <Card className="p-8 text-center" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <p className="font-mono" style={{ color: 'var(--text-secondary)' }}>
          NO TICKETS FOUND. CREATE ONE TO GET STARTED.
        </p>
      </Card>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr style={{ borderBottom: '2px solid var(--border)', backgroundColor: 'var(--bg-secondary)' }}>
            <SortableHeader<Ticket>
              columnKey="id"
              sortConfig={sortConfig}
              onSort={requestSort}
              label="ID"
            />
            <SortableHeader<Ticket>
              columnKey="title"
              sortConfig={sortConfig}
              onSort={requestSort}
              label="Title"
            />
            <SortableHeader<Ticket>
              columnKey="priority"
              sortConfig={sortConfig}
              onSort={requestSort}
              label="Priority"
            />
            <SortableHeader<Ticket>
              columnKey="status"
              sortConfig={sortConfig}
              onSort={requestSort}
              label="Status"
            />
            <SortableHeader<Ticket>
              columnKey="dueDate"
              sortConfig={sortConfig}
              onSort={requestSort}
              label="Due Date"
            />
          </tr>
        </thead>
        <tbody>
          {sortedTickets.map((ticket) => (
            <tr
              key={ticket.id}
              style={{ borderBottom: '1px solid var(--border)' }}
              className="transition-colors hover:bg-slate-50 cursor-pointer"
              onClick={() => onTicketClick?.(ticket.id)}
            >
              <td className="py-3 px-6 font-mono text-sm" style={{ color: 'var(--text-primary)' }}>
                {ticket.id}
              </td>
              <td className="py-3 px-6">
                <span className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{ticket.title}</span>
              </td>
              <td className="py-3 px-6">
                <PriorityBadge priority={ticket.priority} />
              </td>
              <td className="py-3 px-6">
                <StatusBadge status={ticket.status} />
              </td>
              <td className="py-3 px-6 text-sm" style={{ color: 'var(--text-secondary)' }}>
                {new Date(ticket.dueDate).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

**Note:** This assumes `PriorityBadge` and `StatusBadge` components exist. If they don't, we can use simple inline rendering or create minimal versions. Let me check if these components exist.

Actually, looking at the codebase, I don't see `PriorityBadge` or `StatusBadge` for tickets. Let me use inline rendering similar to other parts of the codebase, or use the existing `Badge` component from shadcn.

Let me update the TicketTable to use simple inline rendering for priority and status:

```typescript
// Updated TicketTable.tsx with inline rendering for priority and status

export function TicketTable({ tickets, onTicketClick }: TicketTableProps) {
  const { sortedData: sortedTickets, requestSort, sortConfig } = useSortableData(
    tickets,
    {
      comparators: {
        priority: (a, b) => comparePriority(a as string, b as string),
      },
    }
  );

  if (sortedTickets.length === 0) {
    return (
      <Card className="p-8 text-center" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <p className="font-mono" style={{ color: 'var(--text-secondary)' }}>
          NO TICKETS FOUND. CREATE ONE TO GET STARTED.
        </p>
      </Card>
    );
  }

  // Priority color map
  const priorityConfig: Record<TicketPriority, { color: string; bg: string }> = {
    critical: { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' },
    high: { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
    medium: { color: '#4f46e5', bg: 'rgba(79, 70, 229, 0.1)' },
    low: { color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
  };

  // Status color map
  const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
    open: { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', label: 'OPEN' },
    in_progress: { color: '#4f46e5', bg: 'rgba(79, 70, 229, 0.1)', label: 'IN PROGRESS' },
    fixed: { color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', label: 'FIXED' },
    verified: { color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', label: 'VERIFIED' },
    wont_fix: { color: '#64748b', bg: 'rgba(100, 116, 139, 0.1)', label: 'WONT FIX' },
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr style={{ borderBottom: '2px solid var(--border)', backgroundColor: 'var(--bg-secondary)' }}>
            <SortableHeader<Ticket>
              columnKey="id"
              sortConfig={sortConfig}
              onSort={requestSort}
              label="ID"
            />
            <SortableHeader<Ticket>
              columnKey="title"
              sortConfig={sortConfig}
              onSort={requestSort}
              label="Title"
            />
            <SortableHeader<Ticket>
              columnKey="priority"
              sortConfig={sortConfig}
              onSort={requestSort}
              label="Priority"
            />
            <SortableHeader<Ticket>
              columnKey="status"
              sortConfig={sortConfig}
              onSort={requestSort}
              label="Status"
            />
            <SortableHeader<Ticket>
              columnKey="dueDate"
              sortConfig={sortConfig}
              onSort={requestSort}
              label="Due Date"
            />
          </tr>
        </thead>
        <tbody>
          {sortedTickets.map((ticket) => {
            const prio = priorityConfig[ticket.priority];
            const stat = statusConfig[ticket.status] || statusConfig.open;
            
            return (
              <tr
                key={ticket.id}
                style={{ borderBottom: '1px solid var(--border)' }}
                className="transition-colors hover:bg-slate-50 cursor-pointer"
                onClick={() => onTicketClick?.(ticket.id)}
              >
                <td className="py-3 px-6 font-mono text-sm" style={{ color: 'var(--text-primary)' }}>
                  {ticket.id}
                </td>
                <td className="py-3 px-6">
                  <span className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{ticket.title}</span>
                </td>
                <td className="py-3 px-6">
                  <span
                    className="px-2 py-1 text-xs font-mono font-bold tracking-wider rounded"
                    style={{ backgroundColor: prio.bg, color: prio.color }}
                  >
                    {ticket.priority.toUpperCase()}
                  </span>
                </td>
                <td className="py-3 px-6">
                  <span
                    className="px-2 py-1 text-xs font-mono font-bold tracking-wider rounded"
                    style={{ backgroundColor: stat.bg, color: stat.color }}
                  >
                    {stat.label}
                  </span>
                </td>
                <td className="py-3 px-6 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {new Date(ticket.dueDate).toLocaleDateString()}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
```

**Verify:** Manual testing in browser - switch to list view and click column headers
**Commit:** `feat(sort): refactor TicketTable to use HTML table with column sorting`

---

## Verification Steps

After implementing all tasks, verify the following:

### 1. Hook Unit Tests
```bash
npx vitest run src/hooks/useSortableData.test.ts
npx vitest run src/lib/sort-utils.test.ts
```

### 2. SortableHeader Component Test
```bash
npx vitest run src/components/ui/SortableHeader.test.tsx
```

### 3. Build Check
```bash
npm run build
```

### 4. Manual Browser Testing

**AllScans Page:**
- [ ] Click "Target" header → sorts ascending (A to Z)
- [ ] Click "Target" again → sorts descending (Z to A)
- [ ] Click "Target" again → removes sort (back to default)
- [ ] Click "Severity" header → sorts by severity order (critical first)
- [ ] Click "Date" header → sorts by date (newest/oldest)
- [ ] Apply filter (e.g., "Running") → sort still works on filtered data
- [ ] Sort indicator icons show correctly (ArrowUpDown/ArrowUp/ArrowDown)

**MyScans Page:**
- [ ] All columns are sortable
- [ ] Severity sorts in correct order
- [ ] Date sorts correctly

**TrashScans Page:**
- [ ] All columns are sortable
- [ ] "Deleted At" date column sorts correctly
- [ ] Checkbox selection still works with sorting

**Users Page:**
- [ ] Name, Role, Status, Activity columns are sortable
- [ ] Last Login date sorts correctly

**TicketList Page (List View):**
- [ ] Switch to list view
- [ ] ID, Title, Priority, Status, Due Date columns are sortable
- [ ] Priority sorts in correct order (critical first)
- [ ] Due Date sorts correctly

### 5. Visual Checks
- [ ] Sort indicator icons are visible and correct color (primary for active, muted for inactive)
- [ ] Table headers have hover effect
- [ ] Cursor changes to pointer when hovering over sortable headers
- [ ] No console errors

---

## Summary

| Task | File | Description |
|------|------|-------------|
| 1.1 | `src/lib/sort-utils.ts` | Sort utility functions (severity, priority, date) |
| 1.2 | `src/hooks/useSortableData.ts` | Generic sorting hook with 3-state cycle |
| 1.3 | `src/components/ui/SortableHeader.tsx` | Reusable sortable header component |
| 2.1 | `src/pages/Dashboard/Scans/AllScans.tsx` | Add sorting to AllScans |
| 2.2 | `src/pages/Dashboard/Scans/MyScans.tsx` | Add sorting to MyScans |
| 2.3 | `src/pages/Dashboard/Scans/TrashScans.tsx` | Add sorting to TrashScans |
| 2.4 | `src/pages/Dashboard/Users/Users.tsx` | Add sorting to Users |
| 2.5 | `src/pages/Dashboard/Tickets/components/TicketTable.tsx` | Refactor to table + sorting |

**Total: 8 files created/modified, 3 test files**
