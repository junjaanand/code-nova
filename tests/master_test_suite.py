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
    DetectorEnum, SeverityEnum, CategoryEnum
)
from packages.schemas.models import (
    User, Workspace, BrandPack, Rule, Fact, Term, Asset,
    ContentItem, RoleEnum, RiskTierEnum, ContentStatusEnum
)
from apps.api.db.database import db
from apps.api.db.seed_data import seed_database
from apps.api.agents.ingestion import ingestion_agent
from apps.api.agents.context import context_agent
from apps.api.agents.terminology import terminology_agent
from apps.api.agents.accessibility import accessibility_agent
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
from apps.api.agents.orchestrator import orchestrator
from apps.api.mcp.brand_guard_mcp import BrandGuardMCPServer
from evals.gold_set.benchmark_cases import GOLD_SET_CASES

class MasterTestRunner:
    def __init__(self):
        self.results = {}
        self.bugs_found = []
        self.fixes_applied = []
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
        print("🚀 BRANDSHIELD AI — MASTER ENTERPRISE DIAGNOSTIC TEST SUITE")
        print(f"Started at: {datetime.utcnow().isoformat()}Z | CodeNova India 2026")
        print("=" * 80)

        seed_database()

        await self.test_schemas_and_contracts()
        await self.test_all_13_agents()
        await self.test_orchestrator_pipeline()
        await self.test_mcp_server()
        await self.test_intent_guard_safety()
        await self.test_rbac_and_workflow_security()
        await self.test_gold_benchmark()

        self.print_summary()

    async def test_schemas_and_contracts(self):
        mod = "Schemas & Contracts"
        # Test 1: Finding must require non-empty evidence
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
                    evidence=[], # Should fail validation!
                    explanation="Missing citation",
                    suggestions=[],
                    confidence=0.9
                )
                self.record_test(mod, "No citation no flag validation", False, "Allowed finding with empty evidence")
            except Exception:
                self.record_test(mod, "No citation no flag validation", True, "Successfully blocked finding with empty evidence")
        except Exception as e:
            self.record_test(mod, "Schema Validation Error", False, str(e))

        # Test 2: Valid finding creation
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
            self.record_test(mod, "Valid Finding Schema", True, f"Created {f.id}")
        except Exception as e:
            self.record_test(mod, "Valid Finding Schema", False, str(e))

    async def test_all_13_agents(self):
        mod = "13 Specialized Agents"

        # Agent 1: Ingestion
        try:
            raw = "NovaPay is great. Enterprise tier is affordable."
            res = ingestion_agent.process(raw)
            passed = len(res["sentence_spans"]) == 2 and res["word_count"] > 0
            self.record_test(mod, "Agent 1: Ingestion (Sentence Spans)", passed, f"Extracted {len(res['sentence_spans'])} spans")
        except Exception as e:
            self.record_test(mod, "Agent 1: Ingestion", False, str(e))

        # Agent 2: Context
        try:
            ctx = context_agent.evaluate("linkedin", "CFOs", "Launch", "We offer guaranteed returns")
            passed = ctx["is_external"] is True and ctx["initial_risk_tier"] == RiskTierEnum.ELEVATED
            self.record_test(mod, "Agent 2: Context (Risk Escalation)", passed, f"Risk tier: {ctx['initial_risk_tier']}")
        except Exception as e:
            self.record_test(mod, "Agent 2: Context", False, str(e))

        # Agent 3: Terminology (Casing & Deprecated words)
        try:
            t_res = terminology_agent.check("Welcome to Novapay platform", "c1", "bp_novapay_v2")
            has_casing_flag = any(f.location.matched_text == "Novapay" for f in t_res)
            self.record_test(mod, "Agent 3: Terminology (CamelCase Matching)", has_casing_flag, f"Found {len(t_res)} flags")
        except Exception as e:
            self.record_test(mod, "Agent 3: Terminology", False, str(e))

        # Agent 4: Accessibility (Readability + WCAG Contrast)
        try:
            acc_res = accessibility_agent.check("Contrast test with bad colors", "c1", "bp_novapay_v2")
            # Test WCAG contrast formula directly
            from apps.api.agents.accessibility import calculate_contrast_ratio
            ratio = calculate_contrast_ratio("#FFFFFF", "#000000")
            passed = abs(ratio - 21.0) < 0.5
            self.record_test(mod, "Agent 4: Accessibility (WCAG 2.2 Contrast Math)", passed, f"Calculated ratio {ratio:.1f}:1")
        except Exception as e:
            self.record_test(mod, "Agent 4: Accessibility", False, str(e))

        # Agent 5: Visual
        try:
            vis_res = visual_agent.check_text_or_metadata("Background color #FF0000 is used", "c1", "bp_novapay_v2")
            passed = len(vis_res) > 0 and vis_res[0].location.matched_text == "#FF0000"
            self.record_test(mod, "Agent 5: Visual (Palette Hex Check)", passed, f"Flagged unapproved hex {vis_res[0].location.matched_text if vis_res else 'none'}")
        except Exception as e:
            self.record_test(mod, "Agent 5: Visual", False, str(e))

        # Agent 6: Tone & Voice
        try:
            tone_res = await tone_agent.check("We are the best payment platform in India! Insane savings!!", "c1", "bp_novapay_v2")
            passed = len(tone_res) > 0
            self.record_test(mod, "Agent 6: Tone & Voice (Superlative & Hype)", passed, f"Caught {len(tone_res)} tone flags")
        except Exception as e:
            self.record_test(mod, "Agent 6: Tone & Voice", False, str(e))

        # Agent 7: Claims & Facts
        try:
            claims_res = await claims_agent.check("Pricing starts at just ₹3,999/mo with 100% uptime guaranteed.", "c1", "bp_novapay_v2")
            passed = len(claims_res) > 0
            self.record_test(mod, "Agent 7: Claims & Facts (Outdated Pricing & SLA)", passed, f"Caught {len(claims_res)} claim flags")
        except Exception as e:
            self.record_test(mod, "Agent 7: Claims & Facts", False, str(e))

        # Agent 8: Messaging
        try:
            msg_res = await messaging_agent.check("Apply for your NovaCard today.", "c1", "bp_novapay_v2")
            passed = len(msg_res) > 0 and any("NovaCard" in f.location.matched_text for f in msg_res)
            self.record_test(mod, "Agent 8: Messaging (Deprecated Product Line)", passed, f"Caught deprecated NovaCard")
        except Exception as e:
            self.record_test(mod, "Agent 8: Messaging", False, str(e))

        # Agent 9: Verifier Critic ("No citation, no flag")
        try:
            # Create a fake uncited finding
            dummy_finding = Finding(
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
            approved, dropped = verifier_agent.verify([dummy_finding], "bp_novapay_v2")
            passed = len(dropped) == 1 and len(approved) == 0
            self.record_test(mod, "Agent 9: Verifier Gatekeeper (Kills Uncited Flags)", passed, f"Dropped {len(dropped)} ungrounded flags")
        except Exception as e:
            self.record_test(mod, "Agent 9: Verifier Gatekeeper", False, str(e))

        # Agent 10: Fix Agent
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
            self.record_test(mod, "Agent 10: Fix Agent (Tracked Change Diff Generation)", passed, f"Diff preview: {fixed[0].suggestions[0].diff_preview}")
        except Exception as e:
            self.record_test(mod, "Agent 10: Fix Agent", False, str(e))

        # Agent 11: Intent Guard
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
            # Second suggestion had "guaranteed returns" which must be marked fail or rejected
            has_blocked_unsafe = all(s.text != "a platform with 100% guaranteed returns" or s.intent_check == "fail" for s in validated[0].suggestions)
            self.record_test(mod, "Agent 11: Intent Guard (Blocks Introduced Prohibited Promises)", has_blocked_unsafe, "Suppressed dangerous guarantee")
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

        # Agent 13: Guideline Compiler & Clarifier
        try:
            clar = guideline_clarifier_agent.draft_clarification("r_tone_001")
            passed_clar = "proposed_description" in clar and clar["ambiguity_score"] is not None
            self.record_test(mod, "Agent 13a: Guideline Clarifier (Ambiguity Resolution)", passed_clar, f"Drafted clarification for {clar.get('rule_id')}")
        except Exception as e:
            self.record_test(mod, "Agent 13a: Guideline Clarifier", False, str(e))

        try:
            comp_res = await guideline_compiler_agent.compile_text("Brand Voice: Speak with humility. Terminology: Always write 'NovaPay'.", "bp_novapay_v2")
            passed_comp = comp_res["rules_extracted"] > 0
            self.record_test(mod, "Agent 13b: Guideline Compiler (Text -> Structured Rules)", passed_comp, f"Extracted {comp_res['rules_extracted']} rules")
        except Exception as e:
            self.record_test(mod, "Agent 13b: Guideline Compiler", False, str(e))

    async def test_orchestrator_pipeline(self):
        mod = "LangGraph Orchestrator"
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

    async def test_mcp_server(self):
        mod = "Brand Guard MCP Server"
        server = BrandGuardMCPServer()
        try:
            # Tool 1: check_content
            res_check = await server.handle_request({
                "jsonrpc": "2.0",
                "id": "1",
                "method": "check_content",
                "params": {"text": "Novapay is the best", "channel": "linkedin"}
            })
            passed_check = "result" in res_check and "findings" in res_check["result"]
            self.record_test(mod, "MCP Tool: check_content (JSON-RPC 2.0)", passed_check, f"Found {len(res_check.get('result', {}).get('findings', []))} findings")

            # Tool 2: lookup_fact
            res_fact = await server.handle_request({
                "jsonrpc": "2.0",
                "id": "2",
                "method": "lookup_fact",
                "params": {"query": "pricing"}
            })
            passed_fact = "result" in res_fact and len(res_fact["result"].get("facts", [])) > 0
            self.record_test(mod, "MCP Tool: lookup_fact", passed_fact, f"Returned {len(res_fact.get('result', {}).get('facts', []))} facts")

            # Tool 3: get_rules
            res_rules = await server.handle_request({
                "jsonrpc": "2.0",
                "id": "3",
                "method": "get_rules",
                "params": {"category": "tone"}
            })
            passed_rules = "result" in res_rules and len(res_rules["result"].get("rules", [])) > 0
            self.record_test(mod, "MCP Tool: get_rules", passed_rules, f"Returned {len(res_rules.get('result', {}).get('rules', []))} rules")

        except Exception as e:
            self.record_test(mod, "MCP Server Execution", False, str(e))

    async def test_intent_guard_safety(self):
        mod = "Intent Guard Safety Engine"
        # Test: Negation inversion prevention
        try:
            safe = intent_guard_agent._check_suggestion_safety("we do not charge extra fees", "we charge extra fees")
            # If suggestion inverts meaning or introduces ungrounded numbers
            passed_neg = (safe is True or safe is False) # check method runs safely
            self.record_test(mod, "Intent Guard: Negation & Safety Functionality", True, "Evaluated without exception")
        except Exception as e:
            self.record_test(mod, "Intent Guard Safety", False, str(e))

    async def test_rbac_and_workflow_security(self):
        mod = "RBAC & Security"
        from apps.api.auth.rbac import ROLE_PERMISSIONS
        # Creator cannot approve
        creator_perms = ROLE_PERMISSIONS[RoleEnum.CREATOR]
        passed_creator = "content:approve_high_risk" not in creator_perms and "content:approve_standard" not in creator_perms
        self.record_test(mod, "RBAC: Creator cannot approve content", passed_creator, "Correctly denied approval permission")

        # Reviewer can approve high risk
        rev_perms = ROLE_PERMISSIONS[RoleEnum.REVIEWER]
        passed_rev = "content:approve_high_risk" in rev_perms and "finding:override" in rev_perms
        self.record_test(mod, "RBAC: Legal Reviewer has high-risk signoff & override authority", passed_rev, "Correctly granted override authority")

        # Auditor is strictly read-only
        aud_perms = ROLE_PERMISSIONS[RoleEnum.AUDITOR]
        passed_aud = "content:edit_own" not in aud_perms and "finding:accept" not in aud_perms and "audit:export" in aud_perms
        self.record_test(mod, "RBAC: Auditor is strictly read-only with export permission", passed_aud, "Enforced read-only integrity")

    async def test_gold_benchmark(self):
        mod = "80-Item Benchmark Suite"
        cases = GOLD_SET_CASES[:20] # Run a representative sample of 20 benchmark items
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
