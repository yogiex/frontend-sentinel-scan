import { describe, it, expect } from 'vitest';
import { SLA_DAYS, mockTickets } from './ticket';

describe('Ticket Types', () => {
  it('has correct SLA days for priorities', () => {
    expect(SLA_DAYS.critical).toBe(7);
    expect(SLA_DAYS.high).toBe(30);
    expect(SLA_DAYS.medium).toBe(90);
    expect(SLA_DAYS.low).toBe(180);
  });

  it('has valid mock tickets', () => {
    expect(mockTickets.length).toBeGreaterThan(0);
    mockTickets.forEach(ticket => {
      expect(ticket.id).toBeTruthy();
      expect(ticket.status).toBeTruthy();
      expect(ticket.priority).toBeTruthy();
      expect(ticket.assignedTo).toBeTruthy();
    });
  });

  it('calculates due date correctly based on SLA', () => {
    const ticket = mockTickets[0];
    const createdDate = new Date(ticket.createdAt);
    const dueDate = new Date(ticket.dueDate);
    const diffDays = Math.ceil((dueDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
    expect(diffDays).toBe(SLA_DAYS[ticket.priority]);
  });
});
