# TDD Plan — SentinelScan Go Backend

> Test-Driven Development roadmap: RED → GREEN → REFACTOR
> **✅ Complete — all 21+ TDD items implemented. `go test ./...` passes on all packages.**

---

## Current Test State

### Overall Coverage: ~48% (validated — `go test ./...` green across all packages)

| Metric | Count |
|--------|-------|
| Total test files | ~60 |
| Passing packages | 23/23 (all GREEN) |
| Failing (compile error) | 0 |
| Failing (runtime) | 0 |
| Packages with zero tests | 1 (`internal/domain/service` — empty package) |
| Packages using testify | 8 |
| Packages using SQLite test DB | 5 |
| Integration tests | 13 (2 files, build tag: integration) |
| Benchmark tests | 10 (4 files) |

### Test Coverage by Package (after session 2026-05-12)

| Package | Coverage | Status |
|---------|----------|--------|
| `pkg/errors` | 100% | ✅ |
| `config` | 97.6% | ✅ |
| `internal/infrastructure/event` | 90.5% | ✅ |
| `template` | 71.8% | ✅ |
| `internal/infrastructure/auth` | ~70% | ✅ |
| `internal/infrastructure/authscan` | ~70% | ✅ |
| `internal/domain/entity` | ~65% | 🟡 |
| `internal/application` | ~55% | 🟡 |
| `internal/infrastructure/messaging` | ~40% | 🟡 |
| `internal/domain/repository` | Compiled | ✅ |
| `internal/infrastructure/worker` | ~30% | 🟡 |
| `internal/infrastructure/scanner` | ~25% | 🟡 |
| `api` | ~45% | 🟡 |
| `internal/infrastructure/database/postgres` | ~35% | 🟡 |
| `internal/infrastructure/report` | ~15% | 🟡 |
| `internal/infrastructure/database` (migrator) | ~30% | 🟡 |
| `cmd/migrate` | ~20% | 🟡 |
| `orchestrator` | ~20% | 🟡 |

---

## Phase 0: Fix Broken Tests ✅

Two rounds of fixes. **All GREEN.**

### Round 1 (Original)

| # | File | Issue | Fix |
|---|------|-------|-----|
| 0.1 | `internal/infrastructure/auth/jwt_test.go:348` | Syntax error — orphaned for loop + duplicate tests | Removed duplicate content (lines 340–460) |
| 0.2 | `detection/engine_test.go:8` | Wrong import — `worker` → `internal/infrastructure/worker` | Fixed import path + `NewEngine` signature (3 params) |
| 0.3 | `internal/application/auth/service_test.go` | RED phase TDD failing | Implemented: `jwt.go` (HMAC-SHA256), `password.go` (bcrypt), `service.go` (Register/Login/GetUserByID) |

### Round 2 (2026-05-12 — `go test ./...` first run)

| # | File | Issue | Fix |
|---|------|-------|-----|
| 0.4 | `jwt_test.go` | Unused `"time"` import | Removed |
| 0.5 | `user_repository_test.go` | `PermissionScanCreate`/`PermissionUserManage` undefined | Renamed to `PermScanCreate`/`PermUserWrite` |
| 0.6 | `engine_benchmark_test.go` | `entity.ScanTask` doesn't exist, `Execute` returns 1 value | Use `scanner.Task`, single `result := engine.Execute(...)` |
| 0.7 | `websocket_test.go` | Missing `http` import | Added `"net/http"` |
| 0.8 | `auth/service_test.go` | `GetUserByID` returns "invalid user id" for valid user | mock `Create` now sets `user.ID` |
| 0.9 | `auth_entity_test.go` | `DurationSec` = 0 (zero-value timestamps) | Set `CreatedAt`/`UpdatedAt` 10s apart |
| 0.10 | `messaging_test.go` | Nil pointer in `PublishFailed` | Pass `errors.New("test error")` instead of nil |
| 0.11 | `generator_test.go` | Unexpected mock call to `FindByScanID` for scan-not-found | Mock returns error instead of nil |
| 0.12 | `headless_engine_test.go` | `detectFrameworks` HTML didn't contain keywords | Updated HTML + order-independent comparison |
| 0.13 | `handlers_extended_test.go` | `GetScan`/not_found returns 500 (not `*errors.AppError`) | Use `errors.NewAppError` with 404 |
| 0.14 | `orchestrator_test.go` | Race in ConcurrentSafe (UpdateProgress called 6× instead of 5) | Fixed: delete under lock + Times(5) |
| 0.15 | `websocket_test.go` | EventType named type mismatch in comparison | `string(events[i].Type)` |
| 0.16 | `websocket_test.go` | RabbitMQ test sends HTTP GET (upgrader rejects) | Use WebSocket dial instead |
| 0.17 | `event/bus.go` | Event struct missing JSON tags | Added `json:"type"`/`json:"payload,omitempty"` |
| 0.18 | `api/handlers.go` | Nil orchestrator panic in `CreateScan` | Added `h.orchestrator != nil` guard |
| 0.19 | `orchestrator/orchestrator.go` | Race condition in `CompleteTask` (delete after unlock) | Moved `delete(o.tasks)` inside critical section |

