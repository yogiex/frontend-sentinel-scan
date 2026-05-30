# P1-6: Search & Filter di Scan Tables - Implementation Plan

**Goal:** Add comprehensive search and filtering capabilities to all scan table pages (AllScans, MyScans, TrashScans) with text search, status filters, severity filters, and date range filters.

**Architecture:** Each page maintains its own filter state (search query, status, severity, date range) and applies AND logic to combine all active filters. Filter UI includes search input with icon, dropdown selectors, DateRangePicker, and clear filters button. Result counts are displayed to show filtered vs total scans.

**Design:** This plan implements the search and filter requirements for P1-6 as specified in the project context.

---

## Dependency Graph

```
Batch 1 (parallel): 1.1, 1.2, 1.3 [all independent - modify separate files]
```

---

## Batch 1: Search & Filter Implementation (parallel - 3 implementers)

All tasks in this batch are independent and can run simultaneously. Each task modifies a separate page file.

---

### Task 1.1: Update AllScans.tsx with Full Filter Capabilities

**File:** `src/pages/Dashboard/Scans/AllScans.tsx`
**Test:** `src/pages/Dashboard/Scans/AllScans.test.tsx` (update existing file)
**Depends:** none

**Description:** Enhance AllScans page with text search, severity dropdown, date range picker, and improved filter logic with AND combination.

