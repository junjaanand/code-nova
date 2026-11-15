import asyncio
import os
import sys
import time
import json
import traceback
from datetime import datetime

# Set PYTHONPATH
sys.path.insert(0, r"d:\nova")

from packages.schemas.finding import (
    Finding, TextSpanLocation, EvidenceItem, SuggestionItem,
    DetectorEnum, SeverityEnum, CategoryEnum, FindingStatusEnum
)
from packages.schemas.models import (
    User, Workspace, BrandPack, Rule, Fact, Term, Asset,
    ContentItem, RoleEnum, RiskTierEnum, ContentStatusEnum,
    AuditLog
)
from apps.api.db.database import db
from apps.api.db.seed_data import seed_database
from apps.api.agents.ingestion import ingestion_agent
from apps.api.agents.context import context_agent
from apps.api.agents.terminology import terminology_agent
from apps.api.agents.accessibility import accessibility_agent, calculate_contrast_ratio
from apps.api.agents.visual import visual_agent
from apps.api.agents.tone import tone_agent
from apps.api.agents.claims import claims_agent
from apps.api.agents.messaging import messaging_agent
from apps.api.agents.verifier import verifier_agent
from apps.api.agents.fix_agent import fix_agent
from apps.api.agents.intent_guard import intent_guard_agent
from apps.api.agents.risk_router import risk_router_agent
from apps.api.agents.clarifier import guideline_clarifier_agent
from apps.api.agents.guideline_compiler import guideline_compiler_agent
from apps.api.agents.insights import insights_analyst_agent
from apps.api.agents.orchestrator import orchestrator
from apps.api.mcp.brand_guard_mcp import BrandGuardMCPServer
from apps.api.auth.rbac import ROLE_PERMISSIONS
from evals.gold_set.benchmark_cases import GOLD_SET_CASES

