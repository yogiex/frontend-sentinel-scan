# Data Contract — Frontend

Sumber: `API_CONTRACT.md` v2 (backend `http://localhost:8080/api/v1`, Bearer JWT).

## 1. Tipe domain (camelCase)

| Entitas | Field inti |
|---|---|
| `User` | id, email, username, role, status, permissions[], createdAt, lastLoginAt |
| `Scan` | id, groupId, runNumber, targets[], scanType, profile, status, progress{completed,total,failed}, authCredentialId, schedule, scheduledDate, description, createdBy, createdAt, startedAt, completedAt, duration, errorMessage |
| `Host` | ip, hostname, status, openPorts, vulns |
| `Finding` | id, scanId, target, host, port, severity, name, cveId, cvssScore, category, affectedUrl, requestHeader, requestBody, responseHeader, responseBody, remediation, createdAt |
| `Template` | id, name, description, category, scanType, profile, tags[], content, isFavorite, usageCount, successRate, version, createdAt |
| `Ticket` | id, code, title, description, severity, cvssScore, status, priority, dueAt, assigneeId, scanId, findingId, createdAt, comments[] |
| `Credential` | id, name, authMethod, host, port, username, hasSecret, verifiedAt |
| `AuditEntry` | id, level, category, action, message, userId, metadata, timestamp |
| `Page<T>` | data: T[], meta{page, limit, total} |

Enum mengikuti kontrak: `ScanStatus` (pending, running, paused, completed,
partial_failure, failed, cancelled, aborted), `FindingSeverity` (info, low, medium,
high, critical), `TicketStatus`, `UserRole` (super_admin, admin, user, viewer).

## 2. Aturan adapter

1. `snake_case` hanya di `src/entities/*/api.ts`. Komponen tidak pernah melihatnya.
2. Tanggal tetap string ISO di domain; format hanya di view (`date-fns`).
3. `null` → `undefined` saat masuk domain, kecuali field yang memang ditampilkan "—".
4. Enum tak dikenal → fallback `unknown` + log; bukan throw.
5. List wajib envelope `{data, meta}`; frontend tidak mengasumsikan array polos.
6. Error `{error:{code,message,fields}}` → `AppError {status, code, message, fields?}`.
   401 → refresh sekali lalu logout; 403 → layar izin; 422 → error per field;
   429 → pesan tunggu; 5xx → StatePanel + retry.
7. Tidak ada `any` baru; respons endpoint kritis divalidasi zod di batas adapter.
8. Mock hanya dengan `VITE_USE_MOCK=1`, di `src/entities/*/msw.ts`, tidak diimpor produksi.

## 3. Endpoint → fitur

`auth/*` → login & sesi · `users/*` → Users · `scans/*` → list/detail/progress/
results/logs/trash · `templates/*` → Templates · `tickets/*` → Tickets ·
`auth-credentials/*` → Settings · `dashboard/*` → Overview · `reports/*` → Reports ·
`logs` + `WS /ws/logs` → Audit trail · `scans/{id}/stream` → Progress.

## 4. Status implementasi

M1: tipe + adapter disiapkan, data UI masih dari store mock yang sudah ada.
M2: `src/lib/http.ts`, react-query, sesi nyata, mock dipindah ke balik flag.
