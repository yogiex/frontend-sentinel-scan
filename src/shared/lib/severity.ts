import type { LucideIcon } from 'lucide-react';
import {
  AlertCircle,
  AlertTriangle,
  Info,
  ShieldAlert,
  ShieldQuestion,
} from 'lucide-react';

export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info' | 'unknown';

export interface SeverityMeta {
  label: string;
  icon: LucideIcon;
  /** solid fill — white text on it passes 4.5:1 */
  fill: string;
  /** tint background */
  tint: string;
  /** text color on tint */
  text: string;
}

export const SEVERITY: Record<Severity, SeverityMeta> = {
  critical: {
    label: 'Critical',
    icon: ShieldAlert,
    fill: 'var(--risk-critical)',
    tint: '#FEE2E2',
    text: 'var(--risk-critical)',
  },
  high: {
    label: 'High',
    icon: AlertTriangle,
    fill: 'var(--risk-high)',
    tint: '#FEE2E2',
    text: 'var(--risk-high)',
  },
  medium: {
    label: 'Medium',
    icon: AlertCircle,
    fill: 'var(--risk-medium)',
    tint: '#FEF3C7',
    text: 'var(--risk-medium)',
  },
  low: {
    label: 'Low',
    icon: Info,
    fill: 'var(--risk-low)',
    tint: '#CFFAFE',
    text: 'var(--risk-low)',
  },
  info: {
    label: 'Info',
    icon: Info,
    fill: 'var(--risk-info)',
    tint: '#F1F5F9',
    text: 'var(--risk-info)',
  },
  unknown: {
    label: 'Unknown',
    icon: ShieldQuestion,
    fill: 'var(--steel)',
    tint: '#F1F5F9',
    text: 'var(--steel)',
  },
};

const KNOWN: Severity[] = ['critical', 'high', 'medium', 'low', 'info'];

export function normalizeSeverity(value?: string | null): Severity {
  const v = (value ?? '').toLowerCase();
  return (KNOWN as string[]).includes(v) ? (v as Severity) : 'unknown';
}

export const SEVERITY_ORDER: Severity[] = ['critical', 'high', 'medium', 'low', 'info'];
