from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

from apps.api.db.database import db
from apps.api.auth.jwt import get_current_user_from_token
from apps.api.auth.rbac import require_role
from packages.schemas.models import (
    RoleEnum, ContentStatusEnum, Comment, ReviewAction, RiskTierEnum
)

router = APIRouter(tags=["Workflow & Human Approval"])

class ActionRequest(BaseModel):
    comment: Optional[str] = None
    reason: Optional[str] = None

class CommentRequest(BaseModel):
    body: str
    anchor: Optional[Dict[str, Any]] = None

@router.get("/review-queue")
def get_review_queue(current_user = Depends(get_current_user_from_token)):
    """
    Returns items categorized for the Kanban workflow board:
    Draft, In Review, High Risk (Needs Legal), Changes Requested, Approved.
    """
    items = list(db.content_items.values())
    return {
        "draft": [i for i in items if i.status == ContentStatusEnum.DRAFT],
        "ai_reviewed": [i for i in items if i.status == ContentStatusEnum.AI_REVIEWED],
        "in_review": [i for i in items if i.status == ContentStatusEnum.IN_REVIEW],
        "high_risk": [i for i in items if i.risk_tier == RiskTierEnum.HIGH and i.status != ContentStatusEnum.APPROVED],
        "changes_requested": [i for i in items if i.status == ContentStatusEnum.CHANGES_REQUESTED],
        "approved": [i for i in items if i.status == ContentStatusEnum.APPROVED]
    }

@router.post("/content/{content_id}/submit-for-review")
def submit_for_review(content_id: str, current_user = Depends(get_current_user_from_token)):
    item = db.content_items.get(content_id)
    if not item:
        raise HTTPException(status_code=404, detail="Content not found")
    
    item.status = ContentStatusEnum.IN_REVIEW
    db.log_audit(
        workspace_id="ws_novapay_main",
        actor_id=current_user.id,
        actor_name=current_user.name,
        actor_role=current_user.role,
        event_type="content_submitted_for_human_review",
        event_data={"content_id": content_id}
    )
    return {"status": "submitted", "content": item}

@router.post("/content/{content_id}/approve")
def approve_content(
    content_id: str,
    req: ActionRequest,
    current_user = Depends(require_role([RoleEnum.MANAGER, RoleEnum.REVIEWER, RoleEnum.ADMIN]))
):
    item = db.content_items.get(content_id)
    if not item:
        raise HTTPException(status_code=404, detail="Content not found")

    # High risk requires Reviewer or Admin
    if item.risk_tier == RiskTierEnum.HIGH and current_user.role not in [RoleEnum.REVIEWER, RoleEnum.ADMIN]:
        raise HTTPException(status_code=403, detail="High-risk content requires Legal & Compliance Reviewer approval")

    item.status = ContentStatusEnum.APPROVED
    db.log_audit(
        workspace_id="ws_novapay_main",
        actor_id=current_user.id,
        actor_name=current_user.name,
        actor_role=current_user.role,
        event_type="content_approved",
        event_data={"content_id": content_id, "comment": req.comment}
    )
    return {"status": "approved", "content": item}

@router.post("/content/{content_id}/reject")
def reject_content(
    content_id: str,
    req: ActionRequest,
    current_user = Depends(require_role([RoleEnum.MANAGER, RoleEnum.REVIEWER, RoleEnum.ADMIN]))
):
    if not req.reason:
        raise HTTPException(status_code=400, detail="Rejection reason is required")

    item = db.content_items.get(content_id)
    if not item:
        raise HTTPException(status_code=404, detail="Content not found")

    item.status = ContentStatusEnum.REJECTED
    db.log_audit(
        workspace_id="ws_novapay_main",
        actor_id=current_user.id,
        actor_name=current_user.name,
        actor_role=current_user.role,
        event_type="content_rejected",
        event_data={"content_id": content_id, "reason": req.reason}
    )
    return {"status": "rejected", "content": item}

@router.post("/content/{content_id}/request-revision")
def request_revision(
    content_id: str,
    req: ActionRequest,
    current_user = Depends(require_role([RoleEnum.MANAGER, RoleEnum.REVIEWER, RoleEnum.ADMIN]))
):
    item = db.content_items.get(content_id)
    if not item:
        raise HTTPException(status_code=404, detail="Content not found")

    item.status = ContentStatusEnum.CHANGES_REQUESTED
    return {"status": "changes_requested", "content": item}

# ----------------- COMMENTS -----------------
@router.post("/content/{content_id}/comments")
def add_comment(
    content_id: str,
    req: CommentRequest,
    current_user = Depends(get_current_user_from_token)
):
    comm = Comment(
        content_item_id=content_id,
        author_id=current_user.id,
        author_name=current_user.name,
        anchor=req.anchor,
        body=req.body
    )
    db.comments[comm.id] = comm
    return comm

@router.get("/content/{content_id}/comments")
def get_comments(content_id: str):
    return [c for c in db.comments.values() if c.content_item_id == content_id]
