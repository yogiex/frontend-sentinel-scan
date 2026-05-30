import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { apiClient } from './client';

describe('apiClient', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('creates a scan successfully', async () => {
    const mockScan = { id: 1, targets: ['http://example.com'], status: 'pending' };
    (global.fetch as vi.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockScan),
    });

    const request = { targets: ['http://example.com'] };
    const result = await apiClient.createScan(request);

    expect(result).toEqual(mockScan);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/scans'),
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('throws error on failed scan creation', async () => {
    (global.fetch as vi.Mock).mockResolvedValueOnce({ ok: false, statusText: 'Bad Request' });
    const request = { targets: [] };
    await expect(apiClient.createScan(request)).rejects.toThrow('Failed to create scan: Bad Request');
  });

  it('gets a scan successfully', async () => {
    const mockScan = { id: 1, targets: ['http://example.com'], status: 'completed' };
    (global.fetch as vi.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockScan),
    });

    const result = await apiClient.getScan(1);
    expect(result).toEqual(mockScan);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/scans/1')
    );
  });

  it('gets scan results successfully', async () => {
    const mockResults = [{ id: 1, scanId: 1, target: 'http://example.com', templateId: 'CVE-2023-1234', finding: {}, createdAt: '' }];
    (global.fetch as vi.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResults),
    });

    const result = await apiClient.getScanResults(1);
    expect(result).toEqual(mockResults);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/scans/1/results')
    );
  });

  it('gets templates successfully', async () => {
    const mockTemplates = [{ id: 1, name: 'Test', severity: 'high', tags: [], content: '', version: '1.0', createdAt: '' }];
    (global.fetch as vi.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockTemplates),
    });

    const result = await apiClient.getTemplates();
    expect(result).toEqual(mockTemplates);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/templates')
    );
  });
});
