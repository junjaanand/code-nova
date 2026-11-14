from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

from apps.api.db.database import db
from apps.api.auth.jwt import get_current_user_from_token
from apps.api.auth.rbac import require_role
from apps.api.agents.orchestrator import orchestrator
from packages.schemas.models import (
    ContentItem, ContentVersion, RoleEnum, ContentStatusEnum,
    ContentTypeEnum, ChannelEnum, RiskTierEnum
)
from packages.schemas.finding import Finding, FindingStatusEnum, FindingDecision

router = APIRouter(prefix="/content", tags=["Content & AI Review"])

class CreateContentRequest(BaseModel):
    title: str
    content_text: str
    content_type: ContentTypeEnum = ContentTypeEnum.TEXT
    channel: ChannelEnum = ChannelEnum.LINKEDIN
    audience: str = "B2B Decision Makers"
    creator_purpose: str = "Brand messaging"

class DecisionRequest(BaseModel):
    reason: Optional[str] = None
    custom_edit: Optional[str] = None

@router.get("")
def list_content(status: Optional[ContentStatusEnum] = None):
    items = list(db.content_items.values())
    if status:
        items = [i for i in items if i.status == status]
    return items

@router.post("")
async def create_content(
    req: CreateContentRequest,
    current_user = Depends(get_current_user_from_token)
):
    item = ContentItem(
        workspace_id="ws_novapay_main",
        author_id=current_user.id,
        author_name=current_user.name,
        title=req.title,
        content_type=req.content_type,
        channel=req.channel,
        audience=req.audience,
        creator_purpose=req.creator_purpose,
        status=ContentStatusEnum.DRAFT,
        current_version=1,
        current_text=req.content_text
    )
    db.content_items[item.id] = item

    ver = ContentVersion(
        content_item_id=item.id,
        version_number=1,
        content_text=req.content_text,
        brand_pack_version=2,
        changed_by=current_user.id
    )
    db.content_versions[ver.id] = ver

    db.log_audit(
        workspace_id="ws_novapay_main",
        actor_id=current_user.id,
        actor_name=current_user.name,
        actor_role=current_user.role,
        event_type="content_created",
        event_data={"content_id": item.id, "title": item.title}
    )

    return {"content": item, "version": ver}

@router.get("/{content_id}")
def get_content(content_id: str):
    item = db.content_items.get(content_id)
    if not item:
        raise HTTPException(status_code=404, detail="Content item not found")
    findings = db.get_findings_for_content(content_id)
    return {
        "content": item,
        "findings": findings,
        "findings_count": len(findings)
    }

@router.put("/{content_id}")
def update_content(
    content_id: str,
    req: CreateContentRequest,
    current_user = Depends(get_current_user_from_token)
):
    item = db.content_items.get(content_id)
    if not item:
        raise HTTPException(status_code=404, detail="Content not found")

    item.title = req.title
    item.current_text = req.content_text
    item.channel = req.channel
    item.audience = req.audience
    item.creator_purpose = req.creator_purpose
    item.current_version += 1

    ver = ContentVersion(
        content_item_id=item.id,
        version_number=item.current_version,
        content_text=req.content_text,
        brand_pack_version=2,
        changed_by=current_user.id
    )
    db.content_versions[ver.id] = ver

    return {"content": item, "version": ver}

@router.post("/{content_id}/review")
async def trigger_review(
    content_id: str,
    current_user = Depends(get_current_user_from_token)
):
    item = db.content_items.get(content_id)
    if not item:
        raise HTTPException(status_code=404, detail="Content not found")

    result = await orchestrator.run_review(
        content_id=item.id,
        content_text=item.current_text,
        channel=item.channel.value if hasattr(item.channel, "value") else str(item.channel),
        audience=item.audience,
        creator_purpose=item.creator_purpose
    )

    db.log_audit(
        workspace_id="ws_novapay_main",
        actor_id=current_user.id,
        actor_name=current_user.name,
        actor_role=current_user.role,
        event_type="ai_review_completed",
        event_data={"content_id": content_id, "score": result["score"], "findings_count": result["findings_count"]}
    )

    return result

@router.get("/{content_id}/findings")
def get_findings(content_id: str):
    return db.get_findings_for_content(content_id)

