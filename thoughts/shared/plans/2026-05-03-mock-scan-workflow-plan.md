# Mock Scan Workflow Implementation Plan

**Goal:** Transform the dead NewScan form into a fully functional mock scan workflow with real-time progress visualization, dynamic finding generation, and localStorage persistence.

**Architecture:** In-memory scan store with localStorage persistence + dedicated ScanProgress page with terminal-style output, phase timeline, and live statistics. The store acts as the central mock database that all components read from.

**Design:** [2026-05-03-mock-scan-workflow-design.md](../designs/2026-05-03-mock-scan-workflow-design.md)

---

## Dependency Graph

```
Batch 1 (parallel): 1.1, 1.2, 1.3 [foundation - no deps]
Batch 2 (parallel): 2.1, 2.2 [depend on Batch 1 types from scan-store]
Batch 3 (parallel): 3.1, 3.2, 3.3 [depend on Batch 1-2]
Batch 4 (parallel): 4.1 [depends on Batch 1-3]
```

---

## Batch 1: Foundation (parallel - 3 implementers)

All tasks in this batch have NO dependencies and run simultaneously.

### Task 1.1: Scan Store with localStorage Persistence
**File:** `src/lib/scan-store.ts`
**Test:** `src/lib/scan-store.test.ts`
**Depends:** none

**Design Decision:** The existing `src/types/scan.ts` uses `number` for IDs and different status values. I'm implementing the design's specification with `string` IDs and extended status values (`queued`, `initializing`, `discovering`, `scanning`, `analyzing`, `completed`, `failed`) because the design is the spec. The store will be the single source of truth.

```typescript
// src/lib/scan-store.ts
/**
 * SentinelScan Mock Scan Store
 * Path: src/lib/scan-store.ts
 *
 * Central mock database with localStorage persistence.
 * All scan-related components read from this store.
 */

export type ScanStatus = 
  | 'queued'
  | 'initializing'
  | 'discovering'
  | 'scanning'
  | 'analyzing'
  | 'completed'
  | 'failed';

export type ScanType = 
  | 'basic'
  | 'advanced'
  | 'web'
  | 'credentialed'
  | 'compliance'
  | 'discovery';

export type ScanProfile = 'quick' | 'standard' | 'full' | 'custom';

export interface Host {
  ip: string;
  status: 'up' | 'down';
  openPorts: number;
  vulns: number;
  hostname?: string;
}

export interface Finding {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  cveId?: string;
  cvssScore?: number;
  host: string;
  port?: number;
  description: string;
  category: string;
  discoveredAt: string;
}

export interface ScanConfig {
  credentials: boolean;
  authType?: string;
  stealth: boolean;
  schedule: 'now' | 'schedule';
  scheduledDate?: string;
  scheduledTime?: string;
  userAgentMode?: string;
  enableCookies?: boolean;
  humanLikeDelay?: boolean;
  description?: string;
}

export interface Scan {
  id: string;
  target: string;
  scanType: ScanType;
  profile: ScanProfile;
  status: ScanStatus;
  progress: number;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
  duration: string | null;
  hosts: Host[];
  findings: Finding[];
  logs: string[];
  config: ScanConfig;
  errorMessage?: string;
}

const STORAGE_KEY = 'sentinelscan_scans';

interface ScanStoreState {
  scans: Map<string, Scan>;
  listeners: Set<() => void>;
}

class ScanStore {
  private state: ScanStoreState;

  constructor() {
    this.state = {
      scans: new Map(),
      listeners: new Set(),
    };
    this.loadFromStorage();
  }

  // --- Persistence ---

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          parsed.forEach((scan) => {
            this.state.scans.set(scan.id, scan);
          });
        }
      }
    } catch (e) {
      console.warn('[ScanStore] Failed to load from localStorage:', e);
    }
  }

  private saveToStorage(): void {
    try {
      const scansArray = Array.from(this.state.scans.values());
      localStorage.setItem(STORAGE_KEY, JSON.stringify(scansArray));
    } catch (e) {
      console.warn('[ScanStore] Failed to save to localStorage:', e);
    }
  }

  // --- Subscribe to changes ---

  subscribe(listener: () => void): () => void {
    this.state.listeners.add(listener);
    return () => {
      this.state.listeners.delete(listener);
    };
  }

  private notify(): void {
    this.state.listeners.forEach((listener) => listener());
  }

  // --- Core CRUD ---

  createScan(formValues: {
    target: string;
    scanType: string;
    profile: string;
    schedule?: string;
    scheduledDate?: string;
    scheduledTime?: string;
    useCredentials?: boolean;
    authType?: string;
    userAgentMode?: string;
    enableCookies?: boolean;
    humanLikeDelay?: boolean;
    description?: string;
  }): Scan {
    const id = `scan-${Date.now()}`;
    const now = new Date().toISOString();

    const scan: Scan = {
      id,
      target: formValues.target,
      scanType: formValues.scanType as ScanType,
      profile: formValues.profile as ScanProfile,
      status: 'queued',
      progress: 0,
      createdAt: now,
      startedAt: null,
      completedAt: null,
      duration: null,
      hosts: [],
      findings: [],
      logs: [],
      config: {
        credentials: formValues.useCredentials || false,
        authType: formValues.authType,
        stealth: formValues.userAgentMode !== 'none' || formValues.humanLikeDelay || false,
        schedule: (formValues.schedule as 'now' | 'schedule') || 'now',
        scheduledDate: formValues.scheduledDate,
        scheduledTime: formValues.scheduledTime,
        userAgentMode: formValues.userAgentMode,
        enableCookies: formValues.enableCookies,
        humanLikeDelay: formValues.humanLikeDelay,
        description: formValues.description,
      },
    };

    this.state.scans.set(id, scan);
    this.saveToStorage();
    this.notify();
    return scan;
  }

  getScans(): Scan[] {
    return Array.from(this.state.scans.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  getScan(id: string): Scan | undefined {
    return this.state.scans.get(id);
  }

  updateScan(id: string, updates: Partial<Scan>): Scan | undefined {
    const scan = this.state.scans.get(id);
    if (!scan) return undefined;

    const updated = { ...scan, ...updates };
    this.state.scans.set(id, updated);
    this.saveToStorage();
    this.notify();
    return updated;
  }

  deleteScan(id: string): boolean {
    const deleted = this.state.scans.delete(id);
    if (deleted) {
      this.saveToStorage();
      this.notify();
    }
    return deleted;
  }

  // --- Simulation Engine ---

  async simulateScan(id: string, onUpdate?: (scan: Scan) => void): Promise<void> {
    const scan = this.getScan(id);
    if (!scan) throw new Error(`Scan ${id} not found`);

    const addLog = (message: string) => {
      const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
      const logEntry = `[${timestamp}] ${message}`;
      const updated = this.updateScan(id, { logs: [...(this.getScan(id)?.logs || []), logEntry] });
      if (updated && onUpdate) onUpdate(updated);
    };

    try {
      // Phase 1: Queued (1.5s)
      addLog('INFO  Scan queued, waiting for scanner engine...');
      await this.delay(1500);
      
      // Phase 2: Initializing (2s)
      this.updateScan(id, { status: 'initializing', startedAt: new Date().toISOString() });
      addLog(`INFO  Resolving target: ${scan.target}`);
      await this.delay(500);
      addLog(`INFO  Target resolved successfully`);
      await this.delay(500);
      addLog(`INFO  Loading templates for ${scan.scanType} scan profile`);
      await this.delay(500);
      addLog(`INFO  Configuring scan settings...`);
      await this.delay(500);

      // Phase 3: Discovering (4s)
      this.updateScan(id, { status: 'discovering', progress: 10 });
      addLog(`INFO  Starting host discovery on ${scan.target}`);
      await this.delay(1000);

      const hosts = generateHosts(scan.target, scan.scanType);
      hosts.forEach((host, index) => {
        addLog(`FOUND Host ${host.ip} is ${host.status.toUpperCase()}${host.hostname ? ` (${host.hostname})` : ''}${host.openPorts > 0 ? ` (${host.openPorts} open ports)` : ''}`);
        this.updateScan(id, { 
          hosts: [...(this.getScan(id)?.hosts || []), host],
          progress: 10 + Math.floor((index / hosts.length) * 20)
        });
      });
      await this.delay(1000);

      // Phase 4: Scanning (8s)
      this.updateScan(id, { status: 'scanning', progress: 30 });
      addLog(`INFO  Starting vulnerability scan with ${scan.profile} profile...`);
      
      const findings = generateFindings(scan.scanType, hosts, scan.target);
      const findingsPerTick = Math.ceil(findings.length / 8);
      
      for (let i = 0; i < 8; i++) {
        const startIdx = i * findingsPerTick;
        const endIdx = Math.min(startIdx + findingsPerTick, findings.length);
        const newFindings = findings.slice(startIdx, endIdx);
        
        newFindings.forEach((finding) => {
          const severityTag = finding.severity.toUpperCase();
          addLog(`${severityTag} ${finding.cveId || 'VULN'} [${finding.severity.toUpperCase()}] ${finding.title} on ${finding.host}${finding.port ? ':' + finding.port : ''}`);
        });

        const currentFindings = [...(this.getScan(id)?.findings || []), ...newFindings];
        this.updateScan(id, { 
          findings: currentFindings,
          progress: 30 + Math.floor(((i + 1) / 8) * 60)
        });
        
        if (onUpdate) onUpdate(this.getScan(id)!);
        await this.delay(1000);
      }

      // Phase 5: Analyzing (2s)
      this.updateScan(id, { status: 'analyzing', progress: 95 });
      addLog('INFO  Correlating findings...');
      await this.delay(700);
      addLog('INFO  Generating vulnerability report...');
      await this.delay(700);
      addLog('INFO  Scan completed successfully');
      
      // Phase 6: Completed
      const completedAt = new Date().toISOString();
      const startedAt = this.getScan(id)?.startedAt || completedAt;
      const durationMs = new Date(completedAt).getTime() - new Date(startedAt).getTime();
      const duration = `${Math.floor(durationMs / 60000)}m ${Math.floor((durationMs % 60000) / 1000)}s`;

      this.updateScan(id, { 
        status: 'completed', 
        progress: 100, 
        completedAt,
        duration 
      });

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      addLog(`ERROR Scan failed: ${errorMsg}`);
      this.updateScan(id, { status: 'failed', errorMessage: errorMsg });
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Singleton instance
export const scanStore = new ScanStore();
```

