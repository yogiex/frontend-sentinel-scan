# Milestone Development — SentinelScan Go Backend

| # | Milestone | Fase | Selesai | Poin Utama |
|---|-----------|------|---------|------------|
| M1 | **Foundation & Core Domain** | Sprint 1 | ✅ | Entity layer (ScanJob, Finding, Ticket, User, AuthCredential, AuditLog, dll), status transitions dengan validasi, repository interfaces, service layer (Scan, Ticket, Auth, Report, AuthCredential) |
| M2 | **Auth & Credential Vault** | Sprint 2 | ✅ | JWT (HMAC-SHA256), bcrypt password, RBAC dengan 4 role (admin/security_analyst/auditor/viewer), credential vault 5 metode (login_form, cookie, bearer, api_key, selenium), session manager + health checker |
| M3 | **API & Orchestrator** | Sprint 3+6 | ✅ | REST API (CRUD scan, credential, report, WebSocket stream), orchestrator (StartScan → dispatch tasks → CompleteTask → auto-status `completed`), nil-guard, race fix di CompleteTask |
| M4 | **Scanner Engines** | Sprint 4 | ✅ | HTTP engine (GET + keyword matching), Headless engine (chromedp — XSS, open redirect, framework detection, form extraction), template loader (Nuclei YAML), engine routing by template type |
| M5 | **Worker Pool & Dispatching** | Sprint 4+7 | ✅ | In-memory pool dengan goroutine workers, taskQueue/resultQueue channel, StartDispatchLoop (resultQueue → CompleteTask), session injection ke task, event bus publishing |
| M6 | **RabbitMQ Messaging** | Sprint 4 | ✅ | Topology: 3 exchanges (tasks, events, DLX), 7 queues (HTTP, headless, retry dgn TTL, DLQ, event_persist, event_audit), publisher, consumer, autoscaler, reconnect logic. **Berjalan** — docker-compose + definitions.json siap |
| M7 | **Report Engine** | Sprint 4 | ✅ | PDF generator (chromedp), HTML template dengan FuncMap (inc/join/toUpper), generator service, A4 format, severity breakdown |
| M8 | **Database & Migrations** | Sprint 2+5 | ✅ | PostgreSQL via GORM, 6 repository implementation, migrator CLI (up/down/fresh/status), AutoMigrate, SQLite in-memory untuk testing repo |
| M9 | **Integration & Benchmarks** | Sprint 5 | ✅ | 13 integration tests (build tag), 10 benchmarks (template loader, HTTP engine, config, finding batch insert), e2e scan flow |
| M10 | **Docker & Deployment** | — | ✅ | docker-compose (Postgres + RabbitMQ + pgAdmin), config.yaml, env.example, Dockerfile development, production & staging template |

## Status Akhir

| Metrik | Angka |
|--------|-------|
| Total test functions | ~275 |
| Benchmark functions | 10 |
| Test files | ~60 |
| Packages lulus `go test ./...` | 23/23 |
| Packages lulus `go vet ./...` | 23/23 |

## Tersisa (Non-Bloking)

| Item | Alasan |
|------|--------|
| `internal/domain/service` | Package kosong — belum ada kode production |
| Integration RabbitMQ e2e | Butuh RabbitMQ service running |
| Integration WebSocket e2e | Butuh server running |
