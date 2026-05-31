/**
 * Ticket Filters Component
 * Path: src/pages/Dashboard/Tickets/components/TicketFilters.tsx
 *
 * Status and priority filter controls for the ticket list view.
 * Extracted from TicketList.tsx for better separation of concerns.
 */
import { TicketStatus, TicketPriority } from '@/types/ticket';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter } from 'lucide-react';

interface TicketFiltersProps {
  status: TicketStatus | 'all';
  priority: TicketPriority | 'all';
  onStatusChange: (status: TicketStatus | 'all') => void;
  onPriorityChange: (priority: TicketPriority | 'all') => void;
}

export function TicketFilters({
  status,
  priority,
  onStatusChange,
  onPriorityChange
}: TicketFiltersProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-4 flex-wrap">
        <Filter className="w-4 h-4 text-[var(--text-secondary)]" />
        <Select
          value={status}
          onValueChange={(v) => onStatusChange(v as TicketStatus | 'all')}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="fixed">Fixed</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="wont_fix">Won't Fix</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={priority}
          onValueChange={(v) => onPriorityChange(v as TicketPriority | 'all')}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </Card>
  );
}
