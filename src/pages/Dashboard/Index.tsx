import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/shared/ui/PageHeader';
import { StatStrip, type StatItem } from '@/shared/ui/StatStrip';
import { LedgerTable, type Column } from '@/shared/ui/LedgerTable';
import { SeverityTag } from '@/shared/ui/SeverityTag';
import { StatusTag } from '@/shared/ui/StatusTag';
import { StatePanel } from '@/shared/ui/StatePanel';
import { RUNNING_STATUSES, scanStore, type Finding, type Scan } from '@/lib/scan-store';
import { SEVERITY, SEVERITY_ORDER, normalizeSeverity } from '@/shared/lib/severity';
import { formatDateTime } from '@/shared/lib/format';

function useScans() {
  const [scans, setScans] = useState<Scan[]>(() => scanStore.getScans());
  useEffect(() => {
    const load = () => setScans(scanStore.getScans());
    load();
    return scanStore.subscribe(load);
  }, []);
  return scans;
}

function allFindings(scans: Scan[]): (Finding & { scanId: string })[] {
  return scans.flatMap((s) => s.findings.map((f) => ({ ...f, scanId: s.id })));
}

export function DashboardIndex() {
  const navigate = useNavigate();
  const scans = useScans();

  const stats = useMemo(() => {
    const findings = allFindings(scans);
    const hosts = new Set(scans.flatMap((s) => s.hosts.map((h) => h.ip)));
    const running = scans.filter((s) => RUNNING_STATUSES.includes(s.status)).length;
    const completed = scans.filter((s) => s.status === 'completed').length;
    const critical = findings.filter((f) => normalizeSeverity(f.severity) === 'critical').length;
    return {
      findings,
      totalScans: scans.length,
      running,
      findingsCount: findings.length,
      critical,
      hosts: hosts.size,
      completedPct: scans.length ? Math.round((completed / scans.length) * 100) : 0,
    };
  }, [scans]);

  const items: StatItem[] = [
    { label: 'Scans', value: String(stats.totalScans), hint: 'all runs' },
    { label: 'Running', value: String(stats.running), tone: stats.running > 0 ? 'low' : 'default', hint: 'in progress' },
    { label: 'Findings', value: String(stats.findingsCount), hint: 'across all scans' },
    { label: 'Critical', value: String(stats.critical), tone: stats.critical > 0 ? 'critical' : 'ok', hint: 'needs triage' },
    { label: 'Hosts', value: String(stats.hosts), hint: 'unique targets' },
    { label: 'Completed', value: `${stats.completedPct}%`, tone: 'ok', hint: 'of all scans' },
  ];

  const activeScans = scans.filter((s) => RUNNING_STATUSES.includes(s.status));
  const recent = [...scans]
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, 8);

  const severityCounts = SEVERITY_ORDER.map((sev) => ({
    sev,
    count: stats.findings.filter((f) => normalizeSeverity(f.severity) === sev).length,
  }));
  const maxSeverity = Math.max(1, ...severityCounts.map((s) => s.count));

  const topFindings = [...stats.findings]
    .sort((a, b) => {
      const rank = (s: string) => SEVERITY_ORDER.indexOf(normalizeSeverity(s));
      return rank(a.severity) - rank(b.severity) || (b.cvssScore ?? 0) - (a.cvssScore ?? 0);
    })
    .slice(0, 6);

  const columns: Column<Scan>[] = [
    {
      key: 'target',
      header: 'Target',
      render: (s) => <span className="font-mono text-xs text-[var(--ink)]">{s.target}</span>,
    },
    {
      key: 'type',
      header: 'Type',
      secondary: true,
      render: (s) => <span className="text-[var(--steel)]">{s.scanType}</span>,
    },
    {
      key: 'findings',
      header: 'Findings',
      align: 'right',
      render: (s) => <span className="font-mono text-xs">{s.findings.length}</span>,
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
  ];

  return (
    <div className="flex flex-col gap-6 pb-10">
      <PageHeader
        title="Overview"
        description="Scan coverage, open findings, and the runs that need attention right now."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => navigate(0)}>
              <RefreshCw className="size-4" aria-hidden="true" />
              Refresh
            </Button>
            <Button size="sm" onClick={() => navigate('/dashboard/scans/new')}>
              <Plus className="size-4" aria-hidden="true" />
              New scan
            </Button>
          </>
        }
      />

      <StatStrip items={items} />

      <section aria-labelledby="active-heading" className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between">
          <h2 id="active-heading" className="text-sm font-semibold text-[var(--ink)]">
            Active scans
          </h2>
          <Button variant="link" size="sm" onClick={() => navigate('/dashboard/scans')}>
            View all scans
          </Button>
        </div>
        {activeScans.length === 0 ? (
          <StatePanel
            variant="empty"
            title="No scans running"
            description="Start a scan to watch host discovery and findings arrive here."
            action={{ label: 'New scan', onClick: () => navigate('/dashboard/scans/new') }}
          />
        ) : (
          <ul className="divide-y divide-[var(--rule)] overflow-hidden rounded-md border border-[var(--rule)]">
            {activeScans.map((s) => (
              <li key={s.id} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-mono text-xs text-[var(--ink)]">{s.target}</p>
                  <p className="mt-0.5 text-xs text-[var(--steel)]">
                    {s.scanType} · {s.profile} · started {formatDateTime(s.startedAt)}
                  </p>
                </div>
                <div className="flex items-center gap-3 sm:w-64">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-sm bg-[var(--surface)]">
                    <div
                      className="h-full bg-[var(--signal)]"
                      style={{ width: `${Math.min(100, Math.max(0, s.progress))}%` }}
                      role="progressbar"
                      aria-valuenow={s.progress}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${s.target} progress`}
                    />
                  </div>
                  <span className="tnum w-10 text-right font-mono text-xs text-[var(--steel)]">{s.progress}%</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate(`/dashboard/scans/${s.id}/progress`)}>
                  Open
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <section aria-labelledby="recent-heading" className="flex flex-col gap-2">
          <h2 id="recent-heading" className="text-sm font-semibold text-[var(--ink)]">
            Recent scans
          </h2>
          <LedgerTable
            columns={columns}
            rows={recent}
            getKey={(s) => s.id}
            onRowClick={(s) => navigate(`/dashboard/scans/${s.id}`)}
            emptyTitle="No scans yet"
            emptyDescription="Create the first scan to populate this ledger."
            emptyAction={{ label: 'New scan', onClick: () => navigate('/dashboard/scans/new') }}
            caption="Most recent scans with status and finding counts"
          />
        </section>

        <section aria-labelledby="severity-heading" className="flex flex-col gap-2">
          <h2 id="severity-heading" className="text-sm font-semibold text-[var(--ink)]">
            Findings by severity
          </h2>
          <div className="rounded-md border border-[var(--rule)] p-4">
            {stats.findingsCount === 0 ? (
              <p className="text-sm text-[var(--steel)]">No findings recorded yet.</p>
            ) : (
              <ul className="flex flex-col gap-2.5">
                {severityCounts.map(({ sev, count }) => {
                  const meta = SEVERITY[sev];
                  return (
                    <li key={sev} className="flex items-center gap-3">
                      <span className="w-16 shrink-0 text-xs text-[var(--steel)]">{meta.label}</span>
                      <div className="h-2 flex-1 overflow-hidden rounded-sm bg-[var(--surface)]">
                        <div
                          className="h-full"
                          style={{ width: `${(count / maxSeverity) * 100}%`, backgroundColor: meta.fill }}
                        />
                      </div>
                      <span className="tnum w-8 text-right font-mono text-xs text-[var(--ink)]">{count}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>
      </div>

      <section aria-labelledby="top-heading" className="flex flex-col gap-2">
        <h2 id="top-heading" className="text-sm font-semibold text-[var(--ink)]">
          Needs triage
        </h2>
        <ul className="divide-y divide-[var(--rule)] overflow-hidden rounded-md border border-[var(--rule)]">
          {topFindings.length === 0 && (
            <li className="px-4 py-6 text-center text-sm text-[var(--steel)]">Nothing open right now.</li>
          )}
          {topFindings.map((f) => (
            <li key={`${f.scanId}-${f.id}`} className="flex flex-wrap items-center gap-2 px-4 py-2.5">
              <SeverityTag severity={f.severity} score={f.cvssScore} />
              <button
                type="button"
                onClick={() => navigate(`/dashboard/scans/${f.scanId}/results/${f.id}`)}
                className="min-w-0 flex-1 truncate text-left text-sm text-[var(--ink)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--signal)]"
              >
                {f.title}
              </button>
              <span className="font-mono text-xs text-[var(--steel)]">{f.host}</span>
              {f.cveId && (
                <span className="rounded-sm border border-[var(--rule)] px-1.5 py-0.5 font-mono text-[11px] text-[var(--steel)]">
                  {f.cveId}
                </span>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
