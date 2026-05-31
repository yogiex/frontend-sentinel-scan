# SentinelScan API Contract v1

## 1. Overview

| Key | Value |
|-----|-------|
| Base URL | `http://localhost:8080/api/v1` |
| Protocol | HTTP/1.1 (REST), WebSocket (real-time) |
| Content-Type | `application/json` |
| Auth | Bearer token via `Authorization: Bearer <token>` header |

### Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 204 | No Content (delete success) |
| 400 | Bad Request (invalid body/missing field) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (not owner of resource) |
| 404 | Not Found |
| 409 | Conflict (duplicate, invalid state transition) |
| 500 | Internal Server Error |

### Error Response Format

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Scan not found"
  }
}
```

---

## 2. Authentication

Owner-based: user_id diambil dari JWT token, bukan dari request body.

### POST /api/v1/auth/login

Authenticate user and return JWT token.

**Request:**

```json
{
  "email": "admin@sentinelscan.com",
  "password": "password123"
}
```

**Response 200:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "email": "admin@sentinelscan.com",
    "role": "admin"
  }
}
```

### POST /api/v1/auth/refresh

Refresh expired token.

**Request:**

```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response 200:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### GET /api/v1/auth/me

Get current authenticated user.

**Response 200:**

```json
{
  "id": 1,
  "email": "admin@sentinelscan.com",
  "role": "admin",
  "permissions": ["scan_create", "scan_view", "report_view"]
}
```

### POST /api/v1/auth/logout

Invalidate current token.

**Response:** 204 No Content

---

## 3. Scans

Main feature. All endpoints require `Authorization: Bearer` header.

### POST /api/v1/scans

Create and start a new vulnerability scan.

**Request:**

```json
{
  "targets": ["192.168.1.0/24", "example.com"],
  "template_selectors": "{\"severity\":[\"high\",\"critical\"]}",
  "auth_credential_id": 1
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `targets` | `string[]` | Yes | Target IPs, URLs, or CIDR ranges |
| `template_selectors` | `string` | No | JSON string for Nuclei template filter |
| `auth_credential_id` | `uint` | No | Auth credential ID (must belong to current user) |

**Response 201:**

```json
{
  "id": 1,
  "targets": ["192.168.1.0/24", "example.com"],
  "status": "pending",
  "progress": {
    "completed": 0,
    "total": 0,
    "failed": 0
  },
  "created_at": "2026-05-01T10:00:00Z",
  "updated_at": "2026-05-01T10:00:00Z"
}
```

### GET /api/v1/scans

List scans for current user. Admin can see all scans.

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `status` | `string` | `all` | Filter: `pending`, `running`, `completed`, `failed`, `cancelled`, `aborted` |
| `target` | `string` | — | Search by target address |
| `page` | `int` | `1` | Pagination page |
| `limit` | `int` | `20` | Items per page |

**Response 200:**

```json
{
  "data": [
    {
      "id": 1,
      "targets": ["192.168.1.0/24"],
      "status": "running",
      "progress": {
        "completed": 5,
        "total": 20,
        "failed": 0
      },
      "created_at": "2026-05-01T10:00:00Z",
      "updated_at": "2026-05-01T10:05:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 42
  }
}
```

### GET /api/v1/scans/{id}

Get scan detail by ID. Must be owner or admin.

**Response 200:**

```json
{
  "id": 1,
  "targets": ["192.168.1.0/24"],
  "template_selectors": "{\"severity\":[\"high\",\"critical\"]}",
  "status": "running",
  "progress": {
    "completed": 5,
    "total": 20,
    "failed": 0
  },
  "auth_credential_id": 1,
  "created_by": 1,
  "created_at": "2026-05-01T10:00:00Z",
  "updated_at": "2026-05-01T10:05:00Z"
}
```

### GET /api/v1/scans/{id}/results

Get all findings for a scan.

**Response 200:**

```json
[
  {
    "id": 1,
    "scan_id": 1,
    "target": "192.168.1.1",
    "template_id": "CVE-2024-3094",
      "finding": {
        "name": "SQL Injection in Login Form",
        "severity": "critical",
        "cve_id": "CVE-2024-3094",
        "cvss_score": 9.8,
        "description": "SQL injection vulnerability found in /login.php endpoint",
        "remediation": "Use parameterized queries or prepared statements",
        "affected_url": "https://example.com/api/auth/login",
        "request_header": "POST /api/auth/login HTTP/1.1\\nHost: example.com\\nContent-Type: application/x-www-form-urlencoded",
        "request_body": "email=admin%27+OR+1%3D1--&password=test",
        "response_header": "HTTP/1.1 200 OK\\nContent-Type: text/html",
        "response_body": "<html><body>Welcome admin</body></html>",
        "host": "192.168.1.1",
        "port": 443
      },
    "created_at": "2026-05-01T10:05:00Z"
  }
]
```

### PATCH /api/v1/scans/{id}/cancel

Cancel a running scan. Must be owner or admin.

**Response 200:**

```json
{
  "id": 1,
  "status": "cancelled",
  "updated_at": "2026-05-01T10:10:00Z"
}
```

### GET /api/v1/scans/{id}/logs

Get scan execution logs (for Scan Log tab timeline and failure reason).

**Response 200:**

```json
{
  "scan_id": 1,
  "status": "aborted",
  "logs": [
    {
      "timestamp": "2026-05-01T10:03:12Z",
      "level": "info",
      "message": "Starting vulnerability checks",
      "plugin_id": "10004"
    },
    {
      "timestamp": "2026-05-01T10:05:45Z",
      "level": "error",
      "message": "Scan aborted by user",
      "plugin_id": "system"
    }
  ]
}
```

### DELETE /api/v1/scans/{id}

Soft-delete (trash) a scan. Must be owner or admin.

**Response:** 204 No Content

### GET /api/v1/scans/{id}/stream

WebSocket endpoint for real-time scan events.

**Connection:** `ws://localhost:8080/api/v1/scans/{id}/stream?token=<jwt>`

**Message types:**

```json
// Progress update
{
  "type": "progress",
  "data": {
    "scan_id": 1,
    "completed": 5,
    "total": 20
  }
}

// New finding discovered
{
  "type": "finding",
  "data": {
    "id": 1,
    "scan_id": 1,
    "target": "192.168.1.1",
    "template_id": "CVE-2024-3094",
    "finding": { ... },
    "created_at": "2026-05-01T10:05:00Z"
  }
}

// Scan complete
{
  "type": "complete",
  "data": {
    "scan_id": 1
  }
}

// Log event
{
  "type": "log",
  "data": {
    "scan_id": 1,
    "timestamp": "2026-05-01T10:05:45Z",
    "level": "error",
    "message": "Scan aborted by user"
  }
}
```

---

## 4. Templates

### GET /api/v1/templates

List available Nuclei templates.

**Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `severity` | `string` | Comma-separated: `info,low,medium,high,critical` |
| `tags` | `string` | Comma-separated filter tags |

**Response 200:**

```json
[
  {
    "id": 1,
    "name": "CVE-2024-3094 Detection",
    "severity": "critical",
    "tags": ["cve", "rce", "xz"],
    "version": "1.0",
    "created_at": "2026-01-15T00:00:00Z"
  }
]
```

---

## 5. Tickets

Sub-feature. Created from scan findings.

### GET /api/v1/tickets

List tickets with optional filters.

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `status` | `string` | `all` | Filter: `open`, `in_progress`, `fixed`, `verified`, `wont_fix` |
| `priority` | `string` | `all` | Filter: `critical`, `high`, `medium`, `low` |
| `assigned_to` | `uint` | — | Filter by assigned user ID |

**Response 200:**

```json
{
  "data": [
    {
      "id": 1,
      "ticket_code": "TKT-001",
      "title": "Critical SQL Injection in Login Form",
      "status": "open",
      "priority": "critical",
      "assigned_to": 2,
      "created_by": 1,
      "created_at": "2026-05-01T10:00:00Z",
      "updated_at": "2026-05-01T10:00:00Z",
      "due_date": "2026-05-08T10:00:00Z",
      "cvss_score": 9.8,
      "cve_id": "CVE-2023-12345",
      "remediation": "Use parameterized queries...",
      "comments": []
    }
  ]
}
```

### GET /api/v1/tickets/{id}

Get ticket detail with all comments.

**Response 200:**

```json
{
  "id": 1,
  "ticket_code": "TKT-001",
  "vulnerability_id": "vuln-001",
  "scan_id": "scan-001",
  "title": "Critical SQL Injection in Login Form",
  "description": "SQL injection vulnerability found in /login.php endpoint",
  "status": "open",
  "priority": "critical",
  "assigned_to": 2,
  "created_by": 1,
  "created_at": "2026-05-01T10:00:00Z",
  "updated_at": "2026-05-01T10:00:00Z",
  "due_date": "2026-05-08T10:00:00Z",
  "cvss_score": 9.8,
  "cve_id": "CVE-2023-12345",
  "remediation": "Use parameterized queries...",
  "comments": [
    {
      "id": 1,
      "author_id": 1,
      "message": "Found during automated scan. Needs immediate attention.",
      "created_at": "2026-05-01T10:05:00Z"
    }
  ]
}
```

### POST /api/v1/tickets

Create a new remediation ticket.

**Request:**

```json
{
  "vulnerability_id": "vuln-001",
  "scan_id": "scan-001",
  "title": "Critical SQL Injection in Login Form",
  "description": "SQL injection vulnerability found in /login.php endpoint",
  "priority": "critical",
  "assigned_to": 2,
  "due_date": "2026-05-08T10:00:00Z",
  "remediation": "Use parameterized queries...",
  "cve_id": "CVE-2023-12345",
  "cvss_score": 9.8
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `vulnerability_id` | `string` | Yes | Reference to scan finding |
| `scan_id` | `string` | Yes | Reference to scan |
| `title` | `string` | Yes | Ticket title (min 5 chars) |
| `description` | `string` | Yes | Ticket description (min 10 chars) |
| `priority` | `string` | Yes | `critical`, `high`, `medium`, `low` |
| `assigned_to` | `uint` | No | User ID to assign |
| `due_date` | `string` (ISO8601) | No | Due date (default from SLA) |
| `remediation` | `string` | No | Remediation steps |
| `cve_id` | `string` | No | CVE identifier |
| `cvss_score` | `float` | No | CVSS score (0.0 – 10.0) |

**Response 201:** (same as `GET /api/v1/tickets/{id}` response)

### PATCH /api/v1/tickets/{id}/status

Update ticket status (used by drag-and-drop Kanban).

**Request:**

```json
{
  "status": "in_progress"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `status` | `string` | Yes | `open`, `in_progress`, `fixed`, `verified`, `wont_fix` |

**Response 200:** (updated ticket object)

### POST /api/v1/tickets/{id}/comments

Add a comment to a ticket.

**Request:**

```json
{
  "message": "Scheduled maintenance window for May 5th to update Apache."
}
```

**Response 201:**

```json
{
  "id": 2,
  "author_id": 1,
  "message": "Scheduled maintenance window for May 5th to update Apache.",
  "created_at": "2026-05-01T10:06:00Z"
}
```

---

## 6. Auth Credentials

Owner-based. All endpoints require `Authorization: Bearer` header. User ID extracted from token.

### POST /api/v1/auth-credentials

Create a new auth credential.

**Request:**

```json
{
  "name": "Prod AWS Session",
  "method": "cookie",
  "config": {
    "cookies": [
      { "name": "session", "value": "abc123" }
    ]
  },
  "login_url": "https://example.com/login",
  "verify_url": "https://example.com/me",
  "verify_pattern": "logged_in"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | Yes | Human-readable name |
| `method` | `string` | Yes | `cookie`, `header`, `bearer`, `basic` |
| `config` | `object` | Yes | Auth configuration (varies by method) |
| `login_url` | `string` | No | URL for login flow |
| `verify_url` | `string` | No | URL to verify session is active |
| `verify_pattern` | `string` | No | String to match in verify response |

**Response 201:**

```json
{
  "id": 1,
  "user_id": 1,
  "name": "Prod AWS Session",
  "method": "cookie",
  "created_at": "2026-05-01T10:00:00Z"
}
```

### GET /api/v1/auth-credentials

List auth credentials for current user.

**Response 200:**

```json
[
  {
    "id": 1,
    "user_id": 1,
    "name": "Prod AWS Session",
    "method": "cookie",
    "last_verified_at": "2026-05-01T10:00:00Z",
    "created_at": "2026-05-01T10:00:00Z"
  }
]
```

### GET /api/v1/auth-credentials/{id}

Get single auth credential detail. Must be owner.

**Response 200:** (single credential object)

### PUT /api/v1/auth-credentials/{id}

Update auth credential fields.

**Response 200:** (updated credential object)

### DELETE /api/v1/auth-credentials/{id}

Delete auth credential. Must be owner.

**Response:** 204 No Content

### POST /api/v1/auth-credentials/{id}/verify

Verify auth credential by making a test request.

**Response 200:**

```json
{
  "status": "verified",
  "message": "Session is valid",
  "cookies": 2,
  "headers": 5
}
```

---

## 7. System

### GET /api/v1/health

Health check endpoint (no auth required).

**Response 200:**

```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2026-05-11T10:00:00Z"
}
```

---

## 8. Field Naming Convention

All backend JSON fields use **snake_case**.

| Frontend (TypeScript) | Backend (JSON) |
|-----------------------|----------------|
| `scanId` | `scan_id` |
| `templateId` | `template_id` |
| `authCredentialId` | `auth_credential_id` |
| `createdBy` | `created_by` |
| `createdAt` | `created_at` |
| `updatedAt` | `updated_at` |
| `assignedTo` | `assigned_to` |
| `assignedTeam` | `assigned_team` |
| `dueDate` | `due_date` |
| `cvssScore` | `cvss_score` |
| `cveId` | `cve_id` |
| `vulnerabilityId` | `vulnerability_id` |
| `templateSelectors` | `template_selectors` |
| `ticketCode` | `ticket_code` |
| `loginUrl` | `login_url` |
| `verifyUrl` | `verify_url` |
| `verifyPattern` | `verify_pattern` |
| `userId` | `user_id` |
| `authorId` | `author_id` |

---

## 9. Enums

### ScanStatus

```
pending → running → completed
                  ↘ failed
                  ↘ cancelled
                  ↘ aborted
                  ↘ partial_failure
```

| Value | Description |
|-------|-------------|
| `pending` | Scan created, not yet started |
| `running` | Scan in progress |
| `completed` | All tasks finished successfully |
| `partial_failure` | Some tasks failed |
| `failed` | Scan cancelled or all tasks failed |
| `cancelled` | Scan stopped by user before completion |
| `aborted` | Scan stopped by system/policy/WAF/runtime condition |

### TicketStatus

| Value | Description |
|-------|-------------|
| `open` | Newly created |
| `in_progress` | Being worked on |
| `fixed` | Remediation applied |
| `verified` | Fix verified by reviewer |
| `wont_fix` | Accepted risk |

### TicketPriority

| Value | SLA |
|-------|-----|
| `critical` | 7 days |
| `high` | 30 days |
| `medium` | 90 days |
| `low` | 180 days |

### FindingSeverity

`info` | `low` | `medium` | `high` | `critical`

### AuthMethod

`cookie` | `header` | `bearer` | `basic`
