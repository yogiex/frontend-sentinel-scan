import { Ticket, TicketStatus, TicketPriority } from '@/types/ticket';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TicketCardProps {
  ticket: Ticket;
  showActions?: boolean;
}

const statusColors: Record<TicketStatus, string> = {
  open: 'bg-amber-100 text-amber-800',
  in_progress: 'bg-indigo-100 text-indigo-800',
  fixed: 'bg-emerald-100 text-emerald-800',
  verified: 'bg-indigo-100 text-indigo-800',
  wont_fix: 'bg-slate-100 text-slate-800',
};

const priorityColors: Record<TicketPriority, string> = {
  critical: 'bg-red-100 text-red-800',
  high: 'bg-orange-100 text-orange-800',
  medium: 'bg-amber-100 text-amber-800',
  low: 'bg-emerald-100 text-emerald-800',
};

export function TicketCard({ ticket, showActions = true }: TicketCardProps) {
  const navigate = useNavigate();
  const isOverdue = new Date(ticket.dueDate) < new Date() && 
    !['fixed', 'verified', 'wont_fix'].includes(ticket.status);

  return (
    <Card 
      className={`cursor-pointer hover:shadow-lg transition-shadow ${isOverdue ? 'border-red-500' : ''}`}
      onClick={() => navigate(`/dashboard/tickets/${ticket.id}`)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">
            {ticket.title}
          </CardTitle>
          <div className="flex gap-2">
            <Badge className={statusColors[ticket.status]}>
              {ticket.status.replace('_', ' ')}
            </Badge>
            <Badge className={priorityColors[ticket.priority]}>
              {ticket.priority}
            </Badge>
          </div>
        </div>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {ticket.id} • CVE: {ticket.cveId || 'N/A'} • CVSS: {ticket.cvssScore || 'N/A'}
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {ticket.description}
        </p>
        
        <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
          <div className="flex items-center gap-1">
            <User size={14} />
            <span>Assigned to: {ticket.assignedTo}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar size={14} />
            <span className={isOverdue ? 'text-red-600 font-semibold' : ''}>
              Due: {new Date(ticket.dueDate).toLocaleDateString()}
              {isOverdue && ' (OVERDUE)'}
            </span>
          </div>
        </div>

        {showActions && (
          <div className="flex gap-2 pt-3" onClick={(e) => e.stopPropagation()}>
            {ticket.status === 'open' && (
              <Button
                size="sm"
                onClick={() => {/* TODO: update status to in_progress */}}
              >
                Start Working
              </Button>
            )}
            {ticket.status === 'in_progress' && (
              <Button
                size="sm"
                onClick={() => {/* TODO: update status to fixed */}}
                className="bg-emerald-500 text-white hover:bg-emerald-600"
              >
                Mark as Fixed
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate(`/dashboard/tickets/${ticket.id}`)}
            >
              View Details
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
