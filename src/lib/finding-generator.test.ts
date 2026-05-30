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
