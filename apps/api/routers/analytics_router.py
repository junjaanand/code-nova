from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any
from apps.api.db.database import db
from apps.api.agents.insights import insights_analyst_agent
from apps.api.agents.clarifier import guideline_clarifier_agent
from apps.api.auth.jwt import get_current_user_from_token

router = APIRouter(prefix="/analytics", tags=["Analytics & Guideline Health"])

@router.get("/overview")
def get_analytics_overview():
    return insights_analyst_agent.generate_overview("ws_novapay_main")

@router.get("/guideline-health")
def get_guideline_health():
    overview = insights_analyst_agent.generate_overview("ws_novapay_main")
    return {
        "guideline_health": overview["guideline_health"],
        "high_ambiguity_count": sum(1 for g in overview["guideline_health"] if g["status"] == "needs_clarification")
    }

@router.post("/guideline-health/{rule_id}/draft-clarification")
def draft_rule_clarification(rule_id: str, current_user = Depends(get_current_user_from_token)):
    """
    Guideline Health Intelligence Engine: Generates an AI clarification draft
    for rules with high human override rates.
    """
    result = guideline_clarifier_agent.draft_clarification(rule_id)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result

@router.post("/guideline-health/{rule_id}/apply-clarification")
def apply_rule_clarification(rule_id: str, current_user = Depends(get_current_user_from_token)):
    """
    Improvement 3 Self-Healing Governance:
    Applies the clarified rule description & examples into active Brand Pack,
    resets ambiguity score and override counter, and records a cryptographic audit log.
    """
    rule = db.rules.get(rule_id)
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")

    clarification = guideline_clarifier_agent.draft_clarification(rule_id)
    if "error" in clarification:
        raise HTTPException(status_code=400, detail=clarification["error"])

    rule.description = clarification["proposed_description"]
    rule.good_examples = clarification["additional_good_examples"]
    rule.bad_examples = clarification["additional_bad_examples"]
    rule.ambiguity_score = 0.05
    rule.override_count = 0

    actor_id = getattr(current_user, "id", "usr_ananya")
    actor_name = getattr(current_user, "name", "Ananya Roy (Admin)")
    actor_role = getattr(current_user, "role", "admin")

    db.log_audit(
        workspace_id="ws_novapay_main",
        actor_id=actor_id,
        actor_name=actor_name,
        actor_role=actor_role,
        event_type="guideline_clarified_published",
        event_data={
            "rule_id": rule_id,
            "rule_title": rule.title,
            "new_description": rule.description,
            "resolved_overrides": clarification.get("override_count", 0),
            "new_ambiguity_score": 0.05
        }
    )

    return {
        "status": "success",
        "message": f"Rule {rule.id} updated with clarified guidance in Brand Pack v3.",
        "rule": rule
    }

@router.get("/audit/export")
def export_audit_log(current_user = Depends(get_current_user_from_token)):
    return {
        "workspace": "ws_novapay_main",
        "exported_at": "2026-11-12T18:00:00Z",
        "total_records": len(db.audit_logs),
        "audit_logs": db.audit_logs
    }
