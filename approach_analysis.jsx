import { useState } from "react";

const approaches = [
  {
    id: "A",
    name: "Textbook Clean Architecture",
    subtitle: "Vanilla .NET — exactly what they expect",
    time: "4-5h",
    risk: "None",
    meetsReqs: true,
    seniorThinking: false,
    memorable: false,
    v17Patterns: 0,
    stateFlexibility: "Low",
    stateFlexColor: "#EF4444",
    multiEntity: false,
    dynamicRules: false,
    color: "#6B7280",
    recommended: false,
    summary: "Standard .NET Clean Architecture with EF Core, SQL Server, service layer. No V17 involvement. Safe, expected, forgettable. Changing state combinations requires code changes.",
    phases: [
      { name: "Solution structure", time: "20m", save: "Compiles" },
      { name: "Domain + EF Core", time: "60m", save: "DB + models" },
      { name: "Workflow service", time: "45m", save: "Engine works" },
      { name: "API endpoints", time: "30m", save: "Endpoints live" },
      { name: "Seed + bonus", time: "60m", save: "Full features" },
      { name: "Tests + README", time: "45m", save: "Complete" },
    ],
  },
  {
    id: "B",
    name: "DNA-Infused Architecture",
    subtitle: "V17 philosophy, traditional tech stack — ⭐ Most Flexible",
    time: "5-7h",
    risk: "Low",
    meetsReqs: true,
    seniorThinking: true,
    memorable: true,
    v17Patterns: 4,
    stateFlexibility: "Maximum",
    stateFlexColor: "#10B981",
    multiEntity: true,
    dynamicRules: true,
    color: "#3B82F6",
    recommended: false,
    summary: "Uses SQL Server + EF Core as required, but designs the workflow engine as a generic state machine following Freedom Machine philosophy. EntityType scoping enables unlimited workflow graphs — easiest to change state combinations later.",
    phases: [
      { name: "Solution + generic interfaces", time: "30m", save: "Foundation" },
      { name: "Generic workflow engine", time: "60m", save: "Engine isolated" },
      { name: "SQL Server + EF Core + JSON cols", time: "45m", save: "DB works" },
      { name: "API + DataProcessResult", time: "30m", save: "API live" },
      { name: "History, cache, concurrency, admin", time: "60m", save: "Bonuses done" },
      { name: "Tests + philosophy README", time: "45m", save: "Complete" },
    ],
  },
  {
    id: "C",
    name: "Full V17 Showcase",
    subtitle: "Complete V17 stack replacement",
    time: "8-12h",
    risk: "High",
    meetsReqs: false,
    seniorThinking: true,
    memorable: true,
    v17Patterns: 8,
    stateFlexibility: "Maximum",
    stateFlexColor: "#10B981",
    multiEntity: true,
    dynamicRules: true,
    color: "#EF4444",
    recommended: false,
    summary: "Treats the assignment as a V17 project. Uses Flow Definition, Flow Orchestrator, Database Fabric, ObjectProcessor. Impressive but violates assignment requirements.",
    phases: [
      { name: "V17 foundation (Skill 01+02)", time: "45m", save: "Core ready" },
      { name: "Database Fabric + SQL Server", time: "60m", save: "DB provider" },
      { name: "Flow Definition as state machine", time: "90m", save: "Workflow defined" },
      { name: "API Gateway + Orchestrator", time: "90m", save: "Running" },
      { name: "Tests + documentation", time: "60m", save: "Complete" },
    ],
  },
  {
    id: "D",
    name: "Strategic Hybrid",
    subtitle: "Assignment core + V17 abstraction layer",
    time: "6-8h",
    risk: "Low",
    meetsReqs: true,
    seniorThinking: true,
    memorable: true,
    v17Patterns: 5,
    stateFlexibility: "Medium",
    stateFlexColor: "#F59E0B",
    multiEntity: false,
    dynamicRules: true,
    color: "#10B981",
    recommended: true,
    summary: "Delivers exactly what's asked (SQL Server, EF Core, clean arch) with a hidden V17-inspired generic engine underneath. Has JSON Rules and DataProcessResult but lacks B's EntityType scoping — single workflow type per deployment.",
    phases: [
      { name: "Solution + foundation abstractions", time: "30m", save: "Compiles, DataProcessResult ready", submittable: false },
      { name: "Domain — Generic workflow engine", time: "45m", save: "Engine works in isolation, unit-testable", submittable: false },
      { name: "Infrastructure — EF Core + SQL", time: "45m", save: "DB creates, seed loads, queries work", submittable: false },
      { name: "API layer — all endpoints", time: "30m", save: "Full API working via Swagger", submittable: true },
      { name: "Bonus — history, cache, concurrency, admin", time: "60m", save: "All bonus features working", submittable: true },
      { name: "Tests — unit + integration", time: "45m", save: "All tests green", submittable: true },
      { name: "README + Docker + polish", time: "30m", save: "GitHub-ready", submittable: true },
    ],
  },
];

