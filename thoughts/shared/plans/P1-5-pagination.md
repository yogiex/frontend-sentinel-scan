# P1-5: Pagination di Semua Tabel — Implementation Plan

**Goal:** Add client-side pagination to all 8 pages/tables across the SentinelScan dashboard using the existing shadcn/ui `Pagination` component.

**Architecture:** Each page file is self-contained with its own `currentPage` and `itemsPerPage` state. Pagination operates on filtered data (not raw data). Page resets to 1 when filter/search state changes. All pagination UI uses the existing `src/components/ui/pagination.tsx` component with CSS variable styling consistent with the Slate & Indigo design system.

**Design Decisions Made:**
- `itemsPerPage = 10` (default per requirement)
- No shared hook — each file manages its own pagination state (per requirement: "Each page file should be self-contained")
- Pagination slices `filteredData` (post-filter, post-search) not raw `data`
- Page auto-resets to 1 when filter/search state changes via `useEffect` or inline reset
- `TicketList.tsx` pagination is added to `TicketTable.tsx` (list view only, not kanban)
- `Templates.tsx` paginates the card grid
- `Reports.tsx` paginates the report card list
- `Dashboard/Index.tsx` paginates the `recentScans` table

---

## Dependency Graph

```
Batch 1 (parallel): 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8
  [All 8 files are independent — no cross-file dependencies]
```

All 8 tasks run in parallel in a single batch.

---

## Batch 1: All Pages (parallel — 8 implementers)

All tasks in this batch are independent and run simultaneously.

---

### Task 1.1: `Dashboard/Scans/AllScans.tsx` — Add Pagination

**File:** `src/pages/Dashboard/Scans/AllScans.tsx`
**Test:** `tests/pages/Dashboard/Scans/AllScans.pagination.test.tsx` (optional, manual verification sufficient for mock-data pages)
**Depends:** none

**What changes:**
- Add `currentPage` state (`useState<number>`)
- Add `ITEMS_PER_PAGE = 10` constant
- Compute `totalPages` from `filteredScans.length`
- Slice `filteredScans` into `paginatedScans` for rendering
- Render `<Pagination>` component below the table
- Reset `currentPage` to 1 when `activeFilter` changes (via `useEffect`)

**Code Pattern:**

```tsx
// In the component, add these states and computations:
const [currentPage, setCurrentPage] = useState(1);
const ITEMS_PER_PAGE = 10;

const totalPages = Math.ceil(filteredScans.length / ITEMS_PER_PAGE);
const paginatedScans = filteredScans.slice(
  (currentPage - 1) * ITEMS_PER_PAGE,
  currentPage * ITEMS_PER_PAGE
);

// Reset page when filter changes
useEffect(() => {
  setCurrentPage(1);
}, [activeFilter]);
```

**Pagination Rendering (add below the `</Card>` closing tag, before the outer `</div>`):**

```tsx
// Replace the tbody map from filteredScans to paginatedScans:
<tbody>
  {paginatedScans.map((scan) => (
    // ... existing row JSX (unchanged)
  ))}
</tbody>

// Then after the closing </CardContent> and </Card>, add:
{totalPages > 1 && (
  <div className="mt-4 flex justify-center">
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
          />
        </PaginationItem>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <PaginationItem key={page}>
            <PaginationLink
              onClick={() => setCurrentPage(page)}
              isActive={currentPage === page}
              className="cursor-pointer"
            >
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  </div>
)}
```

**Full replacement file:**

