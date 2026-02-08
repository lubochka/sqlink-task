# Transaction Workflow Engine — Approach Analysis
## Using XIIGen V17 Skills to Tackle the Home Assignment

**Date:** 2026-02-08 | **Assignment:** Backend Home Assignment — Transaction Workflow Engine

---

## Understanding the Assignment (Plain Language)

You need to build a **backend service** that manages customer transactions, where each transaction moves through statuses (like CREATED → VALIDATED → PROCESSING → COMPLETED) — similar to how Jira tickets flow through stages. The critical requirement: **statuses and transitions must be data-driven, not hardcoded**. You configure them in the database, not in code.

**Core:** .NET 7+, SQL Server, Web API, EF Core/Dapper, domain logic outside controllers.
**Bonus:** Status history, caching, concurrency safety, admin endpoints, tests.

---

## The 4 Approaches

I've identified **4 distinct approaches** to solve this assignment, ranging from "exactly what they expect" to "showcase V17 philosophy as a competitive advantage."

---

### Approach A: "Textbook Clean Architecture" (Vanilla .NET)

**What it is:** Build exactly what the assignment asks, no more. Classical .NET Clean Architecture with EF Core, SQL Server, and service layer. No V17 involvement.

**Phases:**
1. Set up solution structure (API → Application → Domain → Infrastructure)
2. Domain models + EF Core migrations (Transactions, Statuses, Transitions tables)
3. Workflow engine service (single class validates transitions)
4. API controllers + DTOs
5. Seed data + bonus features (history, caching, concurrency)
6. Tests + README

**Pros:** Safe, expected, fast (~4 hours). Evaluator sees exactly what they asked for.
**Cons:** Nothing memorable. Looks like every other candidate's submission.
**Time:** 4-5 hours.

---

### Approach B: "DNA-Infused Clean Architecture" (V17 Philosophy, Traditional Tech)

**What it is:** Build with the assignment's required tech (SQL Server, EF Core), but infuse V17's **Freedom Machine philosophy** into the design. The workflow engine becomes a *generic state machine* — not just for transactions, but for ANY entity type. You demonstrate architectural thinking that goes beyond the requirements.

**Key V17 patterns applied:**
- **FREEDOM principle:** Statuses, transitions, AND the entity types they apply to are all dynamic
- **DNA-1 (Dynamic Documents):** Workflow configuration stored as flexible JSON in SQL, not rigid FK tables
- **DNA-6 (Generic Interfaces):** Repository pattern that could swap SQL Server for Elasticsearch without changing the workflow engine
- **DataProcessResult<T>:** Consistent success/failure returns (no exceptions for business logic)

**Phases:**
1. Solution setup + generic repository interfaces (inspired by IDatabaseService)
2. Domain: Generic workflow engine (works for transactions, orders, tickets — anything)
3. SQL Server implementation + EF Core with JSON columns for dynamic metadata
4. API layer with DataProcessResult pattern
5. Bonus: History as event log, caching with IMemoryCache, optimistic concurrency
6. Tests + README explaining the design philosophy

**Pros:** Shows senior-level thinking. The evaluator sees clean code PLUS architectural vision. Still uses their required tech stack.
**Cons:** Takes slightly longer. Might seem over-engineered if evaluator is junior.
**Time:** 5-7 hours.

---

### Approach C: "Full V17 Showcase" (V17 Stack Replacement)

**What it is:** Treat the assignment as a V17 project. Use the DRAWIO_TO_PROJECT_PLAN_GUIDE pipeline — imagine the assignment's workflow as a UML diagram, map to V17 skills, and generate using the skill library. Replace SQL Server with Elasticsearch, use MicroserviceBase, ObjectProcessor, the works.

**V17 skills used:**
- Skill 01 (Core Interfaces) + Skill 02 (ObjectProcessor) — foundation
- Skill 05 (Database Fabric) — with SQL Server provider
- Skill 08 (Flow Definition) — workflow as a DAG
- Skill 09 (Flow Orchestrator) — execution engine
- Skill 15 (API Gateway) — routing
- Skill 29 (Unit Testing) — test generation

