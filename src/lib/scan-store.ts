/**
 * SentinelScan Mock Scan Store
 * Path: src/lib/scan-store.ts
 *
 * Central mock database with localStorage persistence.
 * All scan-related components read from this store.
 */

export type ScanStatus = 
  | 'queued'
  | 'host-discovery'
  | 'port-scanning'
  | 'service-detection'
  | 'vuln-scanning'
  | 'report-generation'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'aborted';

export const RUNNING_STATUSES: ScanStatus[] = ['queued', 'host-discovery', 'port-scanning', 'service-detection', 'vuln-scanning', 'report-generation'];

export type ScanType = 
  | 'basic'
  | 'advanced'
  | 'web'
  | 'credentialed'
  | 'compliance'
  | 'discovery'
  | 'ai-agentic';

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
  url?: string;
  requestHeader?: string;
  requestBody?: string;
  responseHeader?: string;
  responseBody?: string;
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
   // AI-Agentic Anti-Pattern fields
   aiAdaptability?: 'conservative' | 'balanced' | 'aggressive';
   randomizeAttackOrder?: boolean;
   adaptivePayloads?: boolean;
   mimicHumanBehavior?: boolean;
   showAIReasoning?: boolean;
 }

export interface Scan {
  id: string;
  scanGroupId: string;
  sourceScanId?: string;
  runNumber: number;
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
  createdBy?: string;
  deletedAt?: string | null;
  deletedBy?: string;
}

const STORAGE_KEY = 'sentinelscan_scans';
const SEED_KEY = 'sentinelscan_scans_seeded';

interface ScanStoreState {
  scans: Map<string, Scan>;
  listeners: Set<() => void>;
}

