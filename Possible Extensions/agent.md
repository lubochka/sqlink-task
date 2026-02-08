This improvement plan elevates your solution from a "Transaction Engine" to a **"Configurable Workflow Platform"**. This moves you closer to **Approach B (The Freedom Machine)** but keeps the safety of **Approach D**.

Here is your **V17 Skill & Prompt Library** to execute these 4 specific improvements.

---

### **Part 1: The Architecture Strategy**

Before prompting, understand the V17 architectural pattern for each requirement:

1. **Configurable Task:** Don't add columns like `DueDate` or `Priority` to the SQL table. Use a **JSON Data Column** (`CustomFields`) on the Task entity. This is **Skill 05 (Database Fabric)**.
2. **Multi-Project Workflows:** Introduce a **Scope Discriminator**. Instead of just `EntityType='transaction'`, we add `ProjectId` or `WorkflowDefinitionId` to the workflow tables. This allows Project A to have "ToDo -> Done" and Project B to have "Draft -> Review -> Publish". This is **Skill 08 (Flow Definition)**.
3. **Permissions as Rules:** Do NOT write `if (user.Role == "Admin")` in your controller. Permissions are just **Validation Rules**. Add `{ "allowedRoles": ["Manager"] }` to the transition's JSON rule configuration. The generic `RuleEvaluator` checks this. This is **Skill 02 (Object Processor)**.
4. **SSO Strategy:** The Engine (Machine) doesn't care about SSO. The API Gateway (Skill 15) handles the token, extracts the claims (Roles, UserID), and passes them into the Engine's `context` dictionary.

---

### **Part 2: The Prompt Library**

Use these prompts with GitHub Copilot or Claude. They are engineered to force the AI to use the **V17 patterns** (Results, JSON Rules, Generic Engines) instead of writing legacy .NET code.

#### **Requirement 1: Make Task Configurable (JSON Fields)**

**Target Skill:** Skill 05 (Database Fabric) & Skill 01 (Core Interfaces)

> **Prompt:**
> "I need to make the `Transaction` entity configurable so different projects can store different data (e.g., 'DueDate', 'Priority', 'CustomerSegment') without changing the database schema.
> **Apply Skill 05 (Database Fabric):**
> 1. Add a `JsonDocument` property named `Data` to the `Transaction` entity.
> 2. Configure EF Core `ValueConversion` to store this as a JSON string in SQL Server but expose it as `Dictionary<string, object>` in C#.
> 3. Update the `CreateTransactionRequest` DTO to accept a `Dictionary<string, object> Data` field.
> 4. Ensure the `TransactionService` maps this dictionary to the entity.
> 
> 
> **Constraint:** Do not add specific columns like 'DueDate' to the SQL table. Keep it generic."

---

#### **Requirement 2: Multi-Project Support (Dynamic Workflows)**

**Target Skill:** Skill 08 (Flow Definition)

> **Prompt:**
> "I need to support multiple projects, where each project has its own unique workflow states and transitions.
> **Apply Skill 08 (Flow Definition):**
> 1. Create a new `Project` entity (Id, Name, Key).
> 2. Update `WorkflowStatus` and `WorkflowTransition` tables to include a `ProjectId` foreign key (nullable).
> * If `ProjectId` is null, it's a 'Global/Default' workflow.
> * If `ProjectId` is set, it overrides the default.
> 
> 
> 3. Update the `WorkflowRepository` to logic: 'When loading transitions for Project X, look for specific transitions first; fallback to global if none found.'
> 4. Update `Transaction` entity to belong to a `Project`.
> 
> 
> **Constraint:** The `WorkflowEngine` interface must not change. It should still just take a `statusId`. The Repository handles the scoping logic."

---

#### **Requirement 3: Permissions Check (Rules Engine)**

**Target Skill:** Skill 02 (Object Processor) & Skill 15 (Gateway)

