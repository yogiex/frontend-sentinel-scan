# Peta Route

Layout: `Public` (tanpa chrome) · `Dashboard` (AppShell). Judul header diturunkan dari route.

| Path | Halaman | Layout | Guard | Judul |
|---|---|---|---|---|
| `/` | Landing | Public | — | — |
| `/login` | Login | Public | guestOnly | — |
| `/register` | Register (stub) | Public | guestOnly | — |
| `/forgot-password` | Forgot (stub) | Public | guestOnly | — |
| `/dashboard` | Overview | Dashboard | `scan.view` | Overview |
| `/dashboard/scans` | Scan list | Dashboard | `scan.view` | Scans |
| `/dashboard/scans/all` | → redirect `/dashboard/scans` | — | — | — |
| `/dashboard/scans/new` | New scan | Dashboard | `scan.create` | New scan |
| `/dashboard/scans/my` | My scans | Dashboard | `scan.view` | My scans |
| `/dashboard/scans/trash` | Trash | Dashboard | `scan.delete` | Trash |
| `/dashboard/scans/:scanId` | Scan detail | Dashboard | `scan.view` | Scan detail |
| `/dashboard/scans/:scanId/progress` | Scan progress | Dashboard | `scan.view` | Scanning |
| `/dashboard/scans/:scanId/results/:vulnId` | Finding + evidence | Dashboard | `scan.view` | Finding |
| `/dashboard/cves` | CVE library (P2) | Dashboard | `scan.view` | CVE library |
| `/dashboard/cves/:cveId` | CVE detail (P2) | Dashboard | `scan.view` | CVE |
| `/dashboard/templates` | Templates | Dashboard | `template.view` | Templates |
| `/dashboard/templates/:templateId` | Template detail (P1) | Dashboard | `template.edit` | Template |
| `/dashboard/tickets` | Ticket list | Dashboard | `ticket.view` | Tickets |
| `/dashboard/tickets/kanban` | Ticket board | Dashboard | `ticket.view` | Ticket board |
| `/dashboard/tickets/new` | New ticket | Dashboard | `ticket.create` | New ticket |
| `/dashboard/tickets/:ticketId` | Ticket detail | Dashboard | `ticket.view` | Ticket |
| `/dashboard/reports` | Reports (P1) | Dashboard | `report.view` | Reports |
| `/dashboard/logs` | Audit trail | Dashboard | `audit.view` | Audit trail |
| `/dashboard/users` | Users | Dashboard | `user.manage` | Users |
| `/dashboard/settings` | Settings | Dashboard | `settings.manage` | Settings |
| `/dashboard/profile` | Profile (P1) | Dashboard | auth | Profile |
| `/500` | Error 500 | Public | — | — |
| `*` | Error 404 | Public | — | — |

## Aturan

- `guestOnly`: sudah login → redirect `/dashboard`.
- Guard permission → `StatePanel variant="no-permission"` (bukan redirect diam-diam).
- Judul header & item sidebar berasal dari satu konfigurasi route (`src/app/routes.ts`).
- Query param baku: `?q=&page=&limit=&sort=&dir=&status=&severity=&tab=`.
- Setiap route punya `errorElement` (`StatePanel variant="error"`).
