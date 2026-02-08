# Transaction Workflow Engine — Improvement Plan

## No-Code Explanation

We have 3 implementations of a Transaction Workflow Engine (a backend that moves transactions through statuses like CREATED → VALIDATED → PROCESSING → COMPLETED).

**Approach A** (Vanilla): Uses exceptions for error handling, simple structure, no multi-tenant support.
**Approach B** (Multi-Tenant DNA): Uses `DataProcessResult` pattern, supports multiple entity types via `EntityType` discriminator, stores JSON rules.
**Approach D** (Strategic Hybrid): Uses `DataProcessResult` like B but without multi-tenant, includes JSON metadata, balances simplicity with power.

An expert review identified specific improvements needed across all three. We will apply them systematically.

---

## Requirements from Analysis Document

| # | Requirement | Applies To | Category |
|---|-------------|-----------|----------|
| R1 | Docker healthcheck — API waits for DB readiness | A, B, D | DevOps |
| R2 | Start script (start.sh) for one-command launch | A, B, D | DevOps |
| R3 | Secret management — env vars instead of hardcoded passwords | A, B, D | Security |
| R4 | Input validation with FluentValidation | A, B, D | Security |
| R5 | Concurrency: explicit DbUpdateConcurrencyException handling | A (repos already handle, but engine needs it) | Security |
| R6 | RFC 7807 ProblemDetails error format | B, D (ResultMapper) | API Quality |
| R7 | Workflow visualization endpoint (Mermaid export) | A, B, D | Feature |
| R8 | Fix compilation bug: duplicate `var history` in B's TransactionService | B | Bug Fix |
| R9 | Updated README with new features documented | A, B, D | Documentation |

---

## Validation: Plan vs Requirements

- [x] R1: Phase 1 — docker-compose.yml with healthcheck for all 3
- [x] R2: Phase 1 — start.sh for all 3
- [x] R3: Phase 1 — .env file + env var references in docker-compose
- [x] R4: Phase 2 — FluentValidation validators + Program.cs registration
- [x] R5: Phase 2 — Approach A already handles in repo; verify
- [x] R6: Phase 3 — ProblemDetails in ResultMapper for B, D
- [x] R7: Phase 3 — Admin/workflow/visualize endpoint for all 3
- [x] R8: Phase 2 — Fix B's duplicate variable
- [x] R9: Phase 4 — Update READMEs

---

## Positive Examples (Expected After Improvements)

### Docker Start (R1+R2+R3)
```bash
# User runs ONE command:
$ ./start.sh
🚀 Starting Transaction Engine...
✅ Systems GO! API running at http://localhost:5000/swagger

# SQL Server is fully ready before API starts (healthcheck)
# Password comes from .env file, never hardcoded
```

### Input Validation (R4)
```
POST /transactions
{ "amount": -50, "currency": "usd1", "description": "<script>alert('xss')</script>" }

→ 400 Bad Request
{
  "type": "https://httpstatuses.io/400",
  "title": "Validation Error",
  "status": 400,
  "errors": {
    "Amount": ["Amount must be greater than 0."],
    "Currency": ["Currency must be a 3-letter uppercase ISO code."]
  }
}
```

### ProblemDetails Error (R6)
```
POST /transactions/1/transition
{ "targetStatus": "COMPLETED" }

→ 400 Bad Request
{
  "type": "https://httpstatuses.io/400",
  "title": "ValidationError",
  "status": 400,
  "detail": "Transition from 'CREATED' to 'COMPLETED' is not allowed.",
  "allowedTransitions": ["VALIDATED"],
  "currentStatus": "CREATED"
}
```

### Workflow Visualization (R7)
```
GET /admin/workflow/visualize

→ 200 OK (text/plain)
graph TD
    CREATED -->|Validate transaction| VALIDATED
    VALIDATED -->|Begin processing| PROCESSING
    PROCESSING -->|Complete transaction| COMPLETED
    PROCESSING -->|Processing failed| FAILED
    FAILED -->|Retry after failure| VALIDATED
```

## Negative Examples (What We DON'T Want)

### Bad: API crashes on startup (race condition)
```
api_1  | Unhandled exception. Microsoft.Data.SqlClient.SqlException: 
api_1  |   Cannot open database "TransactionWorkflow" requested by the login.
```

### Bad: Hardcoded secrets in docker-compose
```yaml
SA_PASSWORD=YourStrong!Passw0rd  # ← This gets committed to git
```

### Bad: No validation allows garbage input
```
POST /transactions
{ "amount": 0, "currency": "" }
→ 201 Created  # ← Should be 400!
```

### Bad: Generic 500 error instead of structured response
```
→ 500 Internal Server Error
{ "error": "Internal server error" }
# Instead of a clear ProblemDetails response
```

---

## Phases

### Phase 1: DevOps & Security Foundation (docker-compose, start.sh, .env)
**Scope**: R1, R2, R3 — All approaches
**Files changed**: docker-compose.yml, new .env, new start.sh
**Recovery**: Self-contained, no code dependencies

### Phase 2: Input Validation + Bug Fixes
**Scope**: R4, R5, R8 — All approaches
**Files changed**: DTOs.cs (add validators), Program.cs (register FluentValidation), csproj (add package ref), B's TransactionService.cs (fix bug)
**Recovery**: Phase 1 not required, independent

### Phase 3: API Quality — ProblemDetails + Visualization Endpoint  
**Scope**: R6, R7 — ResultMapper for B/D, new admin endpoint for all
**Files changed**: ResultMapper.cs, AdminController.cs, IServices + AdminService
**Recovery**: Phase 1-2 not required, independent

### Phase 4: Documentation Updates
**Scope**: R9 — All approaches
**Files changed**: README.md for each approach
**Recovery**: Can be done anytime

---

## State Tracking

| Phase | Status | Checkpoint |
|-------|--------|------------|
| Phase 1 | NOT_STARTED | |
| Phase 2 | NOT_STARTED | |
| Phase 3 | NOT_STARTED | |
| Phase 4 | NOT_STARTED | |