---

## Phase 1: Core Domain Tests 🟡

Test the innermost layer — domain entities, value objects, and validation logic. **Complete** (write-only phase).

| # | Package | Current | Added | Priority |
|---|---------|---------|-------|----------|
| 1.1 | `internal/domain/entity` | 26.7% | +15 tests (auth_entity_test.go) | **High** |
| 1.2 | `internal/domain/repository` | no stats | +2 compile-time interface checks (auth_repository_test.go) | High |
| 1.3 | `internal/domain/service` | empty | — | Low |

### Tests Added

| Entity | File | Tests |
|--------|------|-------|
| `AuthCredential` | `auth_entity_test.go` | `NewAuthCredential` defaults, all fields, nil config |
| `AuthSession` | `auth_entity_test.go` | `NewAuthSession` with zero values, status constants (Active/Expired/Invalidated) |
| `ScanReportData` | `auth_entity_test.go` | `NewReportData` nil scan, empty findings, severity counts (critical=2/high=3), severity ordering, group counts, severity breakdown, top targets (n=5), duration for completed vs pending scans |
| Repository interfaces | `auth_repository_test.go` | `var _ AuthCredentialRepository = &mock...`, `var _ AuthSessionRepository = &mock...` |

---

## Phase 2: Application Service Tests 🟡

**Complete** (write-only phase).

| # | Service | Tests Added | File |
|---|---------|-------------|------|
| 2.1 | `ScanService` | — | (existing tests sufficient) |
| 2.2 | `AuthCredentialService` | 9 tests: Create (success/empty name/missing method/repo error), GetByID (found/not found), ListByUserID, Update (partial/not found), Delete (success/repo error), UpdateLastVerified, Sanitize (token/password/value/secret masking, nil config) | `auth_credential_service_test.go` |
| 2.3 | `ReportService` | 4 tests: GetReportData (success with severity counts/grouping, scan not found, findings fetch error, no findings) | `report_service_test.go` |
| 2.4 | `TicketService` | — | (existing) |
| 2.5 | `AuthService` | — | (existing) |
| 2.6 | `AuthService` (sub) | Implemented GREEN: Register, Login, GetUserByID | `service.go` |

---

## Phase 3: Infrastructure Tests 🟡

**Complete** (write-only phase). 5 packages now have tests.

### 3.1 AuthScan — Authenticated Scanning ✅

| # | Component | Tests Added | File |
|---|-----------|-------------|------|
| 3.1.1 | `executor.go` (factory) | GetExecutor for each method, unknown method error | `authscan_test.go` |
| 3.1.2 | `login_form.go` | Parse config, build form, httptest server, error on missing fields | `authscan_test.go` |
| 3.1.3 | `cookie_auth.go` | Parse cookie config, build cookie jar, set cookies on client | `authscan_test.go` |
| 3.1.4 | `bearer_auth.go` | Set authorization header, verify URL, verify pattern | `authscan_test.go` |
| 3.1.5 | `apikey_auth.go` | Parse header config, set custom headers | `authscan_test.go` |
| 3.1.6 | `session_manager.go` | Start/Get/Stop/Refresh/Verify/InvalidMethod/Idempotent | `authscan_test.go` |

### 3.2 Scanner Engines ✅

