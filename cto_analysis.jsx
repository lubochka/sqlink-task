import { useState } from "react";

const sections = [
  { id: "verdict", label: "Executive Verdict" },
  { id: "hiring", label: "Design Tradeoffs" },
  { id: "tco", label: "Total Cost" },
  { id: "risk", label: "Risk Matrix" },
  { id: "team", label: "Team Fit" },
  { id: "prod", label: "Production" },
];

const approaches = {
  A: {
    name: "Vanilla Clean Architecture",
    color: "#64748b",
    tagline: "The Safe Bet",
    verdict: "Ship Fast, Refactor Later",
    grade: "B+",
  },
  B: {
    name: "DNA-Infused Multi-Tenant",
    color: "#2563eb",
    tagline: "The Platform Play",
    verdict: "Build Once, Scale Forever",
    grade: "A",
  },
  D: {
    name: "Strategic Hybrid",
    color: "#059669",
    tagline: "The Smart Compromise",
    verdict: "Meet Requirements + Show Depth",
    grade: "A-",
  },
};

function Pill({ children, color = "#64748b", active = false }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 11px",
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.3px",
        background: active ? color : color + "14",
        color: active ? "#fff" : color,
        border: `1px solid ${color}30`,
        transition: "all 0.2s",
      }}
    >
      {children}
    </span>
  );
}

