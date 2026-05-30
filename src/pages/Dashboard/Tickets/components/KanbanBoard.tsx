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

// ─── Aesthetic: Light Theme Hazard Colors ───────────────────────
export const STATUS_COLORS: Record<TicketStatus, { bg: string; border: string; accent: string; stripe: string }> = {
  open: {
    bg: 'rgba(245, 158, 11, 0.08)',
    border: '#f59e0b', // amber-500
    accent: '#f59e0b', // amber-500
    stripe: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(245, 158, 11, 0.08) 10px, rgba(245, 158, 11, 0.08) 20px)',
  },
  in_progress: {
    bg: 'rgba(79, 70, 229, 0.08)',
    border: '#4f46e5', // indigo-600
    accent: '#4f46e5', // indigo-600
    stripe: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(79, 70, 229, 0.08) 10px, rgba(79, 70, 229, 0.08) 20px)',
  },
  fixed: {
    bg: 'rgba(16, 185, 129, 0.08)',
    border: '#10b981', // emerald-500
    accent: '#10b981', // emerald-500
    stripe: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(16, 185, 129, 0.08) 10px, rgba(16, 185, 129, 0.08) 20px)',
  },
  verified: {
    bg: 'rgba(79, 70, 229, 0.08)',
    border: '#4f46e5', // indigo-600
    accent: '#4f46e5', // indigo-600
    stripe: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(79, 70, 229, 0.08) 10px, rgba(79, 70, 229, 0.08) 20px)',
  },
  wont_fix: {
    bg: 'rgba(100, 116, 139, 0.08)',
    border: '#64748b', // slate-500
    accent: '#64748b', // slate-500
    stripe: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(100, 116, 139, 0.08) 10px, rgba(100, 116, 139, 0.08) 20px)',
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
          className="p-3 space-y-2 border-l-4"
          style={{
            backgroundColor: '#ffffff',
            borderColor: priority.color,
            boxShadow: isDropTarget ? `0 0 0 2px ${priority.color}40` : '0 1px 3px rgba(0, 0, 0, 0.1)',
          }}
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-slate-500">
              {ticket.id}
            </span>
            <span
              className="font-mono text-[0.6rem] font-bold"
              style={{ color: priority.color }}
            >
              {ticket.priority.toUpperCase()}
            </span>
          </div>

          <h4 className="font-bold text-sm leading-tight text-slate-900">
            {ticket.title}
          </h4>

          {ticket.cvssScore && (
            <span
              className="font-mono text-[0.65rem] px-1.5 py-0.5 rounded-md border"
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
            <div className="flex items-center gap-1 text-[0.65rem] font-mono font-bold text-red-500">
              <AlertTriangle className="w-3 h-3" />
              OVERDUE
            </div>
          )}
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
      className="flex flex-col w-80 min-w-80 rounded-lg overflow-hidden border-2"
      style={{
        borderColor: colors.border,
      }}
    >
      {/* Hazard Stripe Header */}
      <div
        className="p-3 font-mono font-bold text-sm uppercase tracking-wider flex items-center justify-between border-b-2"
        style={{
          backgroundColor: colors.bg,
          borderBottomColor: colors.border,
          color: colors.accent,
          backgroundImage: colors.stripe,
          opacity: 0.9,
        }}
      >
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4" />
          {statusLabel}
        </div>
        <Badge
          className="font-mono text-[0.7rem]"
          style={{
            backgroundColor: colors.accent,
            color: '#fff',
            opacity: 0.7,
          }}
        >
          {tickets.length}
        </Badge>
      </div>

      {/* Sortable Tickets List */}
      <div
        className="flex-1 p-2 space-y-2 min-h-96 overflow-y-auto bg-white"
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
          <div className="text-center py-8 font-mono text-xs text-slate-500">
            <Icon className="w-8 h-8 mx-auto mb-2" style={{ color: colors.accent }} />
            NO {statusLabel} TICKETS
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
            className="p-3 rounded-lg shadow-2xl w-72 scale-105 border-l-4"
            style={{
              backgroundColor: '#ffffff',
              borderColor: activeTicket.priority === 'critical' ? '#ef4444' :
                             activeTicket.priority === 'high' ? '#F97316' :
                             activeTicket.priority === 'medium' ? '#f59e0b' : '#10b981',
            }}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-slate-500">
                {activeTicket.id}
              </span>
              <span className="font-mono text-[0.6rem] font-bold" style={{
                color: activeTicket.priority === 'critical' ? '#ef4444' :
                       activeTicket.priority === 'high' ? '#F97316' :
                       activeTicket.priority === 'medium' ? '#f59e0b' : '#10b981',
              }}>
                {activeTicket.priority.toUpperCase()}
              </span>
            </div>
            <h4 className="font-bold text-sm mt-2 text-slate-900">
              {activeTicket.title}
            </h4>
          </div>
        ) : null}
      </DragOverlay>
    </DragDropProvider>
  );
}