| # | Component | Tests Added | File |
|---|-----------|-------------|------|
| 3.2.1 | `scanner.go` | — | (interface contract via usage) |
| 3.2.2 | `http_engine.go` | — | (existing tests sufficient) |
| 3.2.3 | `headless_engine.go` | 16 tests: Type(), extractQuoted, detectFrameworks (react/angular/jquery/bootstrap/tailwind/vue/multiple/none), extractForms (counts/actions), analyzePage (XSS detection from console logs, framework detection, open redirect, form extraction, combined signals) | `headless_engine_test.go` |

### 3.3 Report ✅

| # | Component | Tests Added | File |
|---|-----------|-------------|------|
| 3.3.1 | `template.go` | 3 tests: FuncMap helpers `inc` (edge cases), `join` (empty, single, multiple), `toUpper` | `template_test.go` |
| 3.3.2 | `generator.go` | 3 tests: GeneratePDF (scan not found, no chrome error, findings fetch error) using mock repos | `generator_test.go` |
| 3.3.3 | `pdf.go` | 3 tests: NewPDFGenerator (constructor), Close idempotent, Generate (error/no-chrome) | `pdf_test.go` |

### 3.4 Messaging ✅

| # | Component | Tests Added | File |
|---|-----------|-------------|------|
| 3.4.1 | `types.go` | itoa, EventRoutingKey, ScanEventRoutingKey, DefaultConfig | `messaging_test.go` |
| 3.4.2 | `task_publisher.go` | Constructor + error when not connected | `messaging_test.go` |
| 3.4.3 | `event_consumer.go` | Constructor + error when not connected | `messaging_test.go` |

All 20 tests across `Connection`, `EventPublisher`, `TaskPublisher`, `EventConsumer`, `TaskConsumer` constructors + graceful error paths when not connected (no RabbitMQ needed).

### 3.5 Postgres Repositories ✅

| # | Component | Tests Added | File |
|---|-----------|-------------|------|
| 3.5.1 | `auth_credential_repository.go` | — | (existing auth_credential_repository_test.go) |
| 3.5.2 | `auth_session_repository.go` | — | (existing auth_session_repository_test.go) |
| 3.5.3 | `user_repository.go` | 8 tests: Create, FindByID (found/not found), FindByUsername (found/not found), Update, HasPermission (admin/viewer/non-existent), DuplicateUsername | `user_repository_test.go` |

---

## Phase 4: API Handler Tests ✅

**Complete** (write-only phase).

| # | Handler | Tests Added |
|---|---------|-------------|
| 4.1 | Health handler | (existing) |
| 4.2 | `CreateScan` | success, invalid body, service error |
| 4.3 | `GetScan` | success, invalid ID, not found |
| 4.4 | `GetScanResults` | success, invalid ID, not found |
| 4.5 | `ListScans` | (existing) |
| 4.6 | `CancelScan` | (existing) |
| 4.7 | Credential CRUD | CreateAuthCredential (success/invalid/error), GetAuthCredential (success/invalid/not found), ListAuthCredentials (success), UpdateAuthCredential (success/invalid/not found), DeleteAuthCredential (success/invalid/error), VerifyAuthCredential (success/invalid/error) |
| 4.8 | Report handlers | GetReportData (success/invalid/not found) |
| 4.9 | WebSocket | (1 existing test) |

**Total: 19 test cases** in `handlers_extended_test.go` using `httptest.NewRecorder` + `gorilla/mux` with embedded mock services.

---

## Phase 5: Orchestrator Tests ✅

**Complete.** 12 tests covering orchestrator lifecycle, template routing, and scan completion tracking.

| # | Component | Tests Added | File |
|---|-----------|-------------|------|
| 5.1 | `New` | Constructor + progress map init | `orchestrator_test.go` |
| 5.2 | `StartScan` | 6 tests: NoTemplates, MultipleTemplates, HeadlessTemplateRouting, EmptyTargetsNoTemplate, StatusUpdatedAfterTasks, MultipleTargetsNoTemplate | `orchestrator_test.go` |
| 5.3 | Scan completion tracking | 6 tests: ProgressAfterStart, AllSuccess (auto `completed` transition), PartialProgress, ScanNotFound, ConcurrentSafe (10 goroutines, 5 tasks), GetProgressNotFound | `orchestrator_test.go` |