```typescript
// src/lib/scan-store.test.ts
/**
 * SentinelScan Store Tests
 * Path: src/lib/scan-store.test.ts
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { scanStore, Scan } from './scan-store';

describe('ScanStore', () => {
  beforeEach(() => {
    // Clear storage before each test
    localStorage.clear();
    // Reset store state by creating new instance would be better, but for now clear
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
    expect(scans[0].id).toBe(scan2.id); // Most recent first
  });

  it('should update scan properties', () => {
    const scan = scanStore.createScan({
      target: '192.168.1.1',
      scanType: 'basic',
      profile: 'standard',
    });

    const updated = scanStore.updateScan(scan.id, { progress: 50, status: 'scanning' });
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
```

**Verify:** `npx vitest run src/lib/scan-store.test.ts`
**Commit:** `feat(scan): add scan store with localStorage persistence`

---

### Task 1.2: Finding Generator Utility
**File:** `src/lib/finding-generator.ts`
**Test:** `src/lib/finding-generator.test.ts`
**Depends:** none

**Design Decision:** The design specifies generating realistic findings based on scan type. I'm implementing a pure function-based generator that creates deterministic-yet-random findings based on target and scan type. Each scan type has a pool of possible findings, and we select a subset based on the target hash to ensure consistency.

```typescript
// src/lib/finding-generator.ts
/**
 * SentinelScan Finding Generator
 * Path: src/lib/finding-generator.ts
 *
 * Generates realistic vulnerability findings based on scan type and target.
 * Uses a deterministic seed based on target to ensure consistent results.
 */

import type { Finding, Host, ScanType } from './scan-store';

// CVE pools by scan type
const WEB_FINDINGS = [
  { title: 'Cross-Site Scripting (XSS)', severity: 'high' as const, category: 'OWASP Top 10', cvePrefix: 'CVE-2026-2' },
  { title: 'SQL Injection', severity: 'critical' as const, category: 'OWASP Top 10', cvePrefix: 'CVE-2026-3' },
  { title: 'CSRF Token Missing', severity: 'medium' as const, category: 'OWASP Top 10', cvePrefix: 'CVE-2026-4' },
  { title: 'Insecure Direct Object Reference', severity: 'high' as const, category: 'OWASP Top 10', cvePrefix: 'CVE-2026-5' },
  { title: 'Server-Side Request Forgery', severity: 'critical' as const, category: 'OWASP Top 10', cvePrefix: 'CVE-2026-6' },
  { title: 'Directory Traversal', severity: 'medium' as const, category: 'Input Validation', cvePrefix: 'CVE-2026-7' },
  { title: 'Unrestricted File Upload', severity: 'high' as const, category: 'OWASP Top 10', cvePrefix: 'CVE-2026-8' },
  { title: 'Authentication Bypass', severity: 'critical' as const, category: 'Authentication', cvePrefix: 'CVE-2026-9' },
  { title: 'Session Fixation', severity: 'medium' as const, category: 'Authentication', cvePrefix: 'CVE-2026-10' },
  { title: 'Clickjacking', severity: 'low' as const, category: 'Client-Side', cvePrefix: 'CVE-2026-11' },
  { title: 'Information Disclosure', severity: 'low' as const, category: 'Information Leakage', cvePrefix: 'CVE-2026-12' },
  { title: 'Weak Password Policy', severity: 'medium' as const, category: 'Authentication', cvePrefix: 'CVE-2026-13' },
];

const BASIC_FINDINGS = [
  { title: 'Open SSH Service', severity: 'info' as const, category: 'Service Detection', cvePrefix: 'CVE-2026-20' },
  { title: 'Outdated Apache Version', severity: 'medium' as const, category: 'Software Version', cvePrefix: 'CVE-2026-21' },
  { title: 'Weak SSL/TLS Cipher', severity: 'high' as const, category: 'Cryptography', cvePrefix: 'CVE-2026-22' },
  { title: 'Default Credentials', severity: 'critical' as const, category: 'Authentication', cvePrefix: 'CVE-2026-23' },
  { title: 'Open Port 23 (Telnet)', severity: 'high' as const, category: 'Service Detection', cvePrefix: 'CVE-2026-24' },
  { title: 'SMB Signing Disabled', severity: 'medium' as const, category: 'Network', cvePrefix: 'CVE-2026-25' },
  { title: 'DNS Recursion Enabled', severity: 'low' as const, category: 'DNS', cvePrefix: 'CVE-2026-26' },
  { title: 'SNMP Default Community', severity: 'medium' as const, category: 'Service Detection', cvePrefix: 'CVE-2026-27' },
];

const CREDENTIALED_FINDINGS = [
  { title: 'Missing Security Patch', severity: 'critical' as const, category: 'Patch Management', cvePrefix: 'CVE-2026-30' },
  { title: 'Weak File Permissions', severity: 'medium' as const, category: 'Configuration', cvePrefix: 'CVE-2026-31' },
  { title: 'Unquoted Service Path', severity: 'medium' as const, category: 'Windows', cvePrefix: 'CVE-2026-32' },
  { title: 'Local Administrator', severity: 'high' as const, category: 'Access Control', cvePrefix: 'CVE-2026-33' },
  { title: 'PowerShell Execution Policy', severity: 'low' as const, category: 'Configuration', cvePrefix: 'CVE-2026-34' },
  { title: 'Outdated Software Package', severity: 'high' as const, category: 'Patch Management', cvePrefix: 'CVE-2026-35' },
  { title: 'World-Writable Files', severity: 'medium' as const, category: 'File Permissions', cvePrefix: 'CVE-2026-36' },
];

const COMPLIANCE_FINDINGS = [
  { title: 'CIS Control 1: Inventory', severity: 'medium' as const, category: 'CIS Benchmark', cvePrefix: 'CVE-2026-40' },
  { title: 'CIS Control 3: Data Protection', severity: 'high' as const, category: 'CIS Benchmark', cvePrefix: 'CVE-2026-41' },
  { title: 'PCI-DSS 2.2: System Configuration', severity: 'critical' as const, category: 'PCI-DSS', cvePrefix: 'CVE-2026-42' },
  { title: 'PCI-DSS 6.5: Secure Coding', severity: 'high' as const, category: 'PCI-DSS', cvePrefix: 'CVE-2026-43' },
  { title: 'PCI-DSS 8.1: Authentication', severity: 'medium' as const, category: 'PCI-DSS', cvePrefix: 'CVE-2026-44' },
  { title: 'ISO 27001: Access Control', severity: 'low' as const, category: 'ISO 27001', cvePrefix: 'CVE-2026-45' },
  { title: 'NIST Framework: Identify', severity: 'medium' as const, category: 'NIST', cvePrefix: 'CVE-2026-46' },
];

const DISCOVERY_FINDINGS = [
  { title: 'Host Discovered', severity: 'info' as const, category: 'Discovery', cvePrefix: 'CVE-2026-50' },
  { title: 'Open Port Detected', severity: 'info' as const, category: 'Port Scan', cvePrefix: 'CVE-2026-51' },
  { title: 'Service Fingerprinted', severity: 'info' as const, category: 'Service Detection', cvePrefix: 'CVE-2026-52' },
  { title: 'OS Detection', severity: 'info' as const, category: 'Fingerprinting', cvePrefix: 'CVE-2026-53' },
  { title: 'Banner Grabbing', severity: 'info' as const, category: 'Reconnaissance', cvePrefix: 'CVE-2026-54' },
];

// Common ports by service
const SERVICE_PORTS: Record<string, number> = {
  'SSH': 22,
  'HTTP': 80,
  'HTTPS': 443,
  'Telnet': 23,
  'FTP': 21,
  'SMTP': 25,
  'DNS': 53,
  'SMB': 445,
  'RDP': 3389,
  'MySQL': 3306,
  'PostgreSQL': 5432,
  'Redis': 6379,
  'Elasticsearch': 9200,
  'MongoDB': 27017,
  'Apache': 80,
  'Nginx': 80,
  'IIS': 80,
};

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

function getFindingsForScanType(scanType: ScanType): typeof WEB_FINDINGS {
  switch (scanType) {
    case 'web':
    case 'advanced':
      return WEB_FINDINGS;
    case 'basic':
      return BASIC_FINDINGS;
    case 'credentialed':
      return CREDENTIALED_FINDINGS;
    case 'compliance':
      return COMPLIANCE_FINDINGS;
    case 'discovery':
      return DISCOVERY_FINDINGS;
    default:
      return BASIC_FINDINGS;
  }
}

function generateCveId(prefix: string, index: number): string {
  return `${prefix}${String(index).padStart(3, '0')}`;
}

function getRandomPort(finding: typeof WEB_FINDINGS[0], host: Host): number {
  if (finding.category.includes('Web') || finding.title.includes('XSS') || finding.title.includes('SQL')) {
    return host.openPorts > 0 ? Math.random() > 0.5 ? 80 : 443 : 80;
  }
  if (finding.title.includes('SSH') || finding.title.includes('Telnet')) {
    return finding.title.includes('SSH') ? 22 : 23;
  }
  return host.openPorts > 0 ? Math.floor(Math.random() * host.openPorts) + 1 : 80;
}

export function generateFindings(
  scanType: ScanType,
  hosts: Host[],
  target: string
): Finding[] {
  const findingsPool = getFindingsForScanType(scanType);
  const targetHash = simpleHash(target);
  
  // Determine how many findings to generate (3-8 per host that is up)
  const upHosts = hosts.filter((h) => h.status === 'up');
  const findingsPerHost = scanType === 'discovery' ? 1 : scanType === 'compliance' ? 2 : 3;
  const totalFindings = Math.min(
    upHosts.length * findingsPerHost + Math.floor(targetHash % 5),
    findingsPool.length
  );

  const findings: Finding[] = [];
  const usedIndices = new Set<number>();

  for (let i = 0; i < totalFindings; i++) {
    // Pick a finding from the pool (deterministic based on target hash + index)
    const poolIndex = (targetHash + i * 7) % findingsPool.length;
    if (usedIndices.has(poolIndex)) continue;
    usedIndices.add(poolIndex);

    const findingTemplate = findingsPool[poolIndex];
    const host = upHosts[i % upHosts.length];
    if (!host) continue;

    const port = getRandomPort(findingTemplate, host);
    const cvssScore = getCvssScore(findingTemplate.severity);

    findings.push({
      id: generateCveId(findingTemplate.cvePrefix, i + 1),
      title: findingTemplate.title,
      severity: findingTemplate.severity,
      cveId: generateCveId(findingTemplate.cvePrefix, i + 1),
      cvssScore,
      host: host.ip,
      port,
      description: generateDescription(findingTemplate, host, port),
      category: findingTemplate.category,
      discoveredAt: new Date().toISOString(),
    });
  }

  return findings;
}

function getCvssScore(severity: Finding['severity']): number {
  switch (severity) {
    case 'critical': return 9.0 + Math.random();
    case 'high': return 7.0 + Math.random() * 2;
    case 'medium': return 4.0 + Math.random() * 2.9;
    case 'low': return 0.1 + Math.random() * 3.9;
    case 'info': return 0;
  }
}

function generateDescription(
  finding: typeof WEB_FINDINGS[0],
  host: Host,
  port: number
): string {
  const descriptions: Record<string, string> = {
    'Cross-Site Scripting (XSS)': `Reflected XSS vulnerability detected on ${host.ip}:${port}. Input validation is missing on user-supplied parameters.`,
    'SQL Injection': `SQL injection vulnerability in the login form on ${host.ip}:${port}. Unsanitized user input is passed to the database query.`,
    'CSRF Token Missing': `Cross-Site Request Forgery protection is missing from forms on ${host.ip}:${port}.`,
    'Open SSH Service': `SSH service detected on ${host.ip}:${port}. Ensure latest patches are applied.`,
    'Outdated Apache Version': `Apache HTTP Server on ${host.ip}:${port} is running an outdated version with known vulnerabilities.`,
    'Weak SSL/TLS Cipher': `Weak cipher suites detected on ${host.ip}:${port}. Upgrade to TLS 1.2+ with strong ciphers.`,
    'Default Credentials': `Default credentials detected on service running on ${host.ip}:${port}. Change immediately.`,
    'Missing Security Patch': `Critical security patch missing on ${host.ip}. Apply latest security updates.`,
    'CIS Control 1: Inventory': `Asset inventory is incomplete. Some systems are not properly documented.`,
    'PCI-DSS 2.2: System Configuration': `System configuration does not meet PCI-DSS requirements on ${host.ip}.`,
    'Host Discovered': `Active host discovered at ${host.ip} with ${host.openPorts} open ports.`,
  };

  return descriptions[finding.title] || `${finding.title} detected on ${host.ip}:${port}.`;
}

export function generateHosts(target: string, scanType: ScanType): Host[] {
  const targetHash = simpleHash(target);
  const hosts: Host[] = [];

  // Determine target type and generate appropriate hosts
  if (target.includes('/')) {
    // CIDR notation - generate multiple hosts
    const baseIp = target.split('/')[0];
    const baseParts = baseIp.split('.').map(Number);
    const count = scanType === 'discovery' ? 8 : 5;

    for (let i = 1; i <= count; i++) {
      const ip = `${baseParts[0]}.${baseParts[1]}.${baseParts[2]}.${i}`;
      const isUp = (targetHash + i) % 4 !== 0; // 75% up rate
      hosts.push({
        ip,
        status: isUp ? 'up' : 'down',
        openPorts: isUp ? Math.floor((targetHash + i * 3) % 15) + 1 : 0,
        vulns: 0,
        hostname: isUp ? `host-${i}.local` : undefined,
      });
    }
  } else if (target.startsWith('http') || target.includes('.')) {
    // URL or hostname - single host
    const isUp = true;
    hosts.push({
      ip: target.startsWith('http') ? new URL(target).hostname : target,
      status: isUp ? 'up' : 'down',
      openPorts: scanType === 'web' ? 3 : 5,
      vulns: 0,
      hostname: target,
    });
  } else {
    // Single IP
    const isUp = true;
    hosts.push({
      ip: target,
      status: isUp ? 'up' : 'down',
      openPorts: 8,
      vulns: 0,
    });
  }

  return hosts;
}
```