```tsx
/**
 * SentinelScan All Scans Page
 * Path: src/pages/Dashboard/Scans/AllScans.tsx
 *
 * Displays all scans across the system with filtering, sorting, and pagination.
 * Includes loading and empty states.
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusChip } from '@/components/dashboard/StatusChip';
import { SeverityChip } from '@/components/dashboard/SeverityChip';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { EmptyState } from '@/components/ui/EmptyState';
import { Scan as ScanIcon } from 'lucide-react';
import { scanStore, type Scan } from '@/lib/scan-store';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from '@/components/ui/pagination';

const ITEMS_PER_PAGE = 10;

export function AllScans() {
  const navigate = useNavigate();
  const [scans, setScans] = useState<Scan[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'running' | 'completed' | 'failed'>('all');
  const [loading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

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

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter]);

  const filteredScans = scans.filter((scan) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'running') return ['pending', 'queued', 'initializing', 'discovering', 'scanning', 'analyzing'].includes(scan.status);
    return scan.status === activeFilter;
  });

  const totalPages = Math.ceil(filteredScans.length / ITEMS_PER_PAGE);
  const paginatedScans = filteredScans.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

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
                    <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--text-muted)' }}>Target</th>
                    <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--text-muted)' }}>Status</th>
                    <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--text-muted)' }}>Type</th>
                    <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--text-muted)' }}>Findings</th>
                    <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--text-muted)' }}>Severity</th>
                    <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--text-muted)' }}>Duration</th>
                    <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--text-muted)' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedScans.map((scan) => (
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
                      <td className="py-3 px-4 text-slate-300">{formatDuration(scan)}</td>
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

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between text-sm" style={{ color: 'var(--text-muted)' }}>
          <span>
            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredScans.length)} of {filteredScans.length} scans
          </span>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    onClick={() => setCurrentPage(page)}
                    isActive={currentPage === page}
                    className="cursor-pointer"
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
```

**Verify:** `npm run dev` → Navigate to `/dashboard/scans/all` → Verify filter tabs reset page to 1 → Verify pagination appears when >10 scans → Click page numbers and Previous/Next.

**Commit:** `feat(scans): add pagination to AllScans page with filter-aware reset`

---

### Task 1.2: `Dashboard/Scans/MyScans.tsx` — Add Pagination

**File:** `src/pages/Dashboard/Scans/MyScans.tsx`
**Depends:** none

**What changes:**
- Add `currentPage` state
- Compute `totalPages` and `paginatedScans` from `myScans`
- Render `<Pagination>` below the table
- Note: `myScans` is only 3 items currently, so pagination won't show (needs >10 to display). The logic is forward-compatible for when the array grows.

**Code changes (add near top of component body):**

```tsx
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from '@/components/ui/pagination';

const ITEMS_PER_PAGE = 10;

// Inside component:
const [currentPage, setCurrentPage] = useState(1);

const totalPages = Math.ceil(myScans.length / ITEMS_PER_PAGE);
const paginatedScans = myScans.slice(
  (currentPage - 1) * ITEMS_PER_PAGE,
  currentPage * ITEMS_PER_PAGE
);
```

**Replace the tbody map from `myScans.map` to `paginatedScans.map`.**

**Add pagination below the `</Card>` of the table (before the closing `<>` fragment):**

```tsx
{/* Pagination */}
{totalPages > 1 && (
  <div className="mt-4 flex items-center justify-between text-sm" style={{ color: 'var(--text-muted)' }}>
    <span>
      Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, myScans.length)} of {myScans.length} scans
    </span>
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            className={currentPage === 1 ? 'pointer-events-none opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          />
        </PaginationItem>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <PaginationItem key={page}>
            <PaginationLink
              onClick={() => setCurrentPage(page)}
              isActive={currentPage === page}
              className="cursor-pointer"
            >
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            className={currentPage === totalPages ? 'pointer-events-none opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  </div>
)}
```

**Full replacement file:**