@router.post("/{content_id}/findings/{finding_id}/accept")
def accept_finding(
    content_id: str,
    finding_id: str,
    current_user = Depends(get_current_user_from_token)
):
    f = db.findings.get(finding_id)
    if not f or f.content_id != content_id:
        raise HTTPException(status_code=404, detail="Finding not found")

    f.status = FindingStatusEnum.ACCEPTED
    f.decision = FindingDecision(
        action="accept",
        by_user=current_user.name,
        role=current_user.role
    )

    item = db.content_items.get(content_id)
    if item and f.suggestions and hasattr(f.location, "start") and hasattr(f.location, "end"):
        start = f.location.start
        end = f.location.end
        fix_text = f.suggestions[0].text
        matched_str = getattr(f.location, "matched_text", "")

        # 1. Exactly relocate matched_str in current_text to guarantee perfect word boundaries
        if matched_str:
            if start >= len(item.current_text) or item.current_text[start:end] != matched_str:
                actual_pos = item.current_text.find(matched_str)
                if actual_pos != -1:
                    start = actual_pos
                    end = actual_pos + len(matched_str)

        if start < len(item.current_text):
            old_len = max(0, end - start)
            new_len = len(fix_text)
            delta = new_len - old_len

            # 2. Replace the exact span with the fix text
            item.current_text = item.current_text[:start] + fix_text + item.current_text[end:]

            # 3. Update accepted finding's own span
            f.location.start = start
            f.location.end = start + new_len
            f.location.matched_text = fix_text

            # 4. Synchronize all other open findings to prevent any word-breaking offset shift
            for other_f in db.findings.values():
                if other_f.content_id == content_id and other_f.id != f.id and other_f.status != FindingStatusEnum.ACCEPTED:
                    if hasattr(other_f.location, "start") and hasattr(other_f.location, "end"):
                        # Shift offset if after the replaced span
                        if other_f.location.start >= end:
                            other_f.location.start += delta
                            other_f.location.end += delta

                        # Re-verify and lock to the exact word boundary of other_f.location.matched_text
                        other_matched = getattr(other_f.location, "matched_text", "")
                        if other_matched:
                            if item.current_text[other_f.location.start:other_f.location.end] != other_matched:
                                found_idx = item.current_text.find(other_matched)
                                if found_idx != -1:
                                    other_f.location.start = found_idx
                                    other_f.location.end = found_idx + len(other_matched)

    return {"status": "accepted", "finding": f, "updated_text": item.current_text if item else ""}

@router.post("/{content_id}/findings/{finding_id}/reject")
def reject_finding(
    content_id: str,
    finding_id: str,
    req: DecisionRequest,
    current_user = Depends(get_current_user_from_token)
):
    if not req.reason or len(req.reason.strip()) < 5:
        raise HTTPException(status_code=400, detail="Reason required to reject finding")

    f = db.findings.get(finding_id)
    if not f:
        raise HTTPException(status_code=404, detail="Finding not found")

    f.status = FindingStatusEnum.REJECTED
    f.decision = FindingDecision(
        action="reject",
        reason=req.reason,
        by_user=current_user.name,
        role=current_user.role
    )
    return {"status": "rejected", "finding": f}

@router.post("/{content_id}/findings/{finding_id}/override")
def override_finding(
    content_id: str,
    finding_id: str,
    req: DecisionRequest,
    current_user = Depends(require_role([RoleEnum.REVIEWER, RoleEnum.MANAGER, RoleEnum.ADMIN]))
):
    """
    Reviewer override with mandatory rationale.
    Directly updates the rule's ambiguity score and override count for Guideline Health tracking.
    """
    if not req.reason or len(req.reason.strip()) < 5:
        raise HTTPException(status_code=400, detail="Documented rationale required to override finding")

    f = db.findings.get(finding_id)
    if not f:
        raise HTTPException(status_code=404, detail="Finding not found")

    f.status = FindingStatusEnum.OVERRIDDEN
    f.decision = FindingDecision(
        action="override",
        reason=req.reason,
        by_user=current_user.name,
        role=current_user.role
    )

    # Track override in Rule for Guideline Health Intelligence
    if f.evidence:
        rule_id = f.evidence[0].source_id
        rule = db.rules.get(rule_id)
        if rule:
            rule.override_count += 1
            rule.total_eval_count = max(rule.total_eval_count + 1, rule.override_count)
            rule.ambiguity_score = round(rule.override_count / rule.total_eval_count, 2)

    db.log_audit(
        workspace_id="ws_novapay_main",
        actor_id=current_user.id,
        actor_name=current_user.name,
        actor_role=current_user.role,
        event_type="finding_overridden",
        event_data={"finding_id": finding_id, "reason": req.reason}
    )

    return {"status": "overridden", "finding": f}
