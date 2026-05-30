/**
 * Ticket List Page - Orchestrator
 * Path: src/pages/Dashboard/Tickets/TicketList.tsx
 *
 * Light theme with industrial cyber-safety aesthetic.
 * Switch between list view and Trello-style Kanban board with drag-and-drop.
 * Acts as orchestrator - delegates to extracted components.
 */
import { useState, useCallback } from 'react';
import { useTicket } from '@/hooks/useTicket';
import { TicketStatus } from '@/types/ticket';
import { Button } from '@/components/ui/button';
import { Plus, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { KanbanBoard } from './components/KanbanBoard';
import { TicketTable } from './components/TicketTable';
import { TicketFilters } from './components/TicketFilters';

// ─── Main Ticket List Page (Orchestrator) ───────────────────────
export function TicketList() {
  const { tickets, allTickets, filters, setFilters, getOverdueTickets, updateTicketStatus } = useTicket();
  const navigate = useNavigate();
  const overdueCount = getOverdueTickets().length;
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');

  const handleTicketClick = useCallback((ticketId: string) => {
    navigate(`/dashboard/tickets/${ticketId}`);
  }, [navigate]);

  const handleDragEnd = useCallback((event: any) => {
    if (event.canceled) return;

    const { source, target } = event.operation;
    if (!source || !target) return;

    const ticketId = source.id as string;
    const targetId = target.id as string;
    const COLUMNS: TicketStatus[] = ['open', 'in_progress', 'fixed', 'verified', 'wont_fix'];

    // Check if it's a sortable operation (same group = same column)
    const sourceGroup = source.group;
    const targetGroup = target.group;

    if (sourceGroup && targetGroup && sourceGroup === targetGroup) {
      // Reordering within the same column - no status change needed
      return;
    }

    // Cross-column move
    if (COLUMNS.includes(targetId as TicketStatus)) {
      updateTicketStatus(ticketId, targetId as TicketStatus);
    } else {
      const targetTicket = allTickets.find(t => t.id === targetId);
      if (targetTicket) {
        updateTicketStatus(ticketId, targetTicket.status);
      }
    }
  }, [allTickets, updateTicketStatus]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
      <div className="mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between bg-white rounded-2xl p-8 shadow-sm border border-blue-100">
          <div>
            <h1 className="text-4xl font-bold font-mono flex items-center gap-4 text-gray-900">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              TICKETS
            </h1>
            <p className="font-mono text-sm mt-2 text-gray-600 tracking-wide">
              VULNERABILITY REMEDIATION SYSTEM
              <span className="ml-3 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                {tickets.length} TOTAL
              </span>
              {overdueCount > 0 && (
                <span className="ml-2 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                  {overdueCount} OVERDUE
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* View Mode Toggle */}
            <div className="flex rounded-xl overflow-hidden border-2 border-gray-200 bg-gray-50 shadow-sm">
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className={`rounded-none font-mono font-semibold text-sm px-6 py-3 transition-all duration-200 ${
                  viewMode === 'list'
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md hover:from-blue-600 hover:to-indigo-700'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                LIST
              </Button>
              <Button
                variant={viewMode === 'kanban' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('kanban')}
                className={`rounded-none font-mono font-semibold text-sm px-6 py-3 transition-all duration-200 ${
                  viewMode === 'kanban'
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md hover:from-blue-600 hover:to-indigo-700'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                KANBAN
              </Button>
            </div>

            <Button
              className="font-mono font-bold tracking-wider bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 rounded-xl px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              onClick={() => navigate('/dashboard/tickets/new')}
            >
              <Plus className="w-5 h-5 mr-2" />
              NEW TICKET
            </Button>
          </div>
        </div>

        {/* Filters (only in List view) */}
        {viewMode === 'list' && (
          <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-6">
            <TicketFilters
              status={filters.status}
              priority={filters.priority}
              onStatusChange={(v) => setFilters({ ...filters, status: v })}
              onPriorityChange={(v) => setFilters({ ...filters, priority: v })}
            />
          </div>
        )}

        {/* Content Based on View Mode */}
        <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-6">
          {viewMode === 'list' ? (
            <TicketTable tickets={tickets} />
          ) : (
            <KanbanBoard
              tickets={tickets}
              allTickets={allTickets}
              onTicketClick={handleTicketClick}
              onDragEnd={handleDragEnd}
            />
          )}
        </div>
      </div>
    </div>
  );
}
