from __future__ import annotations
from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
import uuid
from datetime import datetime, date

class RoleEnum(str, Enum):
    CREATOR = "creator"
    MANAGER = "manager"
    REVIEWER = "reviewer"
    ADMIN = "admin"
    AUDITOR = "auditor"

class ContentTypeEnum(str, Enum):
    TEXT = "text"
    PDF = "pdf"
    DOCX = "docx"
    IMAGE = "image"
    MIXED = "mixed"

class ChannelEnum(str, Enum):
    LINKEDIN = "linkedin"
    EMAIL = "email"
    BLOG = "blog"
    AD = "ad"
    DECK = "deck"
    WEBSITE = "website"

class ContentStatusEnum(str, Enum):
    DRAFT = "draft"
    AI_REVIEWED = "ai_reviewed"
    CHANGES_REQUESTED = "changes_requested"
    IN_REVIEW = "in_review"
    APPROVED = "approved"
    REJECTED = "rejected"
    PUBLISHED = "published"

class RiskTierEnum(str, Enum):
    STANDARD = "standard"
    ELEVATED = "elevated"
    HIGH = "high"

class RuleCategoryEnum(str, Enum):
    TONE = "tone"
    TERMINOLOGY = "terminology"
    MESSAGING = "messaging"
    VISUAL = "visual"
    ACCESSIBILITY = "accessibility"
    COMPLIANCE = "compliance"

class SeverityEnum(str, Enum):
    INFO = "info"
    WARNING = "warning"
    CRITICAL = "critical"

class ClaimTypeEnum(str, Enum):
    STATISTICAL = "statistical"
    PRICING = "pricing"
    DATE = "date"
    FEATURE = "feature"
    TESTIMONIAL = "testimonial"

class FactStatusEnum(str, Enum):
    APPROVED = "approved"
    EXPIRED = "expired"
    SUPERSEDED = "superseded"

class AssetTypeEnum(str, Enum):
    LOGO = "logo"
    PALETTE = "palette"
    FONT = "font"
    IMAGE_STYLE = "image_style"

# ----------------- Database / Business Models -----------------

class User(BaseModel):
    id: str = Field(default_factory=lambda: f"usr_{uuid.uuid4().hex[:8]}")
    email: str
    name: str
    avatar_url: Optional[str] = None
    role: RoleEnum = RoleEnum.CREATOR
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Workspace(BaseModel):
    id: str = Field(default_factory=lambda: f"ws_{uuid.uuid4().hex[:8]}")
    name: str = "Default Workspace"
    plan_tier: str = "enterprise"
    settings: Dict[str, Any] = Field(default_factory=dict)
    policies: Dict[str, Any] = Field(default_factory=lambda: {
        "auto_assign_high_risk": True,
        "allow_creator_override": False,
        "require_reviewer_override_reason": True,
        "risk_thresholds": {"critical_count_high": 1, "warning_count_elevated": 3}
    })
    created_at: datetime = Field(default_factory=datetime.utcnow)

class UserMembership(BaseModel):
    id: str = Field(default_factory=lambda: f"mem_{uuid.uuid4().hex[:8]}")
    workspace_id: str
    user_id: str
    role: RoleEnum
    joined_at: datetime = Field(default_factory=datetime.utcnow)

class Rule(BaseModel):
    id: str = Field(default_factory=lambda: f"r_{uuid.uuid4().hex[:8]}")
    brand_pack_id: str
    category: RuleCategoryEnum
    severity: SeverityEnum = SeverityEnum.WARNING
    title: str
    description: str
    good_examples: List[str] = Field(default_factory=list)
    bad_examples: List[str] = Field(default_factory=list)
    source_page: Optional[str] = None
    approved: bool = True
    ambiguity_score: float = 0.0
    override_count: int = 0
    total_eval_count: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Fact(BaseModel):
    id: str = Field(default_factory=lambda: f"fact_{uuid.uuid4().hex[:8]}")
    brand_pack_id: str
    claim_type: ClaimTypeEnum
    value: str
    source: str
    owner: str = "Brand Team"
    valid_from: Optional[date] = None
    valid_to: Optional[date] = None
    status: FactStatusEnum = FactStatusEnum.APPROVED
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Term(BaseModel):
    id: str = Field(default_factory=lambda: f"term_{uuid.uuid4().hex[:8]}")
    brand_pack_id: str
    preferred_term: str
    banned_variants: List[str] = Field(default_factory=list)
    context_note: Optional[str] = None
    scope: str = "all"  # external | internal | all