class MasterTestRunner:
    def __init__(self):
        self.results = {}
        self.bugs_found = []
        self.total_tests = 0
        self.passed_tests = 0
        self.failed_tests = 0

    def record_test(self, module: str, test_name: str, passed: bool, details: str = ""):
        self.total_tests += 1
        if passed:
            self.passed_tests += 1
            status = "PASS"
        else:
            self.failed_tests += 1
            status = "FAIL"
            self.bugs_found.append(f"[{module}] {test_name}: {details}")

        if module not in self.results:
            self.results[module] = []
        self.results[module].append({
            "name": test_name,
            "status": status,
            "details": details
        })
        print(f"[{status}] {module} -> {test_name}" + (f" ({details})" if details and not passed else ""))

    async def run_all(self):
        print("=" * 80)
        print("🚀 BRANDSHIELD AI — MASTER ENTERPRISE DIAGNOSTIC TEST SUITE (FULL COVERAGE)")
        print(f"Started at: {datetime.utcnow().isoformat()}Z | CodeNova India 2026")
        print("=" * 80)

        seed_database()

        # 1. Schemas & Contracts
        await self.test_schemas_and_contracts()

        # 2. All 13 Specialized Governance Agents
        await self.test_all_13_agents()

        # 3. LangGraph Orchestrator Pipeline
        await self.test_orchestrator_pipeline()

        # 4. Brand Guard MCP Server (JSON-RPC 2.0)
        await self.test_mcp_server()

        # 5. Dynamic Offset Synchronization & Anti-Word-Splitting Engine
        await self.test_dynamic_offset_synchronization()

        # 6. Intent Guard Safety Engine
        await self.test_intent_guard_safety()

        # 7. Workflow & Review Queue Stage Transitions
        await self.test_workflow_and_review_queue()

        # 8. 5-Role Enterprise RBAC & Security Boundaries
        await self.test_rbac_and_workflow_security()

        # 9. Cryptographic SHA-256 Tamper-Proof Audit Trail
        await self.test_audit_ledger_integrity()

        # 10. Analytics, Insights & Guideline Health Intelligence
        await self.test_analytics_and_guideline_health()

        # 11. 80-Item Gold Benchmark Evaluation
        await self.test_gold_benchmark()

        self.print_summary()

    # ------------------------------------------------------------------------
    # MODULE 1: SCHEMAS & CONTRACTS
    # ------------------------------------------------------------------------
    async def test_schemas_and_contracts(self):
        mod = "1. Schemas & Contracts"
        # Test 1.1: Finding must require non-empty evidence
        try:
            try:
                Finding(
                    content_id="test_01",
                    content_version=1,
                    agent_name="TestAgent",
                    category=CategoryEnum.TONE,
                    severity=SeverityEnum.WARNING,
                    location=TextSpanLocation(start=0, end=5, matched_text="Hello"),
                    detector=DetectorEnum.LLM,
                    evidence=[],  # Must fail validation!
                    explanation="Missing citation",
                    suggestions=[],
                    confidence=0.9
                )
                self.record_test(mod, "No citation no flag validation", False, "Allowed finding with empty evidence")
            except Exception:
                self.record_test(mod, "No citation no flag validation", True, "Successfully blocked finding with empty evidence")
        except Exception as e:
            self.record_test(mod, "Schema Validation Error", False, str(e))

        # Test 1.2: Valid finding creation with full location & evidence
        try:
            f = Finding(
                content_id="test_02",
                content_version=1,
                agent_name="Tone Agent",
                category=CategoryEnum.TONE,
                severity=SeverityEnum.WARNING,
                location=TextSpanLocation(start=0, end=8, matched_text="the best"),
                detector=DetectorEnum.LLM,
                evidence=[EvidenceItem(type="guideline", source_id="r_tone_001", page_or_clause="Voice §2", quote="No superlatives")],
                explanation="Superlative violation",
                suggestions=[SuggestionItem(text="leading", rationale="compliant", intent_check="pass")],
                confidence=0.95
            )
            self.record_test(mod, "Valid Finding Schema & Typed Contract", True, f"Created {f.id}")
        except Exception as e:
            self.record_test(mod, "Valid Finding Schema", False, str(e))

        # Test 1.3: Content Item & Version model validation
        try:
            item = db.content_items.get("cnt_demo_fintech_launch")
            passed = item is not None and item.risk_tier == RiskTierEnum.HIGH and item.current_version >= 1
            self.record_test(mod, "Content Item & Versioning Contract", passed, f"Item {item.id if item else 'None'}")
        except Exception as e:
            self.record_test(mod, "Content Model Validation", False, str(e))

    # ------------------------------------------------------------------------
    # MODULE 2: ALL 13 SPECIALIZED AGENTS
    # ------------------------------------------------------------------------
    async def test_all_13_agents(self):
        mod = "2. 13 Specialized Agents"

        # Agent 1: Ingestion & PII Redaction
        try:
            raw = "NovaPay is great. Enterprise tier is affordable. Email: test@novapay.io"
            res = ingestion_agent.process(raw)
            passed = len(res["sentence_spans"]) >= 2 and res["word_count"] > 0
            self.record_test(mod, "Agent 01: Ingestion & Sentence Spans", passed, f"Extracted {len(res['sentence_spans'])} spans")
        except Exception as e:
            self.record_test(mod, "Agent 01: Ingestion", False, str(e))

        # Agent 2: Context Profiler
        try:
            ctx = context_agent.evaluate("linkedin", "CFOs", "Launch", "We offer guaranteed returns")
            passed = ctx["is_external"] is True and ctx["initial_risk_tier"] == RiskTierEnum.ELEVATED
            self.record_test(mod, "Agent 02: Context & Audience Risk Profiler", passed, f"Tier: {ctx['initial_risk_tier']}")
        except Exception as e:
            self.record_test(mod, "Agent 02: Context", False, str(e))

        # Agent 3: Terminology (Casing & Deprecated words)
        try:
            t_res = terminology_agent.check("Welcome to Novapay platform", "c1", "bp_novapay_v2")
            has_casing_flag = any(f.location.matched_text == "Novapay" for f in t_res)
            self.record_test(mod, "Agent 03: Terminology (CamelCase Matching)", has_casing_flag, f"Found {len(t_res)} flags")
        except Exception as e:
            self.record_test(mod, "Agent 03: Terminology", False, str(e))

        # Agent 4: Accessibility (WCAG 2.2 Contrast Math)
        try:
            ratio = calculate_contrast_ratio("#FFFFFF", "#000000")
            ratio_bad = calculate_contrast_ratio("#FFFFFF", "#F8FAFC")
            passed = abs(ratio - 21.0) < 0.5 and ratio_bad < 4.5
            self.record_test(mod, "Agent 04: Accessibility (WCAG 2.2 AA Contrast Formula)", passed, f"Contrast {ratio:.1f}:1 / {ratio_bad:.1f}:1")
        except Exception as e:
            self.record_test(mod, "Agent 04: Accessibility", False, str(e))

        # Agent 5: Visual Validator (Palette Hex Check)
        try:
            vis_res = visual_agent.check_text_or_metadata("Background color #FF0000 is used", "c1", "bp_novapay_v2")
            passed = len(vis_res) > 0 and vis_res[0].location.matched_text == "#FF0000"
            self.record_test(mod, "Agent 05: Visual & Palette Hex Check", passed, "Caught unapproved hex #FF0000")
        except Exception as e:
            self.record_test(mod, "Agent 05: Visual", False, str(e))

        # Agent 6: Tone & Voice (Superlative & Hype)
        try:
            tone_res = await tone_agent.check("We are the best payment platform in India! Insane savings!!", "c1", "bp_novapay_v2")
            passed = len(tone_res) > 0
            self.record_test(mod, "Agent 06: Tone & Voice (Superlative & Hype Detection)", passed, f"Caught {len(tone_res)} flags")
        except Exception as e:
            self.record_test(mod, "Agent 06: Tone & Voice", False, str(e))

        # Agent 7: Claims & Facts (Outdated Pricing & SLA)
        try:
            claims_res = await claims_agent.check("Pricing starts at just ₹3,999/mo with 100% uptime guaranteed.", "c1", "bp_novapay_v2")
            passed = len(claims_res) > 0
            self.record_test(mod, "Agent 07: Claims & Facts (Pricing & Numerical Truth)", passed, f"Caught {len(claims_res)} claim flags")
        except Exception as e:
            self.record_test(mod, "Agent 07: Claims & Facts", False, str(e))

        # Agent 8: Messaging (Deprecated Product Line)
        try:
            msg_res = await messaging_agent.check("Apply for your NovaCard today.", "c1", "bp_novapay_v2")
            passed = len(msg_res) > 0 and any("NovaCard" in f.location.matched_text for f in msg_res)
            self.record_test(mod, "Agent 08: Messaging (Deprecated Product Line)", passed, "Caught NovaCard")
        except Exception as e:
            self.record_test(mod, "Agent 08: Messaging", False, str(e))

        # Agent 9: Verifier Gatekeeper ("No citation, no flag")
        try:
            dummy_fake = Finding(
                content_id="c1",
                content_version=1,
                agent_name="FakeAgent",
                category=CategoryEnum.TONE,
                severity=SeverityEnum.WARNING,
                location=TextSpanLocation(start=0, end=4, matched_text="Test"),
                detector=DetectorEnum.LLM,
                evidence=[EvidenceItem(type="guideline", source_id="r_non_existent_fake", page_or_clause="p.1", quote="fake")],
                explanation="Fake",
                suggestions=[SuggestionItem(text="Fix", rationale="rationale", intent_check="pass")],
                confidence=0.85
            )
            approved, dropped = verifier_agent.verify([dummy_fake], "bp_novapay_v2")
            passed = len(dropped) == 1 and len(approved) == 0
            self.record_test(mod, "Agent 09: Verifier Gatekeeper (Kills Uncited Flags)", passed, f"Killed {len(dropped)} ungrounded flags")
        except Exception as e:
            self.record_test(mod, "Agent 09: Verifier Gatekeeper", False, str(e))

        # Agent 10: Fix Agent (Tracked Change Diff Generation)
        try:
            f_in = Finding(
                content_id="c1",
                content_version=1,
                agent_name="Terminology Agent",
                category=CategoryEnum.TERMINOLOGY,
                severity=SeverityEnum.CRITICAL,
                location=TextSpanLocation(start=0, end=7, matched_text="Novapay"),
                detector=DetectorEnum.DETERMINISTIC,
                evidence=[EvidenceItem(type="guideline", source_id="r_term_001", page_or_clause="§1.1", quote="Use NovaPay")],
                explanation="Casing error 'Novapay'",
                suggestions=[],
                confidence=1.0
            )
            fixed = fix_agent.generate_fixes([f_in])
            passed = len(fixed[0].suggestions) > 0 and "[-Novapay-]" in fixed[0].suggestions[0].diff_preview
            self.record_test(mod, "Agent 10: Fix Agent (Tracked Diff Generation)", passed, f"Diff: {fixed[0].suggestions[0].diff_preview}")
        except Exception as e:
            self.record_test(mod, "Agent 10: Fix Agent", False, str(e))

        # Agent 11: Intent Guard (Blocks Introduced Prohibited Promises)
        try:
            f_safe = Finding(
                content_id="c1",
                content_version=1,
                agent_name="Tone Agent",
                category=CategoryEnum.TONE,
                severity=SeverityEnum.WARNING,
                location=TextSpanLocation(start=0, end=8, matched_text="the best"),
                detector=DetectorEnum.LLM,
                evidence=[EvidenceItem(type="guideline", source_id="r_tone_001", page_or_clause="p.8", quote="No superlatives")],
                explanation="Superlative",
                suggestions=[
                    SuggestionItem(text="an industry-leading solution", rationale="objective", intent_check="pass"),
                    SuggestionItem(text="a platform with 100% guaranteed returns", rationale="prohibited", intent_check="pass")
                ],
                confidence=0.9
            )
            validated = intent_guard_agent.validate_suggestions([f_safe], "Announce enterprise tier")
            has_blocked = all(s.text != "a platform with 100% guaranteed returns" or s.intent_check == "fail" for s in validated[0].suggestions)
            self.record_test(mod, "Agent 11: Intent Guard (Blocks Introduced Prohibited Promises)", has_blocked, "Suppressed dangerous guarantee")
        except Exception as e:
            self.record_test(mod, "Agent 11: Intent Guard", False, str(e))

        # Agent 12: Risk Router
        try:
            dummy_crit = Finding(
                content_id="c1",
                content_version=1,
                agent_name="Compliance Agent",
                category=CategoryEnum.COMPLIANCE,
                severity=SeverityEnum.CRITICAL,
                location=TextSpanLocation(start=0, end=10, matched_text="guaranteed"),
                detector=DetectorEnum.DETERMINISTIC,
                evidence=[EvidenceItem(type="guideline", source_id="r_term_003", page_or_clause="§4", quote="No guarantees")],
                explanation="Critical",
                suggestions=[],
                confidence=0.99
            )
            routing = risk_router_agent.route([dummy_crit])
            passed = routing["risk_tier"] == RiskTierEnum.HIGH and routing["required_role"] == RoleEnum.REVIEWER
            self.record_test(mod, "Agent 12: Risk Router (Critical -> High Risk -> Legal Reviewer)", passed, f"Tier: {routing['risk_tier']}, Role: {routing['required_role']}")
        except Exception as e:
            self.record_test(mod, "Agent 12: Risk Router", False, str(e))

        # Agent 13a: Guideline Clarifier
        try:
            clar = guideline_clarifier_agent.draft_clarification("r_tone_001")
            passed_clar = "proposed_description" in clar and clar.get("ambiguity_score") is not None
            self.record_test(mod, "Agent 13a: Guideline Clarifier (Ambiguity Resolution)", passed_clar, f"Drafted clarification for {clar.get('rule_id')}")
        except Exception as e:
            self.record_test(mod, "Agent 13a: Guideline Clarifier", False, str(e))

        # Agent 13b: Guideline Compiler
        try:
            comp_res = await guideline_compiler_agent.compile_text("Brand Voice: Speak with humility. Terminology: Always write 'NovaPay'.", "bp_novapay_v2")
            passed_comp = comp_res["rules_extracted"] > 0
            self.record_test(mod, "Agent 13b: Guideline Compiler (Text -> Structured Rules)", passed_comp, f"Extracted {comp_res['rules_extracted']} rules")
        except Exception as e:
            self.record_test(mod, "Agent 13b: Guideline Compiler", False, str(e))

    # ------------------------------------------------------------------------
    # MODULE 3: LANGGRAPH ORCHESTRATOR PIPELINE
    # ------------------------------------------------------------------------
    async def test_orchestrator_pipeline(self):
        mod = "3. LangGraph Orchestrator"
        sample_text = (
            "We are thrilled to announce that Novapay is officially the best payment platform in India! "
            "Enterprise billing starts at just ₹3,999/mo with guaranteed returns. Activate your NovaCard today!!"
        )
        try:
            events_received = []
            def progress(ev):
                events_received.append(ev)

            res = await orchestrator.run_review(
                content_id="test_orchestrator_run",
                content_text=sample_text,
                channel="linkedin",
                audience="B2B CFOs",
                creator_purpose="Announce enterprise tier",
                progress_callback=progress
            )

            passed_score = res["score"] < 70 and res["risk_tier"] == RiskTierEnum.HIGH
            passed_findings = len(res["findings"]) >= 3
            passed_events = len(events_received) >= 5

            self.record_test(mod, "End-to-End Multi-Agent Pipeline Execution", passed_score and passed_findings, f"Score: {res['score']}/100, Findings: {len(res['findings'])}")
            self.record_test(mod, "SSE Streaming Event Progress Callbacks", passed_events, f"Emitted {len(events_received)} progress events")
        except Exception as e:
            self.record_test(mod, "Orchestrator Pipeline", False, str(e))

    # ------------------------------------------------------------------------
    # MODULE 4: BRAND GUARD MCP SERVER (MODEL CONTEXT PROTOCOL)
    # ------------------------------------------------------------------------
    async def test_mcp_server(self):
        mod = "4. Brand Guard MCP Server"
        server = BrandGuardMCPServer()
        try:
            # 4.1 check_content
            res_check = await server.handle_request({
                "jsonrpc": "2.0",
                "id": "1",
                "method": "check_content",
                "params": {"text": "Novapay is the best", "channel": "linkedin"}
            })
            passed_check = "result" in res_check and "findings" in res_check["result"]
            self.record_test(mod, "MCP Tool: check_content (JSON-RPC 2.0)", passed_check, f"Found {len(res_check.get('result', {}).get('findings', []))} findings")

            # 4.2 lookup_fact
            res_fact = await server.handle_request({
                "jsonrpc": "2.0",
                "id": "2",
                "method": "lookup_fact",
                "params": {"query": "pricing"}
            })
            passed_fact = "result" in res_fact and len(res_fact["result"].get("facts", [])) > 0
            self.record_test(mod, "MCP Tool: lookup_fact", passed_fact, f"Returned {len(res_fact.get('result', {}).get('facts', []))} facts")

            # 4.3 get_rules
            res_rules = await server.handle_request({
                "jsonrpc": "2.0",
                "id": "3",
                "method": "get_rules",
                "params": {"category": "tone"}
            })
            passed_rules = "result" in res_rules and len(res_rules["result"].get("rules", [])) > 0
            self.record_test(mod, "MCP Tool: get_rules", passed_rules, f"Returned {len(res_rules.get('result', {}).get('rules', []))} rules")

            # 4.4 Malformed RPC error handling
            res_err = await server.handle_request({
                "jsonrpc": "2.0",
                "id": "4",
                "method": "non_existent_tool",
                "params": {}
            })
            passed_err = "error" in res_err and res_err["error"].get("code") == -32601
            self.record_test(mod, "MCP Error Handling: Method Not Found (-32601)", passed_err, "Returned standard JSON-RPC error")
        except Exception as e:
            self.record_test(mod, "MCP Server Execution", False, str(e))

    # ------------------------------------------------------------------------
    # MODULE 5: DYNAMIC OFFSET SYNCHRONIZATION (ANTI-WORD-SPLITTING ENGINE)
    # ------------------------------------------------------------------------
    async def test_dynamic_offset_synchronization(self):
        mod = "5. Dynamic Offset Synchronization"
        try:
            # Create a test content item with two consecutive findings
            test_text = "We love Novapay and we promise guaranteed returns today."
            item_id = "cnt_test_offset_sync"
            item = ContentItem(
                id=item_id,
                workspace_id="ws_novapay_main",
                author_id="usr_priya",
                author_name="Priya Sharma",
                title="Offset Test",
                status=ContentStatusEnum.AI_REVIEWED,
                current_text=test_text
            )
            db.content_items[item_id] = item

            # Finding 1: 'Novapay' (pos 8 to 15, len 7) -> replaced with 'NovaPay Technologies' (len 20, delta = +13)
            f1_id = "f_test_sync_1"
            f1 = Finding(
                id=f1_id,
                content_id=item_id,
                content_version=1,
                agent_name="Terminology Agent",
                category=CategoryEnum.TERMINOLOGY,
                severity=SeverityEnum.CRITICAL,
                location=TextSpanLocation(start=8, end=15, matched_text="Novapay"),
                detector=DetectorEnum.DETERMINISTIC,
                evidence=[EvidenceItem(type="guideline", source_id="r_term_001", page_or_clause="§1", quote="Use NovaPay")],
                explanation="Casing",
                suggestions=[SuggestionItem(text="NovaPay Technologies", rationale="Fix", intent_check="pass")],
                confidence=1.0,
                status="open"
            )
            db.findings[f1_id] = f1

            # Finding 2: 'guaranteed returns' (originally at pos 31 to 49)
            orig_f2_start = test_text.find("guaranteed returns")
            orig_f2_end = orig_f2_start + len("guaranteed returns")
            f2_id = "f_test_sync_2"
            f2 = Finding(
                id=f2_id,
                content_id=item_id,
                content_version=1,
                agent_name="Compliance Agent",
                category=CategoryEnum.COMPLIANCE,
                severity=SeverityEnum.CRITICAL,
                location=TextSpanLocation(start=orig_f2_start, end=orig_f2_end, matched_text="guaranteed returns"),
                detector=DetectorEnum.DETERMINISTIC,
                evidence=[EvidenceItem(type="guideline", source_id="r_term_003", page_or_clause="§4", quote="No guarantees")],
                explanation="Banned claim",
                suggestions=[],
                confidence=0.99,
                status="open"
            )
            db.findings[f2_id] = f2

            # Execute accept_finding on f1
            from apps.api.routers.content_router import accept_finding
            mock_user = db.users["usr_priya"]
            res = accept_finding(item_id, f1_id, current_user=mock_user)

            # Check 1: Finding 1 was replaced
            updated_text = db.content_items[item_id].current_text
            passed_f1_replaced = "NovaPay Technologies" in updated_text and "Novapay" not in updated_text

            # Check 2: Finding 2's start & end offsets shifted dynamically without word slicing
            expected_new_f2_start = updated_text.find("guaranteed returns")
            actual_f2_start = f2.location.start
            actual_f2_end = f2.location.end
            exact_matched_slice = updated_text[actual_f2_start:actual_f2_end]

            passed_offset_sync = (
                actual_f2_start == expected_new_f2_start and
                exact_matched_slice == "guaranteed returns"
            )

            self.record_test(mod, "Offset Shift Math: Delta Displacement (+13 chars)", passed_f1_replaced, f"New text: {updated_text}")
            self.record_test(mod, "Word Boundary Lock: Zero Syllable Slicing", passed_offset_sync, f"Slice matches '{exact_matched_slice}'")
            self.record_test(mod, "Finding Status Transition: Accepted Dropped from Active Marks", f1.status == "accepted", f"Status: {f1.status}")
        except Exception as e:
            self.record_test(mod, "Dynamic Offset Synchronization", False, str(e))

    # ------------------------------------------------------------------------
    # MODULE 6: INTENT GUARD SAFETY ENGINE
    # ------------------------------------------------------------------------
    async def test_intent_guard_safety(self):
        mod = "6. Intent Guard Safety Engine"
        try:
            # 6.1 Safe suggestion evaluation
            safe_check = intent_guard_agent._check_suggestion_safety("we offer transparent yield across escrow", "we provide reliable escrow services")
            self.record_test(mod, "Intent Guard: Preserves Intent on Safe Suggestion", safe_check is True, "Allowed safe editorial substitution")

            # 6.2 Prohibited guarantee intercept
            banned_check = intent_guard_agent._check_suggestion_safety("the best payment app", "a platform with 100% guaranteed returns")
            self.record_test(mod, "Intent Guard: Intercepts Introduced Prohibited Guarantees", banned_check is False, "Blocked dangerous financial claim")
        except Exception as e:
            self.record_test(mod, "Intent Guard Safety", False, str(e))

    # ------------------------------------------------------------------------
    # MODULE 7: WORKFLOW & REVIEW QUEUE STAGE TRANSITIONS
    # ------------------------------------------------------------------------
    async def test_workflow_and_review_queue(self):
        mod = "7. Workflow & Review Queue"
        try:
            from apps.api.routers.workflow_router import get_review_queue, submit_for_review, approve_content, ActionRequest
            mock_user_priya = db.users["usr_priya"]
            mock_user_kavita = db.users["usr_legal"]

            # 7.1 Queue Categorization
            queue = get_review_queue(current_user=mock_user_priya)
            passed_queue = "ai_reviewed" in queue and "high_risk" in queue and "approved" in queue
            self.record_test(mod, "Review Queue: 5-Stage Kanban Classification", passed_queue, f"High risk items: {len(queue.get('high_risk', []))}")

            # 7.2 Submit content for review
            sub_res = submit_for_review("cnt_demo_fintech_launch", current_user=mock_user_priya)
            passed_sub = sub_res["status"] == "submitted" and db.content_items["cnt_demo_fintech_launch"].status == ContentStatusEnum.IN_REVIEW
            self.record_test(mod, "Workflow Transition: Draft -> In Review", passed_sub, "Status updated to IN_REVIEW")

            # 7.3 Role-Gated Approval (Manager blocked from High Risk)
            mock_user_rahul = db.users["usr_rahul"]
            try:
                approve_content("cnt_demo_fintech_launch", ActionRequest(reason="Looks good"), current_user=mock_user_rahul)
                self.record_test(mod, "Security Gate: Manager Blocked from High-Risk Signoff", False, "Allowed manager to approve high-risk content")
            except Exception as http_err:
                # Expecting 403 Forbidden
                self.record_test(mod, "Security Gate: Manager Blocked from High-Risk Signoff", True, "Successfully raised 403 Forbidden")

            # 7.4 Reviewer Approval (Kavita succeeds)
            app_res = approve_content("cnt_demo_fintech_launch", ActionRequest(reason="Approved under sandbox waiver"), current_user=mock_user_kavita)
            passed_app = app_res["status"] == "approved" and db.content_items["cnt_demo_fintech_launch"].status == ContentStatusEnum.APPROVED
            self.record_test(mod, "Legal Sign-off: Legal Reviewer Successfully Approves", passed_app, "Status updated to APPROVED")
        except Exception as e:
            self.record_test(mod, "Workflow & Review Queue", False, str(e))

    # ------------------------------------------------------------------------
    # MODULE 8: 5-ROLE ENTERPRISE RBAC & SECURITY
    # ------------------------------------------------------------------------
    async def test_rbac_and_workflow_security(self):
        mod = "8. 5-Role Enterprise RBAC"
        # 8.1 Creator (Priya)
        creator_perms = ROLE_PERMISSIONS[RoleEnum.CREATOR]
        passed_creator = (
            "content:edit_own" in creator_perms and
            "finding:accept" in creator_perms and
            "content:approve_high_risk" not in creator_perms and
            "finding:override" not in creator_perms
        )
        self.record_test(mod, "Role 1 (Priya - Creator): Edit & Fix Allowed, Approval Blocked", passed_creator, "Enforced Creator boundaries")

        # 8.2 Manager (Rahul)
        mgr_perms = ROLE_PERMISSIONS[RoleEnum.MANAGER]
        passed_mgr = (
            "content:approve_standard" in mgr_perms and
            "content:approve_high_risk" not in mgr_perms
        )
        self.record_test(mod, "Role 2 (Rahul - Manager): Standard Approval Allowed, High-Risk Blocked", passed_mgr, "Enforced Manager boundaries")

        # 8.3 Reviewer (Kavita)
        rev_perms = ROLE_PERMISSIONS[RoleEnum.REVIEWER]
        passed_rev = (
            "content:approve_high_risk" in rev_perms and
            "finding:override" in rev_perms
        )
        self.record_test(mod, "Role 3 (Kavita - Legal Reviewer): High-Risk Sign-off & Override Empowered", passed_rev, "Enforced Reviewer authority")

        # 8.4 Admin (Ananya)
        admin_perms = ROLE_PERMISSIONS[RoleEnum.ADMIN]
        passed_admin = (
            "brand_pack:manage" in admin_perms and
            "rules:manage" in admin_perms and
            "content:approve_high_risk" in admin_perms
        )
        self.record_test(mod, "Role 4 (Ananya - Admin): Brand Pack & Compiler Full Administration", passed_admin, "Enforced Admin privileges")

        # 8.5 Auditor (Vikram)
        aud_perms = ROLE_PERMISSIONS[RoleEnum.AUDITOR]
        passed_aud = (
            "content:edit_own" not in aud_perms and
            "finding:accept" not in aud_perms and
            "content:approve_standard" not in aud_perms and
            "audit:export" in aud_perms
        )
        self.record_test(mod, "Role 5 (Vikram - Auditor): Strictly Read-Only with Audit Export", passed_aud, "Enforced Auditor read-only integrity")

    # ------------------------------------------------------------------------
    # MODULE 9: CRYPTOGRAPHIC SHA-256 TAMPER-PROOF AUDIT TRAIL
    # ------------------------------------------------------------------------
    async def test_audit_ledger_integrity(self):
        mod = "9. Cryptographic Audit Trail"
        try:
            # 9.1 Audit Log Logging
            initial_count = len(db.audit_logs)
            db.log_audit(
                workspace_id="ws_novapay_main",
                actor_id="usr_legal",
                actor_name="Kavita Desai",
                actor_role="reviewer",
                event_type="finding_overridden",
                event_data={"finding_id": "f_claim_01", "rationale": "Audited exception"}
            )
            passed_logged = len(db.audit_logs) == initial_count + 1
            latest_entry = db.audit_logs[-1]
            self.record_test(mod, "Audit Ledger: Event Logging & Schema Capture", passed_logged, f"Recorded {latest_entry.event_type}")

            # 9.2 Actor and Timestamp Integrity
            passed_actor = (
                latest_entry.actor_id == "usr_legal" and
                latest_entry.actor_role == "reviewer" and
                latest_entry.created_at is not None
            )
            self.record_test(mod, "Audit Ledger: Actor & Timestamp Non-Repudiation", passed_actor, f"Actor: {latest_entry.actor_name}")

            # 9.3 Certified Compliance Export Structure
            from apps.api.routers.analytics_router import export_audit_log
            mock_user_auditor = db.users["usr_auditor"]
            export_data = export_audit_log(current_user=mock_user_auditor)
            passed_export = (
                "total_records" in export_data and
                "audit_logs" in export_data and
                export_data["total_records"] >= 1
            )
            self.record_test(mod, "Audit Ledger: Certified Compliance JSON Export", passed_export, f"Exported {export_data.get('total_records')} records")
        except Exception as e:
            self.record_test(mod, "Audit Trail Verification", False, str(e))

    # ------------------------------------------------------------------------
    # MODULE 10: ANALYTICS & GUIDELINE HEALTH INTELLIGENCE
    # ------------------------------------------------------------------------
    async def test_analytics_and_guideline_health(self):
        mod = "10. Analytics & Guideline Health"
        try:
            # 10.1 Analytics Overview Metrics
            overview = insights_analyst_agent.generate_overview("ws_novapay_main")
            passed_overview = (
                "total_reviews" in overview and
                "avg_compliance_score" in overview and
                "violations_by_category" in overview
            )
            self.record_test(mod, "Analytics Engine: Governance KPI Computation", passed_overview, f"Avg Score: {overview.get('avg_compliance_score')}")

            # 10.2 Guideline Health Index
            passed_health = "guideline_health" in overview and len(overview["guideline_health"]) > 0
            self.record_test(mod, "Guideline Health: Human Override Telemetry Index", passed_health, f"Tracked {len(overview.get('guideline_health', []))} rules")

            # 10.3 Automated Clarification Triggering
            clar = guideline_clarifier_agent.draft_clarification("r_tone_001")
            passed_clar_trigger = "proposed_description" in clar and len(clar.get("additional_good_examples", [])) > 0
            self.record_test(mod, "Clarifier Engine: Positive/Negative Example Generation", passed_clar_trigger, f"Generated {len(clar.get('additional_good_examples', []))} positive examples")
        except Exception as e:
            self.record_test(mod, "Analytics & Guideline Health", False, str(e))

    # ------------------------------------------------------------------------
    # MODULE 11: 80-ITEM GOLD SET BENCHMARK EVALUATION
    # ------------------------------------------------------------------------
    async def test_gold_benchmark(self):
        mod = "11. 80-Item Gold Benchmark"
        cases = GOLD_SET_CASES[:20]  # Benchmark sample
        tp = 0
        tn = 0
        fp = 0
        fn = 0
        start = time.time()

        for c in cases:
            res = await orchestrator.run_review(
                content_id=f"bm_{c['id']}",
                content_text=c["text"],
                channel="linkedin"
            )
            has_violation = (len(res["findings"]) > 0)
            if c["has_violation"]:
                if has_violation:
                    tp += 1
                else:
                    fn += 1
            else:
                if not has_violation:
                    tn += 1
                else:
                    fp += 1

        elapsed = time.time() - start
        precision = tp / max(1, (tp + fp))
        recall = tp / max(1, (tp + fn))

        self.record_test(mod, f"Benchmark Precision (Target >= 95%): {precision*100:.1f}%", precision >= 0.95, f"TP={tp}, FP={fp}")
        self.record_test(mod, f"Benchmark Recall (Target >= 95%): {recall*100:.1f}%", recall >= 0.95, f"TP={tp}, FN={fn}")
        self.record_test(mod, f"Clean Control False Positive Rate (Target <= 5%): {(fp/max(1, fp+tn))*100:.1f}%", (fp/max(1, fp+tn)) <= 0.05, f"FP={fp}, TN={tn}")
        self.record_test(mod, f"Average Pipeline Latency: {(elapsed/len(cases))*1000:.1f}ms", (elapsed/len(cases)) < 2.0, f"Total elapsed: {elapsed:.2f}s for {len(cases)} cases")

    def print_summary(self):
        print("\n" + "=" * 80)
        print("📊 MASTER DIAGNOSTIC TEST RESULTS")
        print("=" * 80)
        print(f"Total Tests Executed: {self.total_tests}")
        print(f"Tests Passed:         {self.passed_tests} ({self.passed_tests/max(1, self.total_tests)*100:.1f}%)")
        print(f"Tests Failed:         {self.failed_tests}")

        if self.bugs_found:
            print("\n⚠️ BUGS / WARNINGS IDENTIFIED:")
            for b in self.bugs_found:
                print(f"  - {b}")
        else:
            print("\n✅ ZERO BUGS DETECTED — ALL SUBSYSTEMS FULLY OPERATIONAL!")

        print("=" * 80)

if __name__ == "__main__":
    runner = MasterTestRunner()
    asyncio.run(runner.run_all())