const v17Patterns = [
  { name: "DataProcessResult<T>", skill: "Skill 01", desc: "Structured success/failure returns instead of exceptions", approach: ["B", "D"] },
  { name: "Freedom Machine", skill: "Philosophy", desc: "Workflow rules = data (FREEDOM), engine = code (MACHINE)", approach: ["B", "C", "D"] },
  { name: "Dynamic Documents", skill: "Skill 02", desc: "JSON metadata columns for extensibility without schema changes", approach: ["B", "C", "D"] },
  { name: "Generic Interfaces", skill: "Skill 05", desc: "IWorkflowEngine works for any entity type, not just transactions", approach: ["B", "C", "D"] },
  { name: "EntityType Scoping", skill: "Skill 08", desc: "Composite key (EntityType, Name) enables unlimited independent workflow graphs per entity type — the critical flexibility differentiator", approach: ["B", "C"] },
  { name: "Dynamic Transition Rules", skill: "Skill 02", desc: "JSON Rules column on transitions enables configurable business logic (maxRetries, allowedRoles) without code changes", approach: ["B", "D"] },
  { name: "Cache Decorator", skill: "DNA-8", desc: "CachedWorkflowConfigRepository wraps real repo transparently", approach: ["B", "D"] },
  { name: "Flow Definition", skill: "Skill 08", desc: "Workflow as DAG of nodes and edges", approach: ["C"] },
  { name: "Flow Orchestrator", skill: "Skill 09", desc: "Full execution engine with checkpointing", approach: ["C"] },
  { name: "ObjectProcessor", skill: "Skill 02", desc: "ParseDocument / BuildQueryFilters for all data ops", approach: ["C"] },
];

const requirements = [
  { name: ".NET 7+ / .NET Core", mandatory: true },
  { name: "SQL Server", mandatory: true },
  { name: "Web API", mandatory: true },
  { name: "EF Core or Dapper", mandatory: true },
  { name: "Data-driven statuses (no enums)", mandatory: true },
  { name: "Allowed transitions only", mandatory: true },
  { name: "Backwards transitions (retry/rollback)", mandatory: true },
  { name: "Reject invalid transitions", mandatory: true },
  { name: "POST /transactions", mandatory: true },
  { name: "GET /transactions/{id}", mandatory: true },
  { name: "POST /transactions/{id}/transition", mandatory: true },
  { name: "GET /transactions/{id}/available-transitions", mandatory: true },
  { name: "Domain logic outside controllers", mandatory: true },
  { name: "Status history", mandatory: false },
  { name: "Workflow caching", mandatory: false },
  { name: "Concurrency safety", mandatory: false },
  { name: "Admin endpoints", mandatory: false },
  { name: "Unit + integration tests", mandatory: false },
  { name: "README with design decisions", mandatory: false },
];

function Badge({ children, color = "#6B7280" }) {
  return (
    <span style={{
      display: "inline-block",
      padding: "2px 10px",
      borderRadius: "12px",
      fontSize: "12px",
      fontWeight: 600,
      background: color + "18",
      color: color,
      border: `1px solid ${color}40`,
    }}>
      {children}
    </span>
  );
}

function Check({ ok }) {
  return <span style={{ color: ok ? "#10B981" : "#EF4444", fontWeight: 700 }}>{ok ? "✓" : "✗"}</span>;
}