```tsx
// src/pages/Dashboard/Scans/AllScans.test.tsx
/**
 * AllScans Component Tests
 * Path: src/pages/Dashboard/Scans/AllScans.test.tsx
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AllScans } from './AllScans';
import { scanStore, type Scan } from '@/lib/scan-store';
import React from 'react';

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

describe('AllScans - Search & Filter', () => {
  beforeEach(() => {
    scanStore.clearAll();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const createMockScan = (overrides: Partial<Scan> = {}): Scan => {
    const id = `scan-${Date.now()}-${Math.random()}`;
    return {
      id,
      target: '192.168.1.0/24',
      scanType: 'basic',
      profile: 'quick',
      status: 'completed',
      progress: 100,
      createdAt: new Date('2026-05-01').toISOString(),
      startedAt: new Date('2026-05-01').toISOString(),
      completedAt: new Date('2026-05-01').toISOString(),
      duration: '45 min',
      hosts: [],
      findings: [],
      logs: [],
      config: { credentials: false, stealth: false, schedule: 'now' },
      ...overrides,
    } as Scan;
  };

  it('should render search input with Search icon', () => {
    render(<AllScans />);
    const searchInput = screen.getByPlaceholderText('Search by target...');
    expect(searchInput).toBeInTheDocument();
  });

  it('should filter scans by search query (target)', async () => {
    scanStore.createScan({
      target: '192.168.1.0/24',
      scanType: 'basic',
      profile: 'quick',
      schedule: 'now',
      useCredentials: false,
      userAgentMode: 'default',
      enableCookies: false,
      humanLikeDelay: false,
    });
    scanStore.createScan({
      target: 'example.com',
      scanType: 'basic',
      profile: 'quick',
      schedule: 'now',
      useCredentials: false,
      userAgentMode: 'default',
      enableCookies: false,
      humanLikeDelay: false,
    });

    render(<AllScans />);

    await waitFor(() => {
      expect(screen.getByText('192.168.1.0/24')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search by target...');
    fireEvent.change(searchInput, { target: { value: 'example.com' } });

    expect(screen.getByText('1 of 2 scans')).toBeInTheDocument();
    expect(screen.queryByText('192.168.1.0/24')).not.toBeInTheDocument();
  });

  it('should filter scans by status tab', async () => {
    scanStore.createScan({
      target: 'example.com',
      scanType: 'basic',
      profile: 'quick',
      schedule: 'now',
      useCredentials: false,
      userAgentMode: 'default',
      enableCookies: false,
      humanLikeDelay: false,
    });
    const scans = scanStore.getScans();
    if (scans.length > 0) {
      scanStore.updateScan(scans[0].id, { status: 'running' });
    }

    render(<AllScans />);

    await waitFor(() => {
      expect(screen.getByText('example.com')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Running'));

    expect(screen.getByText('1 of 1 scans')).toBeInTheDocument();
    expect(screen.getByText('example.com')).toBeInTheDocument();
  });

  it('should filter scans by severity dropdown', async () => {
    const scan1 = scanStore.createScan({
      target: '192.168.1.0/24',
      scanType: 'basic',
      profile: 'quick',
      schedule: 'now',
      useCredentials: false,
      userAgentMode: 'default',
      enableCookies: false,
      humanLikeDelay: false,
    });
    // Add critical finding
    scanStore.updateScan(scan1.id, {
      findings: [{ id: 'f1', title: 'SQL Injection', severity: 'critical', host: '192.168.1.10', description: 'Test', category: 'injection', discoveredAt: new Date().toISOString() }],
    });

    scanStore.createScan({
      target: 'example.com',
      scanType: 'basic',
      profile: 'quick',
      schedule: 'now',
      useCredentials: false,
      userAgentMode: 'default',
      enableCookies: false,
      humanLikeDelay: false,
    });

    render(<AllScans />);

    await waitFor(() => {
      expect(screen.getByText('192.168.1.0/24')).toBeInTheDocument();
    });

    // Open severity select
    fireEvent.click(screen.getByText('All Severities'));
    fireEvent.click(screen.getByText('Critical'));

    expect(screen.getByText('1 of 2 scans')).toBeInTheDocument();
    expect(screen.getByText('192.168.1.0/24')).toBeInTheDocument();
  });

  it('should combine multiple filters with AND logic', async () => {
    const scan1 = scanStore.createScan({
      target: 'example.com',
      scanType: 'basic',
      profile: 'quick',
      schedule: 'now',
      useCredentials: false,
      userAgentMode: 'default',
      enableCookies: false,
      humanLikeDelay: false,
    });
    scanStore.updateScan(scan1.id, { status: 'completed' });

    const scan2 = scanStore.createScan({
      target: 'test.example.com',
      scanType: 'basic',
      profile: 'quick',
      schedule: 'now',
      useCredentials: false,
      userAgentMode: 'default',
      enableCookies: false,
      humanLikeDelay: false,
    });
    scanStore.updateScan(scan2.id, { status: 'failed' });

    render(<AllScans />);

    await waitFor(() => {
      expect(screen.getByText('example.com')).toBeInTheDocument();
    });

    // Search for "example"
    const searchInput = screen.getByPlaceholderText('Search by target...');
    fireEvent.change(searchInput, { target: { value: 'example' } });

    // Filter by failed status
    fireEvent.click(screen.getByText('Failed'));

    expect(screen.getByText('1 of 2 scans')).toBeInTheDocument();
    expect(screen.getByText('test.example.com')).toBeInTheDocument();
  });

  it('should show result count after filtering', async () => {
    scanStore.createScan({
      target: '192.168.1.0/24',
      scanType: 'basic',
      profile: 'quick',
      schedule: 'now',
      useCredentials: false,
      userAgentMode: 'default',
      enableCookies: false,
      humanLikeDelay: false,
    });

    render(<AllScans />);

    await waitFor(() => {
      expect(screen.getByText('192.168.1.0/24')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search by target...');
    fireEvent.change(searchInput, { target: { value: '192.168' } });

    expect(screen.getByText('1 of 1 scans')).toBeInTheDocument();
  });

  it('should clear all filters when Clear All is clicked', async () => {
    scanStore.createScan({
      target: 'example.com',
      scanType: 'basic',
      profile: 'quick',
      schedule: 'now',
      useCredentials: false,
      userAgentMode: 'default',
      enableCookies: false,
      humanLikeDelay: false,
    });

    render(<AllScans />);

    await waitFor(() => {
      expect(screen.getByText('example.com')).toBeInTheDocument();
    });

    // Apply some filters
    const searchInput = screen.getByPlaceholderText('Search by target...');
    fireEvent.change(searchInput, { target: { value: 'example' } });
    fireEvent.click(screen.getByText('Running'));

    // Clear all
    fireEvent.click(screen.getByText('Clear All'));

    expect(searchInput).toHaveValue('');
    expect(screen.getByText('1 of 1 scans')).toBeInTheDocument();
  });

  it('should render the All Scans page header', () => {
    render(<AllScans />);
    expect(screen.getByText('All Scans')).toBeInTheDocument();
  });
});
```