function getSeedScans(): Scan[] {
  const now = new Date();
  const day = (offset: number) => new Date(now.getTime() - offset * 86400000).toISOString();

  return [
    {
      id: 'scan-1',
      scanGroupId: 'scan-1',
      runNumber: 1,
      target: 'staging.app.sentinelsec.com',
      scanType: 'web',
      profile: 'full',
      status: 'completed',
      progress: 100,
      createdAt: day(5),
      startedAt: day(5),
      completedAt: day(5),
      duration: '28m 14s',
      createdBy: 'admin',
      hosts: [
        { ip: '203.0.113.10', status: 'up', openPorts: 5, vulns: 12, hostname: 'staging.app.sentinelsec.com' },
      ],
      findings: [
        { id: 'finding-1', title: 'SQL Injection in Login Endpoint', severity: 'critical', cveId: 'CVE-2025-1001', cvssScore: 9.8, host: '203.0.113.10', port: 443, description: 'Time-based blind SQL injection in POST /api/auth/login email parameter. Database: PostgreSQL.', category: 'OWASP Top 10 - A03:2021', discoveredAt: day(5) },
        { id: 'finding-2', title: 'Stored XSS in User Profile Bio', severity: 'high', cveId: 'CVE-2025-1002', cvssScore: 8.3, host: '203.0.113.10', port: 443, description: 'Unsanitized HTML in profile bio field. Payload executes when admin views user list.', category: 'OWASP Top 10 - A03:2021', discoveredAt: day(5) },
        { id: 'finding-3', title: 'IDOR in Order History API', severity: 'high', cveId: 'CVE-2025-1003', cvssScore: 7.5, host: '203.0.113.10', port: 443, description: 'GET /api/orders/{id} returns any order without ownership check. Numeric ID enumeration possible.', category: 'OWASP Top 10 - A01:2021', discoveredAt: day(5) },
        { id: 'finding-4', title: 'JWT Secret Key Weak', severity: 'high', cvssScore: 7.8, host: '203.0.113.10', port: 443, description: 'JWT signed with "secret" key. Tokens can be forged to impersonate any user.', category: 'Authentication', discoveredAt: day(5) },
        { id: 'finding-5', title: 'Missing CSRF Protection on Password Change', severity: 'medium', cvssScore: 6.5, host: '203.0.113.10', port: 443, description: 'POST /api/auth/change-password lacks CSRF token. Attack can force password reset.', category: 'OWASP Top 10 - A01:2021', discoveredAt: day(5) },
        { id: 'finding-6', title: 'Rate Limiting Bypass via X-Forwarded-For', severity: 'medium', cvssScore: 5.5, host: '203.0.113.10', port: 443, description: 'Rate limiting uses X-Forwarded-For header which can be spoofed to bypass brute-force protection.', category: 'Configuration', discoveredAt: day(5) },
        { id: 'finding-7', title: 'Session Fixation on Login', severity: 'medium', cvssScore: 5.9, host: '203.0.113.10', port: 443, description: 'Session ID not regenerated after login. Attacker can pre-set session ID and hijack after auth.', category: 'Authentication', discoveredAt: day(5) },
        { id: 'finding-8', title: 'Debug Endpoint Exposed', severity: 'medium', cvssScore: 5.3, host: '203.0.113.10', port: 443, description: '/api/debug/env leaks environment variables including DB_HOST, AWS_SECRET_KEY.', category: 'Information Leakage', discoveredAt: day(5) },
        { id: 'finding-9', title: 'Weak Password Policy', severity: 'low', cvssScore: 3.1, host: '203.0.113.10', port: 443, description: 'Password policy accepts 6-character passwords. No complexity requirement.', category: 'Configuration', discoveredAt: day(5) },
        { id: 'finding-10', title: 'Missing Content Security Policy', severity: 'low', cvssScore: 3.7, host: '203.0.113.10', port: 443, description: 'No CSP header. Possibility of data exfiltration via injected scripts.', category: 'Configuration', discoveredAt: day(5) },
        { id: 'finding-11', title: 'Stack Trace Disclosure on 500 Error', severity: 'low', cvssScore: 2.5, host: '203.0.113.10', port: 443, description: 'Express error handler leaks full stack trace including internal IPs and file paths.', category: 'Information Leakage', discoveredAt: day(5) },
        { id: 'finding-12', title: 'Open CORS Policy', severity: 'low', cvssScore: 3.5, host: '203.0.113.10', port: 443, description: 'Access-Control-Allow-Origin: * allows any site to read API responses.', category: 'Configuration', discoveredAt: day(5) },
      ],
      logs: [],
      config: { credentials: false, stealth: false, schedule: 'now', userAgentMode: 'chrome', enableCookies: true, humanLikeDelay: true, description: 'Full OWASP Top 10 assessment on staging environment' },
    },
    {
      id: 'scan-2',
      scanGroupId: 'scan-2',
      runNumber: 1,
      target: 'api.sentinelsec.com',
      scanType: 'web',
      profile: 'full',
      status: 'completed',
      progress: 100,
      createdAt: day(2),
      startedAt: day(2),
      completedAt: day(2),
      duration: '42m 08s',
      createdBy: 'user-3',
      hosts: [
        { ip: '203.0.113.50', status: 'up', openPorts: 3, vulns: 6, hostname: 'api.sentinelsec.com' },
      ],
      findings: [
        { id: 'finding-13', title: 'GraphQL Introspection Enabled', severity: 'high', cveId: 'CVE-2025-2001', cvssScore: 7.5, host: '203.0.113.50', port: 443, description: 'GraphQL introspection queries reveal full schema including admin-only mutations.', category: 'API Security', discoveredAt: day(2) },
        { id: 'finding-14', title: 'No Rate Limiting on REST Endpoints', severity: 'medium', cvssScore: 5.5, host: '203.0.113.50', port: 443, description: 'No rate limiting on POST /api/v2/register. Allows mass account creation.', category: 'API Security', discoveredAt: day(2) },
        { id: 'finding-15', title: 'Mass Assignment in User Update', severity: 'high', cvssScore: 8.0, host: '203.0.113.50', port: 443, description: 'PATCH /api/v2/users allows setting role=admin via request body.', category: 'OWASP Top 10 - A01:2021', discoveredAt: day(2) },
        { id: 'finding-16', title: 'JWT Not Validated on WebSocket Upgrade', severity: 'high', cvssScore: 7.8, host: '203.0.113.50', port: 443, description: 'WebSocket wss://api.sentinelsec.com/ws accepts any valid JWT without user-scope check.', category: 'Authentication', discoveredAt: day(2) },
        { id: 'finding-17', title: 'API Versioning via Path Allows Deprecated Endpoints', severity: 'low', cvssScore: 3.5, host: '203.0.113.50', port: 443, description: '/api/v1/register still active — uses MD5 hashing and no rate limiting.', category: 'API Security', discoveredAt: day(2) },
        { id: 'finding-18', title: 'Server-Side Request Forgery in Proxy Endpoint', severity: 'critical', cveId: 'CVE-2025-2002', cvssScore: 9.1, host: '203.0.113.50', port: 443, description: 'POST /api/v2/proxy/fetch accepts arbitrary URL and returns response. Can access internal services.', category: 'OWASP Top 10 - A10:2021', discoveredAt: day(2) },
      ],
      logs: [],
      config: { credentials: true, authType: 'api-token', stealth: true, schedule: 'now', userAgentMode: 'random', enableCookies: true, humanLikeDelay: false, description: 'API security assessment with authenticated scanning' },
    },
    {
      id: 'scan-3',
      scanGroupId: 'scan-3',
      runNumber: 1,
      target: 'admin.sentinelsec.com',
      scanType: 'web',
      profile: 'full',
      status: 'failed',
      progress: 12,
      createdAt: day(1),
      startedAt: day(1),
      completedAt: day(1),
      duration: '2m 45s',
      createdBy: 'admin',
      hosts: [
        { ip: '203.0.113.100', status: 'up', openPorts: 2, vulns: 0, hostname: 'admin.sentinelsec.com' },
      ],
      findings: [],
      logs: [],
      errorMessage: 'Scan blocked by WAF — target returned 403 Forbidden on all probe requests after 2 minutes.',
      config: { credentials: false, stealth: true, schedule: 'now', userAgentMode: 'random', enableCookies: false, humanLikeDelay: true, description: 'Admin panel security scan' },
    },
  ];
}