```typescript
// src/lib/finding-generator.test.ts
/**
 * SentinelScan Finding Generator Tests
 * Path: src/lib/finding-generator.test.ts
 */
import { describe, it, expect } from 'vitest';
import { generateFindings, generateHosts } from './finding-generator';
import type { ScanType } from './scan-store';

describe('FindingGenerator', () => {
  it('should generate findings for web scan type', () => {
    const hosts = generateHosts('example.com', 'web');
    const findings = generateFindings('web', hosts, 'example.com');

    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toHaveProperty('id');
    expect(findings[0]).toHaveProperty('title');
    expect(findings[0]).toHaveProperty('severity');
    expect(findings[0]).toHaveProperty('host');
  });

  it('should generate consistent findings for same target', () => {
    const hosts = generateHosts('192.168.1.0/24', 'basic');
    const findings1 = generateFindings('basic', hosts, '192.168.1.0/24');
    const findings2 = generateFindings('basic', hosts, '192.168.1.0/24');

    expect(findings1.length).toBe(findings2.length);
    expect(findings1[0].id).toBe(findings2[0].id);
  });

  it('should generate different findings for different scan types', () => {
    const hosts = generateHosts('example.com', 'web');
    const webFindings = generateFindings('web', hosts, 'example.com');
    const basicFindings = generateFindings('basic', hosts, 'example.com');

    // Different scan types should have different finding pools
    const webTitles = webFindings.map((f) => f.title);
    const basicTitles = basicFindings.map((f) => f.title);
    
    // There should be some difference (not guaranteed to be completely different, but likely)
    expect(webFindings.length).toBeGreaterThan(0);
    expect(basicFindings.length).toBeGreaterThan(0);
  });

  it('should generate hosts from CIDR notation', () => {
    const hosts = generateHosts('192.168.1.0/24', 'discovery');
    
    expect(hosts.length).toBeGreaterThan(0);
    expect(hosts[0]).toHaveProperty('ip');
    expect(hosts[0]).toHaveProperty('status');
    expect(hosts[0]).toHaveProperty('openPorts');
  });

  it('should generate appropriate CVSS scores by severity', () => {
    const hosts = generateHosts('example.com', 'web');
    const findings = generateFindings('web', hosts, 'example.com');

    findings.forEach((f) => {
      if (f.severity === 'critical') {
        expect(f.cvssScore).toBeGreaterThanOrEqual(9.0);
      } else if (f.severity === 'high') {
        expect(f.cvssScore).toBeGreaterThanOrEqual(7.0);
      }
    });
  });
});
```

