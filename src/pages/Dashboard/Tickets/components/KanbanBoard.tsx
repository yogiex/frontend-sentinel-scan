/**
 * Kanban Board Component with Drag & Drop
 * Path: src/pages/Dashboard/Tickets/components/KanbanBoard.tsx
 *
 * Contains SortableTicketCard, KanbanColumn, and the main KanbanBoard.
 * Extracted from TicketList.tsx for better bundle optimization.
 */
import { useCallback, useMemo, useState } from 'react';
import { DragDropProvider, DragOverlay } from '@dnd-kit/react';
import { useSortable } from '@dnd-kit/react/sortable';
import { TicketStatus, TicketPriority, Ticket } from '@/types/ticket';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Clock, XCircle, CheckCircle } from 'lucide-react';

// ─── Aesthetic: Light Theme Status Colors ───────────────────────
export const STATUS_COLORS: Record<TicketStatus, { bg: string; border: string; accent: string }> = {
  open: {
    bg: 'rgba(245, 158, 11, 0.06)',
    border: '#f59e0b',
    accent: '#f59e0b',
  },
  in_progress: {
    bg: 'rgba(79, 70, 229, 0.06)',
    border: '#4f46e5',
    accent: '#4f46e5',
  },
  fixed: {
    bg: 'rgba(16, 185, 129, 0.06)',
    border: '#10b981',
    accent: '#10b981',
  },
  verified: {
    bg: 'rgba(79, 70, 229, 0.06)',
    border: '#4f46e5',
    accent: '#4f46e5',
  },
  wont_fix: {
    bg: 'rgba(100, 116, 139, 0.06)',
    border: '#64748b',
    accent: '#64748b',
  },
};

export const STATUS_ICONS: Record<TicketStatus, typeof AlertTriangle> = {
  open: AlertTriangle,
  in_progress: Clock,
  fixed: CheckCircle,
  verified: CheckCircle,
  wont_fix: XCircle,
};

export const COLUMNS: TicketStatus[] = ['open', 'in_progress', 'fixed', 'verified', 'wont_fix'];

