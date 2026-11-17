import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/shared/ui/PageHeader';
import { LedgerTable, type Column } from '@/shared/ui/LedgerTable';
import { StatusTag } from '@/shared/ui/StatusTag';
import { SeverityTag } from '@/shared/ui/SeverityTag';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { RUNNING_STATUSES, scanStore, type Scan } from '@/lib/scan-store';
import { formatDateTime } from '@/shared/lib/format';
import { normalizeSeverity } from '@/shared/lib/severity';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 10;

type Filter = 'all' | 'running' | 'completed' | 'failed';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'running', label: 'Running' },
  { key: 'completed', label: 'Completed' },
  { key: 'failed', label: 'Failed' },
];

function scanSeverity(scan: Scan): string | null {
  if (scan.findings.length === 0) return null;
  const order = ['critical', 'high', 'medium', 'low', 'info'];
  const found = scan.findings
    .map((f) => normalizeSeverity(f.severity))
    .sort((a, b) => order.indexOf(a) - order.indexOf(b));
  return found[0];
}

export function AllScans() {
  const navigate = useNavigate();
  const [scans, setScans] = useState<Scan[]>(() => scanStore.getScans());
  const [filter, setFilter] = useState<Filter>('all');
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Scan | null>(null);

  useEffect(() => {
    const load = () => setScans(scanStore.getScans());
    load();
    return scanStore.subscribe(load);
  }, []);

  useEffect(() => setPage(1), [filter]);

  const filtered = useMemo(() => {
    if (filter === 'all') return scans;
    if (filter === 'running') return scans.filter((s) => RUNNING_STATUSES.includes(s.status));
    return scans.filter((s) => s.status === filter);
  }, [scans, filter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const columns: Column<Scan>[] = [
    {
      key: 'target',
      header: 'Target',
      render: (s) => (
        <span className="block max-w-[38vw] truncate font-mono text-xs text-[var(--ink)] sm:max-w-none" title={s.target}>
          {s.target}
        </span>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      secondary: true,
      render: (s) => <span className="text-[var(--steel)]">{s.scanType}</span>,
    },
    {
      key: 'profile',
      header: 'Profile',
      secondary: true,
      render: (s) => <span className="text-[var(--steel)]">{s.profile}</span>,
    },
    {
      key: 'findings',
      header: 'Findings',
      align: 'right',
      render: (s) => <span className="font-mono text-xs">{s.findings.length}</span>,
    },
    {
      key: 'severity',
      header: 'Top severity',
      secondary: true,
      render: (s) => {
        const severity = scanSeverity(s);
        return severity ? (
          <SeverityTag severity={severity} variant="bare" />
        ) : (
          <span className="text-xs text-[var(--steel)]">—</span>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (s) => <StatusTag status={s.status} kind="scan" />,
    },
    {
      key: 'created',
      header: 'Created',
      align: 'right',
      secondary: true,
      render: (s) => <span className="text-xs text-[var(--steel)]">{formatDateTime(s.createdAt)}</span>,
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      secondary: true,
      render: (s) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/dashboard/scans/${s.id}`);
            }}
          >
            Open
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Move ${s.target} to trash`}
            onClick={(e) => {
              e.stopPropagation();
              setDeleteTarget(s);
            }}
          >
            <Trash2 className="size-4" aria-hidden="true" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4 pb-10">
      <PageHeader
        title="Scans"
        description="Every scan run, its findings, and where it is in the pipeline."
        actions={
          <Button size="sm" onClick={() => navigate('/dashboard/scans/new')}>
            <Plus className="size-4" aria-hidden="true" />
            New scan
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-1" role="group" aria-label="Filter scans">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            aria-pressed={filter === f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              'rounded-sm border px-2.5 py-1 text-xs font-medium transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--signal)]',
              filter === f.key
                ? 'border-[var(--ink)] bg-[var(--ink)] text-white'
                : 'border-[var(--rule)] text-[var(--steel)] hover:bg-[var(--surface)]',
            )}
          >
            {f.label}
          </button>
        ))}
        <span className="ml-auto text-xs text-[var(--steel)]">
          {filtered.length} scan{filtered.length === 1 ? '' : 's'}
        </span>
      </div>

      <LedgerTable
        columns={columns}
        rows={rows}
        getKey={(s) => s.id}
        page={page}
        pageCount={pageCount}
        total={filtered.length}
        onPageChange={setPage}
        onRowClick={(s) => navigate(`/dashboard/scans/${s.id}`)}
        emptyTitle={filter === 'all' ? 'No scans yet' : `No ${filter} scans`}
        emptyDescription={
          filter === 'all'
            ? 'Create a scan to start collecting findings.'
            : 'Try another filter, or start a new scan.'
        }
        emptyAction={{ label: 'New scan', onClick: () => navigate('/dashboard/scans/new') }}
        caption="Scans with target, findings, and status"
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={`Move ${deleteTarget?.target ?? 'scan'} to trash?`}
        description="The scan and its findings stay recoverable from Trash until you empty it."
        confirmLabel="Move to trash"
        variant="destructive"
        onConfirm={() => {
          if (!deleteTarget) return;
          scanStore.softDelete(deleteTarget.id, 'admin');
          toast.success('Scan moved to trash');
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