```tsx
/**
 * SentinelScan My Scans Page
 * Path: src/pages/Scans/MyScans.tsx
 *
 * Displays scans owned by the current user.
 * Includes loading, empty states, and pagination.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusChip } from '@/components/dashboard/StatusChip';
import { SeverityChip } from '@/components/dashboard/SeverityChip';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { EmptyState } from '@/components/ui/EmptyState';
import { Scan } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from '@/components/ui/pagination';

// Mock data - only current user's scans
const myScans = [
  { id: '1', target: '192.168.1.0/24', status: 'completed', vulnerabilities: 23, severity: 'high', duration: '45 min', date: '2026-05-01' },
  { id: '2', target: 'example.com', status: 'running', vulnerabilities: 0, severity: 'medium', duration: '—', date: '2026-05-01' },
  { id: '4', target: 'api.example.com', status: 'failed', vulnerabilities: 0, severity: 'high', duration: '—', date: '2026-04-30' },
];

const ITEMS_PER_PAGE = 10;

export function MyScans() {
  const navigate = useNavigate();
  const [loading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(myScans.length / ITEMS_PER_PAGE);
  const paginatedScans = myScans.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
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
                    <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--text-muted)' }}>Target</th>
                    <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--text-muted)' }}>Status</th>
                    <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--text-muted)' }}>Vulns</th>
                    <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--text-muted)' }}>Severity</th>
                    <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--text-muted)' }}>Duration</th>
                    <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--text-muted)' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedScans.map((scan) => (
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between text-sm" style={{ color: 'var(--text-muted)' }}>
            <span>
              Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, myScans.length)} of {myScans.length} scans
            </span>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => setCurrentPage(page)}
                      isActive={currentPage === page}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
        </>
      )}
    </div>
  );
}
```

**Verify:** `npm run dev` → Navigate to `/dashboard/scans/my` → Verify table renders → Pagination hidden (only 3 items, < 10).

**Commit:** `feat(scans): add pagination to MyScans page`

---

### Task 1.3: `Dashboard/Scans/TrashScans.tsx` — Add Pagination

**File:** `src/pages/Dashboard/Scans/TrashScans.tsx`
**Depends:** none

**What changes:**
- Add `currentPage` state
- Compute `totalPages` and `paginatedScans` from `trashScans`
- Render `<Pagination>` below the table
- Note: `trashScans` is only 3 items currently; pagination is forward-compatible.

**Full replacement file:**