class Asset(BaseModel):
    id: str = Field(default_factory=lambda: f"asset_{uuid.uuid4().hex[:8]}")
    brand_pack_id: str
    asset_type: AssetTypeEnum
    name: str
    file_url: str
    rules: Dict[str, Any] = Field(default_factory=dict)
    # rules can include hex_codes, min_contrast, min_size_px, clear_space_ratio, etc.

class BrandPack(BaseModel):
    id: str = Field(default_factory=lambda: f"bp_{uuid.uuid4().hex[:8]}")
    workspace_id: str
    version: int = 1
    name: str = "Core Brand Guidelines"
    status: str = "active"  # draft | active | archived
    approved_by: Optional[str] = None
    rules: List[Rule] = Field(default_factory=list)
    facts: List[Fact] = Field(default_factory=list)
    terms: List[Term] = Field(default_factory=list)
    assets: List[Asset] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ContentVersion(BaseModel):
    id: str = Field(default_factory=lambda: f"cv_{uuid.uuid4().hex[:8]}")
    content_item_id: str
    version_number: int = 1
    content_text: str
    content_metadata: Dict[str, Any] = Field(default_factory=dict)
    content_hash: str = ""
    brand_pack_version: int = 1
    diff_from_previous: Optional[Dict[str, Any]] = None
    changed_by: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ContentItem(BaseModel):
    id: str = Field(default_factory=lambda: f"cnt_{uuid.uuid4().hex[:8]}")
    workspace_id: str
    author_id: str
    author_name: Optional[str] = "Priya Creator"
    title: str
    content_type: ContentTypeEnum = ContentTypeEnum.TEXT
    channel: ChannelEnum = ChannelEnum.LINKEDIN
    audience: str = "B2B Decision Makers"
    locale: str = "en-IN"
    creator_purpose: str = "Announce Q3 product updates and enterprise pricing"
    status: ContentStatusEnum = ContentStatusEnum.DRAFT
    latest_score: int = 100
    risk_tier: RiskTierEnum = RiskTierEnum.STANDARD
    assigned_reviewer_id: Optional[str] = None
    assigned_reviewer_name: Optional[str] = None
    review_certificate_hash: Optional[str] = None
    submitted_at: datetime = Field(default_factory=datetime.utcnow)
    current_version: int = 1
    current_text: str = ""

class Comment(BaseModel):
    id: str = Field(default_factory=lambda: f"comm_{uuid.uuid4().hex[:8]}")
    content_item_id: str
    author_id: str
    author_name: str
    anchor: Optional[Dict[str, Any]] = None  # text span or page region
    body: str
    parent_comment_id: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ReviewTask(BaseModel):
    id: str = Field(default_factory=lambda: f"task_{uuid.uuid4().hex[:8]}")
    content_item_id: str
    assigned_to: Optional[str] = None
    status: str = "pending"  # pending | in_progress | completed
    due_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ReviewAction(BaseModel):
    id: str = Field(default_factory=lambda: f"act_{uuid.uuid4().hex[:8]}")
    review_task_id: str
    reviewer_id: str
    reviewer_name: str
    reviewer_role: RoleEnum
    action: str  # comment | approve | reject | request_revision | override
    comment: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class AuditLog(BaseModel):
    id: str = Field(default_factory=lambda: f"audit_{uuid.uuid4().hex[:8]}")
    workspace_id: str
    actor_id: str
    actor_name: str
    actor_role: str
    event_type: str
    event_data: Dict[str, Any] = Field(default_factory=dict)
    ip_address: Optional[str] = "127.0.0.1"
    created_at: datetime = Field(default_factory=datetime.utcnow)

class AICallLog(BaseModel):
    id: str = Field(default_factory=lambda: f"ai_{uuid.uuid4().hex[:8]}")
    content_version_id: str
    agent_name: str
    provider: str
    model: str
    input_tokens: int = 0
    output_tokens: int = 0
    cost_usd: float = 0.0
    latency_ms: int = 0
    redactions: List[str] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)

class InsightSnapshot(BaseModel):
    id: str = Field(default_factory=lambda: f"snap_{uuid.uuid4().hex[:8]}")
    workspace_id: str
    snapshot_date: date = Field(default_factory=date.today)
    metrics: Dict[str, Any] = Field(default_factory=dict)
    guideline_health: List[Dict[str, Any]] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)
