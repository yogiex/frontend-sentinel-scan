/**
 * Tests for logStorage.ts
 * Path: src/lib/logStorage.test.ts
 */
import { initDB, appendLog, getAllLogs, clearLogs, getLogSize, isIndexedDBSupported } from './logStorage';

const STORE_ACCESS = 'access_log';
const STORE_ERROR = 'error_log';

describe('logStorage', () => {
  beforeEach(async () => {
    try {
      await clearLogs(STORE_ACCESS);
      await clearLogs(STORE_ERROR);
    } catch {
      // DB might not exist yet
    }
  });

  it('initializes the database without error', async () => {
    if (!isIndexedDBSupported()) return;
    const db = await initDB();
    expect(db).toBeDefined();
    expect(db.name).toBe('sentinelscan_logs');
  });

  it('appends a log line to access_log', async () => {
    if (!isIndexedDBSupported()) return;
    await appendLog(STORE_ACCESS, '2026-05-02T10:00:00Z | sess_1 | admin | 127.0.0.1 | auth | login | info | {}');
    const logs = await getAllLogs(STORE_ACCESS);
    expect(logs).toContain('2026-05-02T10:00:00Z | sess_1 | admin | 127.0.0.1 | auth | login | info | {}');
  });

  it('appends multiple lines and retrieves all as text', async () => {
    if (!isIndexedDBSupported()) return;
    await appendLog(STORE_ACCESS, 'line1');
    await appendLog(STORE_ACCESS, 'line2');
    await appendLog(STORE_ACCESS, 'line3');
    const logs = await getAllLogs(STORE_ACCESS);
    expect(logs).toBe('line1\nline2\nline3');
  });

  it('appends to error_log independently', async () => {
    if (!isIndexedDBSupported()) return;
    await appendLog(STORE_ERROR, 'error line');
    const accessLogs = await getAllLogs(STORE_ACCESS);
    const errorLogs = await getAllLogs(STORE_ERROR);
    expect(accessLogs).toBe('');
    expect(errorLogs).toBe('error line');
  });

  it('clears logs from a store', async () => {
    if (!isIndexedDBSupported()) return;
    await appendLog(STORE_ACCESS, 'line1');
    await appendLog(STORE_ACCESS, 'line2');
    await clearLogs(STORE_ACCESS);
    const logs = await getAllLogs(STORE_ACCESS);
    expect(logs).toBe('');
  });

  it('getLogSize returns a number', async () => {
    if (!isIndexedDBSupported()) return;
    await appendLog(STORE_ACCESS, 'hello');
    const size = await getLogSize(STORE_ACCESS);
    expect(typeof size).toBe('number');
    expect(size).toBeGreaterThan(0);
  });

  it('isIndexedDBSupported returns boolean', () => {
    expect(typeof isIndexedDBSupported()).toBe('boolean');
  });
});