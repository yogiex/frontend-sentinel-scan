# Komponen Bersama — Spesifikasi

10 komponen di `src/shared/ui/`. Baseline (tidak didokumentasikan di sini, hanya
di-restyle lewat token): Button, Input, Textarea, Select, Checkbox, Switch, Tabs,
DropdownMenu, Tooltip, Dialog, Skeleton dari shadcn; toast dari sonner.

Setiap komponen wajib: state lengkap, aksesibel, memakai token, tanpa hex.

---

## 1. `PageHeader`
- **Anatomi:** H1 · deskripsi opsional (≤70ch) · slot aksi (maks 2 tombol + 1 menu).
- **Varian:** `default`, `with-breadcrumb`.
- **State:** default, loading (skeleton judul), aksi disabled.
- **A11y:** H1 nyata; breadcrumb `<nav aria-label="Breadcrumb">`, ujung `aria-current="page"`.
- **Terima bila:** judul dari route; satu H1 per halaman.

## 2. `StatStrip`
- **Anatomi:** sel = label · nilai · delta (arah + periode) · ikon opsional; dipisah garis vertikal.
- **Varian:** `3`, `4`, `6` sel.
- **State:** default, loading, error (nilai "—" + alasan), empty (0 + konteks).
- **A11y:** angka `tabular-nums`; delta menyebut arah dalam teks, bukan hanya panah/warna.
- **Terima bila:** setiap angka punya satuan & periode; tanpa warna dekoratif.

## 3. `SeverityTag`
- **Anatomi:** ikon level + teks level + skor CVSS opsional.
- **Varian:** `tint` (default), `solid`, `bare`.
- **State:** critical, high, medium, low, info, unknown.
- **A11y:** warna + ikon + teks; semua pasangan ≥4.5:1.
- **Terima bila:** high dan medium tidak bisa tertukar tanpa warna.

## 4. `StatusTag`
- **Anatomi:** ikon + teks.
- **Varian:** `scan` (pending, running, paused, completed, partial_failure, failed,
  cancelled, aborted), `ticket` (open, in_progress, fixed, verified, wont_fix).
- **State:** default, `running` (titik berdenyut tunggal), `stale`.
- **A11y:** satu `aria-live` untuk status aktif, bukan per badge.
- **Terima bila:** 8 status scan punya label & ikon berbeda.

## 5. `LedgerTable`
- **Anatomi:** toolbar (search + filter) · thead · rows · pagination · state panel.
- **Varian:** `dense` (40px), `comfort` (48px), `sticky-actions`.
- **State:** loading, empty, error + retry, partial, sorted (`aria-sort`), paginated.
- **A11y:** `scope="col"`; sort lewat `<button>`; pagination `<button disabled>`;
  aksi baris terjangkau keyboard tanpa `onClick` di `<tr>`.
- **Terima bila:** 1000 baris tanpa jank; 375px jadi kartu / kolom prioritas.

## 6. `EvidenceBlock`
- **Anatomi:** segmen (request/response header/body) · blok mono bernomor baris ·
  copy · wrap toggle · expand.
- **Varian:** `inline`, `panel`.
- **State:** default, truncated + expand, empty, copy sukses/gagal, payload besar.
- **A11y:** `<pre><code>` berlabel; copy memberi konfirmasi `aria-live`; scroll lokal.
- **Terima bila:** payload 1 MB tidak membekukan UI; Authorization/Cookie disamarkan.

## 7. `StatePanel`
- **Anatomi:** ikon · judul · penjelasan · aksi utama · aksi sekunder.
- **Varian:** `loading`, `empty`, `error`, `no-permission`, `offline`.
- **A11y:** `role="status"` (loading/empty), `role="alert"` (error).
- **Terima bila:** setiap list punya keempat varian; error menjelaskan langkah berikutnya.

## 8. `ConfirmDialog`
- **Anatomi:** judul · dampak · batal · konfirmasi (label = aksi).
- **Varian:** `destructive`, `default`.
- **State:** default, berjalan (disabled + spinner), error.
- **A11y:** Radix Dialog; fokus awal di batal untuk aksi destruktif.
- **Terima bila:** hanya satu implementasi; tombol menyebut aksi.

## 9. `FormField`
- **Anatomi:** label (wajib/opsional eksplisit) · kontrol · helper · error.
- **Varian:** `text`, `select`, `textarea`, `switch-group`, `file`, `repeater`.
- **State:** default, focus, filled, disabled, readonly, error, validating, success.
- **A11y:** `htmlFor`; error `aria-describedby` + `aria-invalid`; bisa difokuskan.
- **Terima bila:** tidak ada field tanpa label terlihat; error dekat field dan di ringkasan.

## 10. `AppShell` (layout)
- **Anatomi:** rail ikon → kolom konteks → header → main → drawer mobile.
- **Varian:** `expanded`, `rail`, `drawer`.
- **State:** default, collapsed, mobile-open, scrim, route berubah (drawer tutup).
- **A11y:** skip-link `#main`; toggle `aria-label` + `aria-expanded`; grup menu
  `<button aria-expanded aria-controls>`; item aktif `aria-current="page"`.
- **Terima bila:** 375px konten ≥320px; hanya `main` yang scroll.
