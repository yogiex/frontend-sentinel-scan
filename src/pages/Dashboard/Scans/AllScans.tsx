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
          <h1 className="text-2xl font-bold text-slate-900">All Scans</h1>
          <p className="mt-1 text-slate-500">View and manage all vulnerability scans</p>
        </div>
        <Button
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
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
            className={activeFilter === filter ? '' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}
            onClick={() => setActiveFilter(filter)}
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
            {filter !== 'all' && (
              <span className="ml-2 px-1.5 py-0.5 rounded-full text-xs bg-slate-100 text-slate-600">
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
        <Card className="bg-white border-slate-200">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-medium text-slate-500">Target</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-500">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-500">Type</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-500">Findings</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-500">Severity</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-500">Duration</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-500">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedScans.map((scan) => (
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
                      <td className="py-3 px-4 font-mono text-slate-900">{scan.target}</td>
                      <td className="py-3 px-4">
                        <StatusChip status={scan.status as any} />
                      </td>
                      <td className="py-3 px-4 text-slate-500">{scan.scanType}</td>
                      <td className="py-3 px-4">
                        <span className={scan.findings.length > 0 ? 'text-red-500 font-semibold' : 'text-slate-500'}>
                          {scan.findings.length}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <SeverityChip severity={getSeverityFromFindings(scan) as any} size="sm" />
                      </td>
                      <td className="py-3 px-4 text-slate-500">{formatDuration(scan)}</td>
                      <td className="py-3 px-4 text-slate-500">
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
        <div className="flex items-center justify-between text-sm text-slate-500">
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