```tsx
// src/pages/Dashboard/Scans/AllScans.tsx
/**
 * SentinelScan All Scans Page
 * Path: src/pages/Dashboard/Scans/AllScans.tsx
 *
 * Displays all scans across the system with filtering and sorting.
 * Includes loading and empty states.
 * UPDATED: Added search, severity filter, date range filter with AND logic.
 */
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateRangePicker } from '@/components/audit/DateRangePicker';
import { StatusChip } from '@/components/dashboard/StatusChip';
import { SeverityChip } from '@/components/dashboard/SeverityChip';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { EmptyState } from '@/components/ui/EmptyState';
import { Scan as ScanIcon, Search, X } from 'lucide-react';
import { scanStore, type Scan } from '@/lib/scan-store';

type StatusFilter = 'all' | 'running' | 'completed' | 'failed';
type SeverityFilter = 'all' | 'critical' | 'high' | 'medium' | 'low' | 'info';

export function AllScans() {
  const navigate = useNavigate();
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>('all');
  const [dateRange, setDateRange] = useState<{ from?: string; to?: string }>({});

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

  // Compute severity from findings
  const getSeverityFromFindings = (scan: Scan): string => {
    if (scan.findings.some(f => f.severity === 'critical')) return 'critical';
    if (scan.findings.some(f => f.severity === 'high')) return 'high';
    if (scan.findings.some(f => f.severity === 'medium')) return 'medium';
    if (scan.findings.some(f => f.severity === 'low')) return 'low';
    return 'info';
  };

  // Check if scan matches status filter
  const matchesStatusFilter = (scan: Scan, status: StatusFilter): boolean => {
    if (status === 'all') return true;
    if (status === 'running') {
      return ['pending', 'queued', 'initializing', 'discovering', 'scanning', 'analyzing'].includes(scan.status);
    }
    return scan.status === status;
  };

  // Filter scans with AND logic
  const filteredScans = useMemo(() => {
    return scans.filter(scan => {
      // Search filter (by target)
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!scan.target.toLowerCase().includes(query)) {
          return false;
        }
      }

      // Status filter
      if (!matchesStatusFilter(scan, statusFilter)) {
        return false;
      }

      // Severity filter
      if (severityFilter !== 'all') {
        const scanSeverity = getSeverityFromFindings(scan);
        if (scanSeverity !== severityFilter) {
          return false;
        }
      }

      // Date range filter
      if (dateRange.from || dateRange.to) {
        const scanDate = new Date(scan.createdAt);
        scanDate.setHours(0, 0, 0, 0);

        if (dateRange.from) {
          const fromDate = new Date(dateRange.from);
          fromDate.setHours(0, 0, 0, 0);
          if (scanDate < fromDate) return false;
        }

        if (dateRange.to) {
          const toDate = new Date(dateRange.to);
          toDate.setHours(23, 59, 59, 999);
          if (scanDate > toDate) return false;
        }
      }

      return true;
    });
  }, [scans, searchQuery, statusFilter, severityFilter, dateRange]);

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

  const hasActiveFilters = searchQuery || statusFilter !== 'all' || severityFilter !== 'all' || dateRange.from || dateRange.to;

  const clearAllFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setSeverityFilter('all');
    setDateRange({});
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

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        {/* Search Input */}
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          <Input
            placeholder="Search by target..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            style={{ backgroundColor: 'var(--bg-primary)' }}
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex gap-2">
          {(['all', 'running', 'completed', 'failed'] as const).map((filter) => (
            <Button
              key={filter}
              variant={statusFilter === filter ? 'default' : 'outline'}
              size="sm"
              className={statusFilter === filter ? '' : 'border-slate-300 text-slate-600 hover:bg-slate-50'}
              onClick={() => setStatusFilter(filter)}
              style={statusFilter === filter ? { backgroundColor: 'var(--primary)' } : {}}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Button>
          ))}
        </div>

        {/* Severity Filter Dropdown */}
        <Select value={severityFilter} onValueChange={(value) => setSeverityFilter(value as SeverityFilter)}>
          <SelectTrigger className="w-[160px]" style={{ backgroundColor: 'var(--bg-primary)' }}>
            <SelectValue placeholder="All Severities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severities</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="info">Info</SelectItem>
          </SelectContent>
        </Select>

        {/* Date Range Filter */}
        <DateRangePicker
          onRangeChange={setDateRange}
          defaultFrom={dateRange.from ? new Date(dateRange.from) : undefined}
          defaultTo={dateRange.to ? new Date(dateRange.to) : undefined}
        />

        {/* Clear All Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-slate-500 hover:text-slate-700"
          >
            <X className="w-4 h-4 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      {/* Result Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {hasActiveFilters ? (
            <span><span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{filteredScans.length}</span> of {scans.length} scans</span>
          ) : (
            <span><span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{scans.length}</span> total scans</span>
          )}
        </p>
      </div>

      {/* Loading State */}
      {loading && <SkeletonLoader rows={6} columns={7} />}

      {/* Empty State */}
      {!loading && filteredScans.length === 0 && (
        <EmptyState
          title="No scans found"
          description={hasActiveFilters
            ? "No scans match your filters. Try adjusting your search or filter criteria."
            : "No scans yet. Create your first vulnerability scan to get started."}
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
                  {filteredScans.map((scan) => (
                    <tr
                      key={scan.id}
                      className="border-b border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
                      onClick={() => {
                        if (scan.status === 'completed' || scan.status === 'failed') {
                          navigate(`/dashboard/scans/${scan.id}`);
                        } else {
                          navigate(`/dashboard/scans/${scan.id}/progress`);
                        }
                      }}
                    >
                      <td className="py-3 px-4 font-mono text-sm" style={{ color: 'var(--text-primary)' }}>{scan.target}</td>
                      <td className="py-3 px-4">
                        <StatusChip status={scan.status as any} />
                      </td>
                      <td className="py-3 px-4" style={{ color: 'var(--text-secondary)' }}>{scan.scanType}</td>
                      <td className="py-3 px-4">
                        <span className={scan.findings.length > 0 ? 'text-red-600 font-semibold' : 'text-slate-400'}>
                          {scan.findings.length}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <SeverityChip severity={getSeverityFromFindings(scan) as any} size="sm" />
                      </td>
                      <td className="py-3 px-4" style={{ color: 'var(--text-secondary)' }}>{formatDuration(scan)}</td>
                      <td className="py-3 px-4" style={{ color: 'var(--text-secondary)' }}>
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

**Verify:** `npm test -- --testPathPattern=AllScans`
**Commit:** `feat(scans): add search, severity filter, and date range filter to AllScans page`

---

### Task 1.2: Update MyScans.tsx with Search & Filter

**File:** `src/pages/Dashboard/Scans/MyScans.tsx`
**Test:** `src/pages/Dashboard/Scans/MyScans.test.tsx` (new file)
**Depends:** none

**Description:** Add text search input, status dropdown, severity dropdown with AND logic filtering to MyScans page.

```tsx
// src/pages/Dashboard/Scans/MyScans.test.tsx
/**
 * MyScans Component Tests
 * Path: src/pages/Dashboard/Scans/MyScans.test.tsx
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MyScans } from './MyScans';

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

describe('MyScans - Search & Filter', () => {
  it('should render search input with Search icon', () => {
    render(<MyScans />);
    const searchInput = screen.getByPlaceholderText('Search by target...');
    expect(searchInput).toBeInTheDocument();
  });

  it('should filter scans by search query', () => {
    render(<MyScans />);
    const searchInput = screen.getByPlaceholderText('Search by target...');

    fireEvent.change(searchInput, { target: { value: 'example.com' } });

    expect(screen.getByText('1 of 3 scans')).toBeInTheDocument();
    expect(screen.queryByText('192.168.1.0/24')).not.toBeInTheDocument();
  });

  it('should filter scans by status dropdown', () => {
    render(<MyScans />);

    fireEvent.click(screen.getByText('All Statuses'));
    fireEvent.click(screen.getByText('Running'));

    expect(screen.getByText('1 of 3 scans')).toBeInTheDocument();
    expect(screen.getByText('example.com')).toBeInTheDocument();
  });

  it('should filter scans by severity dropdown', () => {
    render(<MyScans />);

    fireEvent.click(screen.getByText('All Severities'));
    fireEvent.click(screen.getByText('High'));

    expect(screen.getByText('2 of 3 scans')).toBeInTheDocument();
    expect(screen.getByText('192.168.1.0/24')).toBeInTheDocument();
    expect(screen.getByText('api.example.com')).toBeInTheDocument();
  });

  it('should combine multiple filters with AND logic', () => {
    render(<MyScans />);

    // Search for "example"
    const searchInput = screen.getByPlaceholderText('Search by target...');
    fireEvent.change(searchInput, { target: { value: 'example' } });

    // Filter by failed status
    fireEvent.click(screen.getByText('All Statuses'));
    fireEvent.click(screen.getByText('Failed'));

    expect(screen.getByText('1 of 3 scans')).toBeInTheDocument();
    expect(screen.getByText('api.example.com')).toBeInTheDocument();
  });

  it('should clear all filters when Clear All is clicked', () => {
    render(<MyScans />);

    // Apply some filters
    const searchInput = screen.getByPlaceholderText('Search by target...');
    fireEvent.change(searchInput, { target: { value: '192.168' } });

    // Clear all
    fireEvent.click(screen.getByText('Clear All'));

    expect(searchInput).toHaveValue('');
    expect(screen.getByText('3 of 3 scans')).toBeInTheDocument();
  });

  it('should render the My Scans page header', () => {
    render(<MyScans />);
    expect(screen.getByText('My Scans')).toBeInTheDocument();
  });
});
```

```tsx
// src/pages/Dashboard/Scans/MyScans.tsx
/**
 * SentinelScan My Scans Page
 * Path: src/pages/Dashboard/Scans/MyScans.tsx
 *
 * Displays scans owned by the current user.
 * Includes loading and empty states.
 * UPDATED: Added search, status filter, and severity filter with AND logic.
 */
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusChip } from '@/components/dashboard/StatusChip';
import { SeverityChip } from '@/components/dashboard/SeverityChip';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { EmptyState } from '@/components/ui/EmptyState';
import { Scan, Search, X } from 'lucide-react';

