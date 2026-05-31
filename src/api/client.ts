/**
 * SentinelScan API Client
 * Path: /home/mirage/Documents/code/sec/research/inkubasi-btp-cybersecurity/code/frontend/src/api/client.ts
 *
 * API client for communicating with SentinelScan backend services.
 * Provides methods for scan operations, templates, and real-time updates.
 */

import type { ScanJob, ScanResult, CreateScanRequest, Template, ScanEvent } from '../types';
import type { Ticket, TicketStatus } from '../types/ticket';
import type { AuthCredential } from '../types/credential';
import { ticketStore, createTicket } from '../lib/ticket-store';
import { credentialStore, createCredential } from '../lib/credential-store';

export const apiClient = {
  async createScan(request: CreateScanRequest): Promise<ScanJob> {
    // Mock response
    return {
      id: Math.floor(Math.random() * 10000),
      targets: request.targets,
      templateSelectors: request.templateSelectors,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },


  async getScan(scanId: number): Promise<ScanJob> {
    // Mock response
    return {
      id: scanId,
      targets: ['example.com'],
      status: 'completed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },


  async getScanResults(scanId: number): Promise<ScanResult[]> {
    // Mock response
    return [
      {
        id: 1,
        scanId,
        target: 'example.com',
        templateId: 'tpl-1',
        finding: { info: 'Mock finding' },
        createdAt: new Date().toISOString(),
      },
    ];
  },


  async getTemplates(): Promise<Template[]> {
    // Mock response
    return [
      {
        id: 1,
        name: 'Default Template',
        severity: 'info',
        tags: ['default'],
        content: 'Mock template content',
        version: '1.0',
        createdAt: new Date().toISOString(),
      },
      {
        id: 2,
        name: 'Advanced Template',
        severity: 'high',
        tags: ['advanced'],
        content: 'Advanced mock template',
        version: '1.0',
        createdAt: new Date().toISOString(),
      },
    ];
  },


  connectWebSocket(
    scanId: number,
    onEvent: (event: ScanEvent) => void,
    onClose?: (event: CloseEvent) => void
  ): WebSocket {
    // Mock WebSocket: call onEvent with mock data every second
    let count = 0;
    const interval = setInterval(() => {
      onEvent({
        type: 'progress',
        data: {
          scanId,
          completed: count,
          total: 3,
        },
      });
      count++;
      if (count >= 3) {
        onEvent({
          type: 'finding',
          data: {
            id: 1,
            scanId,
            target: 'example.com',
            templateId: 'tpl-1',
            finding: { info: 'Mock finding' },
            createdAt: new Date().toISOString(),
          },
        });
        clearInterval(interval);
        onClose?.({} as CloseEvent);
      }
    }, 1000);
    // Return a dummy WebSocket object
    return {
      close: () => clearInterval(interval),
    } as unknown as WebSocket;
  },

  // --- Ticket methods ---

  async getTickets(): Promise<Ticket[]> {
    return ticketStore.getAll();
  },

  async getTicket(id: string): Promise<Ticket | null> {
    return ticketStore.getById(id) ?? null;
  },

  async createTicket(data: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'comments'>): Promise<Ticket> {
    return createTicket(data);
  },

  async updateTicketStatus(id: string, status: TicketStatus): Promise<Ticket | null> {
    return ticketStore.update(id, { status, updatedAt: new Date().toISOString() } as Partial<Ticket>) ?? null;
  },

  async addTicketComment(ticketId: string, author: string, message: string): Promise<Ticket | null> {
    const ticket = ticketStore.getById(ticketId);
    if (!ticket) return null;
    const newComment = { id: `comment-${Date.now()}`, author, message, createdAt: new Date().toISOString() };
    return ticketStore.update(ticketId, { comments: [...ticket.comments, newComment], updatedAt: new Date().toISOString() } as Partial<Ticket>) ?? null;
  },

  // --- Auth Credential methods ---

  async getCredentials(): Promise<AuthCredential[]> {
    return credentialStore.getAll();
  },

  async getCredential(id: string): Promise<AuthCredential | null> {
    return credentialStore.getById(id) ?? null;
  },

  async createCredential(data: Omit<AuthCredential, 'id' | 'createdAt' | 'updatedAt'>): Promise<AuthCredential> {
    return createCredential(data);
  },

  async deleteCredential(id: string): Promise<boolean> {
    return credentialStore.delete(id);
  },
};