```tsx
/**
 * SentinelScan Trash Scans Page
 * Path: src/pages/Scans/TrashScans.tsx
 *
 * Displays deleted scans that can be restored or permanently removed.
 * Includes loading, empty states, and pagination.
 */
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { StatusChip } from '@/components/dashboard/StatusChip';
import { SeverityChip } from '@/components/dashboard/SeverityChip';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { EmptyState } from '@/components/ui/EmptyState';
import { Trash2 } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from '@/components/ui/pagination';

// Mock data - deleted scans
const trashScans = [
  { id: '7', target: 'old-server.local', status: 'completed', vulnerabilities: 12, severity: 'medium', duration: '30 min', date: '2026-04-15', deletedAt: '2026-04-20', deletedBy: 'admin' },
  { id: '8', target: 'test.example.com', status: 'failed', vulnerabilities: 0, severity: 'low', duration: '—', date: '2026-04-10', deletedAt: '2026-04-18', deletedBy: 'user1' },
  { id: '9', target: 'legacy.internal', status: 'completed', vulnerabilities: 56, severity: 'critical', duration: '2h 15min', date: '2026-03-28', deletedAt: '2026-04-12', deletedBy: 'admin' },
];

const ITEMS_PER_PAGE = 10;

export function TrashScans() {
  const [selectedScans, setSelectedScans] = useState<string[]>([]);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; scanIds: string[] }>({ open: false, scanIds: [] });
  const [loading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(trashScans.length / ITEMS_PER_PAGE);
  const paginatedScans = trashScans.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
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
              <Button variant="outline" className="border-emerald-600 text-emerald-600 hover:bg-emerald-50">
                ↩️ Restore ({selectedScans.length})
              </Button>
              <Button variant="outline" className="border-red-600 text-red-600 hover:bg-red-50" onClick={() => handlePermanentDelete(selectedScans)}>
                🗑️ Delete Forever
              </Button>
            </>
          )}
          <Button variant="outline" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }} onClick={handleEmptyTrash}>
            🗑️ Empty Trash
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {loading && <SkeletonLoader rows={4} columns={7} />}

      {/* Empty State */}
      {!loading && trashScans.length === 0 && (
        <EmptyState title="Trash is empty" description="No deleted scans. Scans you delete will appear here for 30 days." icon={<Trash2 className="w-12 h-12" />} />
      )}

      {/* Warning Banner + Table */}
      {!loading && trashScans.length > 0 && (
        <>
       {/* Warning Banner */}
       <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
         <p className="text-sm text-yellow-700">⚠️ Scans in trash will be permanently deleted after 30 days. Restore them before then if needed.</p>
       </div>

       {/* Trash Table */}
       <Card style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', border: '1px solid' }}>
         <CardHeader className="flex flex-row items-center justify-between">
           <CardTitle style={{ color: 'var(--text-primary)' }}>Deleted Scans ({trashScans.length})</CardTitle>
           <button onClick={selectAll} className="text-sm hover:opacity-80" style={{ color: 'var(--primary)' }}>
             {selectedScans.length === trashScans.length ? 'Deselect All' : 'Select All'}
           </button>
         </CardHeader>
         <CardContent className="p-0">
           <div className="overflow-x-auto">
             <table className="w-full text-sm">
               <thead>
                 <tr style={{ borderBottom: '1px solid var(--border)' }}>
                   <th className="text-left py-3 px-4 w-10">
                     <input type="checkbox" checked={selectedScans.length === trashScans.length} onChange={selectAll} style={{ accentColor: 'var(--primary)' }} />
                   </th>
                   <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--text-muted)' }}>Target</th>
                   <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--text-muted)' }}>Status</th>
                   <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--text-muted)' }}>Vulns</th>
                   <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--text-muted)' }}>Severity</th>
                   <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--text-muted)' }}>Deleted By</th>
                   <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--text-muted)' }}>Deleted At</th>
                 </tr>
               </thead>
               <tbody>
                 {paginatedScans.map((scan) => (
                   <tr key={scan.id} style={{ borderBottom: '1px solid var(--border)' }} className="hover:bg-opacity-5 transition-colors"
                     onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(79, 70, 229, 0.05)' }}
                     onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                   >
                     <td className="py-3 px-4">
                       <input type="checkbox" checked={selectedScans.includes(scan.id)} onChange={() => toggleSelect(scan.id)} style={{ accentColor: 'var(--primary)' }} />
                     </td>
                     <td className="py-3 px-4">
                       <span className="font-mono text-sm line-through" style={{ color: 'var(--text-primary)', opacity: 0.6 }}>{scan.target}</span>
                     </td>
                     <td className="py-3 px-4"><StatusChip status={scan.status as any} size="sm" /></td>
                     <td className="py-3 px-4 font-semibold" style={{ color: 'var(--text-primary)' }}>{scan.vulnerabilities}</td>
                     <td className="py-3 px-4"><SeverityChip severity={scan.severity as any} size="sm" /></td>
                     <td className="py-3 px-4" style={{ color: 'var(--text-secondary)' }}>{scan.deletedBy}</td>
                     <td className="py-3 px-4" style={{ color: 'var(--text-secondary)' }}>{scan.deletedAt}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
         </CardContent>
       </Card>

       {/* Pagination */}
       {totalPages > 1 && (
         <div className="mt-4 flex items-center justify-between text-sm" style={{ color: 'var(--text-muted)' }}>
           <span>
             Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, trashScans.length)} of {trashScans.length} scans
           </span>
           <Pagination>
             <PaginationContent>
               <PaginationItem>
                 <PaginationPrevious
                   onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                   className={currentPage === 1 ? 'pointer-events-none opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                 />
               </PaginationItem>
               {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                 <PaginationItem key={page}>
                   <PaginationLink onClick={() => setCurrentPage(page)} isActive={currentPage === page} className="cursor-pointer">
                     {page}
                   </PaginationLink>
                 </PaginationItem>
               ))}
               <PaginationItem>
                 <PaginationNext
                   onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                   className={currentPage === totalPages ? 'pointer-events-none opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                 />
               </PaginationItem>
             </PaginationContent>
           </Pagination>
         </div>
       )}
       </>

       {/* Permanent Delete Confirmation Dialog */}
       <ConfirmDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, scanIds: [] })}
         title="Permanently Delete Scans" description={deleteDialog.scanIds.length > 0 ? `Are you sure you want to permanently delete ${deleteDialog.scanIds.length} scan(s)? This action cannot be undone.` : ''}
         confirmLabel="Delete Forever" variant="destructive" onConfirm={confirmPermanentDelete} />
       </>
      )}
    </div>
  );
}
```

