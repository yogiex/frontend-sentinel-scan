import type { ReactNode } from 'react';
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { StatePanel } from './StatePanel';

export interface Column<T> {
  key: string;
  header: string;
  align?: 'left' | 'right';
  /** hidden below md breakpoint */
  secondary?: boolean;
  width?: string;
  render: (row: T) => ReactNode;
}

export interface LedgerTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  getKey: (row: T) => string;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: { label: string; onClick: () => void };
  sort?: { key: string; dir: 'asc' | 'desc' };
  onSortChange?: (key: string) => void;
  page?: number;
  pageCount?: number;
  total?: number;
  onPageChange?: (page: number) => void;
  onRowClick?: (row: T) => void;
  caption?: string;
  className?: string;
}

export function LedgerTable<T>({
  columns,
  rows,
  getKey,
  loading = false,
  error,
  onRetry,
  emptyTitle,
  emptyDescription,
  emptyAction,
  sort,
  onSortChange,
  page,
  pageCount,
  total,
  onPageChange,
  onRowClick,
  caption,
  className,
}: LedgerTableProps<T>) {
  if (error) {
    return (
      <StatePanel
        variant="error"
        title="Could not load this table"
        description={error}
        action={onRetry ? { label: 'Try again', onClick: onRetry } : undefined}
      />
    );
  }

  if (loading) {
    return (
      <div className="overflow-hidden rounded-md border border-[var(--rule)]" role="status" aria-busy="true">
        <div className="h-10 border-b border-[var(--rule)] bg-[var(--surface)]" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex h-10 items-center gap-3 border-b border-[var(--rule-light)] px-3 last:border-0">
            <div className="h-3 w-1/4 animate-pulse rounded-sm bg-[var(--rule)]/60" />
            <div className="h-3 w-1/3 animate-pulse rounded-sm bg-[var(--rule)]/60" />
            <div className="ml-auto h-3 w-16 animate-pulse rounded-sm bg-[var(--rule)]/60" />
          </div>
        ))}
        <span className="sr-only">Loading table data</span>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <StatePanel
        variant="empty"
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
      />
    );
  }

  return (
    <div className={cn('overflow-hidden rounded-md border border-[var(--rule)] bg-[var(--paper)]', className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          {caption && <caption className="sr-only">{caption}</caption>}
          <thead>
            <tr className="h-10 border-b border-[var(--rule)] bg-[var(--surface)]">
              {columns.map((col) => {
                const active = sort?.key === col.key;
                return (
                  <th
                    key={col.key}
                    scope="col"
                    aria-sort={active ? (sort?.dir === 'asc' ? 'ascending' : 'descending') : undefined}
                    className={cn(
                      'px-3 text-xs font-medium text-[var(--steel)] whitespace-nowrap',
                      col.align === 'right' ? 'text-right' : 'text-left',
                      col.secondary && 'hidden md:table-cell',
                    )}
                    style={col.width ? { width: col.width } : undefined}
                  >
                    {onSortChange ? (
                      <button
                        type="button"
                        onClick={() => onSortChange(col.key)}
                        className="inline-flex items-center gap-1 rounded-sm hover:text-[var(--ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--signal)]"
                      >
                        {col.header}
                        {active &&
                          (sort?.dir === 'asc' ? (
                            <ArrowUp className="size-3" aria-hidden="true" />
                          ) : (
                            <ArrowDown className="size-3" aria-hidden="true" />
                          ))}
                      </button>
                    ) : (
                      col.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={getKey(row)}
                className={cn(
                  'h-10 border-b border-[var(--rule-light)] last:border-0',
                  onRowClick && 'cursor-pointer hover:bg-[var(--surface)]',
                )}
              >
                {columns.map((col, idx) => (
                  <td
                    key={col.key}
                    className={cn(
                      'px-3',
                      col.align === 'right' ? 'text-right tnum' : 'text-left',
                      col.secondary && 'hidden md:table-cell',
                    )}
                  >
                    {idx === 0 && onRowClick ? (
                      <button
                        type="button"
                        onClick={() => onRowClick(row)}
                        className="rounded-sm text-left hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--signal)]"
                      >
                        {col.render(row)}
                      </button>
                    ) : (
                      col.render(row)
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(page !== undefined && pageCount !== undefined && pageCount > 1) && (
        <div className="flex items-center justify-between border-t border-[var(--rule)] px-3 py-2 text-xs text-[var(--steel)]">
          <span className="tnum">
            Page {page} of {pageCount}
            {total !== undefined && ` · ${total} rows`}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPageChange?.(page - 1)}
              aria-label="Previous page"
            >
              <ChevronLeft className="size-4" aria-hidden="true" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pageCount}
              onClick={() => onPageChange?.(page + 1)}
              aria-label="Next page"
            >
              <ChevronRight className="size-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
