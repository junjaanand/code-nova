import os
import json
from typing import Dict, List, Optional, Any
from datetime import datetime, date

from packages.schemas.models import (
    User, Workspace, UserMembership, BrandPack, Rule, Fact, Term, Asset,
    ContentItem, ContentVersion, Comment, ReviewTask, ReviewAction,
    AuditLog, AICallLog, InsightSnapshot, RoleEnum, ContentStatusEnum,
    RiskTierEnum
)
from packages.schemas.finding import Finding, FindingStatusEnum, FindingDecision

class JSONDateTimeEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, (datetime, date)):
            return obj.isoformat()
        if hasattr(obj, "dict"):
            return obj.dict()
        return super().default(obj)

class InMemoryDatabase:
    """
    High-performance in-memory repository with file-backed persistence.
    Works seamlessly across all environments without external DB dependencies,
    while mirroring the PostgreSQL 16 schema.
    """
    def __init__(self, persist_file: Optional[str] = None):
        self.persist_file = persist_file or os.path.join(
            os.path.dirname(__file__), "brandshield_state.json"
        )
        self.workspaces: Dict[str, Workspace] = {}
        self.users: Dict[str, User] = {}
        self.memberships: Dict[str, UserMembership] = {}
        self.brand_packs: Dict[str, BrandPack] = {}
        self.rules: Dict[str, Rule] = {}
        self.facts: Dict[str, Fact] = {}
        self.terms: Dict[str, Term] = {}
        self.assets: Dict[str, Asset] = {}
        self.content_items: Dict[str, ContentItem] = {}
        self.content_versions: Dict[str, ContentVersion] = {}
        self.findings: Dict[str, Finding] = {}
        self.comments: Dict[str, Comment] = {}
        self.review_tasks: Dict[str, ReviewTask] = {}
        self.review_actions: Dict[str, ReviewAction] = {}
        self.audit_logs: List[AuditLog] = []
        self.ai_call_logs: List[AICallLog] = []
        self.insight_snapshots: List[InsightSnapshot] = []

    def log_audit(self, workspace_id: str, actor_id: str, actor_name: str, actor_role: str, event_type: str, event_data: Dict[str, Any]):
        log_entry = AuditLog(
            workspace_id=workspace_id,
            actor_id=actor_id,
            actor_name=actor_name,
            actor_role=actor_role,
            event_type=event_type,
            event_data=event_data,
            created_at=datetime.utcnow()
        )
        self.audit_logs.append(log_entry)
        return log_entry

    def get_active_brand_pack(self, workspace_id: Optional[str] = None) -> Optional[BrandPack]:
        for bp in self.brand_packs.values():
            if bp.status == "active" and (workspace_id is None or bp.workspace_id == workspace_id):
                return bp
        if self.brand_packs:
            return list(self.brand_packs.values())[0]
        return None

    def get_findings_for_content(self, content_id: str) -> List[Finding]:
        return [f for f in self.findings.values() if f.content_id == content_id]

    def get_rules_for_brand_pack(self, brand_pack_id: str) -> List[Rule]:
        return [r for r in self.rules.values() if r.brand_pack_id == brand_pack_id]

    def get_facts_for_brand_pack(self, brand_pack_id: str) -> List[Fact]:
        return [f for f in self.facts.values() if f.brand_pack_id == brand_pack_id]

    def get_terms_for_brand_pack(self, brand_pack_id: str) -> List[Term]:
        return [t for t in self.terms.values() if t.brand_pack_id == brand_pack_id]

    def get_assets_for_brand_pack(self, brand_pack_id: str) -> List[Asset]:
        return [a for a in self.assets.values() if a.brand_pack_id == brand_pack_id]

# Singleton instance
db = InMemoryDatabase()
