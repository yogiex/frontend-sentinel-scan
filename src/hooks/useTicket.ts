import { useState, useCallback } from 'react';
import { Ticket, TicketStatus, TicketFilters, TicketComment } from '@/types/ticket';
import { mockTickets } from '@/types/ticket';

export function useTicket() {
  const [tickets, setTickets] = useState<Ticket[]>(mockTickets);
  const [filters, setFilters] = useState<TicketFilters>({
    status: 'all',
    priority: 'all',
    assignedTo: 'all',
  });

  const filteredTickets = tickets.filter(ticket => {
    if (filters.status !== 'all' && ticket.status !== filters.status) return false;
    if (filters.priority !== 'all' && ticket.priority !== filters.priority) return false;
    if (filters.assignedTo !== 'all' && ticket.assignedTo !== filters.assignedTo) return false;
    return true;
  });

  const getTicketById = useCallback((id: string) => {
    return tickets.find(ticket => ticket.id === id);
  }, [tickets]);

  const createTicket = useCallback((ticketData: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'comments'>) => {
    const newTicket: Ticket = {
      ...ticketData,
      id: `TKT-${String(tickets.length + 1).padStart(3, '0')}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      comments: [],
    };
    setTickets(prev => [...prev, newTicket]);
    return newTicket;
  }, [tickets.length]);

  const updateTicketStatus = useCallback((id: string, status: TicketStatus) => {
    setTickets(prev => prev.map(ticket => 
      ticket.id === id 
        ? { ...ticket, status, updatedAt: new Date().toISOString() }
        : ticket
    ));
  }, []);

  const addComment = useCallback((ticketId: string, comment: Omit<TicketComment, 'id' | 'createdAt'>) => {
    setTickets(prev => prev.map(ticket =>
      ticket.id === ticketId
        ? {
            ...ticket,
            comments: [...ticket.comments, {
              ...comment,
              id: `comment-${Date.now()}`,
              createdAt: new Date().toISOString(),
            } as TicketComment],
            updatedAt: new Date().toISOString(),
          }
        : ticket
    ));
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
    createTicket,
    updateTicketStatus,
    addComment,
    getMyTickets,
    getOverdueTickets,
  };
}