**Phases:**
1. Extract V17 foundation (Skill 01 + 02)
2. Database Fabric with SQL Server provider (Skill 05)
3. Flow Definition adapted for state machine (Skill 08)
4. API Gateway + orchestrator (Skill 15 + 09)
5. Tests + documentation

**Pros:** Demonstrates a complete platform approach. Impressive if targeting a company that values system design.
**Cons:** **Violates the assignment requirements.** They asked for EF Core/Dapper, not Elasticsearch. They asked for simple tables, not a flow engine. Over-engineering penalty is real.
**Time:** 8-12 hours.

---

### Approach D: "Strategic Hybrid" (Assignment Core + V17 Abstraction Layer) ⭐ RECOMMENDED

**What it is:** Deliver the assignment exactly as specified (SQL Server, EF Core, clean architecture), then ADD a thin V17-inspired abstraction layer on top. The result looks like a traditional .NET project but has an inner engine that reveals deeper thinking.

**The strategy:** Build two layers:
1. **Inner Layer (assignment-compliant):** SQL Server + EF Core + standard repo pattern. Evaluator opens the project and sees exactly what they expect.
2. **Outer Layer (V17-inspired):** A generic `IWorkflowEngine<TEntity>` interface that the transaction workflow plugs into. The workflow rules are stored as dynamic JSON documents (using SQL JSON columns). This shows you think beyond the immediate requirement.

**V17 patterns applied (subtly):**
- **Freedom Machine test:** "Can a business user change the workflow without a developer?" → YES — all rules in DB
- **DataProcessResult<T>:** Instead of exceptions, return typed results
- **Generic interfaces:** `IWorkflowEngine`, `ITransitionValidator`, `IHistoryTracker` — swappable
- **ObjectProcessor pattern (simplified):** Workflow metadata stored as `Dictionary<string, object>` / JSON column
- **MicroserviceBase thinking:** Service inherits a base with logging, validation, event hooks built in

**Phases (detailed below):** 7 phases with save points after each.
**Pros:** Satisfies requirements perfectly, shows architectural maturity, demonstrates you can do more than asked without going off-track.
**Cons:** Slightly more complex README to explain.
**Time:** 6-8 hours.

---

## Recommended Approach: D — "Strategic Hybrid"

### Phase Plan (with Save Points)

#### Phase 1: Solution Structure + Foundation (30 min)
**What:** Create the .NET solution, projects, and base abstractions.
**Deliverables:**
- `TransactionWorkflow.API` (Web API project)
- `TransactionWorkflow.Application` (Services, interfaces)
- `TransactionWorkflow.Domain` (Models, workflow engine)
- `TransactionWorkflow.Infrastructure` (EF Core, SQL Server)
- `DataProcessResult<T>` record (from V17 Skill 01 pattern)
- `IWorkflowEngine<TEntity>` interface

**Save State:** Solution compiles, no functionality yet.

#### Phase 2: Domain Layer — Generic Workflow Engine (45 min)
**What:** Build the state machine engine as a pure domain service.
**Deliverables:**
- `WorkflowDefinition` — stores states + allowed transitions (as dynamic metadata)
- `WorkflowEngine` — validates transitions, returns DataProcessResult
- `TransitionValidator` — single responsibility: "is this transition allowed?"
- `WorkflowException` types (for truly exceptional cases)
- Domain models: Transaction (with status), WorkflowState, WorkflowTransition

**Key DNA Pattern:**
```
Workflow config = data in DB (FREEDOM)
Workflow engine = generic code (MACHINE)
```

**Save State:** Domain logic works in isolation (unit-testable with no DB).

#### Phase 3: Infrastructure — EF Core + SQL Server (45 min)
**What:** Implement the persistence layer.
**Deliverables:**
- `AppDbContext` with entity configurations
- Tables: Transactions, WorkflowStates, WorkflowTransitions, TransactionHistory
- `TransactionRepository` implementing generic interface
- `WorkflowConfigRepository` — loads workflow rules from DB
- Migration scripts
- Seed data (CREATED → VALIDATED → PROCESSING → COMPLETED + FAILED paths)