> **Prompt:**
> "I need to implement granular permission checks for transitions (e.g., only 'Managers' can move from 'Validated' to 'Processing').
> **Apply Skill 02 (Object Processor) - The Rule Pattern:**
> 1. Do NOT hardcode roles in C#.
> 2. I want to define permissions in the database by adding `{ 'allowedRoles': ['Manager', 'Admin'] }` to the `WorkflowTransition.Rules` JSON column.
> 3. Create a new `IPermissionEvaluator` or extend the existing `EvaluateRulesAsync` method in `WorkflowEngine`.
> 4. It should check if the `context` dictionary contains a `UserRoles` list and validate it against the JSON rule.
> 
> 
> **Apply Skill 15 (Gateway) - The Context Adapter:**
> 1. In the `TransactionsController`, extract the User's Roles from the `HttpContext.User` claims.
> 2. Pass these roles into the `WorkflowEngine.TryTransitionAsync` method via the `context` dictionary parameter."
> 
> 

---

#### **Requirement 4: SSO Adjustments (Flexible Auth)**

**Target Skill:** Skill 15 (API Gateway)

> **Prompt:**
> "I need to configure Authentication to support multiple SSO providers (Azure AD, Okta, Google) via configuration, without code changes.
> **Apply Skill 15 (API Gateway):**
> 1. Implement a Strategy Pattern for Auth Configuration in `Program.cs`.
> 2. Create an `AuthSettings` class in `appsettings.json` that defines:
> * `Authority` (the SSO URL)
> * `ClientId`
> * `Audience`
> 
> 
> 3. Use standard `Microsoft.AspNetCore.Authentication.JwtBearer`.
> 4. Create a middleware or extension method `AddFlexibleAuth(configuration)` that reads these settings and configures the JwtBearer options.
> 
> 
> **Constraint:** The core Domain project must NOT depend on any Auth libraries. Auth is an API/Infrastructure concern only."

---

### **Part 3: The "Skill Set" Library File**

Create a file named `.ai-config/v17-skill-library.md`. This serves as the "Rule Book" for your AI agents. When you start a chat, upload this file first.

```markdown
# V17 Skill Set Library for Transaction Workflow

This library defines the architectural patterns for the Transaction Workflow project.
AI Agents must follow these skills strictly.

## 🟡 Skill 01: Core Interfaces (The Protocol)
* **Concept:** All business logic returns `DataProcessResult<T>`.
* **Rule:** Never throw exceptions for logical failures (e.g., "Validation Failed", "Permission Denied").
* **Structure:** `public record DataProcessResult<T>(bool IsSuccess, T Data, List<string> Errors, OperationStatus Status);`

## 🟡 Skill 02: Object Processor (The Rule Engine)
* **Concept:** Business rules are configuration (JSON), not code.
* **Pattern:** The `WorkflowEngine` reads the `Rules` JSON column from `WorkflowTransition`.
* **Implementation:** Use the `RuleEvaluator` class to parse keys like `allowedRoles`, `minAmount`, `maxRetries` and validate them against the operation context.

## 🔵 Skill 05: Database Fabric (The Storage)
* **Concept:** "Freedom" data storage using JSON columns.
* **Rule:** For dynamic requirements (configurable tasks), use `Dictionary<string, object>` properties mapped to JSON columns in EF Core using `ValueConversion`.
* **Do Not:** Do not alter the schema for every new field requirement.

## 🟠 Skill 08: Flow Definition (The Map)
* **Concept:** Workflows are defined by Data, not Code.
* **Multi-Tenancy:** Workflows can be scoped by `ProjectId` or `EntityType`.
* **Structure:** `WorkflowTransition` table contains `FromState`, `ToState`, `Rules` (JSON), and `ScopeId`.

## 🟣 Skill 15: API Gateway (The Context Adapter)
* **Concept:** The API layer is responsible for translation, not logic.
* **Auth:** Extracts Claims (Roles, UserId) from tokens and injects them into the `WorkflowEngine`'s `context` dictionary.
* **Response:** Maps `DataProcessResult` status codes to HTTP Status Codes (400, 403, 404, 409).

```

### **Summary of Execution**

1. **Prepare:** Save the `v17-skill-library.md` file in your repo.
2. **Context:** Start a new chat with Copilot/Claude. Attach the library file.
3. **Execute:** Paste the prompts from **Part 2** one by one.
* Start with **Requirement 1** (Configurable Task) to update the core entity.
* Move to **Requirement 2** (Multi-Project) to update the schema.
* Implement **Requirement 3** (Permissions) to leverage the JSON rules.
* Finish with **Requirement 4** (SSO) to secure the API.