**Verify:** `npx vitest run src/lib/finding-generator.test.ts`
**Commit:** `feat(scan): add dynamic finding generator for all scan types`

---

### Task 1.3: Update Types to Match Design
**File:** `src/types/scan.ts`
**Test:** none (type-only changes)
**Depends:** none

**Design Decision:** The design specifies string IDs and extended status values. I'm adding new types that align with the design while keeping existing types for backward compatibility. The store uses the new types.

```typescript
// src/types/scan.ts
/**
 * SentinelScan Type Definitions
 * Path: src/types/scan.ts
 *
 * Core type definitions for scan jobs, results, and events.
 * Updated to support mock scan workflow with extended status values.
 */

// --- Original Types (kept for backward compatibility) ---

export interface ScanJob {
  id: number;
  targets: string[];
  /** Dynamic template selector configuration, shape varies by scan template */
  templateSelectors?: Record<string, unknown>;
  status: 'pending' | 'running' | 'completed' | 'partial_failure' | 'failed';
  createdAt: string;
  updatedAt: string;
}

export interface ScanResult {
  id: number;
  scanId: number;
  target: string;
  templateId: string;
  /** Scan finding data with flexible structure depending on the template used */
  finding: Record<string, unknown>;
  createdAt: string;
}

export interface CreateScanRequest {
  targets: string[];
  /** Dynamic template selector configuration, shape varies by scan template */
  templateSelectors?: Record<string, unknown>;
}

export interface ScanProgress {
  type: 'progress';
  data: {
    scanId: number;
    completed: number;
    total: number;
  };
}

export interface ScanFinding {
  type: 'finding';
  data: ScanResult;
}

export interface ScanComplete {
  type: 'complete';
  data: {
    scanId: number;
  };
}

export type ScanEvent = ScanProgress | ScanFinding | ScanComplete;

// --- New Types for Mock Scan Workflow ---

export type MockScanStatus = 
  | 'queued'
  | 'initializing'
  | 'discovering'
  | 'scanning'
  | 'analyzing'
  | 'completed'
  | 'failed';

export type MockScanType = 
  | 'basic'
  | 'advanced'
  | 'web'
  | 'credentialed'
  | 'compliance'
  | 'discovery';

export interface MockHost {
  ip: string;
  status: 'up' | 'down';
  openPorts: number;
  vulns: number;
  hostname?: string;
}

export interface MockFinding {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  cveId?: string;
  cvssScore?: number;
  host: string;
  port?: number;
  description: string;
  category: string;
  discoveredAt: string;
}

export interface MockScanConfig {
  credentials: boolean;
  authType?: string;
  stealth: boolean;
  schedule: 'now' | 'schedule';
  scheduledDate?: string;
  scheduledTime?: string;
  userAgentMode?: string;
  enableCookies?: boolean;
  humanLikeDelay?: boolean;
  description?: string;
}

export interface MockScan {
  id: string;
  target: string;
  scanType: MockScanType;
  profile: 'quick' | 'standard' | 'full' | 'custom';
  status: MockScanStatus;
  progress: number;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
  duration: string | null;
  hosts: MockHost[];
  findings: MockFinding[];
  logs: string[];
  config: MockScanConfig;
  errorMessage?: string;
}
```

**Verify:** `npx tsc --noEmit` (TypeScript compilation check)
**Commit:** `feat(types): add mock scan workflow types`

---

## Batch 2: Core Components (parallel - 2 implementers)

All tasks in this batch depend on Batch 1 completing.

### Task 2.1: ScanProgress Page Component
**File:** `src/pages/Dashboard/Scans/ScanProgress.tsx`
**Test:** none (demo-only component per design)
**Depends:** 1.1, 1.2 (uses scan-store and finding-generator types)

**Design Decision:** The design specifies a terminal-style layout with left panel (60%) for logs and right panel (40%) for stats. I'm implementing this with a responsive layout that stacks on mobile. The terminal uses monospace font with color-coded log lines. Progress bar uses shadcn/ui styling. Phase timeline shows current phase with visual indicators.

