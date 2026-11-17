/**
 * Deprecated shim — pakai `@/shared/ui/SeverityTag` untuk kode baru.
 */
import { SeverityTag } from '@/shared/ui/SeverityTag';

export function SeverityChip({
  severity,
}: {
  severity: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}) {
  return <SeverityTag severity={severity} variant="bare" />;
}
