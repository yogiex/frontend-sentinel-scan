import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusChip } from '@/components/dashboard/StatusChip';
import { SeverityChip } from '@/components/dashboard/SeverityChip';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Scan, Trash2, RefreshCw, XCircle } from 'lucide-react';
import { scanStore, RUNNING_STATUSES, type Scan as ScanType, type ScanStatus } from '@/lib/scan-store';
import { toast } from 'sonner';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from '@/components/ui/pagination';

const ITEMS_PER_PAGE = 10;

const RESCAN_STATUSES: ScanStatus[] = ['completed', 'failed', 'cancelled', 'aborted'];

function getCurrentUser(): string {
  try {
    const stored = localStorage.getItem('sentinelscan_user');
    if (stored) {
      const user = JSON.parse(stored);
      return user.id || '1';
    }
  } catch {}
  return '1';
}

export function MyScans() {
  const navigate = useNavigate();
  const [scans, setScans] = useState<ScanType[]>([]);
  const [loading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<ScanType | null>(null);
  const userId = getCurrentUser();

  useEffect(() => {
    const load = () => {
      const all = scanStore.getScans();
      const mine = all.filter(s => s.createdBy === userId || s.createdBy === 'admin');
      setScans(mine);
    };
    load();
    const unsub = scanStore.subscribe(load);
    return () => unsub();
  }, [userId]);

  const totalPages = Math.ceil(scans.length / ITEMS_PER_PAGE);
  const paginatedScans = scans.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const getSeverityFromFindings = (scan: ScanType): string => {
    if (scan.findings.some(f => f.severity === 'critical')) return 'critical';
    if (scan.findings.some(f => f.severity === 'high')) return 'high';
    if (scan.findings.some(f => f.severity === 'medium')) return 'medium';
    if (scan.findings.some(f => f.severity === 'low')) return 'low';
    return 'info';
  };

  const formatDuration = (scan: ScanType): string => {
    if (scan.duration) return scan.duration;
    if (scan.startedAt && !RUNNING_STATUSES.includes(scan.status)) {
      const start = new Date(scan.startedAt).getTime();
      const now = Date.now();
      const diff = Math.floor((now - start) / 1000);
      return `${Math.floor(diff / 60)}m ${diff % 60}s`;
    }
    return '—';
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    const user = (() => { try { const u = JSON.parse(localStorage.getItem('sentinelscan_user') || '{}'); return u.username || 'unknown'; } catch { return 'unknown'; } })();
    scanStore.softDelete(deleteTarget.id, user);
    toast.success(`Scan ${deleteTarget.id} moved to trash`);
    setDeleteTarget(null);
  };

  const [cancelTarget, setCancelTarget] = useState<ScanType | null>(null);

  const handleCancel = () => {
    if (!cancelTarget) return;
    scanStore.cancelScan(cancelTarget.id);
    toast.success(`Scan ${cancelTarget.id} cancelled`);
    setCancelTarget(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Scans</h1>
          <p className="mt-1 text-slate-500">Scans created by you</p>
        </div>
        <Button variant="primary" onClick={() => navigate('/dashboard/scans/new')}>
          New Scan
        </Button>
      </div>

      {loading && <SkeletonLoader rows={4} columns={6} />}

      {!loading && scans.length === 0 && (
        <EmptyState
          title="No scans yet"
          description="You haven't created any scans. Start by creating your first vulnerability scan."
          actionText="Create Scan"
          onAction={() => navigate('/dashboard/scans/new')}
          icon={<Scan className="w-12 h-12" />}
        />
      )}

      {!loading && scans.length > 0 && (
        <>
          <div className="grid grid-cols-4 gap-4">
            <Card className="bg-white border-slate-200">
              <CardContent className="p-4">
                <p className="text-xs text-slate-500">Total</p>
                <p className="text-2xl font-bold text-slate-900">{scans.length}</p>
              </CardContent>
            </Card>
            <Card className="bg-white border-slate-200">
              <CardContent className="p-4">
                <p className="text-xs text-slate-500">Completed</p>
                <p className="text-2xl font-bold text-emerald-500">
                  {scans.filter(s => s.status === 'completed').length}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-white border-slate-200">
              <CardContent className="p-4">
                <p className="text-xs text-slate-500">Running</p>
                <p className="text-2xl font-bold text-indigo-600">
                  {scans.filter(s => RUNNING_STATUSES.includes(s.status)).length}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-white border-slate-200">
              <CardContent className="p-4">
                <p className="text-xs text-slate-500">Failed</p>
                <p className="text-2xl font-bold text-red-500">
                  {scans.filter(s => s.status === 'failed').length}
                </p>
              </CardContent>
            </Card>
          </div>

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
                      <th className="text-left py-3 px-4 font-medium text-slate-500">Type</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-500">Findings</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-500">Severity</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-500">Duration</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-500">Date</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-500 w-12"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedScans.map((scan) => (
                      <tr
                        key={scan.id}
                        className="border-b border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
                        onClick={() => {
                          if (RUNNING_STATUSES.includes(scan.status)) {
                            navigate(`/dashboard/scans/${scan.id}/progress`);
                          } else {
                            navigate(`/dashboard/scans/${scan.id}`);
                          }
                        }}
                      >
                        <td className="py-3 px-4 font-mono text-slate-900">{scan.target}</td>
                        <td className="py-3 px-4">
                          <StatusChip status={scan.status as any} size="sm" />
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
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            {RESCAN_STATUSES.includes(scan.status) && (
                              <button
                                onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/scans/new?template=${scan.id}`); }}
                                className="p-1.5 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                                title="Rescan"
                              >
                                <RefreshCw className="w-4 h-4" />
                              </button>
                            )}
                            {RUNNING_STATUSES.includes(scan.status) && (
                              <button
                                onClick={(e) => { e.stopPropagation(); setCancelTarget(scan); }}
                                className="p-1.5 rounded-md text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                                title="Cancel scan"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={(e) => { e.stopPropagation(); setDeleteTarget(scan); }}
                              className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="Delete scan"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
              <span>
                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, scans.length)} of {scans.length} scans
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

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title={`Delete Scan: ${deleteTarget?.target || ''}`}
        description="This will move the scan to trash. You can restore it from the Trash page."
        confirmLabel="Move to Trash"
        variant="destructive"
        onConfirm={handleDelete}
      />

      <ConfirmDialog
        open={cancelTarget !== null}
        onOpenChange={(open) => { if (!open) setCancelTarget(null); }}
        title={`Cancel Scan: ${cancelTarget?.target || ''}`}
        description="This will stop the running scan and mark it as cancelled."
        confirmLabel="Cancel Scan"
        variant="destructive"
        onConfirm={handleCancel}
      />
    </div>
  );
}
