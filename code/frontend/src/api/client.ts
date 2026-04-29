import {
  ScanJob,
  ScanResult,
  CreateScanRequest,
  Template,
  ScanEvent,
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
const WS_BASE = import.meta.env.VITE_WS_URL || 'ws://localhost:8080/api/scans';

export const apiClient = {
  async createScan(request: CreateScanRequest): Promise<ScanJob> {
    const response = await fetch(`${API_BASE}/scans`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!response.ok) throw new Error(`Failed to create scan: ${response.statusText}`);
    return response.json();
  },

  async getScan(scanId: number): Promise<ScanJob> {
    const response = await fetch(`${API_BASE}/scans/${scanId}`);
    if (!response.ok) throw new Error(`Failed to get scan: ${response.statusText}`);
    return response.json();
  },

  async getScanResults(scanId: number): Promise<ScanResult[]> {
    const response = await fetch(`${API_BASE}/scans/${scanId}/results`);
    if (!response.ok) throw new Error(`Failed to get results: ${response.statusText}`);
    return response.json();
  },

  async getTemplates(): Promise<Template[]> {
    const response = await fetch(`${API_BASE}/templates`);
    if (!response.ok) throw new Error(`Failed to get templates: ${response.statusText}`);
    return response.json();
  },

  connectWebSocket(
    scanId: number,
    onEvent: (event: ScanEvent) => void,
    onError?: (error: Event) => void,
    onClose?: (event: CloseEvent) => void
  ): WebSocket {
    const ws = new WebSocket(`${WS_BASE}/${scanId}/stream`);

    ws.onmessage = (event) => {
      try {
        const data: ScanEvent = JSON.parse(event.data as string);
        onEvent(data);
      } catch (e) {
        console.error('Failed to parse WebSocket message:', e);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      onError?.(error);
    };

    ws.onclose = (event) => {
      onClose?.(event);
    };

    return ws;
  },
};