```typescript
// src/pages/Dashboard/Scans/ScanProgress.tsx
/**
 * SentinelScan Progress Page
 * Path: src/pages/Dashboard/Scans/ScanProgress.tsx
 *
 * Real-time scan simulation visualization with:
 * - Terminal-style log output with auto-scroll
 * - Progress bar with percentage
 * - Phase timeline (queued → initializing → discovering → scanning → analyzing → completed)
 * - Live stats: hosts found, vulns found, requests/sec
 * - Findings list appearing in real-time
 */
import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ArrowLeft, 
  Play, 
  CheckCircle2, 
  Clock, 
  Server, 
  Bug, 
  Activity,
  AlertCircle,
  Terminal,
  BarChart3
} from 'lucide-react';
import { scanStore, type Scan, type ScanStatus } from '@/lib/scan-store';

const PHASES: ScanStatus[] = ['queued', 'initializing', 'discovering', 'scanning', 'analyzing', 'completed'];

const PHASE_LABELS: Record<ScanStatus, string> = {
  queued: 'Queued',
  initializing: 'Initializing',
  discovering: 'Discovering',
  scanning: 'Scanning',
  analyzing: 'Analyzing',
  completed: 'Completed',
  failed: 'Failed',
};

const SEVERITY_COLORS: Record<string, string> = {
  critical: 'text-red-400',
  high: 'text-orange-400',
  medium: 'text-yellow-400',
  low: 'text-blue-400',
  info: 'text-gray-400',
};

export function ScanProgress() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [scan, setScan] = useState<Scan | undefined>();
  const [elapsedTime, setElapsedTime] = useState(0);
  const logEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | null>(null);

  // Subscribe to store changes
  useEffect(() => {
    if (!id) return;

    const unsubscribe = scanStore.subscribe(() => {
      const updatedScan = scanStore.getScan(id);
      setScan(updatedScan);
    });

    // Initial load
    const initialScan = scanStore.getScan(id);
    setScan(initialScan);

    // Start simulation if scan is queued
    if (initialScan && initialScan.status === 'queued') {
      scanStore.simulateScan(id, (updated) => {
        setScan({ ...updated });
      });
    }

    return () => {
      unsubscribe();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [id]);

  // Timer for elapsed time
  useEffect(() => {
    if (scan?.startedAt && scan.status !== 'completed' && scan.status !== 'failed') {
      timerRef.current = window.setInterval(() => {
        const start = new Date(scan.startedAt!).getTime();
        const now = Date.now();
        setElapsedTime(Math.floor((now - start) / 1000));
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [scan?.startedAt, scan?.status]);

  // Auto-scroll logs to bottom
  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [scan?.logs]);

  // Auto-redirect on completion
  useEffect(() => {
    if (scan?.status === 'completed') {
      const timer = setTimeout(() => {
        navigate(`/dashboard/scans/${id}`);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [scan?.status, id, navigate]);

  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getPhaseIndex = (status: ScanStatus): number => {
    return PHASES.indexOf(status);
  };

  const getLogColor = (log: string): string => {
    if (log.includes('ERROR')) return 'text-red-400';
    if (log.includes('CRITICAL')) return 'text-red-400';
    if (log.includes('HIGH')) return 'text-orange-400';
    if (log.includes('MEDIUM')) return 'text-yellow-400';
    if (log.includes('LOW')) return 'text-blue-400';
    if (log.includes('INFO')) return 'text-green-400';
    if (log.includes('FOUND')) return 'text-cyan-400';
    return 'text-gray-300';
  };

  if (!scan) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Scans
        </Button>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Scan Not Found</h2>
            <p className="text-slate-400">The requested scan could not be found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentPhaseIndex = getPhaseIndex(scan.status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            className="border-slate-700 text-slate-300 hover:bg-slate-800"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">Scan Progress</h1>
            <p className="text-slate-400 mt-1 font-mono text-sm">
              {scan.id} • {scan.target}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge 
            variant={scan.status === 'completed' ? 'default' : 'secondary'}
            className={
              scan.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
              scan.status === 'failed' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
              'bg-blue-500/20 text-blue-400 border-blue-500/30'
            }
          >
            {scan.status === 'completed' ? (
              <CheckCircle2 className="w-3 h-3 mr-1" />
            ) : scan.status === 'failed' ? (
              <AlertCircle className="w-3 h-3 mr-1" />
            ) : (
              <Play className="w-3 h-3 mr-1" />
            )}
            {PHASE_LABELS[scan.status]}
          </Badge>
          {scan.startedAt && scan.status !== 'completed' && (
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Clock className="w-4 h-4" />
              {formatTime(elapsedTime)}
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Progress</span>
            <span className="text-sm font-semibold text-white">{scan.progress}%</span>
          </div>
          <Progress value={scan.progress} className="h-2 bg-slate-800" />
        </CardContent>
      </Card>

      {/* Main Content: Terminal + Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Panel: Terminal (60%) */}
        <div className="lg:col-span-3">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <Terminal className="w-5 h-5 text-green-400" />
                Scan Log
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-96 bg-slate-950 rounded-b-lg">
                <div className="p-4 font-mono text-sm space-y-1">
                  {scan.logs.map((log, index) => (
                    <div key={index} className={`${getLogColor(log)} whitespace-pre-wrap`}>
                      {log}
                    </div>
                  ))}
                  {scan.status !== 'completed' && scan.status !== 'failed' && (
                    <div className="text-green-400 animate-pulse">█</div>
                  )}
                  <div ref={logEndRef} />
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel: Stats (40%) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Phase Timeline */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-400" />
                Phase Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {PHASES.map((phase, index) => {
                  const isActive = phase === scan.status;
                  const isCompleted = index < currentPhaseIndex || scan.status === 'completed';
                  
                  return (
                    <div key={phase} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                        isCompleted ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' :
                        isActive ? 'bg-blue-500/20 border-blue-500 text-blue-400 animate-pulse' :
                        'bg-slate-800 border-slate-700 text-slate-500'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <span className="text-xs font-bold">{index + 1}</span>
                        )}
                      </div>
                      <span className={`text-sm ${
                        isCompleted ? 'text-emerald-400' :
                        isActive ? 'text-blue-400 font-semibold' :
                        'text-slate-500'
                      }`}>
                        {PHASE_LABELS[phase]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Live Stats */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-400" />
                Live Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                  <Server className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-white">{scan.hosts.filter(h => h.status === 'up').length}</p>
                  <p className="text-xs text-slate-400">Hosts Found</p>
                </div>
                <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                  <Bug className="w-5 h-5 text-red-400 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-white">{scan.findings.length}</p>
                  <p className="text-xs text-slate-400">Vulnerabilities</p>
                </div>
                <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                  <div className="text-2xl font-bold text-white">
                    {scan.findings.filter(f => f.severity === 'critical').length}
                  </div>
                  <p className="text-xs text-slate-400">Critical</p>
                </div>
                <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                  <div className="text-2xl font-bold text-white">
                    {scan.findings.filter(f => f.severity === 'high').length}
                  </div>
                  <p className="text-xs text-slate-400">High</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Findings List (appears during/after scanning) */}
          {scan.findings.length > 0 && (
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-white">Recent Findings</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-48">
                  <div className="space-y-2">
                    {scan.findings.slice(-5).reverse().map((finding) => (
                      <div key={finding.id} className="p-2 bg-slate-800/50 rounded border border-slate-700">
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-mono ${SEVERITY_COLORS[finding.severity]}`}>
                            {finding.cveId}
                          </span>
                          <Badge className={`text-xs ${
                            finding.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                            finding.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                            finding.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-blue-500/20 text-blue-400'
                          }`}>
                            {finding.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-white mt-1">{finding.title}</p>
                        <p className="text-xs text-slate-400">{finding.host}:{finding.port}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Completion Message */}
      {scan.status === 'completed' && (
        <Card className="bg-emerald-500/10 border-emerald-500/30">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              <div>
                <h3 className="font-semibold text-emerald-400">Scan Completed</h3>
                <p className="text-sm text-slate-400">Redirecting to results in 3 seconds...</p>
              </div>
            </div>
            <Button 
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={() => navigate(`/dashboard/scans/${id}`)}
            >
              View Results Now
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

**Verify:** Manual testing - navigate to `/dashboard/scans/scan-test/progress` after creating a scan
**Commit:** `feat(scan): add ScanProgress page with terminal logs and live stats`

---

### Task 2.2: Update NewScan to Use Store
**File:** `src/pages/Dashboard/Scans/NewScan.tsx`
**Test:** none (form component, tested via integration)
**Depends:** 1.1 (uses scan-store)

**Design Decision:** The existing NewScan.tsx has `@ts-nocheck` and uses `// @ts-ignore`. I'm removing these and properly integrating with the scan store. The form's `onSubmit` now calls `scanStore.createScan()` and navigates to the progress page. I'm keeping the existing UI intact as specified by the design ("preserve existing UI").

```typescript
// src/pages/Dashboard/Scans/NewScan.tsx (MODIFIED - key changes only)
/**
 * SentinelScan New Scan Page
 * Path: src/pages/Dashboard/Scans/NewScan.tsx
 *
 * Comprehensive scan configuration with:
 * - Credentialed scanning (SSH key, username/password, API tokens)
 * - Schedule options (immediate or scheduled)
 * - Advanced stealth options
 * - Target validation
 * - NOW INTEGRATED with scan-store
 */
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plus, Shield, Scan, Settings, ChevronDown, Key, Lock, Calendar, Clock, Cookie, Timer, Shuffle, FileText, AlertCircle } from "lucide-react";
import { useState } from "react";
import { scanStore } from "@/lib/scan-store";  // NEW IMPORT

// ... scanTypes, scanProfiles, authTypes, userAgentOptions arrays remain the same ...

const newScanSchema = z.object({
  // ... schema remains the same ...
});

type FormValues = z.infer<typeof newScanSchema>;

export function NewScan() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("target");

  const form = useForm({
    resolver: zodResolver(newScanSchema),
    defaultValues: {
      target: "",
      scanType: "",
      profile: "",
      schedule: "now",
      scheduledDate: "",
      scheduledTime: "",
      useCredentials: false,
      authType: "",
      username: "",
      password: "",
      privateKey: "",
      apiToken: "",
      certFile: "",
      keyValuePairs: [],
      userAgentMode: "random",
      customUserAgent: "",
      enableCookies: true,
      humanLikeDelay: true,
      delayMin: 1,
      delayMax: 5,
      randomizeOrder: true,
      description: "",
    } as FormValues,
  });

  const watchUseCredentials = form.watch("useCredentials");
  const watchAuthType = form.watch("authType");
  const watchScanType = form.watch("scanType");
  const watchSchedule = form.watch("schedule");

  const onSubmit = (data: FormValues) => {
    // NEW: Create scan in store instead of just console.log
    const scan = scanStore.createScan({
      target: data.target,
      scanType: data.scanType,
      profile: data.profile,
      schedule: data.schedule,
      scheduledDate: data.scheduledDate,
      scheduledTime: data.scheduledTime,
      useCredentials: data.useCredentials,
      authType: data.authType,
      userAgentMode: data.userAgentMode,
      enableCookies: data.enableCookies,
      humanLikeDelay: data.humanLikeDelay,
      description: data.description,
    });

    // Navigate to progress page instead of all scans
    navigate(`/dashboard/scans/${scan.id}/progress`);
  };

  return (
    // ... JSX remains exactly the same, no UI changes ...
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* ... all existing JSX unchanged ... */}
    </div>
  );
}
```

**Verify:** Manual testing - fill out NewScan form and submit, should navigate to progress page
**Commit:** `feat(scan): integrate NewScan form with scan-store`

---

## Batch 3: Integration (parallel - 3 implementers)

All tasks in this batch depend on Batch 1-2 completing.

### Task 3.1: Update AllScans to Use Store
**File:** `src/pages/Dashboard/Scans/AllScans.tsx`
**Test:** none (integration tested)
**Depends:** 1.1, 2.2 (uses scan-store, NewScan creates scans)

**Design Decision:** The design specifies removing hardcoded `allScans` array and reading from store. I'm using React state with useEffect to load scans on mount, and setting up a subscription for real-time updates. The component will now show dynamically created scans.

```typescript
// src/pages/Dashboard/Scans/AllScans.tsx (MODIFIED)
/**
 * SentinelScan All Scans Page
 * Path: src/pages/Dashboard/Scans/AllScans.tsx
 *
 * Displays all scans across the system with filtering and sorting.
 * NOW INTEGRATED with scan-store for dynamic data.
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusChip } from '@/components/dashboard/StatusChip';
import { SeverityChip } from '@/components/dashboard/SeverityChip';
import { scanStore, type Scan } from '@/lib/scan-store';  // NEW IMPORT

export function AllScans() {
  const navigate = useNavigate();
  const [scans, setScans] = useState<Scan[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'running' | 'completed' | 'failed'>('all');

  // NEW: Load scans from store and subscribe to changes
  useEffect(() => {
    const loadScans = () => {
      const allScans = scanStore.getScans();
      setScans(allScans);
    };

    // Initial load
    loadScans();

    // Subscribe to store changes
    const unsubscribe = scanStore.subscribe(loadScans);

    return () => unsubscribe();
  }, []);

  // Filter scans based on active tab
  const filteredScans = scans.filter((scan) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'running') return ['queued', 'initializing', 'discovering', 'scanning', 'analyzing'].includes(scan.status);
    return scan.status === activeFilter;
  });

  const getSeverityFromFindings = (scan: Scan): string => {
    if (scan.findings.some(f => f.severity === 'critical')) return 'critical';
    if (scan.findings.some(f => f.severity === 'high')) return 'high';
    if (scan.findings.some(f => f.severity === 'medium')) return 'medium';
    if (scan.findings.some(f => f.severity === 'low')) return 'low';
    return 'info';
  };

  const formatDuration = (scan: Scan): string => {
    if (scan.duration) return scan.duration;
    if (scan.startedAt && scan.status !== 'completed') {
      const start = new Date(scan.startedAt).getTime();
      const now = Date.now();
      const diff = Math.floor((now - start) / 1000);
      return `${Math.floor(diff / 60)}m ${diff % 60}s`;
    }
    return '—';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">All Scans</h1>
          <p className="text-slate-400 mt-1">Monitor and manage vulnerability scans</p>
        </div>
        <Button 
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => navigate('/dashboard/scans/new')}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Scan
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(['all', 'running', 'completed', 'failed'] as const).map((filter) => (
          <Button
            key={filter}
            variant={activeFilter === filter ? 'default' : 'outline'}
            size="sm"
            className={activeFilter === filter ? '' : 'border-slate-700 text-slate-300 hover:bg-slate-800'}
            onClick={() => setActiveFilter(filter)}
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
            {filter !== 'all' && (
              <span className="ml-2 px-1.5 py-0.5 rounded-full text-xs bg-slate-700">
                {filter === 'running' 
                  ? scans.filter(s => ['queued', 'initializing', 'discovering', 'scanning', 'analyzing'].includes(s.status)).length
                  : scans.filter(s => s.status === filter).length
                }
              </span>
            )}
          </Button>
        ))}
      </div>

      {/* Scans Table */}
      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="p-0">
          {filteredScans.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-slate-400">No scans found. Create a new scan to get started.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Target</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Type</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Vulns</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Severity</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Duration</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredScans.map((scan) => (
                  <tr 
                    key={scan.id} 
                    className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors cursor-pointer"
                    onClick={() => {
                      if (scan.status === 'completed' || scan.status === 'failed') {
                        navigate(`/dashboard/scans/${scan.id}`);
                      } else {
                        navigate(`/dashboard/scans/${scan.id}/progress`);
                      }
                    }}
                  >
                    <td className="py-3 px-4 font-mono text-white">{scan.target}</td>
                    <td className="py-3 px-4">
                      <StatusChip status={scan.status as any} />
                    </td>
                    <td className="py-3 px-4 text-slate-300">{scan.scanType}</td>
                    <td className="py-3 px-4">
                      <span className={scan.findings.length > 0 ? 'text-red-400 font-semibold' : 'text-slate-500'}>
                        {scan.findings.length}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <SeverityChip severity={getSeverityFromFindings(scan) as any} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-slate-300">{formatDuration(scan)}</td>
                    <td className="py-3 px-4 text-slate-400">
                      {new Date(scan.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

**Verify:** Manual testing - create a scan from NewScan, check if it appears in AllScans
**Commit:** `feat(scan): update AllScans to read from scan-store`

---

### Task 3.2: Update ScanDetail to Use Store
**File:** `src/pages/Dashboard/Scans/ScanDetail.tsx`
**Test:** none (integration tested)
**Depends:** 1.1 (uses scan-store)

**Design Decision:** The existing ScanDetail uses hardcoded mock data. I'm replacing it with dynamic data from the store. If the scan is still running, it shows a message with a link to the progress page. The component now handles the case where scan is not found.

```typescript
// src/pages/Dashboard/Scans/ScanDetail.tsx (MODIFIED)
/**
 * SentinelScan Scan Detail Page
 * Path: src/pages/Dashboard/Scans/ScanDetail.tsx
 *
 * Shows details of a specific scan.
 * NOW INTEGRATED with scan-store for dynamic data.
 */
import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusChip } from '@/components/dashboard/StatusChip';
import { SeverityChip } from '@/components/dashboard/SeverityChip';
import { ExportModal } from '@/components/export/ExportModal';
import { scanStore, type Scan, type Finding } from '@/lib/scan-store';  // NEW IMPORT
import type { ScanData } from '@/lib/export';

export function ScanDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [scan, setScan] = useState<Scan | undefined>();
  const [showExport, setShowExport] = useState(false);

  // NEW: Load scan from store and subscribe to changes
  useEffect(() => {
    if (!id) return;

    const loadScan = () => {
      const found = scanStore.getScan(id);
      setScan(found);
    };

    loadScan();
    const unsubscribe = scanStore.subscribe(loadScan);

    return () => unsubscribe();
  }, [id]);

  if (!scan) {
    return (
      <div className="space-y-6">
        <Button variant="outline" size="sm" className="border-slate-700 text-slate-300 hover:bg-slate-800" onClick={() => navigate(-1)}>
          ← Back
        </Button>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold text-white mb-2">Scan Not Found</h2>
            <p className="text-slate-400">The requested scan could not be found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If scan is still running, show message
  if (scan.status !== 'completed' && scan.status !== 'failed') {
    return (
      <div className="space-y-6">
        <Button variant="outline" size="sm" className="border-slate-700 text-slate-300 hover:bg-slate-800" onClick={() => navigate(-1)}>
          ← Back
        </Button>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold text-white mb-2">Scan in Progress</h2>
            <p className="text-slate-400 mb-4">This scan is currently running. Redirecting to progress page...</p>
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => navigate(`/dashboard/scans/${scan.id}/progress`)}
            >
              View Progress
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Build export data from scan
  const exportData: ScanData = {
    id: scan.id,
    target: scan.target,
    status: scan.status,
    scanType: scan.scanType,
    profile: scan.profile,
    owner: 'admin', // TODO: get from auth context
    createdAt: scan.createdAt,
    startedAt: scan.startedAt || '',
    completedAt: scan.completedAt || '',
    duration: scan.duration || '',
    credentials: {
      enabled: scan.config.credentials,
      authType: scan.config.authType || 'none',
    },
    summary: {
      totalVulns: scan.findings.length,
      critical: scan.findings.filter(f => f.severity === 'critical').length,
      high: scan.findings.filter(f => f.severity === 'high').length,
      medium: scan.findings.filter(f => f.severity === 'medium').length,
      low: scan.findings.filter(f => f.severity === 'low').length,
      info: scan.findings.filter(f => f.severity === 'info').length,
    },
    hosts: scan.hosts,
    notes: scan.config.description,
    vulnerabilities: scan.findings.map((v) => ({
      id: v.id,
      title: v.title,
      severity: v.severity,
      host: v.host,
      port: v.port || 0,
    })),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" className="border-slate-700 text-slate-300 hover:bg-slate-800" onClick={() => navigate(-1)}>
            ← Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">Scan Details</h1>
            <p className="text-slate-400 mt-1 font-mono text-sm">{scan.id} • {scan.target}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800" onClick={() => setShowExport(true)}>
            Export
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            View Results
          </Button>
        </div>
      </div>

      {/* Status + Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-slate-500 mb-1">Status</p>
            <StatusChip status={scan.status as any} />
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-slate-500 mb-1">Total Vulns</p>
            <p className="text-2xl font-bold text-white">{scan.findings.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-slate-500 mb-1">Critical</p>
            <p className="text-2xl font-bold text-red-400">
              {scan.findings.filter(f => f.severity === 'critical').length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-slate-500 mb-1">High</p>
            <p className="text-2xl font-bold text-orange-400">
              {scan.findings.filter(f => f.severity === 'high').length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-slate-500 mb-1">Medium</p>
            <p className="text-2xl font-bold text-yellow-400">
              {scan.findings.filter(f => f.severity === 'medium').length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-slate-500 mb-1">Low</p>
            <p className="text-2xl font-bold text-blue-400">
              {scan.findings.filter(f => f.severity === 'low').length}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scan Info */}
        <Card className="bg-slate-900 border-slate-800 lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-white">Scan Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Target</span>
              <span className="text-white font-mono">{scan.target}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Type</span>
              <span className="text-white">{scan.scanType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Profile</span>
              <span className="text-white">{scan.profile}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Owner</span>
              <span className="text-white">admin</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Credentials</span>
              <span className={scan.config.credentials ? 'text-emerald-400' : 'text-slate-500'}>
                {scan.config.credentials ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <hr className="border-slate-800" />
            <div className="flex justify-between">
              <span className="text-slate-500">Created</span>
              <span className="text-slate-300">{new Date(scan.createdAt).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Started</span>
              <span className="text-slate-300">{scan.startedAt ? new Date(scan.startedAt).toLocaleString() : '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Completed</span>
              <span className="text-slate-300">{scan.completedAt ? new Date(scan.completedAt).toLocaleString() : '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Duration</span>
              <span className="text-white font-semibold">{scan.duration || '—'}</span>
            </div>
          </CardContent>
        </Card>

        {/* Hosts Discovered */}
        <Card className="bg-slate-900 border-slate-800 lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-white">Hosts Discovered</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left py-2 px-4 text-slate-400 font-medium">IP Address</th>
                  <th className="text-left py-2 px-4 text-slate-400 font-medium">Status</th>
                  <th className="text-left py-2 px-4 text-slate-400 font-medium">Open Ports</th>
                  <th className="text-left py-2 px-4 text-slate-400 font-medium">Vulns</th>
                </tr>
              </thead>
              <tbody>
                {scan.hosts.map((host) => (
                  <tr key={host.ip} className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                    <td className="py-2 px-4 font-mono text-white">{host.ip}</td>
                    <td className="py-2 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${host.status === 'up' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-500/20 text-slate-400'}`}>
                        {host.status}
                      </span>
                    </td>
                    <td className="py-2 px-4 text-slate-300">{host.openPorts}</td>
                    <td className="py-2 px-4">
                      {scan.findings.filter(f => f.host === host.ip).length > 0 ? (
                        <span className="text-red-400 font-semibold">
                          {scan.findings.filter(f => f.host === host.ip).length}
                        </span>
                      ) : (
                        <span className="text-slate-500">0</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      {/* Top Vulnerabilities */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-white">Top Vulnerabilities</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left py-2 px-4 text-slate-400 font-medium">CVE ID</th>
                <th className="text-left py-2 px-4 text-slate-400 font-medium">Title</th>
                <th className="text-left py-2 px-4 text-slate-400 font-medium">Severity</th>
                <th className="text-left py-2 px-4 text-slate-400 font-medium">Host</th>
                <th className="text-left py-2 px-4 text-slate-400 font-medium">Port</th>
              </tr>
            </thead>
            <tbody>
              {scan.findings
                .sort((a, b) => {
                  const severityOrder = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
                  return severityOrder[a.severity] - severityOrder[b.severity];
                })
                .slice(0, 10)
                .map((vuln) => (
                  <tr
                    key={vuln.id}
                    className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/dashboard/scans/${scan.id}/results/${vuln.id}`)}
                  >
                    <td className="py-2 px-4 font-mono text-blue-400">{vuln.cveId || vuln.id}</td>
                    <td className="py-2 px-4 text-white">{vuln.title}</td>
                    <td className="py-2 px-4">
                      <SeverityChip severity={vuln.severity as any} size="sm" />
                    </td>
                    <td className="py-2 px-4 font-mono text-slate-300">{vuln.host}</td>
                    <td className="py-2 px-4 text-slate-400">{vuln.port || '—'}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Notes */}
      {scan.config.description && (
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-white">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-400">{scan.config.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Export Modal */}
      {showExport && <ExportModal data={exportData} onClose={() => setShowExport(false)} />}
    </div>
  );
}
```

**Verify:** Manual testing - complete a scan and check ScanDetail page
**Commit:** `feat(scan): update ScanDetail to read from scan-store`

---

### Task 3.3: Add Progress Route to App.tsx
**File:** `src/App.tsx`
**Test:** none (routing change)
**Depends:** 2.1 (ScanProgress component must exist)

**Design Decision:** The design specifies adding route `:id/progress` inside the scans subtree. I'm adding this route alongside the existing `:id` route for ScanDetail. This allows both `/dashboard/scans/:id` (detail) and `/dashboard/scans/:id/progress` (progress) to work.

```typescript
// src/App.tsx (MODIFIED - key changes)
/**
 * SentinelScan App Root Component
 * Path: src/App.tsx
 *
 * Main application component that handles routing and navigation.
 * Defines routes for public pages (Index, Login) and protected dashboard routes.
 */
import { Routes, Route } from 'react-router-dom';
import { LoggingProvider } from './contexts/LoggingContext';
import { TelemetryProvider } from './components/TelemetryProvider';
import { useNavigationLogger } from './hooks/useNavigationLogger';
import Index from './pages/Index';
import Login from './pages/Login';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { DashboardIndex } from './pages/Dashboard/Index';
import { AllScans } from './pages/Dashboard/Scans/AllScans';
import { MyScans } from './pages/Dashboard/Scans/MyScans';
import { TrashScans } from './pages/Dashboard/Scans/TrashScans';
import { NewScan } from './pages/Dashboard/Scans/NewScan';
import { ScanDetail } from './pages/Dashboard/Scans/ScanDetail';
import { ScanProgress } from './pages/Dashboard/Scans/ScanProgress';  // NEW IMPORT
import { ScanResultDetail } from './pages/Dashboard/Scans/ScanResultDetail';
import { Templates } from './pages/Dashboard/Templates/Templates';
import { UserManagement } from './pages/Dashboard/Users/Users';
import { Reports } from './pages/Dashboard/Reports/Reports';
import { Settings } from './pages/Dashboard/Settings/Settings';
import { LogViewer } from './pages/Dashboard/LogViewer';
import { TicketList } from './pages/Dashboard/Tickets/TicketList';
import { TicketDetail } from './pages/Dashboard/Tickets/TicketDetail';
import { CreateTicket } from './pages/Dashboard/Tickets/CreateTicket';
import { KanbanBoard } from './pages/Dashboard/Tickets/KanbanBoard';

function App() {
  useNavigationLogger();

  return (
    <LoggingProvider>
      <TelemetryProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />

          {/* Protected Dashboard Routes */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardIndex />} />
            
            {/* Scans Subtree */}
            <Route path="scans">
              <Route index element={<AllScans />} />
              <Route path="all" element={<AllScans />} />
              <Route path="new" element={<NewScan />} />
              <Route path=":id/progress" element={<ScanProgress />} />  {/* NEW ROUTE */}
              <Route path=":id" element={<ScanDetail />} />
              <Route path=":scanId/results/:vulnId" element={<ScanResultDetail />} />
              <Route path="my-scans" element={<MyScans />} />
              <Route path="trash" element={<TrashScans />} />
            </Route>
            
            <Route path="templates" element={<Templates />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
            <Route path="logs" element={<LogViewer />} />
            
            {/* Tickets Subtree */}
            <Route path="tickets">
              <Route index element={<TicketList />} />
              <Route path="kanban" element={<KanbanBoard />} />
              <Route path="new" element={<CreateTicket />} />
              <Route path=":id" element={<TicketDetail />} />
            </Route>
          </Route>
        </Routes>
      </TelemetryProvider>
    </LoggingProvider>
  );
}

export default App;
```

**Verify:** Manual testing - navigate to `/dashboard/scans/scan-test/progress`
**Commit:** `feat(scan): add progress route to App.tsx`

---

## Batch 4: Verification (1 implementer)

### Task 4.1: Manual Testing Checklist
**File:** `thoughts/shared/plans/2026-05-03-mock-scan-workflow-checklist.md`
**Test:** none (manual testing document)
**Depends:** 1.1, 1.2, 2.1, 2.2, 3.1, 3.2, 3.3 (all previous tasks)

```markdown
# Mock Scan Workflow - Testing Checklist

## Pre-Testing Setup
- [ ] Run `npm run dev` and open http://localhost:5173
- [ ] Open browser DevTools > Application > Local Storage
- [ ] Clear any existing `sentinelscan_scans` data

## Test 1: Full Scan Lifecycle
1. [ ] Navigate to `/dashboard/scans/new`
2. [ ] Fill in form:
   - Target: `192.168.1.0/24`
   - Scan Type: `Web Application Scan`
   - Profile: `Standard`
   - Enable credentials (optional)
3. [ ] Click "Launch Scan"
4. [ ] Verify: Redirected to `/dashboard/scans/scan-XXXX/progress`
5. [ ] Verify: Progress page shows:
   - [ ] Scan target and ID in header
   - [ ] "Queued" status badge
   - [ ] Terminal log showing "Scan queued..."
   - [ ] Progress bar at 0%
6. [ ] Wait for "Initializing" phase (2s)
   - [ ] Verify: Status changes to "Initializing"
   - [ ] Verify: Log shows target resolution, template loading
7. [ ] Wait for "Discovering" phase (4s)
   - [ ] Verify: Hosts appear in stats panel
   - [ ] Verify: Log shows "FOUND Host ..." messages
8. [ ] Wait for "Scanning" phase (8s)
   - [ ] Verify: Progress bar animates from 30% to 90%
   - [ ] Verify: Findings appear in real-time
   - [ ] Verify: Stats update (vulns count increases)
9. [ ] Wait for "Analyzing" phase (2s)
   - [ ] Verify: Status changes to "Analyzing"
10. [ ] Wait for "Completed" phase
    - [ ] Verify: Status changes to "Completed"
    - [ ] Verify: Progress bar at 100%
    - [ ] Verify: "Redirecting..." message appears
    - [ ] Verify: Auto-redirects to `/dashboard/scans/scan-XXXX` after 3s
    - [ ] OR click "View Results Now" button

## Test 2: ScanDetail Page
1. [ ] After redirect from progress page
2. [ ] Verify: ScanDetail shows:
   - [ ] Correct target, scan type, profile
   - [ ] Status badge shows "Completed"
   - [ ] Summary cards show correct counts
   - [ ] Hosts table lists all discovered hosts
   - [ ] Vulnerabilities table lists all findings sorted by severity
3. [ ] Click on a vulnerability row
   - [ ] Verify: Navigates to result detail page

## Test 3: AllScans Integration
1. [ ] Navigate to `/dashboard/scans/all`
2. [ ] Verify: Newly created scan appears in the table
3. [ ] Verify: Status shows "completed" (or current status)
4. [ ] Verify: Click on scan row navigates to detail/progress appropriately
5. [ ] Create another scan with different type:
   - [ ] Target: `example.com`
   - [ ] Scan Type: `Basic Network Scan`
6. [ ] Verify: Two scans now appear in AllScans
7. [ ] Test filter tabs:
   - [ ] Click "Running" tab (if scan still running)
   - [ ] Click "Completed" tab
   - [ ] Click "All" tab

## Test 4: Persistence (Page Refresh)
1. [ ] While scan is running (or after completion)
2. [ ] Refresh the page (F5)
3. [ ] Verify: Scan state is preserved
4. [ ] If was running, verify: Progress page shows current state
5. [ ] Navigate to AllScans
6. [ ] Verify: All scans still appear after refresh

## Test 5: Different Scan Types
Test each scan type and verify different findings:

1. [ ] **Web Application Scan** (`web`)
   - [ ] Verify: XSS, SQLi, CSRF findings appear
2. [ ] **Basic Network Scan** (`basic`)
   - [ ] Verify: Open services, weak ciphers findings
3. [ ] **Credentialed Scan** (`credentialed`)
   - [ ] Verify: Patch management, permission findings
4. [ ] **Compliance Audit** (`compliance`)
   - [ ] Verify: CIS, PCI-DSS findings
5. [ ] **Host Discovery** (`discovery`)
   - [ ] Verify: Host list, port scan findings

## Test 6: Multiple Concurrent Scans
1. [ ] Open two browser tabs
2. [ ] Launch scan in Tab 1
3. [ ] Launch scan in Tab 2
4. [ ] Verify: Both scans appear in AllScans
5. [ ] Verify: Each progress page shows correct scan

## Test 7: Edge Cases
1. [ ] Navigate to `/dashboard/scans/nonexistent-id`
   - [ ] Verify: "Scan Not Found" message appears
2. [ ] Navigate to `/dashboard/scans/nonexistent-id/progress`
   - [ ] Verify: "Scan Not Found" message appears
3. [ ] Create scan with URL target: `https://example.com`
   - [ ] Verify: Scan handles URL correctly
4. [ ] Create scan with hostname: `test.local`
   - [ ] Verify: Scan handles hostname correctly

## Test 8: localStorage
1. [ ] Open DevTools > Application > Local Storage
2. [ ] Verify: `sentinelscan_scans` key exists
3. [ ] Verify: Value is valid JSON array
4. [ ] Verify: Scan data includes all fields (id, target, status, etc.)

## Performance Checks
- [ ] Terminal log auto-scrolls smoothly
- [ ] Progress bar animation is smooth
- [ ] Phase timeline updates correctly
- [ ] No console errors during simulation

## Cleanup
- [ ] Clear localStorage after testing
- [ ] Verify: AllScans shows empty state
```

**Verify:** Follow the checklist manually
**Commit:** `docs(scan): add manual testing checklist for mock scan workflow`

---

## Summary

| Batch | Tasks | Description | Dependencies |
|-------|-------|-------------|---------------|
| 1 | 1.1, 1.2, 1.3 | Foundation: scan-store, finding-generator, types | None |
| 2 | 2.1, 2.2 | Core: ScanProgress page, NewScan integration | Batch 1 |
| 3 | 3.1, 3.2, 3.3 | Integration: AllScans, ScanDetail, App route | Batch 1-2 |
| 4 | 4.1 | Verification: Manual testing checklist | All previous |

**Total Tasks:** 10 (7 code files + 2 test files + 1 checklist)

**Key Implementation Decisions:**
1. String IDs (`scan-1714723200000`) instead of number IDs to match design
2. Extended status values (`queued`, `initializing`, etc.) for detailed simulation
3. Pure function-based finding generator with deterministic seeds for consistency
4. Terminal-style logs with color coding by severity
5. Phase timeline with visual progress indicators
6. localStorage persistence with graceful fallback
7. Real-time updates via store subscription pattern

**Next Steps After Implementation:**
1. Run through the manual testing checklist
2. Fix any issues found during testing
3. Commit all changes
4. Push to repository for review
