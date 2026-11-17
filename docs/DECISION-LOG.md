# Decision Log — SentinelScan Frontend

Setiap keputusan visual/arsitektur: satu baris, satu pemilik, satu tanggal.
Perubahan setelah gate M0 dianggap perubahan scope.

| # | Tanggal | Keputusan | Alternatif yang ditolak | Alasan | Pemilik |
|---|---|---|---|---|---|
| D1 | 2026-11-16 | Arah visual **evidence ledger** (monokrom bergaris, warna = risiko) | SaaS-card kit seperti sekarang | Kartu identik tanpa hierarki tidak membedakan produk ini dari dashboard apa pun | lead |
| D2 | 2026-11-16 | Chrome tanpa warna merek; tombol primer `--ink`; warna interaktif `--signal` hanya link | Mempertahankan indigo `#4f46e5` | Indigo adalah default shadcn; mempertahankannya membatalkan identitas | lead |
| D3 | 2026-11-16 | Tabel/ledger sebagai permukaan utama; evidence membuka inline | Halaman detail terpisah + kartu | Membaca bukti adalah pekerjaan inti operator | lead |
| D4 | 2026-11-16 | Mock hanya di balik `VITE_USE_MOCK`, tidak pernah dijalur produksi | Mock tetap sebagai sumber data | Mencegah demo palsu masuk rilis | lead |
| D5 | 2026-11-16 | Satu bahasa UI (English); istilah teknis mengikuti kontrak API | Bilingual ID/EN | Kontrak API & istilah keamanan sudah English; campuran memperburuk konsistensi | lead |
| D6 | 2026-11-16 | Light-only; semua `dark:` dihapus | Implementasi dark mode penuh | Setengah jadi lebih buruk daripada tidak ada | lead |
| D7 | 2026-11-16 | Font UI **Archivo**, mono tetap **JetBrains Mono** | Outfit (dependency mati), Inter | Archivo punya karakter grotesque tanpa jadi default; Outfit tidak pernah dipakai | lead |
| D8 | 2026-11-16 | Palet severity baru (ramp monoton, hijau dikeluarkan dari severity) | Token lama `#ef4444/#f59e0b/#10b981` | Semua gagal 4.5:1; `high` dan `medium` identik; merah-hijau berbahaya untuk buta warna | lead |
| D9 | 2026-11-16 | Radius tunggal 6px; kartu tanpa shadow | `rounded-xl` + bayangan seragam | Hierarki lewat garis, bukan kotak | lead |
| D10 | 2026-11-16 | `slate-*` Tailwind di-override sementara ke netral baru | Biarkan halaman lama memakai slate asli | Agar halaman yang belum dimigrasi tetap harmonis; dihapus setelah M4 | lead |
| D11 | 2026-11-16 | Hapus folder `@/`, `.bak`, ~20 modul 0-importer dan test-nya | Menyimpan "untuk referensi" | Sampah repo memperbesar beban perawatan dan menyesatkan | lead |
| D12 | 2026-11-16 | `axios` & `@tanstack/react-query` dipertahankan (dipakai M2), `recharts` dipakai ulang di M4 | Hapus semua dependency nganggur | Akan dibutuhkan dua milestone berikutnya | lead |

| D13 | 2026-11-16 | Aturan React Compiler (`set-state-in-effect`, `purity`, `static-components`, `incompatible-library`) diturunkan ke `warn` | Membiarkannya `error` | Aturan ini menandai pola data-fetching/effect yang memang dipakai; warning tetap terlihat. Ditinjau ulang setelah migrasi ke react-query (M2) | lead |
| D14 | 2026-11-16 | Test gaya lama (badge/button/card "Brutalist", Sidebar/Header markup lama, mock API) ditulis ulang atau dihapus | Membiarkan merah | Test harus menguji perilaku yang berlaku, bukan warna yang sudah diganti | lead |
| D15 | 2026-11-16 | `TerminalWindow` menjadi satu-satunya permukaan gelap | Tema gelap penuh | Blok terminal sebagai bukti "produk menghasilkan output mesin", tanpa memelihara dua tema | lead |
| D16 | 2026-11-16 | Judul di top bar bukan heading | `<h2>` | Satu H1 per halaman; top bar adalah orientasi, bukan struktur dokumen | lead |

---

## Penolakan hasil database skill

`ui-ux-pro-max --design-system` menyarankan **Minimalism & Swiss** dengan palet
`#2563EB` + `#059669` ("Professional blue + deal green").
Ditolak: itu palet SaaS default dan bertabrakan dengan semantik risiko
(hijau = sukses, bukan severity). Yang diambil dari output: pola *dense dashboard*,
skala spasi 8–32px, dan checklist pra-rilis.