**DNA Pattern:**
- WorkflowTransitions table has a JSON `metadata` column for extensibility
- Transactions table has a JSON `customFields` column (future-proofing)

**Save State:** Database creates successfully, seed data loads. Can query transitions.

#### Phase 4: API Layer (30 min)
**What:** Wire up the endpoints.
**Deliverables:**
- `POST /transactions` — create new transaction (starts at initial state)
- `GET /transactions/{id}` — get transaction with current status
- `POST /transactions/{id}/transition` — attempt status change
- `GET /transactions/{id}/available-transitions` — list valid next states
- Consistent error responses using DataProcessResult mapping to HTTP codes

**Save State:** All 4 endpoints work. Can create, read, and transition transactions via Swagger.

#### Phase 5: Bonus Features (60 min)
**What:** Status history, caching, concurrency, admin.
**Deliverables:**
- **History:** TransactionHistory table + `GET /transactions/{id}/history`
- **Caching:** `CachedWorkflowConfigRepository` decorator (loads transitions once, cache-aside pattern)
- **Concurrency:** RowVersion on Transaction entity, EF Core optimistic concurrency check
- **Admin:** `POST /admin/workflow/states` + `POST /admin/workflow/transitions` with cache invalidation

**Save State:** All bonus features working. Full API functional.

#### Phase 6: Tests (45 min)
**What:** Unit + integration tests.
**Deliverables:**
- Unit tests for `WorkflowEngine` (valid transition, invalid transition, backward transition, unknown state)
- Unit tests for `TransitionValidator`
- Integration test for transition endpoint (using WebApplicationFactory + in-memory DB or TestContainers)
- Edge case tests: concurrent updates, empty workflow, circular transitions

**Save State:** All tests green. CI-ready.

#### Phase 7: Documentation + Polish (30 min)
**What:** README, Docker setup, final review.
**Deliverables:**
- README with: how to run, architecture diagram (text), design decisions, tradeoffs
- Docker Compose for SQL Server
- Swagger/OpenAPI documentation
- Design decisions section explaining the V17-inspired generic engine approach

**Save State:** Complete. Ready to push to GitHub.

---

## Validation: Does This Cover All Requirements?

| Requirement | Phase | How |
|---|---|---|
| .NET 7+ / .NET Core | Phase 1 | .NET 9 solution |
| SQL Server | Phase 3 | EF Core + SQL Server in Docker |
| Web API | Phase 4 | ASP.NET Core minimal API or controllers |
| EF Core or Dapper | Phase 3 | EF Core (candidate choice) |
| Transaction has status | Phase 2 | Domain model |
| Allowed next statuses only | Phase 2 | WorkflowEngine validates |
| May move backwards | Phase 3 | Seed data includes FAILED → VALIDATED |
| Reject invalid transitions | Phase 2 | DataProcessResult.Fail() |
| Data-driven statuses (no enums) | Phase 3 | DB tables, no C# enums |
| POST /transactions | Phase 4 | ✓ |
| GET /transactions/{id} | Phase 4 | ✓ |
| POST /transactions/{id}/transition | Phase 4 | ✓ |
| GET /transactions/{id}/available-transitions | Phase 4 | ✓ |
| Separation of concerns | Phase 1-4 | 4-project clean architecture |
| Domain logic outside controllers | Phase 2 | WorkflowEngine in Domain project |
| No direct DB from controllers | Phase 3 | Repository pattern |
| **Bonus:** Status history | Phase 5 | TransactionHistory table + endpoint |
| **Bonus:** Workflow caching | Phase 5 | CachedWorkflowConfigRepository |
| **Bonus:** Concurrency safety | Phase 5 | RowVersion + optimistic concurrency |
| **Bonus:** Admin endpoints | Phase 5 | Add state + add transition endpoints |
| **Bonus:** Tests | Phase 6 | Unit + integration tests |
| **Bonus:** README | Phase 7 | Full documentation |

**✅ All 100% covered.**

---

## Positive & Negative Examples

### ✅ POSITIVE: Generic Workflow Engine (V17 FREEDOM pattern)

