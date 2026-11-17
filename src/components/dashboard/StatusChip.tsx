/**
 * Deprecated shim — pakai `@/shared/ui/StatusTag` untuk kode baru.
 */
import { StatusTag } from '@/shared/ui/StatusTag';

const ALIAS: Record<string, string> = {
  queued: 'pending',
  initializing: 'running',
  discovering: 'running',
  scanning: 'running',
  analyzing: 'running',
};

export function StatusChip({
  status,
}: {
  status: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}) {
  return <StatusTag status={ALIAS[status] ?? status} kind="scan" />;
}
