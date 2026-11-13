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

@router.get("/audit/export")
def export_audit_log(current_user = Depends(get_current_user_from_token)):
    return {
        "workspace": "ws_novapay_main",
        "exported_at": "2026-11-12T18:00:00Z",
        "total_records": len(db.audit_logs),
        "audit_logs": db.audit_logs
    }
