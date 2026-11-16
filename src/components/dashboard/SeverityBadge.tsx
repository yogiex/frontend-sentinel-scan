/**
 * Deprecated shim — pakai `@/shared/ui/SeverityTag` untuk kode baru.
 * Dipertahankan agar halaman lama otomatis memakai palet severity yang valid.
 */
import { SeverityTag } from '@/shared/ui/SeverityTag';

export function SeverityBadge({ severity }: { severity: string }) {
  return <SeverityTag severity={severity} />;
}
