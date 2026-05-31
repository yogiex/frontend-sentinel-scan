import { Store } from './store';
import type { Ticket, TicketStatus } from '@/types/ticket';

const STORAGE_KEY = 'sentinelscan_tickets';

let nextCodeNum = 4;

function generateId(): string {
  const code = `TKT-${String(nextCodeNum).padStart(3, '0')}`;
  nextCodeNum++;
  return code;
}

function loadNextCode(): void {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const max = Math.max(
          ...parsed.map((t: Ticket) => {
            const num = parseInt(t.id.replace('TKT-', ''), 10);
            return isNaN(num) ? 0 : num;
          })
        );
        nextCodeNum = max + 1;
      }
    }
  } catch {
    // ignore
  }
}

loadNextCode();

import { mockTickets } from '@/types/ticket';

export const ticketStore = new Store<Ticket>(STORAGE_KEY, mockTickets);

export function createTicket(data: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'comments'>): Ticket {
  const now = new Date().toISOString();
  const ticket: Ticket = {
    ...data,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
    comments: [],
  };
  ticketStore.create(ticket);
  return ticket;
}

export function updateTicketStatus(id: string, status: TicketStatus): Ticket | undefined {
  return ticketStore.update(id, { status, updatedAt: new Date().toISOString() } as Partial<Ticket>);
}
