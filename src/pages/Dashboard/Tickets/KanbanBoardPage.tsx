import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTicket } from '@/hooks/useTicket';
import { TicketStatus } from '@/types/ticket';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { KanbanBoard } from './components/KanbanBoard';

export function KanbanBoardPage() {
  const { tickets, allTickets, updateTicketStatus } = useTicket();
  const navigate = useNavigate();

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

    const sourceGroup = source.group;
    const targetGroup = target.group;

    if (sourceGroup && targetGroup && sourceGroup === targetGroup) {
      return;
    }

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
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <Card className="rounded-none border-x-0 border-t-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Kanban Board</CardTitle>
              <p className="text-sm text-[var(--text-secondary)] mt-0.5">
                Drag tickets between columns to update status
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard/tickets')}
              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Back to List
            </Button>
          </div>
        </CardHeader>
      </Card>
      <div className="p-6">
        <KanbanBoard
          tickets={tickets}
          allTickets={allTickets}
          onTicketClick={handleTicketClick}
          onDragEnd={handleDragEnd}
        />
      </div>
    </div>
  );
}
