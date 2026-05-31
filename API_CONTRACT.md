# SentinelScan API Contract v2

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
| 422 | Unprocessable Entity (validation error) |
| 429 | Too Many Requests (rate limited) |
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

Validation errors return field-level messages:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "fields": {
      "targets": "Target is required",
      "title": "Title must be at least 5 characters"
    }
  }
}
```

### Pagination

All list endpoints return:

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 42
  }
}
```

Query params: `?page=1&limit=20`

---

## 2. Authentication

Owner-based: `user_id` diambil dari JWT token, bukan dari request body.

### POST /api/v1/auth/login

Authenticate user and return JWT token.

**Request:**

```json
{
  "email": "admin@sentinelscan.com",
  "password": "password123"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | `string` | Yes | User email |
| `password` | `string` | Yes | User password |

**Response 200:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "expires_in": 3600,
  "user": {
    "id": 1,
    "email": "admin@sentinelscan.com",
    "username": "admin",
    "role": "admin",
    "permissions": ["scan_create", "scan_view", "report_view", "user_manage", "settings_manage"]
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
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "expires_in": 3600
}
```

### GET /api/v1/auth/me

Get current authenticated user.

**Response 200:**

```json
{
  "id": 1,
  "email": "admin@sentinelscan.com",
  "username": "admin",
  "role": "admin",
  "permissions": ["scan_create", "scan_view", "report_view", "user_manage", "settings_manage"]
}
```

### POST /api/v1/auth/logout

Invalidate current token.

**Response:** 204 No Content

---

## 3. Users

### GET /api/v1/users

List all users. Requires `user_manage` permission.

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `search` | `string` | — | Search by name or email |
| `role` | `string` | `all` | Filter: `super_admin`, `admin`, `user`, `viewer` |
| `status` | `string` | `all` | Filter: `active`, `inactive`, `suspended` |
| `page` | `int` | `1` | Pagination page |
| `limit` | `int` | `20` | Items per page |

**Response 200:**

```json
{
  "data": [
    {
      "id": 1,
      "email": "admin@sentinelscan.com",
      "username": "admin",
      "role": "admin",
      "status": "active",
      "permissions": ["scan_create", "scan_view"],
      "two_factor_enabled": true,
      "session_timeout": 30,
      "security_score": 85,
      "last_login": "2026-05-01T10:00:00Z",
      "created_at": "2026-01-01T00:00:00Z",
      "updated_at": "2026-05-01T10:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 12
  }
}
```

### GET /api/v1/users/{id}

Get single user detail.

**Response 200:** (single user object as above)

### POST /api/v1/users

Create a new user.

**Request:**

