/**
 * SentinelScan API Client
 * Path: /home/mirage/Documents/code/sec/research/inkubasi-btp-cybersecurity/code/frontend/src/api/client.ts
 *
 * API client for communicating with SentinelScan backend services.
 * Provides methods for scan operations, templates, and real-time updates.
 */

import type { ScanJob, ScanResult, CreateScanRequest, Template, ScanEvent } from '../types';




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
};
