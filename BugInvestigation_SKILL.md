# Bug Investigation Skill — Systematic .NET/EF Core Debugging

## Overview

A repeatable methodology for diagnosing runtime bugs in .NET microservice APIs, especially EF Core entity tracking issues, DI lifetime mismatches, and middleware error-swallowing. Derived from a real debugging session that traced 7 test failures across 3 architecture approaches to 2 root causes in under 30 minutes.

---

## The 5-Layer Investigation Framework

### Layer 1: Symptom Classification

Before touching code, classify every failure into a bucket:

| Symptom | Likely Layer | Investigation Start |
|---------|-------------|-------------------|
| 500 on ALL requests | Startup / DI / DB connection | Program.cs, docker logs |
| 500 on specific endpoint | Service logic / unhandled exception | Middleware → Service → Repository |
| 500 on 2nd+ request only | Entity tracking / caching / DI lifetime | DI registration, IMemoryCache, DbContext scope |
| 400 where 500 expected | Validation catching too broadly | FluentValidation rules |
| Wrong HTTP code | Middleware mapping / ResultMapper | Exception→HTTP mapping layer |
| Cascade failures (A fails → B,C fail) | First failure is root cause | Fix first failure, re-test |

**Key insight:** If test N fails and tests N+1, N+2 also fail but are *dependent* on N's success, only investigate N. The others are cascading.

### Layer 2: Architecture Trace (Read Before Debug)

Map the full request path BEFORE running anything:

```
HTTP Request
  → Middleware (exception handler / global filter)
    → Controller (routing, model binding)
      → Service (business logic orchestration)
        → Domain Engine (state machine / rules)
          → Repository (EF Core / DB access)
            → DbContext (entity tracking, SaveChanges)
```

For each layer, answer:
1. **Does this layer throw or return errors?** (Exception-based vs Result-based)
2. **Does this layer cache anything?** (IMemoryCache, static fields)
3. **What is the DI lifetime?** (Singleton vs Scoped vs Transient)
4. **Does this layer touch navigation properties?** (EF tracking risk)

### Layer 3: The DI Lifetime × Caching Matrix

This is the #1 source of "works on first request, breaks on second" bugs:

```
┌─────────────────┬────────────────┬─────────────────────────────┐
│ Cache Lifetime  │ Consumer       │ Risk                        │
├─────────────────┼────────────────┼─────────────────────────────┤
│ Singleton cache │ Scoped repo    │ ⚠️ CRITICAL: Cached entities │
│ (IMemoryCache)  │ (DbContext)    │ outlive their DbContext.     │
│                 │                │ Next request gets detached   │
│                 │                │ entities → tracking conflict │
├─────────────────┼────────────────┼─────────────────────────────┤
│ Scoped cache    │ Scoped repo    │ ✅ Safe: same lifetime       │
├─────────────────┼────────────────┼─────────────────────────────┤
│ Singleton cache │ Singleton repo │ ⚠️ Only safe with            │
│                 │                │ AsNoTracking queries         │
├─────────────────┼────────────────┼─────────────────────────────┤
│ Static field    │ Any            │ ⛔ Never cache EF entities   │
│ in service      │                │ in static fields             │
└─────────────────┴────────────────┴─────────────────────────────┘
```

**Detection command:**
```bash
# Find all DI registrations and their lifetimes
grep -n "AddScoped\|AddSingleton\|AddTransient\|AddMemoryCache" Program.cs

# Find all cache usage
grep -rn "IMemoryCache\|GetOrCreateAsync\|MemoryCache" --include="*.cs"

# Find navigation property assignments (EF tracking risk)
grep -rn "\.Status =\|\.Navigation =\|transaction\.\w\+ =" --include="*.cs" | grep -v "Id ="
```

### Layer 4: The EF Core Tracking Conflict Pattern

**The most common .NET API bug pattern:**

```
Request 1 (Scope A):
  cache MISS → repo loads entity with DbContext-A tracking → cached in IMemoryCache

Request 2 (Scope B):
  cache HIT → returns entity tracked by DbContext-A (now disposed)
  → DbContext-B tries to use it → TWO entities with same PK → InvalidOperationException
```

**Three manifestations:**

| Pattern | Code | Exception |
|---------|------|-----------|
| Navigation assignment | `entity.Status = cachedStatus` | "Cannot track entity of type 'Status'. Another instance with key is already tracked" |
| Add cascade | `_db.Add(entity)` where entity has cached nav property set | Attempts INSERT on existing FK record → PK violation |
| Update cascade | `_db.Update(entity)` with mixed-scope navigations | Tracking conflict on navigation entities |

**Universal fix checklist:**
1. ✅ Add `AsNoTracking()` to ALL queries whose results might be cached
2. ✅ Never assign navigation properties from cached data — only set FK (e.g., `entity.StatusId = x`, NOT `entity.Status = cachedObj`)
3. ✅ After mutating via FK-only, reload with `GetByIdAsync()` for fresh navigations
4. ✅ Verify with: `grep -rn "\.Status =\|\.Category =\|\.Type =" --include="*.cs" | grep -v "StatusId\|CategoryId\|TypeId"`

### Layer 5: Middleware Error Swallowing

**Problem:** Global exception middleware catches ALL exceptions and returns generic 500 with no detail. The actual error type is hidden.

**Detection:** If you see `{"detail":"An unexpected error occurred."}` with no differentiation, the middleware is swallowing the real exception.