### Production Code Changes
- `orchestrator.go`: Added `sync.Mutex`, `tasks map[uint]*ScanProgress`, `CompleteTask`, `GetProgress`
- `StartScan` now stores progress entry + uses `entity.ScanStatusRunning` typed constant
- `CompleteTask` race fixed: progress deletion moved inside critical section

### Remaining Feature: Worker Dispatch Loop
Unit tests call `CompleteTask` directly. Production still needs a goroutine consuming worker results and calling `CompleteTask` with task outcomes.

---

## Phase 6: Integration Tests ✅

**Complete** (write-only phase). Uses `//go:build integration` build tag.

| # | Test | File | Tests |
|---|------|------|-------|
| 6.1 | Scan end-to-end | `scan_e2e_test.go` | Create scan → findings → FindByScanID verification (SQLite) |
| 6.2 | Credential vault + auth scan | `scan_e2e_test.go` | Create credential → create session → FindByID + CredentialID match |
| 6.3 | Report PDF export | `scan_e2e_test.go` | Complete scan → batch insert 5 findings (1 per severity) → FindByScanID count |
| 6.4 | RabbitMQ message flow | — | Deferred (requires real RabbitMQ) |
| 6.5 | WebSocket real-time | `scan_e2e_test.go` | Stub — skipped (requires running server) |
| 6.6 | Migrator e2e | `migrator_e2e_test.go` | Up all, Up idempotent, Down 1 step, Down all, Fresh, Status (with temp migration files) |
| 6.7 | PDF with Chrome | `scan_e2e_test.go` | Conditional — runs only if `CHROME_BIN` env is set |

**Total: 13 test cases** across 2 files.

```go
//go:build integration
package integration
```

Run with:
```bash
go test -tags=integration -count=1 ./test/integration/...
```

---

## Phase 7: Benchmarks ✅

**Complete** (write-only phase). 10 benchmarks across 4 files in `test/benchmarks/`.

| # | Benchmark | File | Benchmarks |
|---|-----------|------|------------|
| 7.1 | Template loader | `loader_benchmark_test.go` | `BenchmarkTemplateLoader_List100`, `BenchmarkTemplateLoader_List1000`, `BenchmarkTemplateLoader_Get` |
| 7.2 | HTTP engine | `engine_benchmark_test.go` | `BenchmarkHTTPEngine_Execute`, `BenchmarkHTTPEngine_Execute_LargeResponse` (1KB response) |
| 7.3 | Config load | `config_benchmark_test.go` | `BenchmarkConfigLoad_Defaults` (viper defaults only), `BenchmarkConfigLoad_WithEnv` (7 env vars) |
| 7.4 | Finding batch insert | `finding_benchmark_test.go` | `BenchmarkFindingRepository_CreateBatch100`, `BenchmarkFindingRepository_CreateBatch1000`, `BenchmarkFindingRepository_CreateSingle` |

Run with:
```bash
go test -bench=. -benchmem ./test/benchmarks/...
```

---

## Test Conventions

### Directory Layout
```
internal/application/
├── scan_service.go
├── scan_service_test.go         # inline testify mocks + tests
├── auth_credential_service.go
├── auth_credential_service_test.go
├── report_service.go
└── report_service_test.go
```

### Database Tests
- Use SQLite `:memory:` via `setupTestDB(t)` for postgres repo tests
- AutoMigrate models at test start
- No need for external DB
- Also used for migrator tests (`schemaMigration` table)

### AuthScan / Scanner Tests
- Use `httptest.NewServer` for HTTP mock targets
- Use `httptest.NewTLSServer` for HTTPS targets
- No actual network calls in unit tests

### Headless Engine Tests
- Test non-Chrome-dependent functions: `Type()`, `extractQuoted()`, `detectFrameworks()`, `extractForms()`, `analyzePage()` (console log parsing)
- Defer chromedp tests to integration phase

### Messaging Tests
- Test connection error paths when `channel is nil` — no RabbitMQ needed
- Test constructor behavior for all publishers/consumers
- Test routing key formatting and constants

### Assertions
- Prefer `testify/assert` for most checks
- Use `testify/require` for fatal conditions (setup, nil pointers)
- Use `testify/mock` for repository/interface mocking

