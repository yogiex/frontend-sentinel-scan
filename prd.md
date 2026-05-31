# Product Requirement Document (PRD): Vulnerability Assessment Tool

**Project Name:** SentinelScan Dashboard  
**Status:** Active Development (Frontend MVP)  
**Target Platform:** Web-Based Dashboard  
**Framework:** React 19 + TypeScript + Vite + Shadcn/UI  

---

## 1. Executive Summary
SentinelScan adalah platform manajemen kerentanan (vulnerability management) yang memungkinkan tim IT dan Security untuk melakukan penemuan aset (asset discovery), pemindaian celah keamanan (scanning), dan pembuatan laporan (reporting) secara otomatis. Fokus utama project ini adalah memberikan visualisasi data yang padat (dense) namun tetap mudah diintervensi oleh administrator.

## 2. Target Audience
1. **Security Engineers:** Membutuhkan detail teknis CVE, Proof of Concept (PoC), dan mitigasi.
2. **System Administrators:** Membutuhkan daftar prioritas patching harian.
3. **IT Managers/CISO:** Membutuhkan laporan ringkas (executive summary) mengenai postur keamanan organisasi.

## 3. Functional Requirements

### 3.1 Asset & Scan Management
* **REQ-01:** Sistem harus dapat menerima input target berupa IP Address, Range IP (CIDR), atau Domain.
* **REQ-02:** Sistem harus menyediakan template scan (misal: Basic Scan, Web Audit, Full Audit).
* **REQ-03:** Sistem harus mendukung pindaian terautentikasi (Credentialed Scan) via SSH/RDP.
* **REQ-04:** Sistem harus memiliki fitur penjadwalan (Scheduler) untuk pindaian rutin.

### 3.2 Vulnerability Analysis
* **REQ-05:** Setiap temuan harus dipetakan ke ID CVE (Common Vulnerabilities and Exposures) yang valid.
* **REQ-06:** Sistem harus menghitung skor risiko menggunakan standar CVSS v3.1.
* **REQ-07:** Sistem harus mengelompokkan temuan berdasarkan tingkat keparahan (Critical, High, Medium, Low).
* **REQ-07A:** Halaman Scan Detail harus menyediakan 3 tab utama: `Detail`, `History`, dan `Log`.
* **REQ-07B:** Tab `Detail` harus menampilkan daftar seluruh temuan scan dengan severity, urutan temuan (count), judul, dan affected URL.
* **REQ-07C:** Halaman detail temuan harus menampilkan evidence HTTP: request header, request body, response header, response body.
* **REQ-07D:** Tab `History` harus menampilkan riwayat scan per target (termasuk status `completed`, `failed`, `cancelled`, `aborted`) dan ringkasan severity.
* **REQ-07E:** Tab `Log` harus menampilkan log eksekusi scan termasuk alasan kegagalan/abort/cancel.

### 3.3 Reporting Engine (Advanced Feature)
* **REQ-08:** Export laporan dalam format PDF dengan layout Executive Summary (Charts & Top Threats).
* **REQ-09:** Export laporan dalam format CSV/XLSX untuk kebutuhan data teknis mentah.
* **REQ-10:** Kustomisasi laporan (Branding logo, nama asesor, dan klasifikasi dokumen).
* **REQ-11:** Delta Reporting (Membandingkan hasil scan saat ini dengan scan sebelumnya).

## 4. Non-Functional Requirements
* **Performance:** Halaman dashboard harus mampu merender hingga 1000+ baris temuan tanpa lag (Pagination/Virtual Scrolling).
* **Security:** Implementasi sesi aman dan proteksi akses dashboard.
* **Availability:** Mendukung polling status real-time untuk memantau progress scan yang sedang berjalan.
* **Compatibility:** Responsif di berbagai ukuran layar (minimal 1280px width untuk efektivitas dashboard).
* **Data Persistence (MVP):** Seluruh data MVP frontend menggunakan localStorage store sebagai mock backend (tanpa HTTP call langsung).

## 5. UI/UX Design Specifications
* **Style:** Modern, Clean, Light-themed (Slate & Indigo palette).
* **Icons:** Menggunakan Lucide-React untuk konsistensi visual.
* **Components:** Berbasis Shadcn/UI (Radix UI) untuk aksesibilitas tinggi.
* **Design Consistency:** Semua card di dashboard harus menggunakan komponen yang seragam (`StatsCard` untuk statistik, `Card` dari shadcn/ui untuk konten lain). Satu sumber kebenaran — tidak boleh ada inline card dengan layout berbeda di halaman yang berbeda.
* **Typography:** Seragam — tidak boleh ada campuran font dekoratif di satu tempat dan monospace di tempat lain untuk elemen yang sama (judul card, label, value).
* **Key Pages:**
    * Landing Page (Marketing & High-level stats).
    * Dashboard Overview (Risk distribution charts).
    * Scan Center (Wizard untuk membuat scan baru).
    * Vulnerability Library (Database CVE lokal).
    * Report Center (Konfigurasi ekspor file).

## 6. Technical Stack
* **Frontend:** React 19 (Experimental/Latest), TypeScript, Vite.
* **Styling:** Tailwind CSS.
* **UI Components:** Shadcn/UI.
* **State Management:** Local store + hook berbasis localStorage (MVP), roadmap ke TanStack Query untuk integrasi backend.
* **Charts:** Recharts / Tremor.
* **PDF Engine:** @react-pdf/renderer.
* **Testing:** Vitest & React Testing Library.

## 6.1 API & Contract Alignment (MVP to Backend)
* Frontend field naming menggunakan `camelCase`, backend contract menggunakan `snake_case`.
* Endpoint scan harus mendukung status transisi tambahan: `cancelled` dan `aborted`.
* Payload finding backend perlu memuat evidence field:
  * `affected_url`
  * `request_header`
  * `request_body`
  * `response_header`
  * `response_body`
* Untuk kebutuhan tab log, backend menyediakan endpoint log scan per instance (`GET /scans/{id}/logs`) atau stream event `log` via WebSocket.

## 7. Roadmap & Milestones
* **Phase 1:** Core UI & Dashboard Layout (Done).
* **Phase 2:** Scan Wizard & API Mocking (Done - localStorage stores).
* **Phase 3:** Scan Detail Revamp (In Progress - tabs Detail/History/Log + evidence view).
* **Phase 4:** Integration with Scan Engine (Nmap/OpenVAS wrapper).
* **Phase 5:** Advanced Reporting Engine (PDF/CSV Export).
* **Phase 6:** User Authentication & Role-Based Access Control (RBAC).

---
*Document Version: 1.2.0*  
*Last Updated: 2026-05-30*