**Verify:** `npm run dev` → Navigate to `/dashboard/scans/trash` → Verify table renders → Pagination hidden (3 items < 10).

**Commit:** `feat(scans): add pagination to TrashScans page`

---

### Task 1.4: `Dashboard/Users/Users.tsx` — Add Pagination

**File:** `src/pages/Dashboard/Users/Users.tsx`
**Depends:** none

**What changes:**
- Add `currentPage` state
- Compute `totalPages` and `paginatedUsers` from `filtered` (post-filter)
- Render `<Pagination>` below the table
- Reset `currentPage` to 1 when `search`, `roleFilter`, or `statusFilter` changes

**Key addition — reset on filter change:**

```tsx
// Reset page when filters change
useEffect(() => {
  setCurrentPage(1);
}, [search, roleFilter, statusFilter]);
```

**Full replacement for the component body (from `export function UserManagement() {` onwards):**

Add imports at top:
```tsx
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from '@/components/ui/pagination';
```

Add inside the component, after the filter state declarations:
```tsx
const [currentPage, setCurrentPage] = useState(1);
const ITEMS_PER_PAGE = 10;

// Reset page when filters change
useEffect(() => {
  setCurrentPage(1);
}, [search, roleFilter, statusFilter]);

const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
const paginatedUsers = filtered.slice(
  (currentPage - 1) * ITEMS_PER_PAGE,
  currentPage * ITEMS_PER_PAGE
);
```

Replace `{filtered.map((user) => (` with `{paginatedUsers.map((user) => (` in the tbody.

Add pagination block after the `</Card>` of the Users Table (before Quick Actions):

```tsx
{/* Pagination */}
{totalPages > 1 && (
  <div className="mt-4 flex items-center justify-between text-sm" style={{ color: 'var(--text-muted)' }}>
    <span>
      Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} users
    </span>
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            className={currentPage === 1 ? 'pointer-events-none opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          />
        </PaginationItem>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <PaginationItem key={page}>
            <PaginationLink onClick={() => setCurrentPage(page)} isActive={currentPage === page} className="cursor-pointer">
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            className={currentPage === totalPages ? 'pointer-events-none opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  </div>
)}
```

Also update the "Showing X of Y users" text at the bottom to reflect paginated view:
```tsx
<p className="text-[0.7rem] text-slate-400">
  Showing {Math.min(filtered.length, ITEMS_PER_PAGE)} of {filtered.length} users (page {currentPage} of {totalPages})
</p>
```

**Verify:** `npm run dev` → Navigate to `/dashboard/users` → Search/filter resets page to 1 → Pagination appears when >10 users in mock data (currently 5 users, so hidden — forward compatible).

**Commit:** `feat(users): add pagination to UserManagement page with filter-aware reset`

---

### Task 1.5: `Dashboard/Templates/Templates.tsx` — Add Pagination

**File:** `src/pages/Dashboard/Templates/Templates.tsx`
**Depends:** none

**What changes:**
- Add `currentPage` state
- Compute `totalPages` and `paginatedTemplates` from `filtered` (post-filter, post-search)
- Render `<Pagination>` below the card grid
- Reset `currentPage` to 1 when `filter`, `scanTypeFilter`, `profileFilter`, `showFavorites`, or `search` changes

