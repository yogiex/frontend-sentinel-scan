export type TicketStatus = 'open' | 'in_progress' | 'fixed' | 'verified' | 'wont_fix';
export type TicketPriority = 'critical' | 'high' | 'medium' | 'low';

export interface TicketComment {
  id: string;
  author: string;
  message: string;
  createdAt: string;
}

export interface Ticket {
  id: string;
  vulnerabilityId: string; // Reference to scan result
  scanId: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  assignedTo: string; // User ID
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  dueDate: string; // SLA calculation
  comments: TicketComment[];
  remediation: string; // How to fix
  cvssScore?: number;
  cveId?: string;
}

export interface TicketFilters {
  status: TicketStatus | 'all';
  priority: TicketPriority | 'all';
  assignedTo: string | 'all';
}

// SLA Days
export const SLA_DAYS: Record<TicketPriority, number> = {
  critical: 7,
  high: 30,
  medium: 90,
  low: 180,
};

// Mock tickets
export const mockTickets: Ticket[] = [
  {
    id: 'TKT-001',
    vulnerabilityId: 'vuln-001',
    scanId: 'scan-001',
    title: 'Critical SQL Injection in Login Form',
    description: 'SQL injection vulnerability found in /login.php endpoint',
    status: 'open',
    priority: 'critical',
    assignedTo: 'user-2',
    createdBy: 'user-1',
    createdAt: '2026-05-01T10:00:00Z',
    updatedAt: '2026-05-01T10:00:00Z',
    dueDate: '2026-05-08T10:00:00Z', // 7 days SLA
    comments: [
      {
        id: 'comment-001',
        author: 'user-1',
        message: 'Found during automated scan. Needs immediate attention.',
        createdAt: '2026-05-01T10:05:00Z',
      },
    ],
    remediation: 'Use parameterized queries or prepared statements. Example: mysqli_prepare() instead of mysqli_query().',
    cvssScore: 9.8,
    cveId: 'CVE-2023-12345',
  },
  {
    id: 'TKT-002',
    vulnerabilityId: 'vuln-002',
    scanId: 'scan-001',
    title: 'Outdated Apache Version (2.4.29)',
    description: 'Server running outdated Apache version with known vulnerabilities',
    status: 'in_progress',
    priority: 'high',
    assignedTo: 'user-3',
    createdBy: 'user-1',
    createdAt: '2026-04-28T14:00:00Z',
    updatedAt: '2026-05-01T09:00:00Z',
    dueDate: '2026-05-28T14:00:00Z', // 30 days SLA
    comments: [
      {
        id: 'comment-002',
        author: 'user-3',
        message: 'Scheduled maintenance window for May 5th to update Apache.',
        createdAt: '2026-05-01T09:00:00Z',
      },
    ],
    remediation: 'Upgrade to Apache 2.4.58 or later. Follow OS-specific upgrade procedure.',
    cvssScore: 7.5,
  },
  {
    id: 'TKT-003',
    vulnerabilityId: 'vuln-003',
    scanId: 'scan-002',
    title: 'Missing HTTP Security Headers',
    description: 'X-Frame-Options, Content-Security-Policy headers not configured',
    status: 'open',
    priority: 'medium',
    assignedTo: 'user-2',
    createdBy: 'user-1',
    createdAt: '2026-04-30T11:00:00Z',
    updatedAt: '2026-04-30T11:00:00Z',
    dueDate: '2026-07-29T11:00:00Z', // 90 days SLA
    comments: [],
    remediation: 'Add security headers in web server config:\nX-Frame-Options: DENY\nContent-Security-Policy: default-src \'self\'',
    cvssScore: 5.3,
  },
];
