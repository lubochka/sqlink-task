# Transaction Workflow Engine — Improvement Plan V2

## No-Code Explanation

After the initial 4 phases of improvements (Docker healthchecks, FluentValidation, ProblemDetails, Mermaid visualization, README updates), a deeper code review reveals these remaining issues:

**Approach D has a design flaw**: The WorkflowEngine (supposed to be generic) directly depends on ITransactionRepository to count retries. This violates the "engine doesn't know what a Transaction is" principle. The fix: pass the retry count FROM the service layer (like Approach B already does correctly).

**Approaches B & D lack a safety net**: If an unexpected exception happens (database crash, network issue), there's no middleware to catch it. Approach A has one, B/D don't. Unhandled exceptions would return ugly 500 errors.

**Approach A uses a non-standard error format**: While B/D use RFC 7807 ProblemDetails (industry standard), Approach A returns a custom `ErrorResponse` object. This is inconsistent and less professional.

**All approaches are missing a health check endpoint**: The README references `/health` but it doesn't exist. This is critical for Docker, Kubernetes, and load balancers.

**All approaches leak secrets in appsettings.json**: Even though docker-compose uses `.env`, the appsettings.json still has the hardcoded password.

**Infrastructure references Application**: The dependency direction is wrong — Infrastructure should only reference Domain.

---

## Requirements

| # | Requirement | Applies To | Category |
|---|-------------|-----------|----------|
| R1 | Fix D's WorkflowEngine to not depend on ITransactionRepository | D | Architecture |
| R2 | Add global exception handler middleware to B and D | B, D | Resilience |
| R3 | Upgrade A's ExceptionHandler to use ProblemDetails | A | API Standards |
| R4 | Add /health endpoint with DB connectivity check | A, B, D | DevOps |
| R5 | Remove hardcoded password from appsettings.json | A, B, D | Security |
| R6 | Add .env.example for onboarding | A, B, D | DX |
| R7 | Fix Infrastructure→Application dependency direction | A, B, D | Architecture |

---

## Validation: Plan vs Requirements

- [x] R1: Phase 1 — Refactor D's engine + service + tests
- [x] R2: Phase 2 — Add GlobalExceptionMiddleware to B, D
- [x] R3: Phase 2 — Refactor A's middleware to ProblemDetails
- [x] R4: Phase 2 — HealthCheck registration + endpoint for all 3
- [x] R5: Phase 3 — Replace passwords with env var placeholders
- [x] R6: Phase 3 — Create .env.example for all 3
- [x] R7: Phase 3 — Fix csproj dependency direction

---

## Positive Examples (Expected After)

### D's Engine — Clean Generic Interface (R1)
```csharp
// BEFORE: Engine knows about transactions (BAD)
public WorkflowEngine(IWorkflowRepository workflowRepo, ITransactionRepository transactionRepo)

// AFTER: Engine is purely generic (GOOD)
public WorkflowEngine(IWorkflowRepository workflowRepo)
// priorTransitionCount passed from TransactionService like B does
```

### B/D Global Exception Safety (R2)
```
// An unexpected SqlException occurs:
→ 500 Internal Server Error
{
  "type": "https://httpstatuses.io/500",
  "title": "Internal Server Error",
  "status": 500,
  "detail": "An unexpected error occurred."
}
// NOT: a raw stack trace or empty response
```

### A's ProblemDetails Upgrade (R3)
```
POST /transactions/1/transition  {"targetStatus":"COMPLETED"}
→ 400 Bad Request
{
  "type": "https://httpstatuses.io/400",
  "title": "InvalidTransition",
  "status": 400,
  "detail": "Transition from 'CREATED' to 'COMPLETED' is not allowed.",
  "allowedTransitions": ["VALIDATED"],
  "currentStatus": "CREATED"
}
```

### Health Check (R4)
```
GET /health → 200 OK  "Healthy"
GET /health → 503 Service Unavailable  "Unhealthy" (if DB is down)
```

## Negative Examples (What We DON'T Want)

### BAD: Engine depends on specific entity repo
```csharp
// D's WorkflowEngine calling:
await _transactionRepo.GetTransitionCountAsync(transactionId, ...)
// This means you can't reuse the engine for "orders" without changing it
```

### BAD: Unhandled exception in B/D
```
// Database timeout → raw 500 with no structure
HTTP/1.1 500 Internal Server Error
Content-Length: 0
```

### BAD: Hardcoded password in committed file
```json
"DefaultConnection": "...Password=YourStrong!Passw0rd..."
```

---

## Phases

### Phase 1: D's Engine Purity Fix (R1)
**Scope**: Remove ITransactionRepository from D's WorkflowEngine, pass count from service
**Files changed**: D: WorkflowEngine.cs, IWorkflowEngine.cs, TransactionService.cs, IRepositories.cs, WorkflowEngineTests.cs
**Recovery**: Self-contained in D only

### Phase 2: API Resilience (R2, R3, R4)
**Scope**: Global exception middleware for B/D, ProblemDetails for A, health checks for all
**Files changed**: B+D: new GlobalExceptionMiddleware.cs + Program.cs, A: ExceptionHandlerMiddleware.cs + Program.cs, All: Program.cs (health checks)
**Recovery**: Independent per approach

### Phase 3: Config & Dependencies (R5, R6, R7)
**Scope**: Security + DX + clean dependency graph
**Files changed**: All: appsettings.json, new .env.example, Infrastructure.csproj
**Recovery**: Zero code impact, config only

---

## State Tracking

| Phase | Status | Checkpoint |
|-------|--------|------------|
| Phase 1 | ✅ DONE | D: WorkflowEngine, IWorkflowEngine, TransactionService, Tests — all updated |
| Phase 2 | NOT_STARTED | |
| Phase 3 | NOT_STARTED | |