**Add imports:**

```tsx
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from '@/components/ui/pagination';
```

**Add inside component:**

```tsx
const [currentPage, setCurrentPage] = useState(1);
const ITEMS_PER_PAGE = 10;

// Reset page when filters change
useEffect(() => {
  setCurrentPage(1);
}, [filter, scanTypeFilter, profileFilter, showFavorites, search]);

const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
const paginatedTemplates = filtered.slice(
  (currentPage - 1) * ITEMS_PER_PAGE,
  currentPage * ITEMS_PER_PAGE
);
```

**Replace `{filtered.map((template, index) => {` with `{paginatedTemplates.map((template, index) => {`**

**Add pagination after the closing `</div>` of the template cards grid (before the Create/Edit Modal):**

```tsx
{/* Pagination */}
{totalPages > 1 && (
  <div className="flex items-center justify-between text-sm" style={{ color: 'var(--text-muted)' }}>
    <span>
      Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} templates
    </span>
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            className={currentPage === 1 ? 'pointer-events-none opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          />
        </PaginationItem>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <PaginationItem key={page}>
            <PaginationLink onClick={() => setCurrentPage(page)} isActive={currentPage === page} className="cursor-pointer">
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            className={currentPage === totalPages ? 'pointer-events-none opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  </div>
)}
```

**Verify:** `npm run dev` → Navigate to `/dashboard/templates` → Filter/Search resets page → Pagination appears when >10 templates (currently 6, so hidden — forward compatible).

**Commit:** `feat(templates): add pagination to Templates page with filter-aware reset`

---

### Task 1.6: `Dashboard/Reports/Reports.tsx` — Add Pagination

**File:** `src/pages/Dashboard/Reports/Reports.tsx`
**Depends:** none

**What changes:**
- Add `currentPage` state
- Compute `totalPages` and `paginatedReports` from `filtered` (post-filter, post-search)
- Render `<Pagination>` below the report list
- Reset `currentPage` to 1 when `search` or `typeFilter` changes

**Add imports:**

```tsx
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from '@/components/ui/pagination';
```

**Add inside component:**

```tsx
const [currentPage, setCurrentPage] = useState(1);
const ITEMS_PER_PAGE = 10;

// Reset page when filters change
useEffect(() => {
  setCurrentPage(1);
}, [search, typeFilter]);

const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
const paginatedReports = filtered.slice(
  (currentPage - 1) * ITEMS_PER_PAGE,
  currentPage * ITEMS_PER_PAGE
);
```

**Replace `{filtered.map((report) => (` with `{paginatedReports.map((report) => (`**

**Add pagination after the report list (before the Export Modal):**

```tsx
{/* Pagination */}
{totalPages > 1 && (
  <div className="mt-4 flex items-center justify-between text-sm" style={{ color: 'var(--text-muted)' }}>
    <span>
      Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} reports
    </span>
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            className={currentPage === 1 ? 'pointer-events-none opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          />
        </PaginationItem>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <PaginationItem key={page}>
            <PaginationLink onClick={() => setCurrentPage(page)} isActive={currentPage === page} className="cursor-pointer">
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            className={currentPage === totalPages ? 'pointer-events-none opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  </div>
)}
```

**Verify:** `npm run dev` → Navigate to `/dashboard/reports` → Search/Filter resets page → Pagination appears when >10 reports (currently 5, so hidden — forward compatible).

**Commit:** `feat(reports): add pagination to Reports page with filter-aware reset`

---

### Task 1.7: `Dashboard/Tickets/TicketList.tsx` + `TicketTable.tsx` — Add Pagination (List View Only)

**Files:**
- `src/pages/Dashboard/Tickets/components/TicketTable.tsx` (modified — add pagination)
- `src/pages/Dashboard/Tickets/TicketList.tsx` (no changes needed — pagination is inside TicketTable)