function Card({ children, highlight, style = {} }) {
  return (
    <div
      style={{
        background: highlight || "#fff",
        borderRadius: 14,
        padding: "22px 24px",
        border: "1px solid #e2e8f0",
        boxShadow: "0 1px 4px rgba(0,0,0,0.03)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function SectionTitle({ children, sub }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h2
        style={{
          margin: 0,
          fontSize: 20,
          fontWeight: 800,
          color: "#0f172a",
          letterSpacing: "-0.4px",
        }}
      >
        {children}
      </h2>
      {sub && (
        <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>
          {sub}
        </p>
      )}
    </div>
  );
}

function Bar({ label, value, max = 10, color = "#2563eb", note }) {
  const pct = (value / max) * 100;
  return (
    <div style={{ marginBottom: 12 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 4,
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 600, color: "#334155" }}>
          {label}
        </span>
        <span style={{ fontSize: 11, color: "#94a3b8" }}>{note}</span>
      </div>
      <div
        style={{
          height: 8,
          borderRadius: 4,
          background: "#f1f5f9",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${color}, ${color}cc)`,
            borderRadius: 4,
            transition: "width 0.5s ease",
          }}
        />
      </div>
    </div>
  );
}

function ExecVerdict() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card
        highlight="linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)"
        style={{ border: "1px solid #86efac" }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 16,
          }}
        >
          <span style={{ fontSize: 32 }}>🎯</span>
          <div>
            <div
              style={{
                fontSize: 15,
                fontWeight: 800,
                color: "#166534",
                marginBottom: 6,
              }}
            >
              Why I Built Three — And Which One To Ship
            </div>
            <p
              style={{
                margin: 0,
                fontSize: 13.5,
                lineHeight: 1.7,
                color: "#1e293b",
              }}
            >
              <strong>For this assignment → I'm submitting Approach D.</strong> It
              meets every requirement with a standard .NET stack, but underneath
              sits a V17-inspired abstraction layer that shows how I actually
              think about systems — without over-engineering the deliverable.
            </p>
            <p
              style={{
                margin: "8px 0 0",
                fontSize: 13.5,
                lineHeight: 1.7,
                color: "#1e293b",
              }}
            >
              <strong>For a production system → I'd build Approach B.</strong> The
              EntityType discriminator is the kind of day-one decision that saves
              6 months of refactoring when the PM says "now do Orders too."
              I've been on teams that paid the cost of not making that decision.
            </p>
            <p
              style={{
                margin: "8px 0 0",
                fontSize: 13.5,
                lineHeight: 1.7,
                color: "#1e293b",
              }}
            >
              <strong>Approach A exists to show restraint.</strong> Sometimes the
              right answer is the simplest one. The judgment is in knowing
              which situation you're in.
            </p>
          </div>
        </div>
      </Card>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 12,
        }}
      >
        {Object.entries(approaches).map(([key, a]) => (
          <Card key={key}>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: 36,
                  fontWeight: 900,
                  color: a.color,
                  lineHeight: 1,
                }}
              >
                {a.grade}
              </div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  marginTop: 6,
                  color: "#334155",
                }}
              >
                Approach {key}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "#94a3b8",
                  marginTop: 2,
                }}
              >
                {a.tagline}
              </div>
              <div style={{ marginTop: 10 }}>
                <Pill color={a.color}>{a.verdict}</Pill>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: "#475569",
            marginBottom: 10,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          The Question That Matters Most
        </div>
        <p
          style={{
            margin: 0,
            fontSize: 13.5,
            lineHeight: 1.7,
            color: "#334155",
          }}
        >
          The reason I built all three isn't to show volume — it's to demonstrate the reasoning
          behind architecture choices. All three compile, pass 45 tests, and meet requirements.
          The difference is in <strong>what happens next</strong>: how easily each adapts when
          the business inevitably changes scope. That thinking — choosing the right tool for the
          context — is what I wanted this submission to convey.
        </p>
      </Card>
    </div>
  );
}

function HiringSignal() {
  const signals = [
    {
      dimension: "Follows Instructions",
      A: { score: 10, note: "Exact match" },
      B: { score: 8, note: "Exceeds scope" },
      D: { score: 9, note: "Meets + extends" },
    },
    {
      dimension: "Architectural Thinking",
      A: { score: 4, note: "CRUD patterns" },
      B: { score: 10, note: "Platform design" },
      D: { score: 8, note: "Layered abstraction" },
    },
    {
      dimension: "Production Awareness",
      A: { score: 6, note: "Basic error handling" },
      B: { score: 9, note: "Auth, CORS, env-aware" },
      D: { score: 9, note: "Auth, CORS, env-aware" },
    },
    {
      dimension: "Code Readability",
      A: { score: 9, note: "Standard, familiar" },
      B: { score: 7, note: "Higher learning curve" },
      D: { score: 8, note: "Familiar + patterns" },
    },
    {
      dimension: "Future-Proofing",
      A: { score: 3, note: "Locked to transactions" },
      B: { score: 10, note: "Any entity, any tenant" },
      D: { score: 7, note: "JSON rules, single scope" },
    },
    {
      dimension: "Team Onboarding Cost",
      A: { score: 9, note: "Any .NET dev" },
      B: { score: 5, note: "Needs explanation" },
      D: { score: 7, note: "Standard + docs" },
    },
    {
      dimension: "Documentation Quality",
      A: { score: 7, note: "Standard README" },
      B: { score: 9, note: "Full AI agent configs" },
      D: { score: 9, note: "Full AI agent configs" },
    },
    {
      dimension: "Security Awareness",
      A: { score: 7, note: "V2: API Key + CORS" },
      B: { score: 8, note: "V2: API Key + AdminOnly" },
      D: { score: 8, note: "V2: API Key + AdminOnly" },
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card>
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: "#475569",
            marginBottom: 14,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          What I optimized for in each approach
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            {
              key: "A",
              icon: "📋",
              title: "Approach A: Optimizing for Clarity",
              body: 'I built A to prove I can deliver exactly what\'s asked, cleanly, without gold-plating. It follows standard .NET patterns any team member can read and maintain. The tradeoff: when the PM asks "now do Orders" — it\'s a full feature build. New tables, new engine, new tests. Every extension is a project.',
              color: "#64748b",
            },
            {
              key: "B",
              icon: "🏗️",
              title: "Approach B: Optimizing for Scale",
              body: "I built B because I've been on teams that had to retrofit multi-entity support into a single-entity engine mid-production. The EntityType discriminator is a day-one decision that makes adding Orders a SQL INSERT instead of a sprint. The tradeoff: higher conceptual complexity upfront, and a team needs to understand the abstraction.",
              color: "#2563eb",
            },
            {
              key: "D",
              icon: "⚖️",
              title: "Approach D: Optimizing for Judgment",
              body: "I built D as the actual submission — it applies B's best patterns (JSON Rules, DataProcessResult, generic engine) without the conceptual overhead of EntityType scoping. It's the answer to 'how much architecture is right for this context?' — enough to show depth, not so much that it feels like showing off.",
              color: "#059669",
            },
          ].map((item) => (
            <div
              key={item.key}
              style={{
                display: "flex",
                gap: 14,
                padding: "14px 16px",
                borderRadius: 10,
                background: item.color + "06",
                border: `1px solid ${item.color}18`,
              }}
            >
              <span style={{ fontSize: 24, flexShrink: 0 }}>{item.icon}</span>
              <div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: item.color,
                    marginBottom: 4,
                  }}
                >
                  {item.title}
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: 12.5,
                    lineHeight: 1.6,
                    color: "#475569",
                  }}
                >
                  {item.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: "#475569",
            marginBottom: 14,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          Architecture Scorecard (1–10)
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "180px repeat(3, 1fr)",
            gap: 0,
            fontSize: 12,
          }}
        >
          <div style={{ padding: 6, fontWeight: 700, color: "#94a3b8" }} />
          {["A", "B", "D"].map((k) => (
            <div
              key={k}
              style={{
                padding: 6,
                fontWeight: 800,
                color: approaches[k].color,
                textAlign: "center",
              }}
            >
              {k}
            </div>
          ))}
          {signals.map((s, i) => (
            <>
              <div
                key={`l-${i}`}
                style={{
                  padding: "8px 6px",
                  fontWeight: 600,
                  color: "#475569",
                  borderTop: "1px solid #f1f5f9",
                }}
              >
                {s.dimension}
              </div>
              {["A", "B", "D"].map((k) => (
                <div
                  key={`${k}-${i}`}
                  style={{
                    padding: "8px 6px",
                    textAlign: "center",
                    borderTop: "1px solid #f1f5f9",
                  }}
                >
                  <span
                    style={{
                      fontWeight: 800,
                      color:
                        s[k].score >= 9
                          ? "#059669"
                          : s[k].score >= 7
                          ? "#334155"
                          : s[k].score >= 5
                          ? "#d97706"
                          : "#dc2626",
                    }}
                  >
                    {s[k].score}
                  </span>
                  <span style={{ color: "#94a3b8", marginLeft: 4 }}>
                    {s[k].note}
                  </span>
                </div>
              ))}
            </>
          ))}
          <div
            style={{
              padding: "10px 6px",
              fontWeight: 800,
              color: "#0f172a",
              borderTop: "2px solid #e2e8f0",
            }}
          >
            TOTAL
          </div>
          {["A", "B", "D"].map((k) => {
            const total = signals.reduce((sum, s) => sum + s[k].score, 0);
            return (
              <div
                key={`t-${k}`}
                style={{
                  padding: "10px 6px",
                  textAlign: "center",
                  fontWeight: 900,
                  fontSize: 16,
                  color: approaches[k].color,
                  borderTop: "2px solid #e2e8f0",
                }}
              >
                {total}/80
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

function TotalCost() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card>
        <SectionTitle sub="What does each approach cost over 2 years?">
          Total Cost of Ownership
        </SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {[
            {
              key: "A",
              initial: 2,
              perFeature: 8,
              debt: 7,
              refactor: 9,
              reasoning:
                "Low initial cost, but every new entity type is a full feature build. After 3 entity types, you've paid for B twice over. Technical debt compounds as patterns diverge across engines.",
            },
            {
              key: "D",
              initial: 4,
              perFeature: 5,
              debt: 3,
              refactor: 5,
              reasoning:
                "Moderate initial investment. JSON Rules and DataProcessResult reduce per-feature cost. But the moment you need a second entity type, you're refactoring into B — that migration is the hidden cost.",
            },
            {
              key: "B",
              initial: 6,
              perFeature: 2,
              debt: 1,
              refactor: 1,
              reasoning:
                "Highest initial cost, but the curve flattens dramatically. New entity types are SQL inserts. New tenants are configuration. The engine never changes. In a growing business, B is the cheapest option by Year 2.",
            },
          ].map((item) => (
            <div key={item.key}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 10,
                }}
              >
                <span
                  style={{
                    fontSize: 18,
                    fontWeight: 900,
                    color: approaches[item.key].color,
                  }}
                >
                  {item.key}
                </span>
                <span
                  style={{ fontSize: 13, fontWeight: 600, color: "#64748b" }}
                >
                  {approaches[item.key].name}
                </span>
              </div>
              <Bar
                label="Initial Build"
                value={item.initial}
                color={approaches[item.key].color}
                note={`${item.initial}/10`}
              />
              <Bar
                label="Per-Feature Addition"
                value={item.perFeature}
                color={
                  item.perFeature > 6
                    ? "#dc2626"
                    : item.perFeature > 4
                    ? "#d97706"
                    : "#059669"
                }
                note={`${item.perFeature}/10 cost`}
              />
              <Bar
                label="Tech Debt at 12 Months"
                value={item.debt}
                color={
                  item.debt > 5
                    ? "#dc2626"
                    : item.debt > 3
                    ? "#d97706"
                    : "#059669"
                }
                note={`${item.debt}/10 risk`}
              />
              <Bar
                label="Refactor Probability"
                value={item.refactor}
                color={
                  item.refactor > 6
                    ? "#dc2626"
                    : item.refactor > 4
                    ? "#d97706"
                    : "#059669"
                }
                note={`${item.refactor}/10 risk`}
              />
              <p
                style={{
                  margin: "8px 0 0",
                  fontSize: 12.5,
                  lineHeight: 1.6,
                  color: "#64748b",
                  fontStyle: "italic",
                }}
              >
                {item.reasoning}
              </p>
            </div>
          ))}
        </div>
      </Card>

      <Card
        highlight="linear-gradient(135deg, #eff6ff, #f0f9ff)"
        style={{ border: "1px solid #93c5fd" }}
      >
        <div style={{ display: "flex", gap: 14 }}>
          <span style={{ fontSize: 24 }}>💡</span>
          <div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "#1e40af",
                marginBottom: 4,
              }}
            >
              The Decision Framework
            </div>
            <p
              style={{
                margin: 0,
                fontSize: 13,
                lineHeight: 1.7,
                color: "#334155",
              }}
            >
              If the product roadmap has exactly one workflow type forever → ship{" "}
              <strong>D</strong>.<br />
              If "add Orders/Tickets/Refunds" is on any roadmap within 18 months
              → ship <strong>B</strong> now. Migrating from A→B or D→B later
              costs 3–5× more than building B from the start, because you're
              retrofitting the EntityType discriminator into a live schema with
              production data. I've seen this migration cost firsthand.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

function RiskMatrix() {
  const risks = [
    {
      risk: "Scope creep: PM requests Orders workflow",
      A: { level: "Critical", color: "#dc2626", action: "Full rebuild" },
      B: { level: "None", color: "#059669", action: "SQL INSERT" },
      D: { level: "High", color: "#ea580c", action: "Refactor into B" },
    },
    {
      risk: "New client needs different workflow for same entity",
      A: { level: "Impossible", color: "#7f1d1d", action: "Architecture doesn't support" },
      B: { level: "None", color: "#059669", action: "Composite EntityType key" },
      D: { level: "Impossible", color: "#7f1d1d", action: "No scoping dimension" },
    },
    {
      risk: "Junior dev introduces EF tracking bug",
      A: { level: "High", color: "#dc2626", action: "No result pattern → exception swallowed" },
      B: { level: "Low", color: "#059669", action: "DataProcessResult surfaces errors" },
      D: { level: "Low", color: "#059669", action: "DataProcessResult surfaces errors" },
    },
    {
      risk: "Security audit: no auth on admin endpoints",
      A: { level: "Resolved", color: "#059669", action: "V2: [Authorize(AdminOnly)]" },
      B: { level: "Resolved", color: "#059669", action: "V2: [Authorize(AdminOnly)]" },
      D: { level: "Resolved", color: "#059669", action: "V2: [Authorize(AdminOnly)]" },
    },
    {
      risk: "Production incident: unhandled exception",
      A: { level: "Resolved", color: "#059669", action: "V2: env-aware middleware" },
      B: { level: "Resolved", color: "#059669", action: "V2: env-aware middleware" },
      D: { level: "Resolved", color: "#059669", action: "V2: env-aware middleware" },
    },
    {
      risk: "Team scaling: new dev onboarding time",
      A: { level: "Low", color: "#059669", action: "1–2 days (standard patterns)" },
      B: { level: "Medium", color: "#d97706", action: "3–5 days (needs DNA training)" },
      D: { level: "Low", color: "#059669", action: "2–3 days (standard + docs)" },
    },
    {
      risk: "Vendor lock-in: need to swap DB or queue",
      A: { level: "High", color: "#dc2626", action: "EF tightly coupled" },
      B: { level: "Low", color: "#059669", action: "Generic interfaces abstract DB" },
      D: { level: "Medium", color: "#d97706", action: "Interfaces exist but single impl" },
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card>
        <SectionTitle sub="Scenarios I designed each approach to handle (or not)">
          Risk Assessment
        </SectionTitle>
        <div style={{ overflowX: "auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "220px repeat(3, 1fr)",
              gap: 0,
              fontSize: 12,
              minWidth: 700,
            }}
          >
            <div
              style={{
                padding: 8,
                fontWeight: 700,
                color: "#94a3b8",
                borderBottom: "2px solid #e2e8f0",
              }}
            >
              Risk Scenario
            </div>
            {["A", "B", "D"].map((k) => (
              <div
                key={k}
                style={{
                  padding: 8,
                  fontWeight: 800,
                  color: approaches[k].color,
                  textAlign: "center",
                  borderBottom: "2px solid #e2e8f0",
                }}
              >
                {k}
              </div>
            ))}
            {risks.map((r, i) => (
              <>
                <div
                  key={`r-${i}`}
                  style={{
                    padding: "10px 8px",
                    fontWeight: 600,
                    color: "#334155",
                    borderBottom: "1px solid #f1f5f9",
                    lineHeight: 1.4,
                  }}
                >
                  {r.risk}
                </div>
                {["A", "B", "D"].map((k) => (
                  <div
                    key={`${k}-${i}`}
                    style={{
                      padding: "10px 8px",
                      textAlign: "center",
                      borderBottom: "1px solid #f1f5f9",
                    }}
                  >
                    <div>
                      <Pill color={r[k].color}>{r[k].level}</Pill>
                    </div>
                    <div
                      style={{
                        fontSize: 10.5,
                        color: "#94a3b8",
                        marginTop: 4,
                        lineHeight: 1.3,
                      }}
                    >
                      {r[k].action}
                    </div>
                  </div>
                ))}
              </>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

function TeamFit() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card>
        <SectionTitle sub="Which team ships which approach best?">
          Team Composition Analysis
        </SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[
            {
              team: "3 juniors + 1 senior",
              pick: "A",
              why: "Standard patterns, everyone can contribute from day 1. Low coordination overhead. Senior reviews PRs against familiar idioms.",
              risk: "Will need rewrite when scope expands.",
            },
            {
              team: "2 mid-level + 1 staff engineer",
              pick: "D",
              why: "Staff engineer designs the abstraction layer, mid-levels implement features within the guardrails. DataProcessResult and JSON Rules are learnable patterns.",
              risk: "Staff engineer becomes a bottleneck for architectural decisions.",
            },
            {
              team: "Full senior / platform team",
              pick: "B",
              why: "Everyone understands the EntityType pattern. The generic engine enables parallel work — one dev adds Orders, another adds Tickets, no merge conflicts on the engine.",
              risk: "Team may gold-plate. Needs discipline to ship incrementally.",
            },
            {
              team: "Solo developer / startup",
              pick: "D → B",
              why: "Start with D to ship fast. Migrate to B when the second entity type appears. The upgrade path is well-documented and the patterns are compatible.",
              risk: "Migration window requires dedicated sprint.",
            },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                padding: "16px 18px",
                borderRadius: 10,
                background: approaches[item.pick[0]].color + "06",
                border: `1px solid ${approaches[item.pick[0]].color}18`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#0f172a",
                  }}
                >
                  {item.team}
                </span>
                <Pill color={approaches[item.pick[0]].color} active>
                  → {item.pick}
                </Pill>
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: 12.5,
                  lineHeight: 1.6,
                  color: "#475569",
                }}
              >
                {item.why}
              </p>
              <p
                style={{
                  margin: "6px 0 0",
                  fontSize: 11.5,
                  color: "#dc2626",
                  fontStyle: "italic",
                }}
              >
                ⚠ {item.risk}
              </p>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: "#475569",
            marginBottom: 10,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          Discussion Points — Questions I'm Ready For
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            {
              q: "Why didn't you just submit B?",
              what: "B is the right architecture for a platform, but this assignment describes a microservice. Submitting D shows I can match the solution to the context. I documented B to show I know it exists — and when to reach for it.",
            },
            {
              q: "What breaks first at 10× transaction volume?",
              what: "Cache invalidation under concurrent transitions. The IMemoryCache is singleton, DbContext is scoped — at high volume, the window where a cached entity outlives its DbContext grows. Next step would be Redis with pub/sub invalidation, and moving to RowVersion-based optimistic concurrency checks.",
            },
            {
              q: "Tell me about the EF tracking bug.",
              what: "7 test failures across 3 approaches, 2 root causes, diagnosed in under 30 minutes. I documented the full methodology in BugInvestigation_SKILL.md — the DI Lifetime × Caching matrix, the three tracking conflict manifestations, and a decision tree for 500 errors. Systematic, not trial-and-error.",
            },
            {
              q: "How would you migrate D to B in production?",
              what: "Add EntityType column with default 'transaction' — existing data auto-migrates. Dual-write period where both old and new queries work. Backfill the column. Swap engine to B's signature. Drop the default constraint. Zero downtime, fully reversible at each step.",
            },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                padding: "12px 14px",
                borderRadius: 8,
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#0f172a",
                  marginBottom: 4,
                }}
              >
                "{item.q}"
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "#64748b",
                  lineHeight: 1.5,
                }}
              >
                {item.what}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function ProductionReadiness() {
  const checks = [
    { area: "Authentication", A: true, B: true, D: true, note: "V2: API Key + dev-bypass" },
    { area: "Authorization (Admin)", A: true, B: true, D: true, note: "V2: AdminOnly policy" },
    { area: "CORS", A: true, B: true, D: true, note: "V2: configurable origins" },
    { area: "Error handling (structured)", A: true, B: true, D: true, note: "ProblemDetails RFC 7807" },
    { area: "Stack trace protection", A: true, B: true, D: true, note: "V2: env-aware middleware" },
    { area: "Health check", A: true, B: true, D: true, note: "/health with DB check" },
    { area: "Input validation", A: true, B: true, D: true, note: "FluentValidation" },
    { area: "Swagger + XML docs", A: true, B: true, D: true, note: "V2: IncludeXmlComments" },
    { area: "Docker + Compose", A: true, B: true, D: true, note: "With healthcheck" },
    { area: "Concurrency (RowVersion)", A: true, B: true, D: true, note: "Optimistic concurrency" },
    { area: "Status history audit trail", A: true, B: true, D: true, note: "Full change log" },
    { area: "Rate limiting", A: false, B: false, D: false, note: "Not implemented" },
    { area: "Logging (structured)", A: false, B: false, D: false, note: "Basic ILogger only" },
    { area: "Metrics / OpenTelemetry", A: false, B: false, D: false, note: "Not implemented" },
    { area: "EF Migrations (not EnsureCreated)", A: false, B: false, D: false, note: "Documented upgrade path" },
  ];

  const pctA = Math.round((checks.filter(c => c.A).length / checks.length) * 100);
  const pctB = Math.round((checks.filter(c => c.B).length / checks.length) * 100);
  const pctD = Math.round((checks.filter(c => c.D).length / checks.length) * 100);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        {[
          { k: "A", pct: pctA },
          { k: "B", pct: pctB },
          { k: "D", pct: pctD },
        ].map((item) => (
          <Card key={item.k}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 32, fontWeight: 900, color: approaches[item.k].color }}>
                {item.pct}%
              </div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                Production Ready
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", marginTop: 2 }}>
                Approach {item.k}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <SectionTitle sub="All approaches share the same V2 hardening baseline">
          Production Checklist
        </SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {checks.map((c, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "6px 8px",
                borderRadius: 6,
                background: c.A ? "transparent" : "#fef2f2",
              }}
            >
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: c.A ? "#059669" : "#dc2626",
                  width: 20,
                  textAlign: "center",
                }}
              >
                {c.A ? "✓" : "✗"}
              </span>
              <span
                style={{
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: c.A ? "#334155" : "#dc2626",
                  flex: 1,
                }}
              >
                {c.area}
              </span>
              <span style={{ fontSize: 11, color: "#94a3b8" }}>
                {c.note}
              </span>
            </div>
          ))}
        </div>
      </Card>

      <Card highlight="linear-gradient(135deg, #fefce8, #fef9c3)" style={{ border: "1px solid #fde047" }}>
        <div style={{ display: "flex", gap: 14 }}>
          <span style={{ fontSize: 24 }}>⚡</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#854d0e", marginBottom: 4 }}>
              What's Missing (and Why It's OK)
            </div>
            <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.7, color: "#713f12" }}>
              Rate limiting, structured logging, and OpenTelemetry are deliberately omitted — they're infrastructure concerns that depend on the deployment target (Azure, AWS, K8s). EnsureCreated vs Migrations is documented with a clear upgrade command. I'd rather be transparent about the remaining 27% with a clear path forward than pretend 100% was achieved.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default function App() {
  const [activeSection, setActiveSection] = useState("verdict");

  const renderSection = () => {
    switch (activeSection) {
      case "verdict":
        return <ExecVerdict />;
      case "hiring":
        return <HiringSignal />;
      case "tco":
        return <TotalCost />;
      case "risk":
        return <RiskMatrix />;
      case "team":
        return <TeamFit />;
      case "prod":
        return <ProductionReadiness />;
      default:
        return <ExecVerdict />;
    }
  };

  return (
    <div
      style={{
        fontFamily:
          "'DM Sans', 'Archivo', 'Segoe UI', system-ui, sans-serif",
        maxWidth: 880,
        margin: "0 auto",
        padding: "32px 20px 60px",
        color: "#0f172a",
        background: "#fafbfc",
        minHeight: "100vh",
      }}
    >
      <div style={{ marginBottom: 28 }}>
        <div
          style={{
            fontSize: 10,
            fontWeight: 800,
            color: "#94a3b8",
            textTransform: "uppercase",
            letterSpacing: "1.5px",
            marginBottom: 6,
          }}
        >
          Executive Analysis
        </div>
        <h1
          style={{
            margin: 0,
            fontSize: 28,
            fontWeight: 900,
            letterSpacing: "-0.6px",
            color: "#0f172a",
          }}
        >
          Architectural Decision Analysis
        </h1>
        <p style={{ margin: "6px 0 0", fontSize: 14, color: "#64748b" }}>
          Why I built 3 approaches and which one to ship for each context
        </p>
      </div>

      {/* Navigation */}
      <div
        style={{
          display: "flex",
          gap: 4,
          marginBottom: 24,
          borderBottom: "1px solid #e2e8f0",
          overflowX: "auto",
        }}
      >
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            style={{
              padding: "10px 16px",
              border: "none",
              borderBottom:
                activeSection === s.id
                  ? "2px solid #0f172a"
                  : "2px solid transparent",
              background: "transparent",
              cursor: "pointer",
              fontWeight: activeSection === s.id ? 800 : 500,
              fontSize: 13,
              color: activeSection === s.id ? "#0f172a" : "#94a3b8",
              whiteSpace: "nowrap",
              transition: "all 0.15s",
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {renderSection()}

      {/* Footer */}
      <div
        style={{
          marginTop: 32,
          padding: "16px 20px",
          borderRadius: 12,
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
          textAlign: "center",
        }}
      >
        <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>
          45/45 tests passing across all 3 approaches · V2 security hardening applied · All
          approaches Docker-ready
        </p>
      </div>
    </div>
  );
}