**Investigation steps:**
```bash
# 1. Check if middleware logs the real exception
grep -A5 "LogError\|LogWarning" *Middleware*.cs

# 2. Enhance logging temporarily (add to catch block):
_logger.LogError(ex, "[{ExType}]: {Message}\n{Stack}",
    ex.GetType().FullName, ex.Message, ex.StackTrace);

# 3. Read Docker logs for the real exception:
docker-compose logs api 2>&1 | Select-String "error|exception" -Last 20

# 4. Check if inner exceptions exist:
_logger.LogError(ex, "Outer: {Msg}, Inner: {Inner}",
    ex.Message, ex.InnerException?.Message);
```

---

## Decision Tree: "Why is my endpoint returning 500?"

```
500 on endpoint
│
├─ On EVERY request? ──→ Startup issue
│   ├─ Check: docker-compose logs api | grep "fail"
│   ├─ Check: db.Database.Migrate() with no migration files?
│   └─ Check: connection string / DB container health
│
├─ On FIRST request only? ──→ Cold-start / seed data issue
│   └─ Check: OnModelCreating seed data, HasData() calls
│
├─ On 2nd+ request only? ──→ CACHING BUG (most likely)
│   ├─ Check: IMemoryCache DI lifetime (singleton!) vs DbContext (scoped!)
│   ├─ Check: AsNoTracking() on cached queries
│   └─ Check: Navigation property assignments from cached data
│
├─ On specific transition? ──→ Domain logic / state machine bug
│   ├─ Check: WorkflowEngine transition validation
│   ├─ Check: Entity tracking after status change
│   └─ Check: Repository Update() with dirty navigation graph
│
└─ Random / intermittent? ──→ Concurrency / race condition
    ├─ Check: RowVersion / optimistic concurrency
    ├─ Check: SaveChangesAsync ordering
    └─ Check: Parallel request handling
```

---

## Positive Example: Correct Caching + EF Pattern

```csharp
// Repository: Queries that will be cached MUST use AsNoTracking
public async Task<WorkflowStatus?> GetInitialStatusAsync(CancellationToken ct)
    => await _db.WorkflowStatuses
        .AsNoTracking()  // ← Critical: prevents tracking in any DbContext
        .FirstOrDefaultAsync(s => s.IsInitial, ct);

// Service: Only set FK, never set navigation from cached data
public async Task<Transaction> CreateAsync(CreateRequest request, CancellationToken ct)
{
    var initialStatus = await _workflowEngine.GetInitialStatusAsync(ct);
    
    var transaction = new Transaction
    {
        StatusId = initialStatus.Id,  // ✅ FK only
        // Status = initialStatus,    // ⛔ NEVER — cached entity from old scope
        Amount = request.Amount,
    };
    
    var created = await _repo.CreateAsync(transaction, ct);
    return await _repo.GetByIdAsync(created.Id, ct);  // ✅ Reload with fresh nav
}

// After transition: FK-only mutation + reload
public async Task<Transaction> TransitionAsync(int id, string target, CancellationToken ct)
{
    var transaction = await _repo.GetByIdAsync(id, ct);
    var outcome = await _engine.TryTransition(transaction.StatusId, target, ct);
    
    transaction.StatusId = outcome.TargetStatusId;  // ✅ FK only
    transaction.UpdatedAt = DateTime.UtcNow;
    
    await _repo.UpdateAsync(transaction, ct);
    return await _repo.GetByIdAsync(id, ct);  // ✅ Reload for fresh Status nav
}
```

## Negative Example: Tracking Conflict Bug

```csharp
// ⛔ Cached entity assigned to navigation property
public async Task<Transaction> CreateAsync(CreateRequest request, CancellationToken ct)
{
    var initialStatus = await _workflowEngine.GetInitialStatusAsync(ct);
    // ^ Returns cached entity from IMemoryCache (singleton)
    //   This entity was loaded by a PREVIOUS request's DbContext (now disposed)
    
    var transaction = new Transaction
    {
        StatusId = initialStatus.Id,
        Status = initialStatus,     // ⛔ BUG: Detached entity from old DbContext
        Amount = request.Amount,
    };
    
    _db.Transactions.Add(transaction);
    // ^ Add() cascades: sees Status is "detached", marks it as "Added"
    // ^ SaveChanges tries INSERT INTO WorkflowStatuses → PK VIOLATION
    await _db.SaveChangesAsync(ct);
}

// ⛔ Same bug in transition path
transaction.StatusId = targetStatus.Id;
transaction.Status = targetStatus;  // ⛔ Cached from old scope
_db.Transactions.Update(transaction);
// ^ Update() sees two Status entities with same PK → InvalidOperationException
```

---

## Quick Reference: Investigation Commands

```bash
# Find the smoking gun — DI lifetime mismatch
grep -n "AddScoped\|AddSingleton\|AddTransient\|MemoryCache" Program.cs

# Find dangerous navigation assignments
grep -rn "\.\(Status\|Type\|Category\) =" --include="*.cs" Services/ Domain/ | grep -v "Id ="

# Find missing AsNoTracking
grep -rn "FirstOrDefaultAsync\|ToListAsync" --include="*.cs" Repositories/ | grep -v AsNoTracking

# Check middleware logging quality
grep -B2 -A5 "LogError" --include="*.cs" -r Middleware/

# Docker logs — find the REAL exception
docker-compose logs api 2>&1 | grep -i "exception\|error\|fail" | tail -20
```

---

## Checklist: Before Declaring "Fixed"

- [ ] All cached repository queries use `AsNoTracking()`
- [ ] No navigation properties assigned from cached/injected data
- [ ] After FK-only mutations, entity is reloaded for DTO mapping
- [ ] Middleware logs full exception type + stack trace (at least in Development)
- [ ] DI lifetimes are consistent (no singleton consuming scoped-tracked entities)
- [ ] Tests cover: 1st request, 2nd request (cache hit), error path on 2nd request
- [ ] Docker logs show no swallowed exceptions