// Mock data - only current user's scans
const myScans = [
  {
    id: '1',
    target: '192.168.1.0/24',
    status: 'completed' as const,
    vulnerabilities: 23,
    severity: 'high' as const,
    duration: '45 min',
    date: '2026-05-01',
  },
  {
    id: '2',
    target: 'example.com',
    status: 'running' as const,
    vulnerabilities: 0,
    severity: 'medium' as const,
    duration: '—',
    date: '2026-05-01',
  },
  {
    id: '4',
    target: 'api.example.com',
    status: 'failed' as const,
    vulnerabilities: 0,
    severity: 'high' as const,
    duration: '—',
    date: '2026-04-30',
  },
];

type StatusFilter = 'all' | 'completed' | 'running' | 'failed';
type SeverityFilter = 'all' | 'critical' | 'high' | 'medium' | 'low' | 'info';

export function MyScans() {
  const navigate = useNavigate();
  const [loading] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>('all');

  // Filter scans with AND logic
  const filteredScans = useMemo(() => {
    return myScans.filter(scan => {
      // Search filter (by target)
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!scan.target.toLowerCase().includes(query)) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== 'all' && scan.status !== statusFilter) {
        return false;
      }

      // Severity filter
      if (severityFilter !== 'all' && scan.severity !== severityFilter) {
        return false;
      }

      return true;
    });
  }, [searchQuery, statusFilter, severityFilter]);

  const hasActiveFilters = searchQuery || statusFilter !== 'all' || severityFilter !== 'all';

  const clearAllFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setSeverityFilter('all');
  };

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

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        {/* Search Input */}
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          <Input
            placeholder="Search by target..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            style={{ backgroundColor: 'var(--bg-primary)' }}
          />
        </div>

        {/* Status Filter Dropdown */}
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
          <SelectTrigger className="w-[160px]" style={{ backgroundColor: 'var(--bg-primary)' }}>
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="running">Running</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>

        {/* Severity Filter Dropdown */}
        <Select value={severityFilter} onValueChange={(value) => setSeverityFilter(value as SeverityFilter)}>
          <SelectTrigger className="w-[160px]" style={{ backgroundColor: 'var(--bg-primary)' }}>
            <SelectValue placeholder="All Severities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severities</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="info">Info</SelectItem>
          </SelectContent>
        </Select>

        {/* Clear All Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-slate-500 hover:text-slate-700"
          >
            <X className="w-4 h-4 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      {/* Result Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {hasActiveFilters ? (
            <span><span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{filteredScans.length}</span> of {myScans.length} scans</span>
          ) : (
            <span><span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{myScans.length}</span> total scans</span>
          )}
        </p>
      </div>

      {/* Loading State */}
      {loading && <SkeletonLoader rows={4} columns={6} />}

      {/* Empty State */}
      {!loading && filteredScans.length === 0 && (
        <EmptyState
          title="No scans found"
          description={hasActiveFilters
            ? "No scans match your filters. Try adjusting your search or filter criteria."
            : "You haven't created any scans. Start by creating your first vulnerability scan."}
          actionText="Create Scan"
          onAction={() => navigate('/dashboard/scans/new')}
          icon={<Scan className="w-12 h-12" />}
        />
      )}

      {/* Stats Summary + Table */}
      {!loading && filteredScans.length > 0 && (
        <>
       {/* Stats Summary */}
        <div className="grid grid-cols-4 gap-4">
          <Card style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', border: '1px solid' }}>
            <CardContent className="p-4">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Total</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{filteredScans.length}</p>
            </CardContent>
          </Card>
          <Card style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', border: '1px solid' }}>
            <CardContent className="p-4">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Completed</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--success)' }}>
                {filteredScans.filter(s => s.status === 'completed').length}
              </p>
            </CardContent>
          </Card>
          <Card style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', border: '1px solid' }}>
            <CardContent className="p-4">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Running</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>
                {filteredScans.filter(s => s.status === 'running').length}
              </p>
            </CardContent>
          </Card>
          <Card style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', border: '1px solid' }}>
            <CardContent className="p-4">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Failed</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--danger)' }}>
                {filteredScans.filter(s => s.status === 'failed').length}
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
                  {filteredScans.map((scan) => (
                    <tr
                      key={scan.id}
                      style={{ borderBottom: '1px solid var(--border)' }}
                      className="transition-colors cursor-pointer hover:bg-slate-50"
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

**Verify:** `npm test -- --testPathPattern=MyScans`
**Commit:** `feat(scans): add search and filters to MyScans page`

---

### Task 1.3: Update TrashScans.tsx with Search & Filter

**File:** `src/pages/Dashboard/Scans/TrashScans.tsx`
**Test:** `src/pages/Dashboard/Scans/TrashScans.test.tsx` (new file)
**Depends:** none

**Description:** Add text search input and status dropdown with AND logic filtering to TrashScans page.

```tsx
// src/pages/Dashboard/Scans/TrashScans.test.tsx
/**
 * TrashScans Component Tests
 * Path: src/pages/Dashboard/Scans/TrashScans.test.tsx
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TrashScans } from './TrashScans';

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

describe('TrashScans - Search & Filter', () => {
  it('should render search input with Search icon', () => {
    render(<TrashScans />);
    const searchInput = screen.getByPlaceholderText('Search by target...');
    expect(searchInput).toBeInTheDocument();
  });

  it('should filter scans by search query', () => {
    render(<TrashScans />);
    const searchInput = screen.getByPlaceholderText('Search by target...');

    fireEvent.change(searchInput, { target: { value: 'old-server' } });

    expect(screen.getByText('1 of 3 scans')).toBeInTheDocument();
    expect(screen.queryByText('test.example.com')).not.toBeInTheDocument();
  });

  it('should filter scans by status dropdown', () => {
    render(<TrashScans />);

    fireEvent.click(screen.getByText('All Statuses'));
    fireEvent.click(screen.getByText('Failed'));

    expect(screen.getByText('1 of 3 scans')).toBeInTheDocument();
    expect(screen.getByText('test.example.com')).toBeInTheDocument();
  });

  it('should combine search and status filters with AND logic', () => {
    render(<TrashScans />);

    // Search for "example"
    const searchInput = screen.getByPlaceholderText('Search by target...');
    fireEvent.change(searchInput, { target: { value: 'example' } });

    // Filter by completed status
    fireEvent.click(screen.getByText('All Statuses'));
    fireEvent.click(screen.getByText('Completed'));

    expect(screen.getByText('1 of 3 scans')).toBeInTheDocument();
    expect(screen.getByText('test.example.com')).not.toBeInTheDocument();
  });

  it('should clear all filters when Clear All is clicked', () => {
    render(<TrashScans />);

    // Apply some filters
    const searchInput = screen.getByPlaceholderText('Search by target...');
    fireEvent.change(searchInput, { target: { value: 'legacy' } });

    // Clear all
    fireEvent.click(screen.getByText('Clear All'));

    expect(searchInput).toHaveValue('');
    expect(screen.getByText('3 of 3 scans')).toBeInTheDocument();
  });

  it('should render the Trash page header', () => {
    render(<TrashScans />);
    expect(screen.getByText('Trash')).toBeInTheDocument();
  });
});
```

```tsx
// src/pages/Dashboard/Scans/TrashScans.tsx
/**
 * SentinelScan Trash Scans Page
 * Path: src/pages/Dashboard/Scans/TrashScans.tsx
 *
 * Displays deleted scans that can be restored or permanently removed.
 * Includes loading and empty states.
 * UPDATED: Added search and status filter with AND logic.
 */
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { StatusChip } from '@/components/dashboard/StatusChip';
import { SeverityChip } from '@/components/dashboard/SeverityChip';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { EmptyState } from '@/components/ui/EmptyState';
import { Trash2, Search, X } from 'lucide-react';

// Mock data - deleted scans
const trashScans = [
  {
    id: '7',
    target: 'old-server.local',
    status: 'completed' as const,
    vulnerabilities: 12,
    severity: 'medium' as const,
    duration: '30 min',
    date: '2026-04-15',
    deletedAt: '2026-04-20',
    deletedBy: 'admin',
  },
  {
    id: '8',
    target: 'test.example.com',
    status: 'failed' as const,
    vulnerabilities: 0,
    severity: 'low' as const,
    duration: '—',
    date: '2026-04-10',
    deletedAt: '2026-04-18',
    deletedBy: 'user1',
  },
  {
    id: '9',
    target: 'legacy.internal',
    status: 'completed' as const,
    vulnerabilities: 56,
    severity: 'critical' as const,
    duration: '2h 15min',
    date: '2026-03-28',
    deletedAt: '2026-04-12',
    deletedBy: 'admin',
  },
];

type StatusFilter = 'all' | 'completed' | 'failed';

export function TrashScans() {
  const [selectedScans, setSelectedScans] = useState<string[]>([]);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; scanIds: string[] }>({ open: false, scanIds: [] });
  const [loading] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const toggleSelect = (id: string) => {
    setSelectedScans(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedScans(selectedScans.length === filteredScans.length ? [] : filteredScans.map(s => s.id));
  };

  // Filter scans with AND logic
  const filteredScans = useMemo(() => {
    return trashScans.filter(scan => {
      // Search filter (by target)
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!scan.target.toLowerCase().includes(query)) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== 'all' && scan.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [searchQuery, statusFilter]);

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

  const hasActiveFilters = searchQuery || statusFilter !== 'all';

  const clearAllFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
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

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        {/* Search Input */}
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          <Input
            placeholder="Search by target..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            style={{ backgroundColor: 'var(--bg-primary)' }}
          />
        </div>

        {/* Status Filter Dropdown */}
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
          <SelectTrigger className="w-[160px]" style={{ backgroundColor: 'var(--bg-primary)' }}>
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>

        {/* Clear All Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-slate-500 hover:text-slate-700"
          >
            <X className="w-4 h-4 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      {/* Result Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {hasActiveFilters ? (
            <span><span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{filteredScans.length}</span> of {trashScans.length} scans</span>
          ) : (
            <span><span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{trashScans.length}</span> total scans</span>
          )}
        </p>
      </div>

      {/* Loading State */}
      {loading && <SkeletonLoader rows={4} columns={7} />}

      {/* Empty State */}
      {!loading && filteredScans.length === 0 && (
        <EmptyState
          title="No scans found"
          description={hasActiveFilters
            ? "No scans match your filters. Try adjusting your search or filter criteria."
            : "Trash is empty. Scans you delete will appear here for 30 days."}
          icon={<Trash2 className="w-12 h-12" />}
        />
      )}

      {/* Warning Banner + Table */}
      {!loading && filteredScans.length > 0 && (
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
          <CardTitle style={{ color: 'var(--text-primary)' }}>Deleted Scans ({filteredScans.length})</CardTitle>
          <button
            onClick={selectAll}
            className="text-sm hover:opacity-80"
            style={{ color: 'var(--primary)' }}
          >
            {selectedScans.length === filteredScans.length ? 'Deselect All' : 'Select All'}
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
                      checked={selectedScans.length === filteredScans.length && filteredScans.length > 0}
                      onChange={selectAll}
                      style={{ accentColor: 'var(--primary)' }}
                    />
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
                {filteredScans.map((scan) => (
                  <tr
                    key={scan.id}
                    style={{ borderBottom: '1px solid var(--border)' }}
                    className="hover:bg-slate-50 transition-colors"
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

**Verify:** `npm test -- --testPathPattern=TrashScans`
**Commit:** `feat(scans): add search and status filter to TrashScans page`

---

## Summary

### Files Modified:
1. `src/pages/Dashboard/Scans/AllScans.tsx` - Added search, severity filter, date range filter
2. `src/pages/Dashboard/Scans/MyScans.tsx` - Added search, status filter, severity filter
3. `src/pages/Dashboard/Scans/TrashScans.tsx` - Added search, status filter

### Files Created/Updated:
1. `src/pages/Dashboard/Scans/AllScans.test.tsx` - Updated with filter tests
2. `src/pages/Dashboard/Scans/MyScans.test.tsx` - New test file
3. `src/pages/Dashboard/Scans/TrashScans.test.tsx` - New test file

### Filter Logic Pattern (AND Logic):
All filters are combined using AND logic:
- If search query is set → filter by target containing query (case-insensitive)
- If status filter is not 'all' → filter by status
- If severity filter is not 'all' → filter by computed severity (AllScans) or direct severity property
- If date range is set → filter by createdAt within range (AllScans only)

### State Management:
- Each page maintains its own filter state using `useState`
- Filtered results are computed using `useMemo` for performance
- Clear All functionality resets all filters to default values

### Key Design Decisions:
1. **Design requires AND logic for combining filters.** I'm implementing it as a series of early-return filters in useMemo - each filter that's active must pass for the scan to be included.

2. **Design requires text search by target.** I'm implementing case-insensitive substring matching using `target.toLowerCase().includes(query.toLowerCase())`.

3. **Design requires result count display.** I'm showing "X of Y scans" when filters are active, and "X total scans" when no filters are active.

4. **Design requires Clear All button.** Button only appears when filters are active, resets all filter states to defaults.

5. **AllScans uses scanStore, MyScans/TrashScans use mock arrays.** Following existing patterns - AllScans already uses scanStore with subscription, so I kept that pattern. MyScans and TrashScans use static arrays as per existing design.

### Verification Steps:
1. Run tests:
   ```bash
   npm test -- --testPathPattern=AllScans
   npm test -- --testPathPattern=MyScans
   npm test -- --testPathPattern=TrashScans
   ```

2. Manual testing:
   - Navigate to /dashboard/scans/all - verify search, status tabs, severity dropdown, date picker work
   - Navigate to /dashboard/scans/my - verify search, status dropdown, severity dropdown work
   - Navigate to /dashboard/scans/trash - verify search and status dropdown work
   - Verify Clear All button appears when filters are active
   - Verify result count updates correctly
   - Verify AND logic (combining multiple filters narrows results)
