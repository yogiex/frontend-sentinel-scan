# Test Gap Analysis — TDD Plan vs Realisasi

> Analisis kesenjangan antara TDD Plan dan test yang sudah ditulis.
> Tanggal: 2026-05-12
> **Update: Semua gap teknis telah diisi. Tersisa: domain service (package kosong) + external integrations (RabbitMQ/WS e2e).**

---

## ✅ Baru Selesai (Batch 1 — 2026-05-12)

| Item | File | Perubahan |
|------|------|-----------|
| Phase 5 Orchestrator | `orchestrator/orchestrator_test.go` | +6 test: NoTemplates, MultipleTemplates, HeadlessTemplateRouting, EmptyTargetsNoTemplate, StatusUpdatedAfterTasks, MultipleTargetsNoTemplate |
| Entity gaps | `internal/domain/entity/scan_test.go` | Fix bug `UpdateStatus` (return error for invalid). Add: valid/invalid/same-status transitions, nil/empty targets |
| Entity gaps | `internal/domain/entity/finding_test.go` | +2 test: NewFinding edge cases, nested details |
| Entity gaps | `internal/domain/entity/ticket_test.go` | Fix bug `UpdateStatus` (return error for invalid). Add: all valid/invalid/same-status transitions |
| Entity gaps | `internal/domain/entity/user_test.go` | +5 test: unknown role, admin has all perms, security_analyst perms, auditor perms, viewer perms |
| generator.go | `report/generator_test.go` | +3 test: GeneratePDF scan not found, no chrome error, findings fetch error |
| WebSocket | `api/websocket_test.go` | +7 test: receives event, multiple events, scan ID filtering, disconnect on close, bad payload does not crash, bad payload falls through, RabbitMQ invalid/valid scan ID |
| Phase 5.3 Scan completion | `orchestrator/orchestrator_test.go` | +6 test: progress after start, all-success completion, partial progress, not-found scan, concurrent safety, not-found progress |
| Phase 3.3.1 template.go | `report/template_test.go` | +3 test: FuncMap helpers `inc`, `join`, `toUpper` edge cases |

### Production Code Fixes
- `scan.go:UpdateStatus` — sekarang return error untuk transisi invalid (sebelumnya selalu return nil)
- `ticket.go:UpdateStatus` — sekarang return error untuk transisi invalid (sebelumnya selalu return nil)
- `orchestrator.go:CompleteTask` — race condition fixed: delete progress di dalam critical section
- `event/bus.go:Event` — tambah JSON tags `json:"type"`/`json:"payload,omitempty"` untuk lowercase serialization
- `api/handlers.go:CreateScan` — tambah `h.orchestrator != nil` guard

## ✅ Baru Selesai (Batch 2 — 2026-05-12 bugfix round)

| # | File | Issue | Fix |
|---|------|-------|-----|
| 1 | `jwt_test.go` | Unused `"time"` import | Removed |
| 2 | `user_repository_test.go` | `PermissionScanCreate`/`PermissionUserManage` undefined | Renamed to `PermScanCreate`/`PermUserWrite` |
| 3 | `engine_benchmark_test.go` | `entity.ScanTask` doesn't exist, `Execute` returns 1 value | Use `scanner.Task`, single `result` |
| 4 | `websocket_test.go` | Missing `http` import | Added `"net/http"` |
| 5 | `auth/service_test.go` | `GetUserByID` returns "invalid user id" | mock `Create` now sets `user.ID` |
| 6 | `auth_entity_test.go` | `DurationSec` = 0 (zero timestamps) | Set `CreatedAt`/`UpdatedAt` 10s apart |
| 7 | `messaging_test.go` | Nil pointer in `PublishFailed` | Pass non-nil error |
| 8 | `generator_test.go` | Unexpected mock call `FindByScanID` | Mock returns error for not-found |
| 9 | `headless_engine_test.go` | `detectFrameworks` HTML didn't match keywords | Updated HTML + order-independent compare |
| 10 | `handlers_extended_test.go` | `GetScan`/not_found returns 500 | Use `errors.NewAppError` with 404 |
| 11 | `orchestrator_test.go` | Race in ConcurrentSafe (6 calls vs 5 expected) | Delete under lock + `Times(5)` |
| 12 | `websocket_test.go` | EventType named type mismatch | `string(events[i].Type)` |
| 13 | `websocket_test.go` | RabbitMQ test uses HTTP GET (upgrader rejects) | Use WebSocket dial |

---

## Ringkasan

Total: **~270 test functions + 10 benchmark functions** dari **~60 test files**.
**`go test ./...` dan `go vet ./...` GREEN across 23 packages.**

---

## ❌ Belum Tersentuh Sama Sekali

| Item | Package | Detail | Prioritas |
|------|---------|--------|-----------|
| Phase 1.3 | `internal/domain/service` | Package kosong — belum ada domain service yang perlu di-test | Low |
| Phase 6.4 | `test/integration/` | RabbitMQ message flow (publish → consume → ack) | Low |
| Phase 6.5 | `test/integration/` | WebSocket real-time streaming | Low |

---

## ⚠️ Masih Parsial

| Item | File | Gap |
|------|------|-----|
| — | — | Semua gap yang teridentifikasi telah diisi |

---

## ✅ Baru Selesai (Sesi 2026-05-12 — Dispatch Loop)

| Item | File | Perubahan |
|------|------|-----------|
| `ScanID` field | `internal/infrastructure/worker/task.go` | +1 field on `Result` struct |
| Propagate ScanID | `internal/infrastructure/worker/pool.go` | Set `ScanID` in both `executeTask` return paths |
| StartDispatchLoop | `orchestrator/orchestrator.go` | +method to consume `ResultQueue` → `CompleteTask` |
| Dispatch loop tests | `orchestrator/orchestrator_test.go` | +5 test: success, failure, ctx cancellation, nil queue, channel close |
| Wire in main.go | `main.go` | `orchCfg.ResultQueue = resultQueue` + `orch.StartDispatchLoop(ctx)` |

### Production Code Changes
- `worker/task.go:Result` — tambah field `ScanID uint`
- `worker/pool.go:executeTask` — set `ScanID` pada kedua return path

## 📊 Prioritas Tersisa

| Priority | Item | Package | Effort |
|----------|------|---------|--------|
| P5 | Domain service tests | `internal/domain/service/` | 0h (empty) |
| P5 | Integration RabbitMQ + WS e2e | `test/integration/` | 4h |

---

## Referensi

- [TDD Plan](tdd-plan.md)
- [Total test files: ~60, Test functions: ~270 (+5 dispatch loop), Benchmarks: 10]
- Commit terakhir: `7ce00f3` (dispatch loop belum di-commit)
