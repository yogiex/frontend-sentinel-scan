import { Search, RefreshCw, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { DateRangePicker } from './DateRangePicker';
import type { LogLevel, AuditCategory } from '@/lib/logger';
import { cn } from '@/lib/utils';

const LEVELS: (LogLevel | 'all')[] = ['all', 'debug', 'info', 'warn', 'error', 'critical'];
const CATEGORIES: (AuditCategory | 'all')[] = ['all', 'auth', 'scan', 'export', 'user_management', 'settings', 'navigation', 'system', 'security', 'performance'];

interface FilterBarProps {
  levelFilter: LogLevel | 'all';
  categoryFilter: AuditCategory | 'all';
  searchInput: string;
  onLevelChange: (level: LogLevel | 'all') => void;
  onCategoryChange: (category: AuditCategory | 'all') => void;
  onSearchChange: (search: string) => void;
  onDateRangeChange: (range: { from?: string; to?: string }) => void;
  onRefresh: () => void;
  onExport: (format: 'json' | 'csv') => void;
  onClear: () => void;
  loading?: boolean;
}

export function FilterBar({
  levelFilter,
  categoryFilter,
  searchInput,
  onLevelChange,
  onCategoryChange,
  onSearchChange,
  onDateRangeChange,
  onRefresh,
  onExport,
  onClear,
  loading = false,
}: FilterBarProps) {
  return (
    <div className="audit-filter-bar">
      <div className="flex items-center gap-2 mb-3">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <h3 className="text-sm font-medium text-muted-foreground">Filters</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search logs..."
            value={searchInput}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 font-mono text-sm"
          />
        </div>

        {/* Level Filter */}
        <Select value={levelFilter} onValueChange={(v) => onLevelChange(v as LogLevel | 'all')}>
          <SelectTrigger className="font-mono text-sm" aria-label="Filter by level">
            <SelectValue placeholder="All Levels" />
          </SelectTrigger>
          <SelectContent>
            {LEVELS.map((l) => (
              <SelectItem key={l} value={l}>
                {l === 'all' ? 'All Levels' : l.charAt(0).toUpperCase() + l.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Category Filter */}
        <Select value={categoryFilter} onValueChange={(v) => onCategoryChange(v as AuditCategory | 'all')}>
          <SelectTrigger className="font-mono text-sm" aria-label="Filter by category">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c === 'all' ? 'All Categories' : c.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Date Range Picker */}
        <DateRangePicker onRangeChange={onDateRangeChange} />

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={onRefresh}
            disabled={loading}
            aria-label="Refresh"
          >
            <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => onExport('json')}>
                Export as JSON
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport('csv')}>
                Export as CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="destructive" size="sm" onClick={onClear}>
            Clear Logs
          </Button>
        </div>
      </div>
    </div>
  );
}
