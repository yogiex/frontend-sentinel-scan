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
  | 'failed';

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
  private nextId = 1;

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
    // AI-Agentic Anti-Pattern fields
    aiAdaptability?: string;
    randomizeAttackOrder?: boolean;
    adaptivePayloads?: boolean;
    mimicHumanBehavior?: boolean;
    showAIReasoning?: boolean;
  }): Scan {
    const id = `scan-${this.nextId++}`;
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
    return Array.from(this.state.scans.values()).sort(
      (a, b) => {
        // Sort by createdAt descending (newest first)
        const timeDiff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        if (timeDiff !== 0) return timeDiff;
        // Tiebreaker: sort by ID descending (higher ID = newer)
        return b.id.localeCompare(a.id);
      }
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

  // --- Testing utility ---

  clearAll(): void {
    this.state.scans.clear();
    this.nextId = 1;
     try {
      localStorage.removeItem(STORAGE_KEY);
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