// ─── Sortable Ticket Card for Kanban ────────────────────────────
export function SortableTicketCard({
  ticket,
  index,
  group,
  onTicketClick
}: {
  ticket: Ticket;
  index: number;
  group: TicketStatus;
  onTicketClick: (id: string) => void;
}) {
  const { ref, isDragging, isDropTarget } = useSortable({
    id: ticket.id,
    index,
    group,
  });

  const priorityConfig: Record<TicketPriority, { color: string; bgAlpha: string }> = {
    critical: { color: '#ef4444', bgAlpha: 'rgba(239, 68, 68, 0.08)' }, // red-500
    high: { color: '#F97316', bgAlpha: 'rgba(249, 115, 22, 0.08)' },
    medium: { color: '#f59e0b', bgAlpha: 'rgba(245, 158, 11, 0.08)' }, // amber-500
    low: { color: '#10b981', bgAlpha: 'rgba(16, 185, 129, 0.08)' }, // emerald-500
  };

  const isOverdue = new Date(ticket.dueDate) < new Date() &&
    !['fixed', 'verified', 'wont_fix'].includes(ticket.status);

  const priority = priorityConfig[ticket.priority];

  return (
    <div
      ref={ref}
      className="touch-none"
      style={{ touchAction: 'none' }}
    >
      <div
        className={`cursor-pointer transition-all duration-150 ${isDragging ? 'opacity-40 scale-95' : 'hover:scale-[1.02]'}`}
        onClick={() => onTicketClick(ticket.id)}
      >
        <Card
          className="p-2.5 space-y-1.5 border-l-4"
          style={{
            borderColor: priority.color,
            boxShadow: isDropTarget ? `0 0 0 2px ${priority.color}40` : '0 1px 3px rgba(0, 0, 0, 0.1)',
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[0.65rem] font-medium text-[var(--text-secondary)]">
              {ticket.id}
            </span>
            <span
              className="text-[0.6rem] font-semibold uppercase"
              style={{ color: priority.color }}
            >
              {ticket.priority}
            </span>
          </div>

          <h4 className="font-semibold text-xs leading-tight text-[var(--text-primary)]">
            {ticket.title}
          </h4>

          <div className="flex items-center gap-2">
            {ticket.cvssScore && (
              <span
                className="text-[0.6rem] px-1.5 py-0.5 rounded border"
                style={{
                  backgroundColor: ticket.cvssScore >= 7 ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                  color: ticket.cvssScore >= 7 ? '#ef4444' : '#10b981',
                  borderColor: ticket.cvssScore >= 7 ? '#ef4444' : '#10b981',
                }}
              >
                CVSS {ticket.cvssScore}
              </span>
            )}

            {isOverdue && (
              <span className="flex items-center gap-1 text-[0.6rem] font-semibold text-red-500">
                <AlertTriangle className="w-2.5 h-2.5" />
                Overdue
              </span>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── Kanban Column Component ────────────────────────────────────
export function KanbanColumn({
  status,
  tickets,
  onTicketClick
}: {
  status: TicketStatus;
  tickets: Ticket[];
  onTicketClick: (id: string) => void;
}) {
  const colors = STATUS_COLORS[status];
  const Icon = STATUS_ICONS[status];
  const statusLabel = status.replace('_', ' ').toUpperCase();

  return (
    <div
      className="flex flex-col w-[260px] min-w-[260px] rounded-lg overflow-hidden border shadow-sm"
      style={{
        borderColor: colors.border,
      }}
    >
      {/* Column Header */}
      <div
        className="px-3 py-2.5 text-sm font-semibold flex items-center justify-between border-b"
        style={{
          backgroundColor: colors.bg,
          borderBottomColor: colors.border,
          color: colors.accent,
        }}
      >
        <div className="flex items-center gap-1.5">
          <Icon className="w-3.5 h-3.5" />
          {statusLabel}
        </div>
        <Badge
          className="text-[0.65rem] px-1.5 py-0"
          style={{
            backgroundColor: colors.accent,
            color: '#fff',
          }}
        >
          {tickets.length}
        </Badge>
      </div>

      {/* Sortable Tickets List */}
      <div
        className="flex-1 p-2 space-y-2 min-h-96 overflow-y-auto bg-[var(--bg-card)]"
      >
        {tickets.map((ticket, index) => (
          <SortableTicketCard
            key={ticket.id}
            ticket={ticket}
            index={index}
            group={status}
            onTicketClick={onTicketClick}
          />
        ))}

        {tickets.length === 0 && (
          <div className="text-center py-8 text-xs text-[var(--text-secondary)]">
            <Icon className="w-6 h-6 mx-auto mb-1.5" style={{ color: colors.accent }} />
            No tickets
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Kanban Board with Drag & Drop Provider ─────────────────────
export function KanbanBoard({
  tickets,
  allTickets,
  onTicketClick,
  onDragEnd
}: {
  tickets: Ticket[];
  allTickets: Ticket[];
  onTicketClick: (id: string) => void;
  onDragEnd: (event: any) => void;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const handleDragStart = useCallback((event: any) => {
    setActiveId(event.operation.source?.id as string | null);
  }, []);

  const ticketsByStatus = useMemo(() => {
    const grouped = new Map<TicketStatus, Ticket[]>();
    COLUMNS.forEach(status => grouped.set(status, []));
    for (const ticket of tickets) {
      const column = grouped.get(ticket.status);
      if (column) {
        column.push(ticket);
      }
    }
    return grouped;
  }, [tickets]);

  const activeTicket = activeId ? allTickets.find(t => t.id === activeId) : null;

  return (
    <DragDropProvider onDragStart={handleDragStart} onDragEnd={onDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map(status => (
          <KanbanColumn
            key={status}
            status={status}
            tickets={ticketsByStatus.get(status) || []}
            onTicketClick={onTicketClick}
          />
        ))}
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeTicket ? (
          <div
            className="p-3 rounded-lg shadow-2xl w-72 scale-105 border-l-4 bg-[var(--bg-card)]"
            style={{
              borderColor: activeTicket.priority === 'critical' ? '#ef4444' :
                             activeTicket.priority === 'high' ? '#F97316' :
                             activeTicket.priority === 'medium' ? '#f59e0b' : '#10b981',
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[var(--text-secondary)]">
                {activeTicket.id}
              </span>
              <span className="text-[0.6rem] font-semibold uppercase" style={{
                color: activeTicket.priority === 'critical' ? '#ef4444' :
                       activeTicket.priority === 'high' ? '#F97316' :
                       activeTicket.priority === 'medium' ? '#f59e0b' : '#10b981',
              }}>
                {activeTicket.priority}
              </span>
            </div>
            <h4 className="font-semibold text-sm mt-2 text-[var(--text-primary)]">
              {activeTicket.title}
            </h4>
          </div>
        ) : null}
      </DragOverlay>
    </DragDropProvider>
  );
}
