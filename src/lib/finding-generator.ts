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

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

function getFindingsForScanType(scanType: ScanType): Array<{
  title: string;
  severity: Finding['severity'];
  category: string;
  cvePrefix: string;
}> {
  switch (scanType) {
    case 'web':
    case 'advanced':
      return WEB_FINDINGS as any;
    case 'basic':
      return BASIC_FINDINGS as any;
    case 'credentialed':
      return CREDENTIALED_FINDINGS as any;
    case 'compliance':
      return COMPLIANCE_FINDINGS as any;
    case 'discovery':
      return DISCOVERY_FINDINGS as any;
    default:
      return BASIC_FINDINGS as any;
  }
}

function generateCveId(prefix: string, index: number): string {
  return `${prefix}${String(index).padStart(3, '0')}`;
}

function getRandomPort(finding: { title: string; severity: string; category: string; cvePrefix: string }, host: Host): number {
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
  finding: { title: string; severity: string; category: string; cvePrefix: string },
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