**Depends:** none

**Design Decision:** Pagination is added to `TicketTable.tsx` (list view only). The kanban view (`KanbanBoard`) is not paginated per requirement ("list view only, not kanban").

**Modified file: `src/pages/Dashboard/Tickets/components/TicketTable.tsx`**

```tsx
/**
 * Ticket Table Component (List View)
 * Path: src/pages/Dashboard/Tickets/components/TicketTable.tsx
 *
 * Displays tickets in a vertical list using TicketCard components.
 * Now includes client-side pagination.
 */
import { useState, useEffect } from 'react';
import { Ticket } from '@/types/ticket';
import { TicketCard } from '@/components/dashboard/TicketCard';
import { Card } from '@/components/ui/card';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from '@/components/ui/pagination';

const ITEMS_PER_PAGE = 10;

export function TicketTable({ tickets }: { tickets: Ticket[] }) {
  const [currentPage, setCurrentPage] = useState(1);

  // Reset page when tickets data changes (e.g., filter change from parent)
  useEffect(() => {
    setCurrentPage(1);
  }, [tickets]);

  const totalPages = Math.ceil(tickets.length / ITEMS_PER_PAGE);
  const paginatedTickets = tickets.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (tickets.length === 0) {
    return (
      <Card className="p-8 text-center" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <p className="font-mono" style={{ color: 'var(--text-secondary)' }}>
          NO TICKETS FOUND. CREATE ONE TO GET STARTED.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {paginatedTickets.map(ticket => (
        <TicketCard key={ticket.id} ticket={ticket} />
      ))}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm" style={{ color: 'var(--text-muted)' }}>
          <span>
            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, tickets.length)} of {tickets.length} tickets
          </span>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink onClick={() => setCurrentPage(page)} isActive={currentPage === page} className="cursor-pointer">
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
```

**Verify:** `npm run dev` → Navigate to `/dashboard/tickets` → Ensure view mode is "LIST" → Pagination renders when >10 tickets (currently mock has ~5 tickets, so hidden — forward compatible). Switch to kanban — no pagination (correct behavior).

**Commit:** `feat(tickets): add pagination to TicketTable list view (not kanban)`

---

### Task 1.8: `Dashboard/Index.tsx` — Add Pagination to Recent Scans Table

**File:** `src/pages/Dashboard/Index.tsx`
**Depends:** none

**What changes:**
- Add `currentPage` state for the recentScans table
- Compute `totalPages` and `paginatedScans` from `recentScans`
- Render `<Pagination>` below the Recent Scans table
- Note: `recentScans` is only 5 items currently; pagination is forward-compatible.

**Add imports:**

```tsx
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from '@/components/ui/pagination';
```

**Add inside `DashboardIndex` component, after existing state:**

```tsx
const [scansPage, setScansPage] = useState(1);
const SCANS_PER_PAGE = 10;

const scansTotalPages = Math.ceil(recentScans.length / SCANS_PER_PAGE);
const paginatedRecentScans = recentScans.slice(
  (scansPage - 1) * SCANS_PER_PAGE,
  scansPage * SCANS_PER_PAGE
);
```

**Replace `{recentScans.map((scan) => (` with `{paginatedRecentScans.map((scan) => (` in the Recent Scans table tbody.**

**Add pagination after the Recent Scans `</Card>`:**

```tsx
{/* Pagination for Recent Scans */}
{scansTotalPages > 1 && (
  <div className="mt-4 flex items-center justify-between text-sm" style={{ color: 'var(--text-muted)' }}>
    <span>
      Showing {((scansPage - 1) * SCANS_PER_PAGE) + 1}–{Math.min(scansPage * SCANS_PER_PAGE, recentScans.length)} of {recentScans.length} recent scans
    </span>
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={() => setScansPage(p => Math.max(1, p - 1))}
            className={scansPage === 1 ? 'pointer-events-none opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          />
        </PaginationItem>
        {Array.from({ length: scansTotalPages }, (_, i) => i + 1).map((page) => (
          <PaginationItem key={page}>
            <PaginationLink onClick={() => setScansPage(page)} isActive={scansPage === page} className="cursor-pointer">
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext
            onClick={() => setScansPage(p => Math.min(scansTotalPages, p + 1))}
            className={scansPage === scansTotalPages ? 'pointer-events-none opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  </div>
)}
```

