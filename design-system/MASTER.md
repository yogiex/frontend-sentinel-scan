# SentinelScan — Design System (Master)

Sumber kebenaran tunggal untuk warna, tipografi, spasi, dan aturan komposisi.
Berlaku untuk seluruh `src/`. Setiap penyimpangan harus dicatat di `docs/DECISION-LOG.md`.

Arah: **evidence ledger** — lembar kerja teknis. Monokrom bergaris, warna hanya untuk risiko.

---

## 1. Prinsip

1. Warna adalah bukti, bukan dekorasi. Kalau berwarna, itu severity/status.
2. Mono hanya untuk teks mesin (IP, CIDR, CVE, hash, port, timestamp, durasi).
3. Tabel adalah permukaan utama; detail membuka inline.
4. Kepadatan di atas kelegaan: baris 40px, tanpa padding hiasan.
5. Sentence case. Tidak ada label kapital, tidak ada emoji sebagai ikon.
6. Satu radius, satu ketebalan garis, satu warna teks utama.

---

## 2. Warna

| Token | Nilai | Peran | Kontras terukur |
|---|---|---|---|
| `--paper` | `#FFFFFF` | kanvas | — |
| `--surface` | `#F6F7F9` | rail, header, zebra | — |
| `--ink` | `#171A1F` | teks utama, tombol primer | 17.44:1 di paper |
| `--steel` | `#5A636E` | teks sekunder | 6.10:1 · 5.69:1 di surface |
| `--rule` | `#D7DCE1` | garis dekoratif | 1.38:1 (bukan teks) |
| `--rule-strong` | `#7A8592` | batas kontrol interaktif | 3.75:1 · 3.50:1 |
| `--signal` | `#1B4B8F` | link, aksi sekunder, focus ring | 8.57:1 |
| `--risk-critical` | `#7F1D1D` | severity critical, danger | 10.02:1 |
| `--risk-high` | `#991B1B` | severity high | 8.31:1 |
| `--risk-medium` | `#B45309` | severity medium, warning | 5.02:1 |
| `--risk-low` | `#0E7490` | severity low | 5.36:1 |
| `--risk-info` | `#475569` | severity info | 7.58:1 |
| `--ok` | `#047857` | sukses/verified/fixed | 5.48:1 |

Tint (untuk chip `tint`), semua pasangan ≥4.5:1:

| Level | Tint | Teks |
|---|---|---|
| critical | `#FEE2E2` | `#7F1D1D` (8.20:1) |
| high | `#FEE2E2` | `#991B1B` (6.80:1) |
| medium | `#FEF3C7` | `#B45309` (4.51:1) |
| low | `#CFFAFE` | `#0E7490` (4.79:1) |
| info | `#F1F5F9` | `#475569` (6.92:1) |
| ok | `#D1FAE5` | `#047857` |

**Larangan:** hex mentah di `src/**/*.tsx`, `rgba()` manual, `slate-*` di komponen baru,
warna merek di chrome, hijau untuk severity, dark mode (satu tema, `color-scheme: light`).

---

## 3. Tipografi

| Peran | Keluarga | Berat |
|---|---|---|
| UI & judul | Archivo (`@fontsource/archivo`) | 500, 600 |
| Teks mesin | JetBrains Mono | 400, 500 |

Skala (px / line-height): `12/16` `13/18` `15/22` `18/26` `22/28` `28/36` `36/44`.
Body 15px. Tracking `-0.01em` hanya untuk ≥22px. Panjang baris 60–75ch.
Tidak ada teks < 12px. Angka teknis & KPI: `tabular-nums`.

---

## 4. Spasi & density

Skala 4px: `4 8 12 16 20 24 32 40 48 64`.

| Ukuran | Nilai |
|---|---|
| baris tabel | 40px |
| kontrol sm / md | 32 / 36px |
| header | 56px |
| rail | 56px |
| kolom konteks | 232px |
| padding konten | 24 / 16 (mobile) |
| lebar konten | 1240px |

---

## 5. Radius, elevation, motion

- Radius: `--radius: 6px` default · `4px` kontrol kecil · `0` sel & blok evidence.
- Elevation: hanya `none` dan `0 8px 24px rgba(23,26,31,.12)` untuk dialog/popover.
  **Kartu tanpa shadow.**
- Motion: `120 / 180 / 240ms`, easing `cubic-bezier(.2,0,0,1)`.
  Hanya memicu pada aksi pengguna. `prefers-reduced-motion` → 0ms.
- z-index: `sticky 10` `dropdown 30` `overlay 40` `modal 50` `toast 60`.
- Breakpoint: `sm 640` `md 768` `lg 1024` `xl 1280` `2xl 1536`.

---

## 6. Komposisi

- Halaman = header + strip + tabel/panel bergaris. Bukan tumpukan kartu.
- Seksi dipisah `1px var(--rule)`, jarak 24px.
- Satu H1 per halaman (dari route), H2 per seksi, H3 per sub-seksi. Brand bukan heading.
- Tabel: `scope="col"`, angka rata kanan, aksi sticky kanan, kolom sekunder
  disembunyikan `< 768px`.
- Chart: legend wajib, sumbu Y berangka atau dual-axis berlabel, tabel fallback.
- Ikon: lucide, 16px (inline) / 20px (nav), stroke 1.75. Tidak ada emoji.

---

## 7. Aksesibilitas (tidak bisa dinegosiasikan)

- Kontras teks ≥ 4.5:1, batas kontrol ≥ 3:1.
- Fokus terlihat: `outline: 2px solid var(--signal); outline-offset: 2px`.
- Semua alur selesai dengan keyboard; target sentuh ≥ 44px di mobile.
- Modal & menu dari Radix (focus trap, Escape, return focus).
- Status perubahan memakai `aria-live` satu titik, bukan setiap badge.
