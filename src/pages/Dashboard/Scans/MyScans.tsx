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
            <h1 className="text-2xl font-bold text-slate-900">My Scans</h1>
            <p className="mt-1 text-slate-500">Scans created by you</p>
          </div>
          <Button
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
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
          <Card className="bg-white border-slate-200">
            <CardContent className="p-4">
              <p className="text-xs text-slate-500">Total</p>
              <p className="text-2xl font-bold text-slate-900">{myScans.length}</p>
            </CardContent>
          </Card>
          <Card className="bg-white border-slate-200">
            <CardContent className="p-4">
              <p className="text-xs text-slate-500">Completed</p>
              <p className="text-2xl font-bold text-emerald-500">
                {myScans.filter(s => s.status === 'completed').length}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white border-slate-200">
            <CardContent className="p-4">
              <p className="text-xs text-slate-500">Running</p>
              <p className="text-2xl font-bold text-indigo-600">
                {myScans.filter(s => s.status === 'running').length}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white border-slate-200">
            <CardContent className="p-4">
              <p className="text-xs text-slate-500">Failed</p>
              <p className="text-2xl font-bold text-red-500">
                {myScans.filter(s => s.status === 'failed').length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Scans Table */}
        <Card className="bg-white border-slate-200">
          <CardHeader>
            <CardTitle className="text-slate-900">Your Scans</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-medium text-slate-500">Target</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-500">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-500">Vulns</th>
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
                      onClick={() => navigate(`/dashboard/scans/${scan.id}`)}
                    >
                      <td className="py-3 px-4">
                        <span className="font-mono text-sm text-slate-900">{scan.target}</span>
                      </td>
                      <td className="py-3 px-4">
                        <StatusChip status={scan.status as any} size="sm" />
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">{scan.vulnerabilities}</td>
                      <td className="py-3 px-4">
                        <SeverityChip severity={scan.severity as any} size="sm" />
                      </td>
                      <td className="py-3 px-4 text-slate-500">{scan.duration}</td>
                      <td className="py-3 px-4 text-slate-500">{scan.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
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
