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
          <h1 className="text-2xl font-bold text-slate-900">Trash</h1>
          <p className="mt-1 text-slate-500">Deleted scans - will be permanently removed after 30 days</p>
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
          <Button variant="outline" className="border-slate-200 text-slate-500 hover:bg-slate-50" onClick={handleEmptyTrash}>
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
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-700">⚠️ Scans in trash will be permanently deleted after 30 days. Restore them before then if needed.</p>
        </div>

        {/* Trash Table */}
        <Card className="bg-white border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-slate-900">Deleted Scans ({trashScans.length})</CardTitle>
            <button onClick={selectAll} className="text-sm hover:opacity-80 text-indigo-600">
              {selectedScans.length === trashScans.length ? 'Deselect All' : 'Select All'}
            </button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 w-10">
                      <input type="checkbox" checked={selectedScans.length === trashScans.length} onChange={selectAll} className="accent-indigo-600" />
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-slate-500">Target</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-500">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-500">Vulns</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-500">Severity</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-500">Deleted By</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-500">Deleted At</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedScans.map((scan) => (
                    <tr key={scan.id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <input type="checkbox" checked={selectedScans.includes(scan.id)} onChange={() => toggleSelect(scan.id)} className="accent-indigo-600" />
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-sm line-through text-slate-900 opacity-60">{scan.target}</span>
                      </td>
                      <td className="py-3 px-4"><StatusChip status={scan.status as any} size="sm" /></td>
                      <td className="py-3 px-4 font-semibold text-slate-900">{scan.vulnerabilities}</td>
                      <td className="py-3 px-4"><SeverityChip severity={scan.severity as any} size="sm" /></td>
                      <td className="py-3 px-4 text-slate-500">{scan.deletedBy}</td>
                      <td className="py-3 px-4 text-slate-500">{scan.deletedAt}</td>
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

        {/* Permanent Delete Confirmation Dialog */}
        <ConfirmDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, scanIds: [] })}
          title="Permanently Delete Scans" description={deleteDialog.scanIds.length > 0 ? `Are you sure you want to permanently delete ${deleteDialog.scanIds.length} scan(s)? This action cannot be undone.` : ''}
          confirmLabel="Delete Forever" variant="destructive" onConfirm={confirmPermanentDelete} />
        </>
       )}
    </div>
  );
}
