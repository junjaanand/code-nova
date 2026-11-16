# 🏆 BrandShield AI — CodeNova India 2026: Round 2 Official Submission
### Theme: Pre-Publication Brand Governance & Multi-Agent Consistency Enforcement
**Repository:** [https://github.com/junjaanand/code-nova.git](https://github.com/junjaanand/code-nova.git)  
**Submission Window:** Round 2 (The Build) — Due Monday, 16 November 2026 at 10:00 AM IST  
**Live Application URL:** `http://localhost:3000` (Localhost) | Public Tunnel / Deployed Link Available  
**Interactive Master Guide:** `http://localhost:3000/guide.html`  
**FastAPI Swagger Docs:** `http://localhost:8000/docs`  

---

## 👥 1. Team Members & Individual Contribution Statements
*(Note: As required by CodeNova rules, both members submit individually on the portal with these exact contribution lines for certificate generation)*

### 1.1 Varun (Team Lead)
* **Title / Role:** `AI/ML & Architecture Lead`
* **Personal Contribution Statement (Prints on Certificate):**  
  > *"Engineered the 13-agent LangGraph orchestrator, Brand Guard Model Context Protocol (MCP) server, deterministic-first verification gatekeeper, and the 47-test end-to-end diagnostic suite."*
* **Primary Modules Owned:**
  * Backend Architecture in Python 3.11 / FastAPI.
  * 13 Specialized Governance Agents (Ingestion, Context, Terminology, Accessibility, Visual, Tone & Voice, Claims & Facts, Messaging, Verifier Critic Gate, Fix Agent, Intent Guard, Risk Router, Guideline Compiler & Clarifier).
  * Brand Guard MCP Server (`apps/api/mcp/brand_guard_mcp.py`) supporting JSON-RPC 2.0 for external tools (ChatGPT, Claude Desktop, Cursor).
  * 47-Test Master Diagnostic Suite (`tests/master_test_suite.py`) with 100% pass rate.
  * 80-Item Gold Benchmark Evaluation (`evals/eval_harness.py`).

### 1.2 Vanshika Mamdyal
* **Title / Role:** `Frontend & UX Lead`
* **Personal Contribution Statement (Prints on Certificate):**  
  > *"Built the Next.js 15 App Router interface, Tiptap ProseMirror document canvas with dynamic offset synchronization, 5-role Kanban review queue, and dark/light UI design system."*
* **Primary Modules Owned:**
  * Next.js 15 App Router & React 19 Frontend architecture.
  * Tiptap / ProseMirror Document Canvas (`apps/web/components/editor/TiptapEditor.tsx`) with dynamic word-boundary highlight synchronization.
  * Side-by-side Evidence Drawer showing 100% verified Brand Pack citations.
  * 5-Role Kanban Approval Queue (`apps/web/components/review-queue/KanbanBoard.tsx`).
  * Dynamic Role-Scoped Sidebar (`apps/web/components/layout/Sidebar.tsx`) and Centered 54px Command Header.
  * Standalone Interactive Master Guide (`BrandShield_Master_Home_Guide.html`).

---

## 🚀 2. The Three Named Improvements for Round 3 (15 Rubric Points)

As proposed in our Round 1 plan, here are the three substantial improvements delivered with measurable proof:

| # | Named Improvement | Architecture Deliverable | Measured Benchmark Proof |
| :--- | :--- | :--- | :--- |
| **1** | **Evidence-Grounded Abstention Engine** | Strict "No citation, no flag" Verifier Critic Gate. Automatically drops any candidate flag that cannot cite an exact clause, version, or fact. | **100.0% Citation Validity** on 80-item Gold Benchmark. Zero hallucinated guideline clauses. |
| **2** | **Intent Guard Semantic Fix Engine** | Cross-sentence coherence and negation preservation. Generates tracked changes while mathematically blocking introduced prohibited promises (e.g. guarantees). | **100.0% Fix Pass Rate** on immediate re-scan. Zero new ungrounded claims introduced. |
| **3** | **Guideline Health Intelligence & Clarifier** | Telemetry engine analyzing human reviewer override patterns to detect ambiguous rules and auto-generate clarified wording with positive/negative examples for Admin approval. | Successfully detects high-override rules (e.g. `r_tone_001` at 16.7% override) and drafts structured amendments in Brand Pack v3. |

---

## 🛠️ 3. Full List of Completed Features

### 3.1 Core Review Engine
* **Hybrid Detection Architecture:** Deterministic exact phrase matching ($0\text{ms}$ latency), WCAG 2.2 AA relative luminance math ($4.5:1$ contrast ratio), and semantic LLM evaluation with instant circuit breakers.
* **"No Citation, No Flag" Gatekeeper:** Every single flag cites the exact guideline clause, approved fact, or asset (e.g., *Brand Glossary §1.1* or *Pricing Sheet 2026 v2.4*). Uncited flags are permanently purged.
* **Dynamic Offset Synchronization:** Eliminates word-splitting bugs on fix acceptance. Character displacement ($\Delta = L_{new} - L_{old}$) shifts subsequent open findings while dynamically re-anchoring to exact word boundaries.
* **13-Agent LangGraph Pipeline:** Parallel execution across Ingestion, Context, Terminology, Accessibility, Visual, Tone & Voice, Claims & Facts, Messaging, Verifier Gatekeeper, Fix Agent, Intent Guard, Risk Router, and Guideline Clarifier.

### 3.2 Human Control & 5-Role Governance (RBAC)
* **✍️ Priya (Creator):** Drafts content, views real-time inline citations, clicks "Apply Fix" for safe tracked changes, submits for approval. Blocked from self-approving high-risk copy.
* **📋 Rahul (Manager):** Triages 5-stage Kanban queue (Pending AI, AI Reviewed, High Risk Review, Approved, Published), approves standard/elevated risk posts, monitors SLA velocity.
* **⚖️ Kavita (Legal Reviewer):** Exclusive high-risk sign-off authority, inspects 100% verifier grounding confidence, executes overrides with mandatory compliance justification.
* **🛡️ Ananya (Admin):** Manages Brand Pack (17 rules, 14 facts, terms, assets), runs Guideline Compiler to turn raw text/PDFs into structured JSON rules, monitors Guideline Health.
* **👁️ Vikram (Auditor):** Strictly read-only mode, tamper-evident canvas watermarks, inspects immutable SHA-256 audit logs, exports certified compliance JSON certificates.

### 3.3 Ecosystem & Model Context Protocol (MCP)
* **Brand Guard MCP Server:** Native JSON-RPC 2.0 server (`apps/api/mcp/brand_guard_mcp.py`) exposing `check_content`, `lookup_fact`, and `get_rules` so external AI agents (Claude Desktop, Cursor, ChatGPT) can pre-screen drafts before submission.

---

## 🧪 4. Evaluation & Diagnostic Test Results

* **Master Diagnostic Test Suite (`tests/master_test_suite.py`):**
  * **Total Tests Executed:** 47
  * **Tests Passed:** 47 (100.0%)
  * **Tests Failed:** 0
  * **Subsystems Covered:** Universal Pydantic Schemas, 13 Specialized Agents, LangGraph Pipeline, MCP Server, Dynamic Offset Synchronization, Intent Guard Safety, Review Queue Kanban, 5-Role RBAC Security, Cryptographic SHA-256 Audit Trail, Analytics Engine, and 80-Item Gold Benchmark.
* **80-Item Gold Set Evaluation Benchmark:**
  * **Citation Grounding Rate:** **100.0%** (Target: 100%)
  * **Detection Precision:** **100.0%** (Target: > 90%)
  * **Detection Recall:** **100.0%** (Target: > 90%)
  * **Clean Control False Positive Rate:** **0.0%** (Target: < 5%)
  * **Average Pipeline Latency:** **90.5 ms** (Target: < 250 ms)

---

## ⚡ 5. Quickstart & How Judges Can Run It

### Prerequisites
* Python 3.11+
* Node.js 18+ and npm

### Step 1: Start Backend
```powershell
$env:PYTHONPATH="."
python -m uvicorn apps.api.main:app --host 0.0.0.0 --port 8000 --reload
```
*FastAPI Swagger interactive docs available at: `http://localhost:8000/docs`*

### Step 2: Start Frontend
```powershell
cd apps/web
npm install
npm run dev
```
*Open `http://localhost:3000` in your browser.*

### Step 3: Run the 47-Test Master Suite
```powershell
$env:PYTHONPATH="."
python -u tests/master_test_suite.py
```

### Step 4 (Optional): Instant Public HTTPS URL for Remote Judges
```powershell
# In a new terminal:
npx cloudflared tunnel --url http://localhost:3000
# Or:
npx localtunnel --port 3000
```

---

## 🎬 6. 3-Minute Live Demo Script for Evaluators

1. **Open `http://localhost:3000` (Priya - Creator Desk):**
   * Notice the Document Canvas is pre-loaded with `Q3 Enterprise Launch Announcement — LinkedIn`.
   * Observe 3 open violations highlighted in yellow/red: `Novapay`, `the best payment platform in India`, and `₹3,999/mo`.
   * Click on `Novapay`: the right-hand Evidence Drawer displays the exact citation (*Brand Glossary §1.1*), 100% verifier confidence, and the Intent-Safe suggestion `NovaPay`.
   * Click **Apply Fix →**: the brand name replaces instantly with whole, intact words (zero offset desynchronization).
2. **Switch Persona to Rahul (Manager):**
   * Click **📋 Rahul** in the top navbar.
   * The sidebar automatically filters to 3 tabs (*Approval Queue*, *Content Inspection*, *Team Analytics*).
   * Open `/queue` to inspect the Kanban board. See low-risk vs high-risk routing.
3. **Switch Persona to Kavita (Legal Reviewer):**
   * Click **⚖️ Kavita** in the top navbar.
   * Notice the emerald Legal Desk indicator and the high-risk escalation.
   * Test the override workflow: click **Override Finding** and observe that the system enforces entering a mandatory legal justification before saving.
4. **Switch Persona to Ananya (Admin):**
   * Click **🛡️ Ananya** in the top navbar.
   * Open `/brand-pack` to browse the 17 active rules and 14 verified facts.
   * Check **Guideline Health** to see automated ambiguity scores and one-click clarification drafts.
5. **Switch Persona to Vikram (Auditor):**
   * Click **👁️ Vikram** in the top navbar.
   * Notice the amber Auditor Banner and the locked read-only state.
   * Click **Export Certified JSON Audit Log** to verify the cryptographic SHA-256 audit trail.

---

## 📜 7. Mandatory Disclosures (Rules 6, 7 & 10)

* **Third-Party Libraries & Frameworks:** Next.js 15 (App Router), FastAPI, Tailwind CSS, Lucide React, Tiptap (ProseMirror), Recharts.
* **AI Models & Gateway:** Google Gemini 2.5 Flash (via Google GenAI SDK / LiteLLM routing) with deterministic circuit breakers.
* **Templates & Boilerplate:** UI layout and components built with Tailwind CSS. All business logic, multi-agent pipelines, MCP tools, and schemas were engineered by the team during the official CodeNova India 2026 build window.
* **Plagiarism & Integrity Statement:** This project is the original work of Varun and Vanshika Mamdyal. No proprietary code was copied, and all evidence benchmarks are reproducible via `evals/eval_harness.py`.
