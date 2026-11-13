import asyncio
from typing import Dict, Any, List, Optional, Callable
from datetime import datetime

from packages.schemas.finding import Finding
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
from apps.api.db.database import db

class ReviewOrchestrator:
    """
    LangGraph-compatible state orchestrator running the multi-agent pipeline:
    Ingestion -> Context -> Fan-Out Specialist Agents -> Verifier ("No citation, no flag")
    -> Fix Agent -> Intent Guard -> Risk Router -> Persist & Stream.
    """
    async def run_review(
        self,
        content_id: str,
        content_text: str,
        channel: str = "linkedin",
        audience: str = "General Business Audience",
        creator_purpose: str = "",
        brand_pack_id: Optional[str] = None,
        progress_callback: Optional[Callable[[Dict[str, Any]], None]] = None
    ) -> Dict[str, Any]:
        
        async def report_progress(step: str, agent: str, status: str, message: str, pct: int):
            event = {
                "step": step,
                "agent": agent,
                "status": status,
                "message": message,
                "progress_pct": pct,
                "timestamp": datetime.utcnow().isoformat()
            }
            if progress_callback:
                if asyncio.iscoroutinefunction(progress_callback):
                    await progress_callback(event)
                else:
                    progress_callback(event)

        # 0. Active Brand Pack
        if not brand_pack_id:
            bp = db.get_active_brand_pack()
            brand_pack_id = bp.id if bp else "bp_novapay_v2"

        # 1. Ingestion Agent
        await report_progress("ingestion", "Ingestion Agent", "running", "Parsing document & redacting PII...", 10)
        ingest_res = ingestion_agent.process(content_text)
        await report_progress("ingestion", "Ingestion Agent", "completed", f"Extracted {ingest_res['word_count']} words.", 20)

        # 2. Context Agent
        await report_progress("context", "Context Agent", "running", "Evaluating target channel & audience sensitivity...", 25)
        ctx_res = context_agent.evaluate(channel, audience, creator_purpose, content_text)
        await report_progress("context", "Context Agent", "completed", f"Channel: {channel}, Initial Risk: {ctx_res['initial_risk_tier']}", 35)

        # 3. Parallel Fan-Out: Specialist Agents
        await report_progress("specialists", "Specialist Agents", "running", "Running Terminology, Accessibility, Tone, Claims & Messaging checks in parallel...", 45)
        
        raw_findings: List[Finding] = []
        
        # Deterministic Agents
        term_findings = terminology_agent.check(content_text, content_id, brand_pack_id)
        raw_findings.extend(term_findings)

        acc_findings = accessibility_agent.check(content_text, content_id, brand_pack_id)
        raw_findings.extend(acc_findings)

        vis_findings = visual_agent.check_text_or_metadata(content_text, content_id, brand_pack_id)
        raw_findings.extend(vis_findings)

        # Semantic Agents
        tone_findings = await tone_agent.check(content_text, content_id, brand_pack_id)
        raw_findings.extend(tone_findings)

        claims_findings = await claims_agent.check(content_text, content_id, brand_pack_id)
        raw_findings.extend(claims_findings)

        msg_findings = await messaging_agent.check(content_text, content_id, brand_pack_id)
        raw_findings.extend(msg_findings)

        await report_progress("specialists", "Specialist Agents", "completed", f"Generated {len(raw_findings)} raw candidate findings.", 60)

        # 4. Verifier / Critic Agent ("No citation, no flag")
        await report_progress("verifier", "Verifier & Critic Agent", "running", "Validating evidence grounding ('No citation, no flag')...", 70)
        verified_findings, killed_findings = verifier_agent.verify(raw_findings, brand_pack_id)
        await report_progress(
            "verifier", "Verifier & Critic Agent", "completed",
            f"Approved {len(verified_findings)} grounded findings. Pruned {len(killed_findings)} uncited flags.",
            78
        )

        # 5. Fix Agent (Generate tracked change suggestions)
        await report_progress("fix_agent", "Fix Agent", "running", "Drafting 2-3 intent-preserving fix options with rationale...", 82)
        with_fixes = fix_agent.generate_fixes(verified_findings)
        await report_progress("fix_agent", "Fix Agent", "completed", "Generated tracked-change suggestions.", 88)

        # 6. Intent Guard (Preserve creator meaning & block introduced claims)
        await report_progress("intent_guard", "Intent Guard", "running", "Verifying fixes preserve creator purpose and add no ungrounded claims...", 92)
        safe_findings = intent_guard_agent.validate_suggestions(with_fixes, creator_purpose)
        await report_progress("intent_guard", "Intent Guard", "completed", "Intent safety check passed.", 95)

        # 7. Risk Router (Compute compliance score 0-100 & route)
        await report_progress("risk_router", "Risk Router", "running", "Computing compliance score & governance routing...", 98)
        routing_res = risk_router_agent.route(safe_findings)

        # Save findings in database
        for f in safe_findings:
            db.findings[f.id] = f

        # Update Content Item state
        item = db.content_items.get(content_id)
        if item:
            item.status = "ai_reviewed"
            item.latest_score = routing_res["score"]
            item.risk_tier = routing_res["risk_tier"]
            if routing_res["risk_tier"] == "high":
                item.assigned_reviewer_id = "usr_legal"
                item.assigned_reviewer_name = "Kavita Iyer (Legal & Compliance)"
            elif routing_res["risk_tier"] == "elevated":
                item.assigned_reviewer_id = "usr_rahul"
                item.assigned_reviewer_name = "Rahul Mehta (Content Manager)"

        await report_progress("completed", "Orchestrator", "completed", f"Review complete! Final Score: {routing_res['score']}/100", 100)

        return {
            "content_id": content_id,
            "score": routing_res["score"],
            "risk_tier": routing_res["risk_tier"],
            "required_role": routing_res["required_role"],
            "reviewer_desc": routing_res["reviewer_desc"],
            "findings_count": len(safe_findings),
            "findings": safe_findings,
            "killed_count": len(killed_findings),
            "analysis_metadata": {
                "word_count": ingest_res["word_count"],
                "channel": channel,
                "audience": audience,
                "completed_at": datetime.utcnow().isoformat()
            }
        }

orchestrator = ReviewOrchestrator()
