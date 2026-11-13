from __future__ import annotations
from enum import Enum
from typing import List, Optional, Union, Dict, Any
from pydantic import BaseModel, Field, field_validator
import uuid
from datetime import datetime

class CategoryEnum(str, Enum):
    TONE = "tone"
    TERMINOLOGY = "terminology"
    MESSAGING = "messaging"
    CLAIM = "claim"
    VISUAL = "visual"
    ACCESSIBILITY = "accessibility"
    COMPLIANCE = "compliance"

class SeverityEnum(str, Enum):
    INFO = "info"
    WARNING = "warning"
    CRITICAL = "critical"

class DetectorEnum(str, Enum):
    DETERMINISTIC = "deterministic"
    LLM = "llm"

class FindingStatusEnum(str, Enum):
    OPEN = "open"
    ACCEPTED = "accepted"
    EDITED = "edited"
    REJECTED = "rejected"
    OVERRIDDEN = "overridden"

class TextSpanLocation(BaseModel):
    type: str = "text_span"
    start: int = Field(..., description="0-based start character index")
    end: int = Field(..., description="0-based end character index")
    matched_text: Optional[str] = Field(None, description="Exact substring matched")

class VisualLocation(BaseModel):
    type: str = "visual"
    page: Optional[int] = Field(1, description="1-based page number")
    bbox: Optional[List[float]] = Field(None, description="Normalized coordinates [x1, y1, x2, y2]")
    color_hex: Optional[str] = Field(None, description="Hex code for visual color findings")

class EvidenceItem(BaseModel):
    type: str = Field(..., description="Type of evidence: guideline | fact | asset | metric")
    source_id: str = Field(..., description="Unique ID of guideline rule, fact record, or asset")
    source_version: int = Field(1, description="Brand Pack or Fact version")
    page_or_clause: Optional[str] = Field(None, description="Section, page, or clause reference")
    quote: str = Field(..., description="Exact quoted text from brand rule or approved fact")

class SuggestionItem(BaseModel):
    id: str = Field(default_factory=lambda: f"sug_{uuid.uuid4().hex[:8]}")
    text: str = Field(..., description="Proposed replacement text or fix description")
    rationale: str = Field(..., description="Why this fix satisfies the brand guideline")
    intent_check: str = Field("pass", description="'pass' or 'fail' from Intent Guard")
    diff_preview: Optional[str] = Field(None, description="Inline diff markup")

class FindingDecision(BaseModel):
    action: str = Field(..., description="accept | edit | reject | override")
    reason: Optional[str] = Field(None, description="Required for reject and override")
    by_user: Optional[str] = None
    role: Optional[str] = None
    custom_edit: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class Finding(BaseModel):
    id: str = Field(default_factory=lambda: f"f_{uuid.uuid4().hex[:8]}")
    content_id: str = Field(..., description="ID of the content item being reviewed")
    content_version: int = Field(1, description="Version of the content item")
    agent_name: str = Field("agent", description="Specialist agent that discovered this finding")
    category: CategoryEnum = Field(..., description="Category of rule violation")
    severity: SeverityEnum = Field(..., description="Severity level: info, warning, critical")
    location: Union[TextSpanLocation, VisualLocation, Dict[str, Any]] = Field(
        ..., description="Exact position within text or visual canvas"
    )
    detector: DetectorEnum = Field(DetectorEnum.LLM, description="Deterministic check vs LLM semantic check")
    evidence: List[EvidenceItem] = Field(
        ..., 
        description="Evidence list. Under the 'No citation, no flag' rule, empty evidence is disallowed."
    )
    explanation: str = Field(..., description="Clear explanation of the violation and why it matters")
    suggestions: List[SuggestionItem] = Field(default_factory=list, description="2-3 intent-preserving fixes")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Calibrated confidence score between 0 and 1")
    status: FindingStatusEnum = Field(FindingStatusEnum.OPEN, description="Workflow status")
    decision: Optional[FindingDecision] = Field(None, description="Human decision record")

    @field_validator("evidence")
    @classmethod
    def validate_non_empty_evidence(cls, v: List[EvidenceItem]) -> List[EvidenceItem]:
        # 'No citation, no flag' rule enforcement at schema level
        if not v or len(v) == 0:
            raise ValueError("No citation, no flag: finding must contain at least 1 verified evidence item")
        return v