class ScanStore {
  private state: ScanStoreState;
  private nextId = 4;

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
          parsed.forEach((scan: Scan) => {
            this.state.scans.set(scan.id, scan);
          });
        }
      }
      // Seed data on first run
      if (this.state.scans.size === 0 && !localStorage.getItem(SEED_KEY)) {
        getSeedScans().forEach(scan => {
          this.state.scans.set(scan.id, scan);
        });
        localStorage.setItem(SEED_KEY, 'true');
        this.saveToStorage();
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
    createdBy?: string;
    sourceScanId?: string;
    // AI-Agentic Anti-Pattern fields
    aiAdaptability?: string;
    randomizeAttackOrder?: boolean;
    adaptivePayloads?: boolean;
    mimicHumanBehavior?: boolean;
    showAIReasoning?: boolean;
  }): Scan {
    const id = `scan-${this.nextId++}`;
    const now = new Date().toISOString();

    // Determine scanGroupId and runNumber
    let scanGroupId: string;
    let runNumber: number;
    if (formValues.sourceScanId) {
      const source = this.state.scans.get(formValues.sourceScanId);
      scanGroupId = source?.scanGroupId || id;
      const existingRuns = this.getScanHistory(scanGroupId);
      runNumber = existingRuns.length + 1;
    } else {
      scanGroupId = id;
      runNumber = 1;
    }

    const scan: Scan = {
      id,
      scanGroupId,
      sourceScanId: formValues.sourceScanId,
      runNumber,
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
      createdBy: formValues.createdBy || 'admin',
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
        // AI-Agentic Anti-Pattern fields
        aiAdaptability: formValues.aiAdaptability as 'conservative' | 'balanced' | 'aggressive' | undefined,
        randomizeAttackOrder: formValues.randomizeAttackOrder,
        adaptivePayloads: formValues.adaptivePayloads,
        mimicHumanBehavior: formValues.mimicHumanBehavior,
        showAIReasoning: formValues.showAIReasoning,
      },
    };

    this.state.scans.set(id, scan);
    this.saveToStorage();
    this.notify();
    return scan;
  }

  getScans(): Scan[] {
    return this.getActiveScans();
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

  // --- Soft-delete & Trash ---

  softDelete(id: string, deletedBy?: string): Scan | undefined {
    const scan = this.state.scans.get(id);
    if (!scan) return undefined;
    const now = new Date().toISOString();
    const isInProgress = RUNNING_STATUSES.includes(scan.status);
    const updated = { ...scan, deletedAt: now, deletedBy: deletedBy || 'unknown', status: isInProgress ? 'failed' as ScanStatus : scan.status } as Scan;
    this.state.scans.set(id, updated);
    this.saveToStorage();
    this.notify();
    return updated;
  }

  restore(id: string): Scan | undefined {
    const scan = this.state.scans.get(id);
    if (!scan) return undefined;
    const updated = { ...scan, deletedAt: null, deletedBy: undefined } as Scan;
    this.state.scans.set(id, updated);
    this.saveToStorage();
    this.notify();
    return updated;
  }

  getTrashedScans(): Scan[] {
    return Array.from(this.state.scans.values())
      .filter(s => s.deletedAt != null)
      .sort((a, b) => new Date(b.deletedAt!).getTime() - new Date(a.deletedAt!).getTime());
  }

  permanentDelete(id: string): boolean {
    const deleted = this.state.scans.delete(id);
    if (deleted) {
      this.saveToStorage();
      this.notify();
    }
    return deleted;
  }

  getActiveScans(): Scan[] {
    return Array.from(this.state.scans.values())
      .filter(s => s.deletedAt == null)
      .sort((a, b) => {
        const timeDiff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        if (timeDiff !== 0) return timeDiff;
        return b.id.localeCompare(a.id);
      });
  }

  getScansByTarget(target: string): Scan[] {
    return Array.from(this.state.scans.values())
      .filter(s => s.deletedAt == null && s.target === target)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  cancelScan(id: string): Scan | undefined {
    const scan = this.state.scans.get(id);
    if (!scan) return undefined;
    const updated = { ...scan, status: 'cancelled' as ScanStatus, completedAt: new Date().toISOString() };
    this.state.scans.set(id, updated);
    this.saveToStorage();
    this.notify();
    return updated;
  }

  // --- Scan Group / History ---

  getScanHistory(scanGroupId: string): Scan[] {
    return Array.from(this.state.scans.values())
      .filter(s => s.scanGroupId === scanGroupId && s.deletedAt == null)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  getLatestScan(scanGroupId: string): Scan | undefined {
    const runs = this.getScanHistory(scanGroupId);
    return runs.length > 0 ? runs[runs.length - 1] : undefined;
  }

  getScanInstances(): { groupId: string; target: string; lastRun: Scan; runCount: number }[] {
    const all = this.getActiveScans();
    const groups = new Map<string, Scan[]>();
    for (const scan of all) {
      const list = groups.get(scan.scanGroupId) || [];
      list.push(scan);
      groups.set(scan.scanGroupId, list);
    }
    return Array.from(groups.entries()).map(([groupId, runs]) => {
      runs.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      return {
        groupId,
        target: runs[0].target,
        lastRun: runs[runs.length - 1],
        runCount: runs.length,
      };
    }).sort((a, b) => new Date(b.lastRun.createdAt).getTime() - new Date(a.lastRun.createdAt).getTime());
  }

  // --- Testing utility ---

  clearAll(): void {
    this.state.scans.clear();
    this.nextId = 4;
     try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(SEED_KEY);
    } catch {
      // ignore
    }
    this.notify();
  }

  // --- Simulation Engine (Nessus-style phases) ---

   async simulateScan(id: string, onUpdate?: (scan: Scan) => void): Promise<void> {
    const scan = this.getScan(id);
    if (!scan) throw new Error(`Scan ${id} not found`);

    const isAIAgentic = scan.scanType === 'ai-agentic';

    const addLog = (type: string, message: string, pluginId?: string) => {
      const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
      const plugin = pluginId ? `Plugin ${pluginId}: ` : '';
      const logEntry = `+ [${timestamp}] ${plugin}${type}: ${message}`;
      const updated = this.updateScan(id, { logs: [...(this.getScan(id)?.logs || []), logEntry] });
      if (updated && onUpdate) onUpdate(updated);
    };

    const addAILog = (message: string, reasoning?: string) => {
      const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
      const aiPrefix = '🤖 AI-Agent';
      const logEntry = `+ [${timestamp}] ${aiPrefix}: ${message}${reasoning ? ` | Reasoning: ${reasoning}` : ''}`;
      const updated = this.updateScan(id, { logs: [...(this.getScan(id)?.logs || []), logEntry] });
      if (updated && onUpdate) onUpdate(updated);
    };

    const updateProgress = (status: ScanStatus, progress: number, extra?: Partial<Scan>) => {
      this.updateScan(id, { status, progress, ...extra });
      const current = this.getScan(id);
      if (current && onUpdate) onUpdate(current);
    };

    try {
      // Phase 1: Queued (1.5s)
      addLog('INFO', 'Scan queued, waiting for scanner engine...');
      if (isAIAgentic) {
        addAILog('Initializing AI-Agentic engine...', 'Loading adaptive scanning modules');
      }
      await this.delay(1500);

      // Phase 2: Host Discovery (3s)
      updateProgress('host-discovery', 10, { startedAt: new Date().toISOString() });
      addLog('INFO', `Resolving target: ${scan.target}`, '10150');
      await this.delay(750);
      addLog('INFO', `Target resolved: ${scan.target}`, '10150');
      
      if (isAIAgentic) {
        addAILog('Analyzing target architecture...', 'Detecting tech stack, framework, CMS');
        await this.delay(500);
        addAILog('Detected: React SPA + Node.js API', 'HTML analysis + JS framework detection');
        await this.delay(500);
        addAILog('Selecting optimal scan strategy...', 'Matching target profile to attack patterns');
        await this.delay(500);
        addAILog('Strategy chosen: SPA-focused OWASP Top 10', 'Skipping WordPress/legacy checks');
      }

      await this.delay(750);
      addLog('INFO', 'Starting host discovery (Ping sweep)...', '10180');
      await this.delay(750);
      addLog('INFO', 'Discovering live hosts...', '10221');
      await this.delay(750);

      const hosts = generateHosts(scan.target, scan.scanType);
      hosts.forEach((host) => {
        addLog(`Host ${host.ip} is ${host.status.toUpperCase()}${host.hostname ? ` (${host.hostname})` : ''}`, '10221');
        this.updateScan(id, {
          hosts: [...(this.getScan(id)?.hosts || []), host],
        });
      });
      await this.delay(500);
      addLog('INFO', `Host discovery complete: ${hosts.filter(h => h.status === 'up').length} live hosts found`, '10221');

      // Phase 3: Port Scanning (4s)
      updateProgress('port-scanning', 25);
      addLog('INFO', 'Starting port scanning...', '11219');
      await this.delay(1000);
      addLog('INFO', 'Scanning common ports (TCP)...', '11219');
      
      if (isAIAgentic) {
        await this.delay(500);
        addAILog('Adapting port scan order...', 'Randomizing sequence to avoid pattern detection');
        await this.delay(500);
        addAILog('Discovered non-standard port: 3443 (Alt HTTPS)', 'AI expanded port range based on service fingerprint');
      }

      await this.delay(1000);
      addLog('INFO', 'Detecting open ports...', '11219');
      await this.delay(1000);
      addLog('INFO', `Port scanning complete: ${hosts.reduce((sum, h) => sum + h.openPorts, 0)} ports open`, '11219');

      // Phase 4: Service Detection (3s)
      updateProgress('service-detection', 40);
      addLog('INFO', 'Starting service detection...', '11936');
      await this.delay(1000);
      addLog('INFO', 'Fingerprinting services...', '11936');
      
      if (isAIAgentic) {
        await this.delay(500);
        addAILog('Found API endpoint: /graphql', 'Detected GraphQL introspection enabled');
        await this.delay(500);
        addAILog('Pivot: Adding GraphQL-specific vulnerability checks', 'Dynamic plugin selection based on discovered services');
      }

      await this.delay(1000);
      addLog('INFO', 'Identifying service versions...', '11936');
      await this.delay(1000);

      // Phase 5: Vulnerability Scanning (8s)
      updateProgress('vuln-scanning', 55);
      addLog('INFO', `Starting vulnerability scan with ${scan.profile} profile...`, '10004');
      await this.delay(500);

      const findings = generateFindings(scan.scanType, hosts, scan.target);
      const findingsPerTick = Math.ceil(findings.length / 8);

      for (let i = 0; i < 8; i++) {
        const startIdx = i * findingsPerTick;
        const endIdx = Math.min(startIdx + findingsPerTick, findings.length);
        const newFindings = findings.slice(startIdx, endIdx);

        if (isAIAgentic && newFindings.length > 0) {
          const vulnTypes = [...new Set(newFindings.map(f => f.category))];
          addAILog(`Testing ${vulnTypes.join(', ')} vulnerabilities...`, `Adaptive payload generation for ${scan.config.aiAdaptability || 'balanced'} mode`);
          await this.delay(200);
        }

        newFindings.forEach((finding) => {
          const type = finding.severity === 'critical' || finding.severity === 'high' ? 'VULN' : 'INFO';
          addLog(type, `${finding.title} on ${finding.host}${finding.port ? ':' + finding.port : ''}`, finding.cveId || '10004');
        });

        const currentFindings = [...(this.getScan(id)?.findings || []), ...newFindings];
        this.updateScan(id, {
          findings: currentFindings,
          progress: 55 + Math.floor(((i + 1) / 8) * 35)
        });

        if (isAIAgentic && Math.random() > 0.7) {
          addAILog('Pivoting attack vector...', 'Previous test revealed new attack surface');
        }

        if (onUpdate) onUpdate(this.getScan(id)!);
        await this.delay(800);
      }

      // Phase 6: Report Generation (2s)
      updateProgress('report-generation', 95);
      addLog('INFO', 'Correlating findings...', '19506');
      if (isAIAgentic) {
        await this.delay(300);
        addAILog('Generating AI-powered remediation suggestions...', 'Analyzing root causes and attack chains');
      }
      await this.delay(700);
      addLog('INFO', 'Generating vulnerability report...', '19506');
      await this.delay(700);
      addLog('INFO', 'Scan completed successfully', '19506');

      // Phase 7: Completed
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
      addLog('ERROR', `Scan failed: ${errorMsg}`);
      this.updateScan(id, { status: 'failed', errorMessage: errorMsg });
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Import generateHosts and generateFindings from finding-generator
import { generateHosts, generateFindings } from './finding-generator';

// Singleton instance
export const scanStore = new ScanStore();
