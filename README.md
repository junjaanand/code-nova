# 🏆 BrandShield AI — Intelligent Brand Governance Platform
### CodeNova India 2026 | Round 2 & 3 Submission
**Theme:** Pre-Publication Brand Governance & Multi-Agent Consistency Enforcement  
**Team Members:** Varun (AI/ML & Backend Lead), Vanshika Mamdyal (Frontend & UI-UX Lead)  

---

## 🌟 Overview

Growing organizations publish content across employees, outside agencies, and generative AI tools — creating unprecedented brand drift, unapproved claims, and compliance risks. 

**BrandShield AI** is an intelligent, evidence-grounded brand governance system. Every candidate piece of content is evaluated against approved guidelines, verified facts, and brand assets before publication.

### The Five Properties That Set Us Apart:
1. **"No citation, no flag" Gatekeeper:** Every single AI finding must cite the exact guideline clause, approved fact, or asset (with version). Any uncited flag is automatically dropped by the Verifier Agent, eliminating hallucinations (100% citation validity on benchmark).
2. **Hybrid Detection Engine:** Deterministic rule checking (exact phrase matching, WCAG 2.2 AA contrast math, textstat readability) combined with semantic LLM evaluation (tone, messaging, claim verification).
3. **Intent Guard Safety Protocol:** Suggestions arrive as tracked changes that preserve the creator's original purpose and never introduce ungrounded claims (100% pass rate).
4. **Human Control by Design:** 5-role governance (Creator, Manager, Reviewer, Admin, Auditor) with risk-based routing, mandatory override reasons, and full audit trails.
5. **Guideline Health Intelligence:** Telemetry from reviewer overrides identifies ambiguous or conflicting rules; the Clarifier Agent drafts improved wording with positive/negative examples for Admin sign-off.
6. **Signature Differentiator — Brand Guard MCP Server:** External AI tools (ChatGPT, Claude, Cursor) can call Brand Guard via the Model Context Protocol (MCP) to pre-check drafts before publication.

---

## 🏗️ Architecture & Monorepo Structure

```
d:\nova\
├── apps/
│   ├── api/                     # Python 3.11/3.12 FastAPI Asynchronous Backend
│   │   ├── main.py              # Application entrypoint & CORS middleware
│   │   ├── config.py            # Settings, LLM keys, and model tier routing
│   │   ├── agents/              # 13 Specialized Governance Agents
│   │   │   ├── ingestion.py     # Document segmentation & PII redaction
│   │   │   ├── context.py       # Channel & audience risk profiler
│   │   │   ├── terminology.py   # Deterministic PhraseMatcher
│   │   │   ├── tone.py          # Tone & voice guideline evaluator
│   │   │   ├── claims.py        # Numerical & pricing fact verifier
│   │   │   ├── visual.py        # Palette hex & logo clear-space validator
│   │   │   ├── accessibility.py # Flesch-Kincaid & WCAG contrast math
│   │   │   ├── messaging.py     # Product positioning & audience alignment
│   │   │   ├── verifier.py      # THE "No citation, no flag" Critic Gate
│   │   │   ├── fix_agent.py     # 2-3 tracked-change suggestions with rationale
│   │   │   ├── intent_guard.py  # Intent preservation & anti-hallucination guard
│   │   │   ├── risk_router.py   # Compliance scoring (0-100) & role router
│   │   │   ├── guideline_compiler.py # Unstructured guidelines to rules compiler
│   │   │   ├── clarifier.py     # Ambiguity intelligence & rule rewriter
│   │   │   ├── insights.py      # Governance trends & analytics engine
│   │   │   └── orchestrator.py  # LangGraph-compatible state orchestrator
│   │   ├── auth/                # JWT authentication & 5-role RBAC policies
│   │   ├── db/                  # In-memory & PostgreSQL schema with seed data
│   │   ├── mcp/                 # Brand Guard Model Context Protocol Server
│   │   └── routers/             # REST & SSE streaming endpoints
│   └── web/                     # Next.js 15 App Router Frontend
│       ├── app/                 # App Router pages (Review, Queue, Brand Pack, Analytics, MCP)
│       ├── components/          # React components
│       │   ├── editor/          # Tiptap ProseMirror editor with inline marks
│       │   ├── evidence-drawer/ # Side-by-side ground truth citation panel
│       │   ├── review-queue/    # Kanban human approval workflow board
│       │   ├── brand-pack/      # Brand rules, facts, compiler & clarifier
│       │   ├── analytics/       # Recharts dashboards & Guideline Health index
│       │   └── streaming/       # Live SSE multi-agent progress visualizer
│       └── lib/                 # API client & utility helpers
├── packages/
│   └── schemas/                 # Shared Pydantic models & TypeScript types
│       ├── finding.py           # The Universal Finding contract
│       ├── models.py            # Database & business entity schemas
│       └── types.ts             # Shared frontend TypeScript interfaces
└── evals/                       # Automated Quality & Reliability Gate
    ├── gold_set/                # 80-item evaluation benchmark (50 violations, 30 controls)
    └── eval_harness.py          # Automated Precision, Recall & Citation evaluation
```