```csharp
// The engine doesn't know about "Transactions" — it works for anything
public class WorkflowEngine : IWorkflowEngine
{
    public DataProcessResult<WorkflowTransitionResult> TryTransition(
        string entityType,      // "transaction", "order", "ticket" — any type
        string currentStatus,
        string targetStatus,
        Dictionary<string, object>? metadata = null)
    {
        var allowed = _configRepo.GetAllowedTransitions(entityType, currentStatus);
        if (!allowed.Any(t => t.TargetStatus == targetStatus))
            return DataProcessResult<WorkflowTransitionResult>.Fail(
                $"Transition from '{currentStatus}' to '{targetStatus}' is not allowed. " +
                $"Allowed: {string.Join(", ", allowed.Select(t => t.TargetStatus))}",
                DataProcessStatus.ValidationError);

        return DataProcessResult<WorkflowTransitionResult>.Ok(
            new WorkflowTransitionResult(currentStatus, targetStatus, DateTime.UtcNow, metadata));
    }
}
```

**Why correct:** The engine is MACHINE (generic, doesn't know "transaction"). The workflow rules are FREEDOM (data in DB). Adding a new entity type (orders, tickets) requires zero code changes — just new rows in the WorkflowTransitions table.

### ❌ NEGATIVE: Hardcoded Status Logic

```csharp
// ❌ BAD — Status logic in controller, hardcoded transitions
[HttpPost("{id}/transition")]
public IActionResult Transition(int id, [FromBody] string newStatus)
{
    var transaction = _db.Transactions.Find(id);

    // Hardcoded transition logic — adding a new status requires code change
    if (transaction.Status == "CREATED" && newStatus == "VALIDATED") { }
    else if (transaction.Status == "VALIDATED" && newStatus == "PROCESSING") { }
    else if (transaction.Status == "PROCESSING" && newStatus == "COMPLETED") { }
    else return BadRequest("Invalid transition");

    transaction.Status = newStatus;
    _db.SaveChanges();
    return Ok();
}
```

**Why wrong:** Statuses hardcoded in controller. Adding FAILED status requires code change + deploy. No separation of concerns. No history tracking. No concurrency handling.

---

### ✅ POSITIVE: DataProcessResult Pattern (V17 Skill 01)

```csharp
// Service returns structured result — controller maps to HTTP
public async Task<DataProcessResult<TransactionDto>> CreateTransactionAsync(
    CreateTransactionRequest request)
{
    var initialState = await _workflowConfig.GetInitialStateAsync("transaction");
    if (initialState == null)
        return DataProcessResult<TransactionDto>.Fail(
            "No workflow configured for entity type 'transaction'");

    var transaction = new Transaction
    {
        Status = initialState.Name,
        Amount = request.Amount,
        CustomFields = request.Metadata ?? new Dictionary<string, object>()
    };

    await _repository.AddAsync(transaction);
    return DataProcessResult<TransactionDto>.Ok(transaction.ToDto());
}
```

**Why correct:** Business logic returns DataProcessResult, not exceptions. Controller just maps: Ok → 200, NotFound → 404, ValidationError → 400, Error → 500. Clean separation.

### ❌ NEGATIVE: Exception-Driven Flow

```csharp
// ❌ BAD — Using exceptions for business logic flow
public async Task<TransactionDto> CreateTransaction(CreateTransactionRequest req)
{
    var state = await _db.States.FirstOrDefaultAsync(s => s.IsInitial);
    if (state == null)
        throw new InvalidOperationException("No initial state"); // 500 error for config issue
    // ...
    throw new ArgumentException("Invalid amount"); // Generic exception
}
```

**Why wrong:** Exceptions for flow control, inconsistent error types, no structured error model.

---

### ✅ POSITIVE: Caching with Invalidation (V17 DNA-8 Cache Pattern)

```csharp
public class CachedWorkflowConfigRepository : IWorkflowConfigRepository
{
    private readonly IWorkflowConfigRepository _inner;
    private readonly IMemoryCache _cache;
    private static readonly TimeSpan CacheDuration = TimeSpan.FromMinutes(30);

    public async Task<List<WorkflowTransition>> GetAllowedTransitions(
        string entityType, string fromStatus)
    {
        var key = $"workflow:{entityType}:{fromStatus}";
        return await _cache.GetOrCreateAsync(key, async entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = CacheDuration;
            return await _inner.GetAllowedTransitions(entityType, fromStatus);
        });
    }

    public void InvalidateCache(string entityType)
    {
        // Clear all cached entries for this entity type
        // Called when admin adds/modifies transitions
    }
}
```

**Why correct:** Decorator pattern (doesn't touch original repo). Cache-aside with TTL. Invalidation hook for admin changes.

### ❌ NEGATIVE: Inline Caching

```csharp
// ❌ BAD — Caching mixed into business logic
public class WorkflowService
{
    private static Dictionary<string, List<string>> _cache = new(); // Static mutable state!

    public bool CanTransition(string from, string to)
    {
        if (!_cache.ContainsKey(from))
            _cache[from] = _db.Transitions.Where(t => t.From == from).Select(t => t.To).ToList();
        return _cache[from].Contains(to);
    }
    // No invalidation, no TTL, thread-unsafe, untestable
}
```

**Why wrong:** Static mutable state, no invalidation, no TTL, thread-unsafe, impossible to test.

---

## Recovery & State Management

Each phase produces a compilable, runnable checkpoint. If interrupted:

| Interrupted At | Recovery Action | Time Lost |
|---|---|---|
| After Phase 1 | Rebuild from solution template | ~5 min |
| After Phase 2 | Domain is complete. Continue with Phase 3 | 0 min |
| After Phase 3 | DB works. Wire up API (Phase 4) | 0 min |
| After Phase 4 | Core assignment DONE. Bonuses are optional. | 0 min |
| After Phase 5 | All features done. Just need tests + docs. | 0 min |
| After Phase 6 | Tests done. Just README left. | 0 min |

**Key insight:** After Phase 4, you have a **submittable assignment**. Phases 5-7 are incremental improvements. You can stop at any save point and still have a working product.

---

## Mini RAG: Which V17 Files to Reference During Implementation

When actually building Approach D, reference these V17 files in this order:

| Phase | V17 File to Read | What You'll Extract |
|---|---|---|
| 1 | `skills/01-core-interfaces/SKILL.md` | DataProcessResult pattern, interface design |
| 1 | `FREEDOM_MACHINE_GUIDE.md` | MACHINE vs FREEDOM classification for your design |
| 2 | `skills/02-object-processor/SKILL.md` | ParseDocument / BuildQueryFilters pattern ideas |
| 2 | `skills/08-flow-definition/SKILL.md` | How to model a workflow as data |
| 3 | `skills/05-database-fabric/SKILL.md` | Generic repository interface pattern |
| 3 | `GENIE_DNA_GUIDE.md` | Dynamic document storage patterns |
| 4 | `skills/15-api-gateway/SKILL.md` | API routing / error handling patterns |
| 5 | `skills/09-flow-orchestrator/SKILL.md` | State checkpointing / resume patterns |
| 6 | `skills/29-unit-testing/SKILL.md` | Test generation patterns |
| 7 | `ROUTING_GUIDE.md` | Documentation structure reference |

---

## Summary: Why Approach D?

| Criteria | A (Vanilla) | B (DNA-Infused) | C (Full V17) | D (Hybrid) ⭐ |
|---|---|---|---|---|
| Meets requirements | ✅ | ✅ | ❌ (different tech) | ✅ |
| Shows senior thinking | ❌ | ✅ | ✅ | ✅ |
| Time to complete | 4-5h | 5-7h | 8-12h | 6-8h |
| Risk of "over-engineering" | None | Low | High | Low |
| Memorable to evaluator | No | Yes | Yes (wrong way) | Yes (right way) |
| Recoverable at any phase | ✅ | ✅ | ❌ | ✅ |
| V17 patterns demonstrated | 0 | 3-4 | All | 4-5 (subtle) |

**Approach D delivers:** A clean, standard .NET project that any evaluator expects, with a hidden V17-inspired architecture that elevates it from "competent" to "impressive" — without triggering the "over-engineered" red flag.
