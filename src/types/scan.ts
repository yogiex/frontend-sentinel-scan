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

/**
 * SentinelScan Type Definitions
 * Path: src/types/scan.ts
 *
 * Core type definitions for scan jobs, results, and events.
 * Updated to support mock scan workflow with extended status values.
 */

// --- Original Types (kept for backward compatibility) ---
// (Original types are defined above)

// --- New Types for Mock Scan Workflow ---

export type MockScanStatus =
  | 'queued'
  | 'host-discovery'
  | 'port-scanning'
  | 'service-detection'
  | 'vuln-scanning'
  | 'report-generation'
  | 'completed'
  | 'failed';

export type MockScanType =
  | 'basic'
  | 'advanced'
  | 'web'
  | 'credentialed'
  | 'compliance'
  | 'discovery'
  | 'ai-agentic';

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
  // AI-Agentic Anti-Pattern fields
  aiAdaptability?: 'conservative' | 'balanced' | 'aggressive';
  randomizeAttackOrder?: boolean;
  adaptivePayloads?: boolean;
  mimicHumanBehavior?: boolean;
  showAIReasoning?: boolean;
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
