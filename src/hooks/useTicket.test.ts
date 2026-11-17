import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTicket } from './useTicket';

describe('useTicket Hook', () => {
  it('loads mock tickets on init', () => {
    const { result } = renderHook(() => useTicket());
    expect(result.current.allTickets.length).toBeGreaterThan(0);
  });

  it('filters tickets by status', () => {
    const { result } = renderHook(() => useTicket());
    act(() => {
      result.current.setFilters({ status: 'open', priority: 'all', assignedTo: 'all' });
    });
    expect(result.current.tickets.every(t => t.status === 'open')).toBe(true);
  });

  it('creates new ticket', () => {
    const { result } = renderHook(() => useTicket());
    act(() => {
      result.current.createTicket({
        vulnerabilityId: 'vuln-999',
        scanId: 'scan-999',
        title: 'Test Ticket',
        description: 'Test description',
        status: 'open',
        priority: 'low',
        assignedTo: 'user-1',
        createdBy: 'user-1',
        dueDate: '2026-12-31T00:00:00Z',
        remediation: 'Test fix',
      });
    });
    expect(result.current.allTickets.length).toBeGreaterThan(3);
    expect(result.current.allTickets[result.current.allTickets.length - 1].title).toBe('Test Ticket');
  });

  it('updates ticket status', () => {
    const { result } = renderHook(() => useTicket());
    const ticketId = result.current.allTickets[0].id;
    act(() => {
      result.current.updateTicketStatus(ticketId, 'in_progress');
    });
    expect(result.current.getTicketById(ticketId)?.status).toBe('in_progress');
  });

  it('adds comment to ticket', () => {
    const { result } = renderHook(() => useTicket());
    const ticketId = result.current.allTickets[0].id;
    act(() => {
      result.current.addComment(ticketId, {
        author: 'user-1',
        message: 'Test comment',
      });
    });
    expect(result.current.getTicketById(ticketId)?.comments.length).toBeGreaterThan(0);
  });

  it('gets my tickets', () => {
    const { result } = renderHook(() => useTicket());
    const myTickets = result.current.getMyTickets('user-2');
    expect(myTickets.every(t => t.assignedTo === 'user-2')).toBe(true);
  });

  it('gets overdue tickets', () => {
    const { result } = renderHook(() => useTicket());
    // Mock an overdue ticket
    act(() => {
      result.current.createTicket({
        vulnerabilityId: 'vuln-overdue',
        scanId: 'scan-001',
        title: 'Overdue Ticket',
        description: 'This is overdue',
        status: 'open',
        priority: 'critical',
        assignedTo: 'user-1',
        createdBy: 'user-1',
        dueDate: '2026-01-01T00:00:00Z', // Past date
        remediation: 'Fix it',
      });
    });
    const overdue = result.current.getOverdueTickets();
    expect(overdue.length).toBeGreaterThan(0);
  });
});
