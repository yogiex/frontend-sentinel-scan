# Bisnis Proses: Vulnerability Management & Reporting System

Dokumen ini menjelaskan alur kerja aplikasi dari penemuan aset hingga pembuatan laporan akhir (Reporting), mengacu pada standar fungsionalitas industri seperti Nessus.

---

## 1. Core Workflow (Vulnerability Management Lifecycle)

### Tahap 1: Asset Discovery & Management
- **Input**: IP Range, Domain, atau integrasi Cloud (AWS/Azure).
- **Proses**: *Host discovery*, identifikasi OS, deteksi port, dan *service fingerprinting*.
- **Output**: Inventory aset yang terverifikasi dalam database.

### Tahap 2: Scan Configuration (Policy & Template)
- **Template**: *Basic Network Scan, Advanced Scan, Web Application Tests*.
- **Credentialed vs Non-Credentialed**:
  - *Credentialed*: Akses SSH/RDP untuk pemeriksaan patch internal dan konfigurasi lokal.
  - *Non-Credentialed*: Analisis kerentanan dari sudut pandang eksternal (perimeter).

### Tahap 3: Execution Engine (The "Brain")
- **Vulnerability Mapping**: Sinkronisasi hasil deteksi dengan database CVE terbaru.
- **Severity Scoring**: Kalkulasi otomatis menggunakan CVSS v3.1/v4.0.

### Tahap 4: Analysis & Prioritization
- **Deduplication**: Konsolidasi temuan serupa untuk efisiensi pembacaan.
- **Risk Ranking**: Penentuan prioritas berdasarkan *Exploit Code Maturity* dan *Severity*.

### Tahap 5: Remediation & Reporting
- **Actionable Insights**: Rekomendasi perbaikan teknis.
- **Advanced Export**: Dokumentasi formal untuk kebutuhan operasional dan audit.

---

## 2. Reporting Engine Lifecycle (Fitur Kompleks)

Agar fitur Reporting sekelas Nessus, proses bisnis di sisi Frontend harus menangani alur berikut:

| Tahap Reporting | Aktivitas Sistem | Tujuan |
| :--- | :--- | :--- |
| **Data Aggregation** | Mengambil JSON hasil scan dan metadata aset dari API. | Mengumpulkan semua fakta mentah. |
| **Data Transformation** | Re-sorting data berdasarkan *severity* (Critical → Low) dan kategori temuan. | Menyiapkan data untuk visualisasi. |
| **Templating** | Menerapkan desain laporan (Executive Summary vs Technical Audit). | Menyesuaikan laporan dengan audiens target. |
| **Client-Side Rendering** | Mengonversi komponen React & Chart (SVG) menjadi format PDF/Excel. | Keamanan data (proses terjadi di browser user). |
| **Packaging & Export** | Menambahkan watermark, klasifikasi dokumen, dan proteksi file. | Finalisasi dokumen siap kirim. |

---

## 3. Matriks Fitur UI & Reporting (Shadcn UI)

| Fitur Utama | Deskripsi Teknis | Komponen Shadcn |
| :--- | :--- | :--- |
| **Scan Scheduler** | Penjadwalan pindaian berkala. | `Calendar` & `Select` |
| **Plugin Management** | Aktivasi/Deaktivasi modul deteksi spesifik. | `Switch` & `Accordion` |
| **Report Wizard** | Modal konfigurasi ekspor (Pilih format, branding, & filter). | `Dialog` & `Checkbox` |
| **Visual Summary** | Grafik distribusi risiko dan tren keamanan. | `Card` & `Recharts` |
| **Audit Logs** | Rekam jejak aktivitas scan dan aktivitas user. | `ScrollArea` |

---

## 4. Strategi Data Flow (Planning)

1. **Frontend (React)**: Mengirim instruksi ekspor beserta parameter filter (misal: "Hanya Critical & High").
2. **API (Backend)**: Menyediakan *endpoint* khusus yang mengembalikan data hasil scan yang sudah terformat untuk laporan.
3. **Reporting Library**:
   - **PDF**: `@react-pdf/renderer` mengolah komponen React menjadi layout dokumen.
   - **Excel**: `exceljs` menyusun data teknis ke dalam kolom spreadsheet.
4. **Local Storage/Cache**: Menyimpan konfigurasi laporan terakhir (logo instansi, nama asesor) agar user tidak perlu mengisi ulang.

---

## 5. Rencana Format Laporan

- **Executive Report (PDF)**: Fokus pada *Visual Charts*, *High-Level Risk Score*, dan *Summary of Progress*.
- **Technical Audit (PDF/CSV)**: Fokus pada *CVE Details*, *Proof of Concept*, *Impact*, dan *Solution*.
- **Compliance Report (PDF)**: Pemetaan temuan terhadap standar industri (ISO 27001, NIST, atau PCI-DSS).
