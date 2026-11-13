from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from apps.api.db.database import db
from apps.api.auth.rbac import require_role
from apps.api.agents.guideline_compiler import guideline_compiler_agent
from packages.schemas.models import (
    BrandPack, Rule, Fact, Term, Asset, RoleEnum, RuleCategoryEnum, SeverityEnum
)

router = APIRouter(prefix="/brand-pack", tags=["Brand Pack Management"])

class CompileRequest(BaseModel):
    document_text: str
    document_name: Optional[str] = "Brand Guide"

@router.get("")
def list_brand_packs():
    return list(db.brand_packs.values())

@router.get("/active")
def get_active_brand_pack():
    bp = db.get_active_brand_pack()
    if not bp:
        raise HTTPException(status_code=404, detail="No active brand pack found")
    
    # Attach nested entities
    return {
        "brand_pack": bp,
        "rules": db.get_rules_for_brand_pack(bp.id),
        "facts": db.get_facts_for_brand_pack(bp.id),
        "terms": db.get_terms_for_brand_pack(bp.id),
        "assets": db.get_assets_for_brand_pack(bp.id)
    }

@router.post("/compile")
async def compile_guidelines(
    req: CompileRequest,
    current_user = Depends(require_role([RoleEnum.ADMIN, RoleEnum.MANAGER]))
):
    """
    Guideline Compiler Agent endpoint: Parses guidelines using Gemini AI and creates structured rules, facts, and terms.
    """
    bp = db.get_active_brand_pack()
    brand_pack_id = bp.id if bp else "bp_novapay_v2"
    result = await guideline_compiler_agent.compile_text(req.document_text, brand_pack_id)
    
    # Store compiled rules, facts, and terms into database
    for r in result["rules"]:
        db.rules[r.id] = r
    for f in result.get("facts", []):
        db.facts[f.id] = f
    for t in result.get("terms", []):
        db.terms[t.id] = t

    db.log_audit(
        workspace_id="ws_novapay_main",
        actor_id=current_user.id,
        actor_name=current_user.name,
        actor_role=current_user.role,
        event_type="guideline_compiled",
        event_data={
            "doc_name": req.document_name, 
            "rules_count": result["rules_extracted"],
            "facts_count": result.get("facts_extracted", 0),
            "terms_count": result.get("terms_extracted", 0)
        }
    )

    return result

@router.post("/{version}/approve-rule/{rule_id}")
def approve_compiled_rule(
    version: int,
    rule_id: str,
    current_user = Depends(require_role([RoleEnum.ADMIN]))
):
    rule = db.rules.get(rule_id)
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")
    
    rule.approved = True
    db.log_audit(
        workspace_id="ws_novapay_main",
        actor_id=current_user.id,
        actor_name=current_user.name,
        actor_role=current_user.role,
        event_type="rule_approved",
        event_data={"rule_id": rule_id, "title": rule.title}
    )
    return {"status": "success", "rule": rule}