export default function App() {
  const [selected, setSelected] = useState("D");
  const [tab, setTab] = useState("overview");

  const current = approaches.find((a) => a.id === selected);

  return (
    <div style={{
      fontFamily: "'IBM Plex Sans', 'Segoe UI', system-ui, sans-serif",
      maxWidth: 900,
      margin: "0 auto",
      padding: "32px 20px",
      color: "#1a1a2e",
      background: "#fafbfc",
      minHeight: "100vh",
    }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{
          fontSize: 26,
          fontWeight: 800,
          margin: 0,
          letterSpacing: "-0.5px",
          background: "linear-gradient(135deg, #1a1a2e, #16213e)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}>
          Transaction Workflow Engine
        </h1>
        <p style={{ color: "#6B7280", fontSize: 14, marginTop: 4 }}>
          4 approaches to tackle the assignment using XIIGen V17 skills
        </p>
      </div>

      {/* Approach Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 28 }}>
        {approaches.map((a) => (
          <button
            key={a.id}
            onClick={() => setSelected(a.id)}
            style={{
              padding: "14px 12px",
              border: selected === a.id ? `2px solid ${a.color}` : "2px solid #e5e7eb",
              borderRadius: 12,
              background: selected === a.id ? a.color + "08" : "white",
              cursor: "pointer",
              textAlign: "left",
              position: "relative",
              transition: "all 0.15s",
            }}
          >
            {a.recommended && (
              <span style={{
                position: "absolute",
                top: -8,
                right: 8,
                background: a.color,
                color: "white",
                fontSize: 10,
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: 8,
              }}>
                ⭐ REC
              </span>
            )}
            <div style={{
              fontSize: 20,
              fontWeight: 800,
              color: a.color,
              marginBottom: 4,
            }}>
              {a.id}
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#1a1a2e", lineHeight: 1.3 }}>
              {a.name}
            </div>
            <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>
              {a.time} · {a.v17Patterns} patterns
            </div>
          </button>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 0, marginBottom: 20, borderBottom: "2px solid #e5e7eb" }}>
        {[
          { id: "overview", label: "Overview" },
          { id: "phases", label: "Phases & Save Points" },
          { id: "validation", label: "Requirements Check" },
          { id: "patterns", label: "V17 Patterns" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: "10px 18px",
              border: "none",
              borderBottom: tab === t.id ? `2px solid ${current.color}` : "2px solid transparent",
              background: "transparent",
              cursor: "pointer",
              fontWeight: tab === t.id ? 700 : 500,
              color: tab === t.id ? current.color : "#6B7280",
              fontSize: 13,
              marginBottom: -2,
              transition: "all 0.15s",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{
        background: "white",
        borderRadius: 14,
        padding: 24,
        border: "1px solid #e5e7eb",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}>
        {tab === "overview" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <span style={{
                fontSize: 36,
                fontWeight: 900,
                color: current.color,
                lineHeight: 1,
              }}>
                {current.id}
              </span>
              <div>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{current.name}</h2>
                <p style={{ margin: 0, fontSize: 13, color: "#6B7280" }}>{current.subtitle}</p>
              </div>
            </div>

            <p style={{ fontSize: 14, lineHeight: 1.6, color: "#374151", marginBottom: 20 }}>
              {current.summary}
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
              {[
                { label: "Time Estimate", value: current.time },
                { label: "Risk Level", value: current.risk },
                { label: "Meets Requirements", value: current.meetsReqs ? "Yes ✓" : "No ✗" },
                { label: "V17 Patterns Used", value: current.v17Patterns },
                { label: "State Flexibility", value: current.stateFlexibility },
                { label: "Multi-Entity / Tenant", value: current.multiEntity ? "Yes ✓" : "No ✗" },
                { label: "Dynamic JSON Rules", value: current.dynamicRules ? "Yes ✓" : "No ✗" },
                { label: "Shows Senior Thinking", value: current.seniorThinking ? "Yes" : "No" },
                { label: "Memorable to Evaluator", value: current.memorable ? "Yes" : "No" },
              ].map((item, i) => (
                <div key={i} style={{
                  padding: "10px 14px",
                  background: "#f9fafb",
                  borderRadius: 8,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}>
                  <span style={{ fontSize: 12, color: "#6B7280" }}>{item.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#1a1a2e" }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "phases" && (
          <div>
            <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700 }}>
              {current.phases.length} Phases — Approach {current.id}
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {current.phases.map((p, i) => (
                <div key={i} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 16px",
                  background: p.submittable ? "#f0fdf4" : "#f9fafb",
                  borderRadius: 10,
                  border: p.submittable ? "1px solid #bbf7d0" : "1px solid #e5e7eb",
                }}>
                  <div style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: current.color,
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 800,
                    flexShrink: 0,
                  }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: "#6B7280", marginTop: 2 }}>
                      💾 Save: {p.save}
                    </div>
                  </div>
                  <Badge color={current.color}>{p.time}</Badge>
                  {p.submittable && (
                    <Badge color="#10B981">Submittable</Badge>
                  )}
                </div>
              ))}
            </div>
            {current.id === "D" && (
              <div style={{
                marginTop: 16,
                padding: "12px 16px",
                background: "#fffbeb",
                borderRadius: 10,
                border: "1px solid #fde68a",
                fontSize: 13,
                color: "#92400e",
                lineHeight: 1.5,
              }}>
                💡 <strong>After Phase 4</strong>, you have a submittable assignment with all mandatory requirements met. Phases 5-7 add bonus features incrementally. You can stop at any save point.
              </div>
            )}
          </div>
        )}

        {tab === "validation" && (
          <div>
            <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700 }}>
              Requirements Coverage — Approach {current.id}
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {requirements.map((r, i) => {
                const covered = current.id !== "C" || !r.mandatory || !["SQL Server", "EF Core or Dapper"].includes(r.name);
                return (
                  <div key={i} style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "6px 12px",
                    borderRadius: 6,
                    background: !covered ? "#fef2f2" : "transparent",
                  }}>
                    <Check ok={covered} />
                    <span style={{ fontSize: 13, flex: 1, color: covered ? "#374151" : "#DC2626" }}>
                      {r.name}
                    </span>
                    {r.mandatory ? (
                      <Badge color="#DC2626">Mandatory</Badge>
                    ) : (
                      <Badge color="#6B7280">Bonus</Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === "patterns" && (
          <div>
            <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700 }}>
              V17 Patterns Used in Each Approach
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {v17Patterns.map((p, i) => {
                const used = p.approach.includes(current.id);
                return (
                  <div key={i} style={{
                    padding: "12px 16px",
                    borderRadius: 10,
                    background: used ? current.color + "08" : "#f9fafb",
                    border: used ? `1px solid ${current.color}30` : "1px solid #e5e7eb",
                    opacity: used ? 1 : 0.5,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: used ? current.color : "#9CA3AF" }}>
                        {p.name}
                      </span>
                      <Badge color={used ? current.color : "#9CA3AF"}>{p.skill}</Badge>
                    </div>
                    <div style={{ fontSize: 12, color: "#6B7280", lineHeight: 1.4 }}>
                      {p.desc}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Comparison bar */}
      <div style={{
        marginTop: 20,
        padding: "16px 20px",
        background: "white",
        borderRadius: 14,
        border: "1px solid #e5e7eb",
      }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#6B7280", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.5px" }}>
          Quick Comparison
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "120px repeat(4, 1fr)", gap: 0, fontSize: 12 }}>
          {["", "A", "B", "C", "D"].map((h, i) => (
            <div key={i} style={{
              padding: "6px 8px",
              fontWeight: 800,
              color: i === 0 ? "#6B7280" : approaches[i - 1].color,
              textAlign: i === 0 ? "left" : "center",
              borderBottom: "1px solid #e5e7eb",
            }}>
              {h}
            </div>
          ))}
          {[
            { label: "Meets reqs", vals: ["✓", "✓", "✗", "✓"] },
            { label: "Time", vals: ["4-5h", "5-7h", "8-12h", "6-8h"] },
            { label: "State flex", vals: ["Low", "Max", "Max", "Med"] },
            { label: "Multi-entity", vals: ["No", "Yes", "Yes", "No"] },
            { label: "JSON Rules", vals: ["No", "Yes", "Yes", "Yes"] },
            { label: "Risk", vals: ["None", "Low", "High", "Low"] },
            { label: "Patterns", vals: ["0", "4", "8", "5"] },
            { label: "Memorable", vals: ["No", "Yes", "Yes*", "Yes"] },
          ].map((row, ri) => (
            [
              <div key={`l-${ri}`} style={{ padding: "6px 8px", color: "#6B7280", fontWeight: 600 }}>{row.label}</div>,
              ...row.vals.map((v, vi) => (
                <div key={`v-${ri}-${vi}`} style={{
                  padding: "6px 8px",
                  textAlign: "center",
                  fontWeight: 600,
                  color: v === "✗" || v === "High" || v === "Yes*" ? "#EF4444" : v === "Max" ? "#10B981" : v === "Med" ? "#F59E0B" : "#374151",
                  background: selected === approaches[vi].id ? approaches[vi].color + "08" : "transparent",
                }}>
                  {v}
                </div>
              ))
            ]
          )).flat()}
        </div>
      </div>
    </div>
  );
}
