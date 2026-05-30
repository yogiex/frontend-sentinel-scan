import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTicket } from '@/hooks/useTicket';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Calendar, User, AlertTriangle } from 'lucide-react';
import { TicketStatus, TicketPriority } from '@/types/ticket';

const statusColors: Record<TicketStatus, string> = {
  open: 'bg-blue-100 text-blue-800', in_progress: 'bg-yellow-100 text-yellow-800',
  fixed: 'bg-green-100 text-green-800', verified: 'bg-emerald-100 text-emerald-800',
  wont_fix: 'bg-gray-100 text-gray-800',
};
const priorityColors: Record<TicketPriority, string> = {
  critical: 'bg-red-100 text-red-800', high: 'bg-orange-100 text-orange-800',
  medium: 'bg-yellow-100 text-yellow-800', low: 'bg-green-100 text-green-800',
};

export function TicketDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getTicketById, updateTicketStatus, addComment } = useTicket();
  const ticket = getTicketById(id!);
  const [newComment, setNewComment] = React.useState('');

  if (!ticket) return <div className="text-center p-8 text-slate-500">Ticket not found</div>;

  const isOverdue = new Date(ticket.dueDate) < new Date() && !['fixed', 'verified', 'wont_fix'].includes(ticket.status);

  return (
    <div className="space-y-6 max-w-4xl">
      <Button variant="ghost" onClick={() => navigate('/dashboard/tickets')} className="text-slate-500 hover:text-slate-900">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back
      </Button>

      <Card className={isOverdue ? 'border-red-500' : 'border-slate-200'}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl text-slate-900">{ticket.title}</CardTitle>
              <p className="text-sm mt-1 text-slate-500">{ticket.id}</p>
            </div>
            <div className="flex gap-2">
              <Badge className={statusColors[ticket.status]}>{ticket.status.replace('_', ' ')}</Badge>
              <Badge className={priorityColors[ticket.priority]}>{ticket.priority}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4 text-sm text-slate-500">
            <div className="flex items-center gap-2"><User className="w-4 h-4" /> Assigned to: {ticket.assignedTo}</div>
            <div className="flex items-center gap-2"><Calendar className="w-4 h-4" />
              <span className={isOverdue ? 'text-red-600 font-semibold' : ''}>Due: {new Date(ticket.dueDate).toLocaleDateString()} {isOverdue && '(OVERDUE)'}</span>
            </div>
            {ticket.cveId && <div className="flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> CVE: {ticket.cveId}</div>}
            {ticket.cvssScore && <div>CVSS: {ticket.cvssScore}</div>}
          </div>

          <div><h3 className="font-semibold mb-2 text-slate-900">Description</h3>
            <p className="text-slate-500">{ticket.description}</p></div>

          {ticket.remediation && <div><h3 className="font-semibold mb-2 text-slate-900">Remediation</h3>
            <pre className="p-4 rounded-lg text-sm bg-slate-50 text-slate-900">{ticket.remediation}</pre></div>}

          <div className="flex gap-2 pt-4 border-t border-slate-200">
            {ticket.status === 'open' && <Button onClick={() => updateTicketStatus(ticket.id, 'in_progress')} className="bg-indigo-600 text-white hover:bg-indigo-700">Start Working</Button>}
            {ticket.status === 'in_progress' && <Button onClick={() => updateTicketStatus(ticket.id, 'fixed')} className="bg-emerald-500 text-white hover:bg-emerald-600">Mark as Fixed</Button>}
            {ticket.status === 'fixed' && <Button onClick={() => updateTicketStatus(ticket.id, 'verified')} className="bg-indigo-600 text-white hover:bg-indigo-700">Verify Fix</Button>}
          </div>
        </CardContent>
      </Card>

      <Card><CardHeader><CardTitle className="text-slate-900">Comments</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {ticket.comments.map(c => (
            <div key={c.id} className="p-3 rounded-lg bg-slate-50">
              <div className="flex items-center justify-between mb-2"><span className="font-semibold text-sm text-slate-900">{c.author}</span>
                <span className="text-xs text-slate-500">{new Date(c.createdAt).toLocaleString()}</span></div>
              <p className="text-sm text-slate-500">{c.message}</p>
            </div>
          ))}
          <div className="space-y-2 pt-4 border-t border-slate-200">
            <Textarea placeholder="Add a comment..." value={newComment} onChange={e => setNewComment(e.target.value)} className="bg-slate-50 text-slate-900" />
            <Button onClick={() => { addComment(ticket.id, { author: 'current-user', message: newComment }); setNewComment(''); }} disabled={!newComment.trim()} className="bg-indigo-600 text-white hover:bg-indigo-700">Add Comment</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