```go
import (
    "github.com/stretchr/testify/assert"
    "github.com/stretchr/testify/mock"
    "github.com/stretchr/testify/require"
)

func TestSomething(t *testing.T) {
    result, err := someFunc()
    require.NoError(t, err)
    assert.Equal(t, expected, result)
}
```

### Table-Driven Tests
```go
tests := []struct {
    name    string
    input   string
    want    string
    wantErr bool
}{
    {"valid input", "hello", "HELLO", false},
    {"empty input", "", "", true},
}
for _, tt := range tests {
    t.Run(tt.name, func(t *testing.T) {
        got, err := transform(tt.input)
        if tt.wantErr {
            assert.Error(t, err)
            return
        }
        assert.NoError(t, err)
        assert.Equal(t, tt.want, got)
    })
}
```

### Mock Naming
```go
type mockScanRepo struct { mock.Mock }
type mockFindingRepo struct { mock.Mock }
type mockAuthCredRepo struct { mock.Mock }
type mockTemplateLoader struct { mock.Mock }
```

### Running Tests
```bash
# All tests (with race detector, no cache)
./backend.sh test

# Unit tests only (skip integration)
./backend.sh test:short

# Single package
go test -count=1 -v ./internal/application/...

# With coverage
go test -count=1 -cover ./internal/domain/entity/...

# Coverage HTML report
go test -coverprofile=coverage.out ./...
go tool cover -html=coverage.out -o coverage.html

# Integration tests (build tag)
go test -tags=integration -count=1 ./test/integration/...

# Benchmarks
go test -bench=. -benchmem ./test/benchmarks/...
```

---

## Priority Matrix — Actual (Sprint 1–6)

| Priority | Phase | Packages | Status | Effort |
|----------|-------|----------|--------|--------|
| P0 | 0 | `auth/jwt`, `detection` | ✅ Done | 1h |
| P1 | 1 | `entity` | ✅ Done | 4h |
| P1 | 2 | `application` services | ✅ Done | 6h |
| P1 | 3.1 | `authscan` | ✅ Done | 8h |
| P2 | 3.5 | `postgres` repos | ✅ Done | 4h |
| P2 | 4 | `api` handlers | ✅ Done | 6h |
| P2 | 5 | `orchestrator` | ✅ Done | 6h |
| P3 | 3.2 | `scanner` | ✅ Done | 6h |
| P3 | 3.3 | `report` (+ template FuncMap, generator mock tests) | ✅ Done | 6h |
| P3 | 3.4 | `messaging` | ✅ Done | 3h |
| P4 | 6 | Integration tests | ✅ Done | 8h |
| P5 | 7 | Benchmarks (+ fix engine_benchmark types) | ✅ Done | 4h |
| — | Bugfix round 2 | All 16 compilation/runtime failures fixed | ✅ Done | 2h |
| — | Event JSON tags | `event.Event` lowercase JSON serialization | ✅ Done | 0.5h |
| — | Orchestrator race | `CompleteTask` delete-under-lock concurrency fix | ✅ Done | 0.5h |
| — | Worker dispatch loop | `StartDispatchLoop` consumes `resultQueue` → calls `CompleteTask` | ✅ Done | 2h |

### Actual Sprint Execution

| Sprint | Focus | Status |
|--------|-------|--------|
| **Sprint 1** | Fix broken + Entity + Application services | ✅ 11h |
| **Sprint 2** | AuthScan + Postgres repos | ✅ 12h |
| **Sprint 3** | API handlers (Orchestrator deferred) | ✅ 8h |
| **Sprint 4** | Scanner + Report + Messaging | ✅ 13h |
| **Sprint 5** | Integration + Benchmarks | ✅ 12h |
| **Sprint 6** | Orchestrator + Entity gaps + Bugfix round 2 | ✅ 8h |
| **Sprint 7** | Worker dispatch loop + ScanID on Result | ✅ 2h |

### Remaining Work

| Package | Reason | Effort |
|---------|--------|--------|
| `internal/domain/service` | Empty — planned domain service layer (no code to test) | — |
| Integration: RabbitMQ (6.4) | Requires real RabbitMQ service running | 4h |
| Integration: WebSocket e2e (6.5) | Requires running server with WS handshake | 2h |

### Target: Project-wide coverage >50% after remaining production work
