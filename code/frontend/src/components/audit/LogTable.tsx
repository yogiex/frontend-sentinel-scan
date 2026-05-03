import { useState } from 'react';
import type { AuditLogEntry, LogLevel } from '@/lib/logger';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { LevelBadge } from './LevelBadge';
import { CategoryIcon } from './CategoryIcon';
import { EmptyState } from '@/components/ui/EmptyState';
import { cn } from '@/lib/utils';

interface LogTableProps {
  entries: AuditLogEntry[];
  onExport?: (format: 'json' | 'csv') => void;
  onClear?: () => void;
  pageSize?: number;
}

export function LogTable({ entries, onExport, onClear, pageSize = 25 }: LogTableProps) {
  const [page, setPage] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const totalPages = Math.ceil(entries.length / pageSize);
  const pageEntries = entries.slice(page * pageSize, (page + 1) * pageSize);

  const levelRowClass: Record<LogLevel, string> = {
    debug: 'log-row-debug',
    info: 'log-row-info',
    warn: 'log-row-warn',
    error: 'log-row-error',
    critical: 'log-row-critical',
  };

  if (entries.length === 0) {
    return (
      <EmptyState
        title="No logs found"
        description="Activity will be recorded as you use the application"
        icon="📋"
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      {(onExport || onClear) && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground font-mono">
            Showing {pageEntries.length} of {entries.length} entries
          </p>
          <div className="flex items-center gap-2">
            {onExport && (
              <>
                <button onClick={() => onExport('json')}>Export JSON</button>
                <button onClick={() => onExport('csv')}>Export CSV</button>
              </>
            )}
            {onClear && (
              <button onClick={onClear}>Clear Logs</button>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg border border-[var(--audit-border)] overflow-x-auto">
        <Table className="audit-table">
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageEntries.map((entry) => (
              <>
                <TableRow
                  key={entry.id}
                  className={cn('cursor-pointer', levelRowClass[entry.level])}
                  onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                >
                  <TableCell className="font-mono text-xs whitespace-nowrap text-muted-foreground">
                    {new Date(entry.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <LevelBadge level={entry.level} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <CategoryIcon category={entry.category} />
                      <span className="capitalize">{entry.category.replace('_', ' ')}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{entry.action}</TableCell>
                  <TableCell className="text-muted-foreground">{entry.user}</TableCell>
                  <TableCell className="text-xs max-w-xs truncate text-muted-foreground">
                    {JSON.stringify(entry.details)}
                  </TableCell>
                </TableRow>
                {expandedId === entry.id && (
                  <TableRow>
                    <TableCell colSpan={6} className="p-0">
                      <Collapsible open={true}>
                        <CollapsibleContent>
                          <div className="p-4 bg-[var(--audit-bg-surface)] space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">{entry.action}</h4>
                              <button onClick={() => setExpandedId(null)}>✕</button>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm font-mono">
                              <div>
                                <span className="text-muted-foreground">Timestamp:</span>
                                <p className="mt-0.5 text-xs">{entry.timestamp}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Session ID:</span>
                                <p className="font-mono text-xs mt-0.5">{entry.sessionId}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">User:</span>
                                <p>{entry.user}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">User Agent:</span>
                                <p className="text-xs truncate">{entry.userAgent}</p>
                              </div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Details:</span>
                              <pre className="mt-1 p-3 rounded-lg text-xs overflow-x-auto bg-[var(--audit-bg-base)] text-foreground">
                                {JSON.stringify(entry.details, null, 2)}
                              </pre>
                            </div>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    </TableCell>
                  </TableRow>
                )}
              </>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                aria-disabled={page === 0}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => (
              <PaginationItem key={i}>
                <PaginationLink onClick={() => setPage(i)} isActive={page === i}>
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                aria-disabled={page === totalPages - 1}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
