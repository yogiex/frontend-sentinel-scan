/**
 * SentinelScan DashboardIndex Tests
 * Path: src/pages/Dashboard/Index.test.tsx
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { DashboardIndex } from './Index';

describe('DashboardIndex', () => {
  it('renders dashboard title', () => {
    render(
      <BrowserRouter>
        <DashboardIndex />
      </BrowserRouter>
    );
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Vulnerability scanner overview and security posture')).toBeInTheDocument();
  });

  it('renders stats cards', () => {
    render(
      <BrowserRouter>
        <DashboardIndex />
      </BrowserRouter>
    );
    expect(screen.getAllByText('Total Assets').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Vulnerabilities').length).toBeGreaterThan(0);
    expect(screen.getByText('Resolved')).toBeInTheDocument();
  });

  it('renders recent scans table', () => {
    render(
      <BrowserRouter>
        <DashboardIndex />
      </BrowserRouter>
    );
    expect(screen.getByText('Recent Scans')).toBeInTheDocument();
    expect(screen.getAllByText('192.168.1.0/24').length).toBeGreaterThan(0);
    expect(screen.getAllByText('example.com').length).toBeGreaterThan(0);
  });

  it('renders vulnerability chart section', () => {
    render(
      <BrowserRouter>
        <DashboardIndex />
      </BrowserRouter>
    );
    expect(screen.getByText('Scan Trend')).toBeInTheDocument();
  });
});
