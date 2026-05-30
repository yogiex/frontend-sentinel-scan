/**
 * SentinelScan Scan Store Tests
 * Path: src/lib/scan-store.test.ts
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { scanStore, Scan, ScanStatus } from './scan-store';

describe('ScanStore', () => {
  beforeEach(() => {
    // Clear storage before each test
    localStorage.clear();
    // Reset store state by clearing all scans
    const scans = scanStore.getScans();
    scans.forEach((scan) => scanStore.deleteScan(scan.id));
  });

  it('should create a scan with correct initial state', () => {
    const scan = scanStore.createScan({
      target: '192.168.1.0/24',
      scanType: 'basic',
      profile: 'standard',
    });

    expect(scan.id).toMatch(/^scan-\d+$/);
    expect(scan.target).toBe('192.168.1.0/24');
    expect(scan.status).toBe('queued');
    expect(scan.progress).toBe(0);
    expect(scan.hosts).toEqual([]);
    expect(scan.findings).toEqual([]);
    expect(scan.logs).toEqual([]);
  });

  it('should retrieve all scans sorted by creation date', () => {
    const scan1 = scanStore.createScan({
      target: '10.0.0.1',
      scanType: 'web',
      profile: 'quick',
    });
    
    // Small delay to ensure different timestamps
    const scan2 = scanStore.createScan({
      target: 'example.com',
      scanType: 'basic',
      profile: 'full',
    });

    const scans = scanStore.getScans();
    expect(scans.length).toBe(2);
    // Most recent scan (scan2) should be first
    expect(scans[0].target).toBe('example.com');
    // Older scan (scan1) should be second
    expect(scans[1].target).toBe('10.0.0.1');
  });

  it('should update scan properties', () => {
    const scan = scanStore.createScan({
      target: '192.168.1.1',
      scanType: 'basic',
      profile: 'standard',
    });

    const updated = scanStore.updateScan(scan.id, { progress: 50, status: 'scanning' as ScanStatus });
    expect(updated?.progress).toBe(50);
    expect(updated?.status).toBe('scanning');
  });

  it('should delete a scan', () => {
    const scan = scanStore.createScan({
      target: '192.168.1.1',
      scanType: 'basic',
      profile: 'standard',
    });

    const result = scanStore.deleteScan(scan.id);
    expect(result).toBe(true);
    expect(scanStore.getScan(scan.id)).toBeUndefined();
  });

  it('should persist to localStorage', () => {
    const scan = scanStore.createScan({
      target: '192.168.1.1',
      scanType: 'basic',
      profile: 'standard',
    });

    const stored = localStorage.getItem('sentinelscan_scans');
    expect(stored).toBeTruthy();
    const parsed = JSON.parse(stored!);
    expect(parsed.length).toBe(1);
    expect(parsed[0].id).toBe(scan.id);
  });

  it('should notify subscribers on changes', () => {
    let notificationCount = 0;
    const unsubscribe = scanStore.subscribe(() => {
      notificationCount++;
    });

    scanStore.createScan({
      target: '192.168.1.1',
      scanType: 'basic',
      profile: 'standard',
    });

    expect(notificationCount).toBe(1);
    unsubscribe();
  });
});
