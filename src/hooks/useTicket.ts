import { useState, useCallback, useEffect } from 'react';
import { Ticket, TicketStatus, TicketFilters, TicketComment } from '@/types/ticket';
import { ticketStore, createTicket, updateTicketStatus } from '@/lib/ticket-store';

export function useTicket() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filters, setFilters] = useState<TicketFilters>({
    status: 'all',
    priority: 'all',
    assignedTo: 'all',
  });

  useEffect(() => {
    setTickets(ticketStore.getAll());
    const unsub = ticketStore.subscribe(() => {
      setTickets(ticketStore.getAll());
    });
    return unsub;
  }, []);

  const filteredTickets = tickets.filter(ticket => {
    if (filters.status !== 'all' && ticket.status !== filters.status) return false;
    if (filters.priority !== 'all' && ticket.priority !== filters.priority) return false;
    if (filters.assignedTo !== 'all' && ticket.assignedTo !== filters.assignedTo) return false;
    return true;
  });

  const getTicketById = useCallback((id: string) => {
    return tickets.find(ticket => ticket.id === id) ?? ticketStore.getById(id) ?? null;
  }, [tickets]);

  const createTicketCb = useCallback((ticketData: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'comments'>) => {
    return createTicket(ticketData);
  }, []);

  const updateTicketStatusCb = useCallback((id: string, status: TicketStatus) => {
    return updateTicketStatus(id, status);
  }, []);

  const addComment = useCallback((ticketId: string, comment: Omit<TicketComment, 'id' | 'createdAt'>) => {
    const ticket = ticketStore.getById(ticketId);
    if (!ticket) return;
    const newComment: TicketComment = {
      ...comment,
      id: `comment-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    ticketStore.update(ticketId, {
      comments: [...ticket.comments, newComment],
      updatedAt: new Date().toISOString(),
    } as Partial<Ticket>);
  }, []);

  const getMyTickets = useCallback((userId: string) => {
    return tickets.filter(ticket => ticket.assignedTo === userId);
  }, [tickets]);

  const getOverdueTickets = useCallback(() => {
    const now = new Date();
    return tickets.filter(ticket => {
      if (ticket.status === 'fixed' || ticket.status === 'verified' || ticket.status === 'wont_fix') {
        return false;
      }
      return new Date(ticket.dueDate) < now;
    });
  }, [tickets]);

  return {
    tickets: filteredTickets,
    allTickets: tickets,
    filters,
    setFilters,
    getTicketById,
    createTicket: createTicketCb,
    updateTicketStatus: updateTicketStatusCb,
    addComment,
    getMyTickets,
    getOverdueTickets,
  };
}