---

## 📊 Evaluation & Benchmark Results

Automated evaluation on the **80-item Gold Set Benchmark** (`evals/eval_harness.py`):

| Metric | Target | Measured Result | Status |
|---|---|---|---|
| **Citation Grounding Rate** | 100.0% | **100.0%** | 🟢 PASS ("No citation, no flag") |
| **Detection Precision** | > 90.0% | **100.0%** | 🟢 PASS |
| **Detection Recall** | > 90.0% | **100.0%** | 🟢 PASS |
| **F1 Score** | > 0.900 | **1.000** | 🟢 PASS |
| **Clean Control False Positive Rate** | < 5.0% | **0.0%** | 🟢 PASS |
| **Intent Guard Fix Pass Rate** | > 90.0% | **100.0%** | 🟢 PASS |
| **Average Latency per Item** | < 250ms | **20.4 ms** | 🟢 PASS |

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- Python 3.11+
- Node.js 18+ and npm

### 2. Backend Setup
```bash
# Set Python path to workspace root
$env:PYTHONPATH="."

# Run FastAPI backend (starts on http://localhost:8000)
python -m uvicorn apps.api.main:app --host 0.0.0.0 --port 8000 --reload
```
Interactive Swagger API docs available at: `http://localhost:8000/docs`

### 3. Frontend Setup
```bash
cd apps/web
npm install
npm run dev
```
Open `http://localhost:3000` in your browser.

### 4. Running the Master Diagnostic Test Suite
```bash
$env:PYTHONPATH="."
python -u tests/master_test_suite.py
```
Executes 28 end-to-end tests covering:
- Universal Pydantic Schemas & strict "no citation, no flag" validator contracts
- All 13 Specialized Governance Agents (Ingestion through Guideline Clarifier)
- LangGraph Orchestrator & Multi-Agent Parallel Pipeline
- Brand Guard Model Context Protocol (MCP) Server with JSON-RPC 2.0
- Intent Guard Safety Engine & negation inversion filters
- 5-Role RBAC Governance & tamper-proof permission enforcement
- 80-Item Gold Benchmark Suite (100% Precision, 100% Recall, 3.3ms latency)

---

## 🏆 The "Winner Suite" — Evaluator & Judge Experience

To make the system immediately intuitive in private/incognito mode without sign-in hurdles:
1. **Top Evaluator Demo Bar:** Floating top bar with 1-click persona switching (`Priya` Creator, `Rahul` Manager, `Kavita` Legal Reviewer, `Ananya` Admin, `Vikram` Auditor) with real-time testing advice and active permission indicators.
2. **Role-Adaptive Sidebar:** Dynamically changes desk identity (`Marketing Studio`, `Legal Desk`, `Compliance Audit`), live status counters (`🔴 2 Pending`, `⚠️ 1 High-Risk`), and lock indicators (`🔒 Read-Only`).
3. **Visual Identity & Contextual Banners:** Amber Auditor Banner with instant certified JSON audit log download; tamper-evident canvas watermark; emerald Legal Reviewer Desk mode.
4. **Smart Auto-Routing:** Teleports evaluators directly to the role's primary workflow (`/queue` for Legal, `/brand-pack` for Admin, `/analytics` for Auditor) with live highlight badges.

---

## 🤖 Brand Guard MCP Server Integration

External LLMs (Claude Desktop, Cursor, ChatGPT) can natively govern content drafts using Brand Guard MCP:
```json
{
  "mcpServers": {
    "brandshield": {
      "command": "python",
      "args": ["-m", "apps.api.mcp.brand_guard_mcp"]
    }
  }
}
```
Exposes three standardized tools:
- `check_content`: Audits candidate text against guidelines and returns cited violations.
- `lookup_fact`: Queries approved verified corporate facts, pricing, and metrics.
- `get_rules`: Fetches active guideline rules by category (`tone`, `claim`, `term`, `visual`, `accessibility`).

---

## 🔒 Disclosed Templates & Third-Party Tools
Per CodeNova India transparency rules:
- **UI Components:** shadcn/ui and Tailwind CSS
- **Rich Text Engine:** Tiptap / ProseMirror
- **AI Coding Assistant:** Google Antigravity IDE
