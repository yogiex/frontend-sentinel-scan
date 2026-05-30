/**
 * Ticket Table Component (List View)
 * Path: src/pages/Dashboard/Tickets/components/TicketTable.tsx
 *
 * Displays tickets in a vertical list using TicketCard components.
 * Extracted from TicketList.tsx for better separation of concerns.
 */
import { Ticket } from '@/types/ticket';
import { TicketCard } from '@/components/dashboard/TicketCard';
import { Card } from '@/components/ui/card';

export function TicketTable({ tickets }: { tickets: Ticket[] }) {
  if (tickets.length === 0) {
    return (
      <Card className="p-8 text-center bg-white border-slate-200">
        <p className="font-mono text-slate-500">
          NO TICKETS FOUND. CREATE ONE TO GET STARTED.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {tickets.map(ticket => (
        <TicketCard key={ticket.id} ticket={ticket} />
      ))}
    </div>
  );
}
