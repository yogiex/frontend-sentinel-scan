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
