/**
 * Ticket List Page - Orchestrator
 * Path: src/pages/Dashboard/Tickets/TicketList.tsx
 *
 * Clean modern light theme with list/Kanban toggle.
 * Acts as orchestrator - delegates to extracted components.
 */
import { useTicket } from '@/hooks/useTicket';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TicketTable } from './components/TicketTable';
import { TicketFilters } from './components/TicketFilters';

// ─── Main Ticket List Page (List View) ─────────────────────────
export function TicketList() {
  const { tickets, filters, setFilters, getOverdueTickets } = useTicket();
  const navigate = useNavigate();
  const overdueCount = getOverdueTickets().length;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] p-6">
      <div className="mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-600 rounded-xl">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <div>
                  <CardTitle>Tickets</CardTitle>
                  <CardDescription>Vulnerability remediation tracking</CardDescription>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* View Mode Navigation */}
                <div className="flex rounded-lg overflow-hidden border border-[var(--border)]">
                  <Button
                    variant="default"
                    size="sm"
                    className="rounded-none px-4"
                  >
                    List
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/dashboard/tickets/kanban')}
                    className="rounded-none px-4 text-[var(--text-secondary)]"
                  >
                    Kanban
                  </Button>
                </div>

                <Button
                  variant="primary"
                  onClick={() => navigate('/dashboard/tickets/new')}
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  New Ticket
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-sm text-[var(--text-secondary)] pt-0">
            <Badge variant="secondary">{tickets.length} total</Badge>
            {overdueCount > 0 && (
              <Badge variant="destructive">{overdueCount} overdue</Badge>
            )}
          </CardContent>
        </Card>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <TicketFilters
              status={filters.status}
              priority={filters.priority}
              onStatusChange={(v) => setFilters({ ...filters, status: v })}
              onPriorityChange={(v) => setFilters({ ...filters, priority: v })}
            />
          </CardContent>
        </Card>

        {/* Ticket List */}
        <Card>
          <CardContent className="pt-6">
            <TicketTable tickets={tickets} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