**Verify:** `npm run dev` → Navigate to `/dashboard` → Scroll to Recent Scans table → Pagination hidden (5 items < 10, forward compatible).

**Commit:** `feat(dashboard): add pagination to Recent Scans table on Index page`

---

## Summary of Changes

| Task | File | Lines Changed | Pagination Added |
|------|------|---------------|-----------------|
| 1.1 | `src/pages/Dashboard/Scans/AllScans.tsx` | ~40 lines added | ✅ Table (filter-aware) |
| 1.2 | `src/pages/Dashboard/Scans/MyScans.tsx` | ~30 lines added | ✅ Table (forward-compatible) |
| 1.3 | `src/pages/Dashboard/Scans/TrashScans.tsx` | ~30 lines added | ✅ Table (forward-compatible) |
| 1.4 | `src/pages/Dashboard/Users/Users.tsx` | ~35 lines added | ✅ Table (filter-aware) |
| 1.5 | `src/pages/Dashboard/Templates/Templates.tsx` | ~35 lines added | ✅ Card Grid (filter-aware) |
| 1.6 | `src/pages/Dashboard/Reports/Reports.tsx` | ~30 lines added | ✅ Card List (filter-aware) |
| 1.7 | `src/pages/Dashboard/Tickets/components/TicketTable.tsx` | ~40 lines added | ✅ List View Only (not kanban) |
| 1.8 | `src/pages/Dashboard/Index.tsx` | ~25 lines added | ✅ Recent Scans Table |

**Total:** 8 files modified, ~265 lines added, all self-contained, no shared hooks.

---

## Verification Steps (All Pages)

1. **Start dev server:** `npm run dev`
2. **Navigate to each page** and verify:
   - [ ] Table/card list renders correctly
   - [ ] Pagination component appears when data > 10 items (or add temporary mock data > 10 to test)
   - [ ] Clicking page numbers updates the displayed items
   - [ ] Previous/Next buttons work correctly
   - [ ] Previous is disabled on page 1, Next is disabled on last page
   - [ ] Changing filters/search resets page to 1
   - [ ] "Showing X–Y of Z" text is correct
   - [ ] CSS variable styling matches design system (`var(--primary)`, etc.)
   - [ ] No console errors

3. **Specific page checks:**
   - [ ] **AllScans:** Switch filter tabs → page resets to 1
   - [ ] **Users:** Type in search + change role/status filters → page resets to 1
   - [ ] **Templates:** Change category/type/profile filters or search → page resets to 1
   - [ ] **Reports:** Change search or type filter → page resets to 1
   - [ ] **Tickets:** Switch to kanban view → no pagination (correct); switch to list → pagination works
   - [ ] **Index:** Recent Scans table has pagination (when >10 items)

---

## Notes

- **Current mock data is small** (3-6 items per page), so pagination will be hidden by default. The logic is fully implemented and will activate automatically when data grows beyond 10 items (e.g., after API integration in P2).
- **No `PaginationEllipsis`** is used since with ≤26 items (10 per page = max 3 pages), ellipsis isn't needed. If future requirements include >5 pages, add `PaginationEllipsis` for better UX.
- **`pointer-events-none` + `opacity-50` + `cursor-not-allowed`** is used to visually disable Previous/Next at boundaries (the shadcn `PaginationLink` uses `<a>` tags, so we use className manipulation rather than disabling an `<a>` tag).
- **All pagination state is local** to each component — no shared hook, as specified in requirements.
