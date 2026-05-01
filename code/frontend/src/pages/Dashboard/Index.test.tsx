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
    expect(screen.getByText('Overview of your security scans and vulnerabilities')).toBeInTheDocument();
  });

  it('renders stats cards', () => {
    render(
      <BrowserRouter>
        <DashboardIndex />
      </BrowserRouter>
    );
    expect(screen.getByText('Total Assets')).toBeInTheDocument();
    expect(screen.getByText('Active Scans')).toBeInTheDocument();
    expect(screen.getByText('Vulnerabilities')).toBeInTheDocument();
    expect(screen.getByText('Resolved')).toBeInTheDocument();
  });

  it('renders recent scans table', () => {
    render(
      <BrowserRouter>
        <DashboardIndex />
      </BrowserRouter>
    );
    expect(screen.getByText('Recent Scans')).toBeInTheDocument();
    expect(screen.getByText('192.168.1.0/24')).toBeInTheDocument();
    expect(screen.getByText('example.com')).toBeInTheDocument();
  });

  it('renders vulnerability chart section', () => {
    render(
      <BrowserRouter>
        <DashboardIndex />
      </BrowserRouter>
    );
    expect(screen.getByText('Vulnerability Distribution')).toBeInTheDocument();
  });
});