```json
{
  "email": "newuser@sentinelscan.com",
  "username": "newuser",
  "password": "SecurePass123!",
  "role": "user",
  "permissions": ["scan_create", "scan_view"],
  "two_factor_enabled": false,
  "session_timeout": 30
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | `string` | Yes | User email |
| `username` | `string` | Yes | Display name |
| `password` | `string` | Yes | Password (min 8 chars) |
| `role` | `string` | Yes | `super_admin`, `admin`, `user`, `viewer` |
| `permissions` | `string[]` | No | Array of permission strings |
| `two_factor_enabled` | `bool` | No | Enable 2FA (default: false) |
| `session_timeout` | `int` | No | Session timeout in minutes (default: 30) |

**Response 201:** (user object)

### PUT /api/v1/users/{id}

Update user.

**Request** (partial update):

```json
{
  "role": "admin",
  "permissions": ["scan_create", "scan_view", "user_manage"],
  "status": "active",
  "two_factor_enabled": true,
  "session_timeout": 60
}
```

**Response 200:** (updated user object)

### DELETE /api/v1/users/{id}

Permanently delete a user.

**Response:** 204 No Content

### PATCH /api/v1/users/{id}/status

Suspend or activate a user.

**Request:**

```json
{
  "status": "suspended"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `status` | `string` | Yes | `active`, `inactive`, `suspended` |

**Response 200:** (updated user object)

### GET /api/v1/users/stats

User statistics for dashboard.

**Response 200:**

```json
{
  "total": 12,
  "active": 10,
  "admin": 2,
  "suspended": 1,
  "two_factor_enabled": 5,
  "average_security_score": 78.5
}
```

---

## 4. Scans

All scan endpoints require `Authorization: Bearer` header.

### POST /api/v1/scans

Create and start a new vulnerability scan.

**Request:**

```json
{
  "targets": ["192.168.1.0/24", "example.com"],
  "scan_type": "web",
  "profile": "standard",
  "template_selectors": "{\"severity\":[\"high\",\"critical\"]}",
  "auth_credential_id": 1,
  "schedule": "now",
  "scheduled_date": null,
  "scheduled_time": null,
  "description": "Weekly web scan",
  "credentials": {
    "enabled": false,
    "auth_type": null
  },
  "stealth": {
    "user_agent_mode": "random",
    "enable_cookies": true,
    "human_like_delay": true,
    "delay_min": 1,
    "delay_max": 5,
    "randomize_order": true
  },
  "ai_agentic": {
    "enabled": false,
    "adaptability": "balanced",
    "randomize_attack_order": true,
    "adaptive_payloads": true,
    "mimic_human_behavior": true,
    "show_ai_reasoning": true
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `targets` | `string[]` | Yes | Target IPs, URLs, or CIDR ranges |
| `scan_type` | `string` | Yes | `basic`, `advanced`, `web`, `credentialed`, `compliance`, `discovery`, `ai-agentic` |
| `profile` | `string` | Yes | `quick`, `standard`, `full`, `custom` |
| `template_selectors` | `string` | No | JSON string for Nuclei template filter |
| `auth_credential_id` | `uint` | No | Auth credential ID (must belong to current user) |
| `schedule` | `string` | No | `now`, `schedule` |
| `scheduled_date` | `string` | No | ISO8601 date if scheduled |
| `scheduled_time` | `string` | No | HH:mm if scheduled |
| `description` | `string` | No | Notes about this scan (max 500 chars) |
| `credentials.enabled` | `bool` | No | Enable credentialed scanning |
| `credentials.auth_type` | `string` | No | `ssh-key`, `username-password`, `api-token`, `certificate` |
| `stealth.user_agent_mode` | `string` | No | `random`, `chrome`, `firefox`, `safari`, `edge`, `custom` |
| `stealth.enable_cookies` | `bool` | No | Maintain session cookies |
| `stealth.human_like_delay` | `bool` | No | Add random delays |
| `stealth.delay_min` | `int` | No | Min delay seconds (default: 1) |
| `stealth.delay_max` | `int` | No | Max delay seconds (default: 5) |
| `stealth.randomize_order` | `bool` | No | Randomize scan order |
| `ai_agentic` | `object` | No | AI-Agentic Anti-Pattern config |

**Response 201:**

```json
{
  "id": 1,
  "scan_group_id": "sg-1",
  "source_scan_id": null,
  "run_number": 1,
  "targets": ["192.168.1.0/24", "example.com"],
  "scan_type": "web",
  "profile": "standard",
  "status": "pending",
  "progress": {
    "completed": 0,
    "total": 0,
    "failed": 0
  },
  "config": {},
  "created_by": 1,
  "created_at": "2026-05-01T10:00:00Z",
  "updated_at": "2026-05-01T10:00:00Z"
}
```

### GET /api/v1/scans

List scans. Admin can see all scans; regular users see only their own.

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `status` | `string` | `all` | Filter: `pending`, `running`, `completed`, `failed`, `cancelled`, `aborted`, `partial_failure` |
| `scan_type` | `string` | `all` | Filter by scan type |
| `target` | `string` | — | Search by target address |
| `owner` | `uint` | — | Filter by creator user ID |
| `search` | `string` | — | Search across target and description |
| `page` | `int` | `1` | Pagination page |
| `limit` | `int` | `20` | Items per page |
| `sort` | `string` | `-created_at` | Sort field with prefix `-` for DESC |

**Response 200:**

```json
{
  "data": [
    {
      "id": 1,
      "scan_group_id": "sg-1",
      "source_scan_id": null,
      "run_number": 1,
      "targets": ["192.168.1.0/24"],
      "scan_type": "web",
      "profile": "full",
      "status": "running",
      "progress": {
        "completed": 5,
        "total": 20,
        "failed": 0
      },
      "created_by": 1,
      "created_at": "2026-05-01T10:00:00Z",
      "updated_at": "2026-05-01T10:05:00Z",
      "started_at": "2026-05-01T10:00:30Z",
      "completed_at": null,
      "duration": null
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 42
  }
}
```

### GET /api/v1/scans/my

List scans owned by the current authenticated user.

Same query params and response as `GET /api/v1/scans`.

### GET /api/v1/scans/{id}

Get scan detail by ID. Must be owner or admin.

**Response 200:**

```json
{
  "id": 1,
  "scan_group_id": "sg-1",
  "source_scan_id": null,
  "run_number": 1,
  "targets": ["192.168.1.0/24"],
  "scan_type": "web",
  "profile": "full",
  "status": "running",
  "progress": {
    "completed": 5,
    "total": 20,
    "failed": 0
  },
  "auth_credential_id": 1,
  "schedule": "now",
  "scheduled_date": null,
  "scheduled_time": null,
  "description": "Weekly web scan",
  "config": {},
  "created_by": 1,
  "created_at": "2026-05-01T10:00:00Z",
  "updated_at": "2026-05-01T10:05:00Z",
  "started_at": "2026-05-01T10:00:30Z",
  "completed_at": null,
  "duration": null,
  "hosts": [
    {
      "ip": "192.168.1.1",
      "status": "up",
      "open_ports": 5,
      "vulns": 3,
      "hostname": "web.example.com"
    }
  ],
  "findings": [],
  "logs": [],
  "error_message": null
}
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

### PATCH /api/v1/scans/{id}/pause

Pause a running scan.

**Response 200:**

```json
{
  "id": 1,
  "status": "paused",
  "updated_at": "2026-05-01T10:10:00Z"
}
```

### PATCH /api/v1/scans/{id}/resume

Resume a paused scan.

**Response 200:**

```json
{
  "id": 1,
  "status": "running",
  "updated_at": "2026-05-01T10:11:00Z"
}
```

### POST /api/v1/scans/{id}/rerun

Rerun a scan with the same parameters. Source scan must be in terminal state: `completed`, `failed`, `cancelled`, or `aborted`. The new scan shares the same `scan_group_id` as the source.

**Request:** (body optional — jika kosong, copy parameter dari scan sebelumnya)

```json
{
  "targets": ["192.168.1.0/24"],
  "template_selectors": "{\"severity\":[\"high\",\"critical\"]}",
  "auth_credential_id": 1
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `targets` | `string[]` | No | Override targets (default: copy from source scan) |
| `template_selectors` | `string` | No | Override template selectors |
| `auth_credential_id` | `uint` | No | Override auth credential |

**Response 201:**

```json
{
  "id": 2,
  "scan_group_id": "sg-1",
  "source_scan_id": 1,
  "run_number": 2,
  "targets": ["192.168.1.0/24"],
  "status": "pending",
  "progress": {
    "completed": 0,
    "total": 0,
    "failed": 0
  },
  "created_at": "2026-05-01T10:15:00Z",
  "updated_at": "2026-05-01T10:15:00Z"
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
    "scan_group_id": "sg-1",
    "target": "192.168.1.1",
    "template_id": "CVE-2024-3094",
    "finding": {
      "name": "SQL Injection in Login Form",
      "severity": "critical",
      "cve_id": "CVE-2024-3094",
      "cvss_score": 9.8,
      "description": "SQL injection vulnerability found in /login.php endpoint",
      "remediation": "Use parameterized queries or prepared statements",
      "category": "OWASP Top 10 - A03:2021",
      "affected_url": "https://example.com/api/auth/login",
      "request_header": "POST /api/auth/login HTTP/1.1\nHost: example.com\nContent-Type: application/x-www-form-urlencoded",
      "request_body": "email=admin%27+OR+1%3D1--&password=test",
      "response_header": "HTTP/1.1 200 OK\nContent-Type: text/html",
      "response_body": "<html><body>Welcome admin</body></html>",
      "host": "192.168.1.1",
      "port": 443
    },
    "created_at": "2026-05-01T10:05:00Z"
  }
]
```

### GET /api/v1/scans/{scanId}/results/{findingId}

Get single finding detail.

**Response 200:** (single finding object as above nested in the `finding` field)

### GET /api/v1/scans/{id}/logs

Get scan execution logs.

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

### GET /api/v1/scans/{id}/progress

Get current scan progress (used by progress page during active scan).

**Response 200:**

```json
{
  "scan_id": 1,
  "status": "running",
  "progress": {
    "completed": 5,
    "total": 20,
    "failed": 0
  },
  "current_phase": "vuln-scanning",
  "started_at": "2026-05-01T10:00:30Z",
  "estimated_remaining": "5m 30s"
}
```

### GET /api/v1/scans/{id}/history

Get all scan runs sharing the same `scan_group_id` (for history chain).

**Response 200:**

```json
{
  "scan_group_id": "sg-1",
  "runs": [
    {
      "id": 1,
      "run_number": 1,
      "source_scan_id": null,
      "status": "completed",
      "progress": { "completed": 20, "total": 20, "failed": 0 },
      "findings_count": 12,
      "created_at": "2026-05-01T10:00:00Z",
      "duration": "28m 14s"
    },
    {
      "id": 2,
      "run_number": 2,
      "source_scan_id": 1,
      "status": "running",
      "progress": { "completed": 5, "total": 20, "failed": 0 },
      "findings_count": 3,
      "created_at": "2026-05-05T14:00:00Z",
      "duration": null
    }
  ]
}
```

### DELETE /api/v1/scans/{id}

Soft-delete (trash) a scan. Must be owner or admin.

**Response:** 204 No Content

### GET /api/v1/scans/trash

List soft-deleted scans.

**Response 200:**

```json
{
  "data": [
    {
      "id": 5,
      "targets": ["10.0.0.0/24"],
      "status": "completed",
      "deleted_at": "2026-05-03T12:00:00Z",
      "deleted_by": "admin",
      "created_at": "2026-05-01T10:00:00Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 3 }
}
```

### POST /api/v1/scans/{id}/restore

Restore scan from trash.

**Response 200:** (restored scan object)

### DELETE /api/v1/scans/{id}/permanent

Permanently delete scan.

**Response:** 204 No Content

### POST /api/v1/scans/empty-trash

Permanently delete all trashed scans.

**Response:** 204 No Content

### GET /api/v1/scans/instances

Get all scan instances grouped by `scan_group_id`. Each instance shows the latest run.

**Response 200:**

```json
{
  "data": [
    {
      "scan_group_id": "sg-1",
      "targets": ["192.168.1.0/24"],
      "run_count": 3,
      "total_findings": 18,
      "last_run": {
        "id": 3,
        "run_number": 3,
        "status": "completed",
        "created_at": "2026-05-05T14:00:00Z"
      }
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 15 }
}
```

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

// Phase change (simulation phase)
{
  "type": "phase",
  "data": {
    "scan_id": 1,
    "phase": "vuln-scanning",
    "progress": 55
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

## 5. Templates

### GET /api/v1/templates

List available scan templates.

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `category` | `string` | `all` | Filter by category |
| `scan_type` | `string` | `all` | Filter by scan type |
| `severity` | `string` | — | Comma-separated: `info,low,medium,high,critical` |
| `search` | `string` | — | Search by name or description |
| `favorites` | `bool` | `false` | Show only favorites |
| `page` | `int` | `1` | Pagination page |
| `limit` | `int` | `20` | Items per page |

**Response 200:**

```json
{
  "data": [
    {
      "id": 1,
      "name": "CVE-2024-3094 Detection",
      "description": "Detects XZ backdoor vulnerability",
      "severity": "critical",
      "tags": ["cve", "rce", "xz"],
      "category": "vulnerability",
      "scan_type": "web",
      "profile": "full",
      "version": "1.0",
      "content": "id: xz-backdoor\ninfo:\n  name: XZ Backdoor Detection\n  severity: critical\n...",
      "is_favorite": false,
      "created_at": "2026-01-15T00:00:00Z",
      "updated_at": "2026-01-15T00:00:00Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 156 }
}
```

### GET /api/v1/templates/{id}

Get template detail.

**Response 200:** (single template object)

### POST /api/v1/templates

Create a new template.

**Request:**

```json
{
  "name": "Custom API Security Scan",
  "description": "Checks for common API vulnerabilities",
  "severity": "high",
  "tags": ["api", "owasp", "rest"],
  "category": "vulnerability",
  "scan_type": "web",
  "profile": "full",
  "content": "id: custom-api-scan\n..."
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | Yes | Template name |
| `description` | `string` | No | Description |
| `severity` | `string` | Yes | `info`, `low`, `medium`, `high`, `critical` |
| `tags` | `string[]` | No | Search tags |
| `category` | `string` | Yes | Template category |
| `scan_type` | `string` | Yes | `basic`, `advanced`, `web`, `credentialed`, `compliance`, `discovery` |
| `profile` | `string` | Yes | `quick`, `standard`, `full` |
| `content` | `string` | No | Nuclei YAML template content |

**Response 201:** (template object)

### PUT /api/v1/templates/{id}

Update template.

**Response 200:** (updated template object)

### DELETE /api/v1/templates/{id}

Delete template.

**Response:** 204 No Content

### PATCH /api/v1/templates/{id}/favorite

Toggle favorite status.

**Request:**

```json
{
  "is_favorite": true
}
```

**Response 200:** (updated template object)

---

## 6. Tickets

### GET /api/v1/tickets

List tickets with filters.

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `status` | `string` | `all` | Filter: `open`, `in_progress`, `fixed`, `verified`, `wont_fix` |
| `priority` | `string` | `all` | Filter: `critical`, `high`, `medium`, `low` |
| `assigned_to` | `uint` | — | Filter by assigned user ID |
| `scan_id` | `uint` | — | Filter by scan ID |
| `search` | `string` | — | Search title |
| `sort` | `string` | `-updated_at` | Sort field |
| `page` | `int` | `1` | Pagination page |
| `limit` | `int` | `20` | Items per page |

**Response 200:**

```json
{
  "data": [
    {
      "id": 1,
      "ticket_code": "TKT-001",
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
      "vulnerability_id": 1,
      "scan_id": 1,
      "comments": []
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 8 }
}
```

### GET /api/v1/tickets/{id}

Get ticket detail with all comments.

**Response 200:** (single ticket object with comments array)

### POST /api/v1/tickets

Create a new remediation ticket.

**Request:**

```json
{
  "vulnerability_id": 1,
  "scan_id": 1,
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
| `vulnerability_id` | `uint` | Yes | Reference to scan finding ID |
| `scan_id` | `uint` | Yes | Reference to scan ID |
| `title` | `string` | Yes | Ticket title (min 5 chars) |
| `description` | `string` | Yes | Ticket description (min 10 chars) |
| `priority` | `string` | Yes | `critical`, `high`, `medium`, `low` |
| `assigned_to` | `uint` | No | User ID to assign |
| `due_date` | `string` (ISO8601) | No | Due date (default from SLA) |
| `remediation` | `string` | No | Remediation steps |
| `cve_id` | `string` | No | CVE identifier |
| `cvss_score` | `float` | No | CVSS score (0.0 – 10.0) |

**Response 201:** (ticket object)

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

### GET /api/v1/tickets/stats

Ticket statistics for badges and overview.

**Response 200:**

```json
{
  "total": 8,
  "by_status": {
    "open": 3,
    "in_progress": 2,
    "fixed": 2,
    "verified": 0,
    "wont_fix": 1
  },
  "by_priority": {
    "critical": 2,
    "high": 3,
    "medium": 2,
    "low": 1
  },
  "overdue": 1
}
```

### GET /api/v1/tickets/overdue

List overdue tickets.

**Response 200:** (array of tickets past due_date)

---

## 7. Auth Credentials

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
  "last_verified_at": null,
  "created_at": "2026-05-01T10:00:00Z",
  "updated_at": "2026-05-01T10:00:00Z"
}
```

### GET /api/v1/auth-credentials

List auth credentials for current user.

**Response 200:** (array of credential objects)

### GET /api/v1/auth-credentials/{id}

Get single auth credential detail. Must be owner.

**Response 200:** (single credential object without sensitive config details)

### PUT /api/v1/auth-credentials/{id}

Update auth credential.

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

### POST /api/v1/findings/{id}/false-positive

Mark a finding as false positive.

**Request:**

```json
{
  "note": "This is a false alarm triggered by WAF interference"
}
```

**Response 200:**

```json
{
  "id": 1,
  "is_false_positive": true,
  "false_positive_note": "This is a false alarm triggered by WAF interference",
  "updated_at": "2026-05-01T10:10:00Z"
}
```

---

## 8. Reports

### GET /api/v1/reports

List generated reports.

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `search` | `string` | — | Search by title or description |
| `type` | `string` | `all` | Filter by report type |
| `page` | `int` | `1` | Pagination page |
| `limit` | `int` | `20` | Items per page |

**Response 200:**

```json
{
  "data": [
    {
      "id": 1,
      "title": "Weekly Security Scan Report",
      "type": "scan",
      "scan_id": 1,
      "status": "completed",
      "summary": {
        "total_vulns": 12,
        "critical": 2,
        "high": 4,
        "medium": 4,
        "low": 2
      },
      "created_by": 1,
      "created_at": "2026-05-01T10:00:00Z",
      "updated_at": "2026-05-01T10:05:00Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 5 }
}
```

### GET /api/v1/reports/{id}

Get report detail.

**Response 200:** (full report object)

### POST /api/v1/reports/generate

Generate a new report from a scan.

**Request:**

```json
{
  "scan_id": 1,
  "type": "summary",
  "format": "html",
  "include_findings": true,
  "include_remediation": true
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `scan_id` | `uint` | Yes | Scan ID to generate report from |
| `type` | `string` | Yes | `summary`, `detailed`, `compliance`, `executive` |
| `format` | `string` | Yes | `html`, `pdf`, `json`, `csv` |
| `include_findings` | `bool` | No | Include finding details |
| `include_remediation` | `bool` | No | Include remediation steps |

**Response 201:** (report object)

### GET /api/v1/reports/{id}/export

Export/Download report in specified format.

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `format` | `string` | `html` | `html`, `csv`, `json`, `pdf`, `nessus`, `markdown` |

**Response:** File download with appropriate Content-Type header.

---

## 9. Settings

### GET /api/v1/settings

Get all system settings.

**Response 200:**

```json
{
  "general": {
    "system_name": "SentinelScan",
    "default_scan_profile": "standard",
    "max_concurrent_scans": 5,
    "scan_timeout_minutes": 120,
    "auto_delete_days": 30,
    "retention_period_days": 90
  },
  "notifications": {
    "email_enabled": true,
    "scan_complete": true,
    "critical_vuln_found": true,
    "scan_failed": true,
    "weekly_summary": false,
    "webhook_enabled": false,
    "webhook_url": ""
  },
  "security": {
    "two_factor_required": false,
    "session_timeout_minutes": 30,
    "password_min_length": 8,
    "password_require_special": true,
    "api_rate_limit_per_minute": 60,
    "cors_allowed_origins": ["http://localhost:5173"]
  }
}
```

### PUT /api/v1/settings

Update general settings.

**Request:**

```json
{
  "system_name": "SentinelScan Pro",
  "default_scan_profile": "full",
  "max_concurrent_scans": 10,
  "scan_timeout_minutes": 180,
  "auto_delete_days": 60,
  "retention_period_days": 180
}
```

**Response 200:** (updated settings object)

### GET /api/v1/settings/notifications

Get notification settings.

### PUT /api/v1/settings/notifications

Update notification settings.

**Request:**

```json
{
  "email_enabled": true,
  "scan_complete": true,
  "critical_vuln_found": true,
  "scan_failed": true,
  "weekly_summary": false,
  "webhook_enabled": true,
  "webhook_url": "https://hooks.slack.com/services/xxx"
}
```

### POST /api/v1/settings/notifications/test

Send a test notification.

**Request:**

```json
{
  "channel": "email"
}
```

**Response 200:**

```json
{
  "status": "sent",
  "message": "Test notification sent successfully"
}
```

### GET /api/v1/settings/security

Get security settings.

### PUT /api/v1/settings/security

Update security settings.

**Request:**

```json
{
  "two_factor_required": true,
  "session_timeout_minutes": 60,
  "password_min_length": 12,
  "password_require_special": true,
  "api_rate_limit_per_minute": 120,
  "cors_allowed_origins": ["http://localhost:5173", "https://app.sentinelscan.com"]
}
```

### POST /api/v1/settings/security/regenerate-keys

Regenerate API keys.

**Response 200:**

```json
{
  "api_key": "sk_new_generated_key_here",
  "api_secret": "new_secret_here"
}
```

### GET /api/v1/integrations

List external integrations and their connection status.

**Response 200:**

```json
{
  "data": [
    {
      "id": 1,
      "name": "Slack",
      "type": "notification",
      "connected": false,
      "config": { "webhook_url": "..." },
      "created_at": "2026-01-01T00:00:00Z"
    },
    {
      "id": 2,
      "name": "Jira",
      "type": "ticketing",
      "connected": true,
      "config": { "url": "https://jira.example.com", "project": "SEC" },
      "created_at": "2026-01-15T00:00:00Z"
    }
  ]
}
```

### POST /api/v1/integrations

Add a new integration configuration.

**Request:**

```json
{
  "name": "DefectDojo",
  "type": "ticketing",
  "config": {
    "url": "https://defectdojo.example.com",
    "api_key": "dd-api-key"
  }
}
```

### POST /api/v1/integrations/{id}/connect

Connect/enable an integration.

**Response 200:** (updated integration)

### POST /api/v1/integrations/{id}/disconnect

Disconnect/disable an integration.

**Response 200:** (updated integration)

---

## 10. Audit Logs

### GET /api/v1/logs

Get audit logs.

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `level` | `string` | `all` | Filter: `info`, `warn`, `error`, `critical` |
| `category` | `string` | — | Filter by category/module |
| `user` | `string` | — | Filter by username |
| `from` | `string` (ISO8601) | — | Start date |
| `to` | `string` (ISO8601) | — | End date |
| `search` | `string` | — | Free text search |
| `page` | `int` | `1` | Pagination page |
| `limit` | `int` | `50` | Items per page |

**Response 200:**

```json
{
  "data": [
    {
      "id": 1,
      "timestamp": "2026-05-01T10:00:00Z",
      "level": "info",
      "category": "auth",
      "user": "admin",
      "action": "user_login",
      "message": "User admin logged in from IP 192.168.1.100",
      "metadata": {
        "ip": "192.168.1.100",
        "user_agent": "Mozilla/5.0..."
      }
    }
  ],
  "meta": { "page": 1, "limit": 50, "total": 1200 }
}
```

### GET /api/v1/logs/access

Get access logs only (same params as above).

### GET /api/v1/logs/errors

Get error/critical logs only (same params as above).

### GET /api/v1/logs/stats

Log statistics for visual panels.

**Response 200:**

```json
{
  "total": 1200,
  "by_level": { "info": 800, "warn": 250, "error": 120, "critical": 30 },
  "by_category": { "auth": 400, "scan": 350, "system": 200, "api": 150, "settings": 100 },
  "by_user": { "admin": 500, "user-1": 300, "user-2": 200 }
}
```

### GET /api/v1/logs/export

Export logs.

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `type` | `string` | `all` | `all`, `access`, `error` |
| `format` | `string` | `json` | `json`, `csv` |
| `from` | `string` | — | Start date filter |
| `to` | `string` | — | End date filter |

**Response:** File download.

### DELETE /api/v1/logs

Clear all logs.

**Response:** 204 No Content

### DELETE /api/v1/logs/access

Clear access logs.

**Response:** 204 No Content

### DELETE /api/v1/logs/errors

Clear error logs.

**Response:** 204 No Content

---

## 11. Dashboard

### GET /api/v1/dashboard/summary

Main summary statistics.

**Response 200:**

```json
{
  "total_assets": 156,
  "total_scans": 42,
  "total_vulnerabilities": 1287,
  "critical": 23,
  "high": 89,
  "medium": 345,
  "low": 830,
  "resolved": 456,
  "compliance_score": 72.5
}
```

### GET /api/v1/dashboard/security-posture

Security posture score and trend.

**Response 200:**

```json
{
  "score": 72.5,
  "grade": "C",
  "trend": "up",
  "improvement": "Improved by 5 points since last week"
}
```

### GET /api/v1/dashboard/scanner-status

Scanner engine status.

**Response 200:**

```json
{
  "online": true,
  "engines_active": 3,
  "engines_total": 4,
  "last_scan_time": "2026-05-01T10:00:00Z",
  "queue_length": 2,
  "engines": [
    { "name": "Nuclei Engine", "status": "active" },
    { "name": "Port Scanner", "status": "active" },
    { "name": "Web Scanner", "status": "active" },
    { "name": "Compliance Engine", "status": "idle" }
  ]
}
```

### GET /api/v1/dashboard/active-scans

Currently running scans.

**Response 200:**

```json
[
  {
    "id": 1,
    "targets": ["192.168.1.0/24"],
    "status": "running",
    "progress": {
      "completed": 8,
      "total": 20,
      "failed": 0
    },
    "current_phase": "vuln-scanning",
    "started_at": "2026-05-01T10:00:30Z",
    "estimated_remaining": "5m 30s"
  }
]
```

### GET /api/v1/dashboard/scan-trend

Chart data for scans and vulnerabilities over time.

**Response 200:**

```json
[
  {
    "date": "2026-04-25",
    "scans": 3,
    "vulnerabilities": 45
  },
  {
    "date": "2026-04-26",
    "scans": 5,
    "vulnerabilities": 78
  }
]
```

### GET /api/v1/dashboard/top-cves

Top CVEs by severity.

**Response 200:**

```json
[
  {
    "cve_id": "CVE-2024-3094",
    "severity": "critical",
    "cvss_score": 9.8,
    "affected_assets": 12,
    "name": "XZ Backdoor"
  },
  {
    "cve_id": "CVE-2025-1001",
    "severity": "critical",
    "cvss_score": 9.1,
    "affected_assets": 8,
    "name": "SQL Injection in Login"
  }
]
```

### GET /api/v1/dashboard/asset-breakdown

Asset distribution by category.

**Response 200:**

```json
[
  { "category": "Servers", "count": 42 },
  { "category": "Endpoints", "count": 68 },
  { "category": "Network", "count": 23 },
  { "category": "Cloud", "count": 15 },
  { "category": "Containers", "count": 8 }
]
```

### GET /api/v1/dashboard/compliance

Compliance framework scores.

**Response 200:**

```json
[
  {
    "framework": "PCI-DSS",
    "score": 85.5,
    "controls_passed": 45,
    "controls_total": 52
  },
  {
    "framework": "HIPAA",
    "score": 72.0,
    "controls_passed": 36,
    "controls_total": 50
  },
  {
    "framework": "CIS Benchmarks",
    "score": 68.5,
    "controls_passed": 89,
    "controls_total": 130
  }
]
```

### GET /api/v1/dashboard/recent-scans

Recent scans list.

**Response 200:**

```json
[
  {
    "id": 1,
    "targets": ["192.168.1.0/24"],
    "status": "completed",
    "findings_count": 12,
    "critical": 2,
    "high": 4,
    "medium": 4,
    "low": 2,
    "duration": "28m 14s",
    "created_at": "2026-05-01T10:00:00Z"
  }
]
```

---

## 12. Health

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

## 13. WebSocket Logs

### WS /ws/logs

Real-time audit log streaming.

**Connection:** `ws://localhost:8080/ws/logs?token=<jwt>`

**Messages:**

```json
{
  "type": "log",
  "data": {
    "id": 123,
    "timestamp": "2026-05-01T10:05:00Z",
    "level": "info",
    "category": "scan",
    "user": "admin",
    "action": "scan_completed",
    "message": "Scan #1 completed successfully"
  }
}
```

---

## 14. Field Naming Convention

All backend JSON fields use **snake_case**.

| Frontend (TypeScript) | Backend (JSON) |
|-----------------------|----------------|
| `scanId` | `scan_id` |
| `scanGroupId` | `scan_group_id` |
| `sourceScanId` | `source_scan_id` |
| `runNumber` | `run_number` |
| `scanType` | `scan_type` |
| `templateId` | `template_id` |
| `templateSelectors` | `template_selectors` |
| `authCredentialId` | `auth_credential_id` |
| `createdBy` | `created_by` |
| `createdAt` | `created_at` |
| `updatedAt` | `updated_at` |
| `startedAt` | `started_at` |
| `completedAt` | `completed_at` |
| `deletedAt` | `deleted_at` |
| `deletedBy` | `deleted_by` |
| `assignedTo` | `assigned_to` |
| `assignedTeam` | `assigned_team` |
| `dueDate` | `due_date` |
| `cvssScore` | `cvss_score` |
| `cveId` | `cve_id` |
| `vulnerabilityId` | `vulnerability_id` |
| `ticketCode` | `ticket_code` |
| `loginUrl` | `login_url` |
| `verifyUrl` | `verify_url` |
| `verifyPattern` | `verify_pattern` |
| `userId` | `user_id` |
| `authorId` | `author_id` |
| `errorMessage` | `error_message` |
| `falsePositiveNote` | `false_positive_note` |
| `lastVerifiedAt` | `last_verified_at` |
| `scanType` | `scan_type` |
| `userAgentMode` | `user_agent_mode` |
| `enableCookies` | `enable_cookies` |
| `humanLikeDelay` | `human_like_delay` |
| `randomizeOrder` | `randomize_order` |
| `aiAdaptability` | `ai_adaptability` |
| `randomizeAttackOrder` | `randomize_attack_order` |
| `adaptivePayloads` | `adaptive_payloads` |
| `mimicHumanBehavior` | `mimic_human_behavior` |
| `showAIReasoning` | `show_ai_reasoning` |
| `twoFactorEnabled` | `two_factor_enabled` |
| `sessionTimeout` | `session_timeout` |
| `securityScore` | `security_score` |
| `isFavorite` | `is_favorite` |

---

## 15. Enums

### UserRole

| Value | Description |
|-------|-------------|
| `super_admin` | Full system access |
| `admin` | Administrative access |
| `user` | Standard user |
| `viewer` | Read-only access |

### UserStatus

| Value | Description |
|-------|-------------|
| `active` | Active account |
| `inactive` | Inactive account |
| `suspended` | Suspended account |

### ScanStatus (API)

```
pending → running → completed
                  ↘ partial_failure
                  ↘ failed
                  ↘ cancelled
                  ↘ aborted
```

| Value | Description |
|-------|-------------|
| `pending` | Scan created, not yet started |
| `running` | Scan in progress |
| `completed` | All tasks finished successfully |
| `partial_failure` | Some tasks failed |
| `failed` | All tasks failed |
| `cancelled` | Scan stopped by user before completion |
| `aborted` | Scan stopped by system/policy/WAF/runtime condition |
| `paused` | Scan temporarily paused |

Note: Frontend uses simulation phases internally (`queued`, `host-discovery`, `port-scanning`, `service-detection`, `vuln-scanning`, `report-generation`). These are mapped from the `running` status on the backend side.

### ScanType

| Value | Description |
|-------|-------------|
| `basic` | Basic Network Scan |
| `advanced` | Advanced Scan |
| `web` | Web Application Scan |
| `credentialed` | Credentialed Patch Audit |
| `compliance` | Compliance Audit |
| `discovery` | Host Discovery |
| `ai-agentic` | AI-Agentic Anti-Pattern |

### ScanProfile

| Value | Description |
|-------|-------------|
| `quick` | Fast scan (~5 min) |
| `standard` | Balanced depth/speed (~15 min) |
| `full` | Thorough analysis (~45 min) |
| `custom` | Manual selection (variable) |

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

### LogLevel

`info` | `warn` | `error` | `critical`

### ReportType

`summary` | `detailed` | `compliance` | `executive`

### ExportFormat

`html` | `csv` | `json` | `pdf` | `nessus` | `markdown`

### IntegrationType

`notification` | `ticketing` | `log_management` | `remediation` | `threat_intel`
