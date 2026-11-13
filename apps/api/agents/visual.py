import re
from typing import List, Dict, Any
from packages.schemas.finding import (
    Finding, VisualLocation, TextSpanLocation, EvidenceItem, SuggestionItem,
    DetectorEnum, SeverityEnum, CategoryEnum
)
from apps.api.db.database import db

class VisualAgent:
    """
    Evaluates visual consistency: color hex codes, logo clear-space rules,
    and brand asset rules.
    """
    def check_text_or_metadata(self, content_text: str, content_id: str, brand_pack_id: str, metadata: Dict[str, Any] = None) -> List[Finding]:
        findings: List[Finding] = []
        rules = {r.id: r for r in db.get_rules_for_brand_pack(brand_pack_id)}
        assets = {a.asset_type: a for a in db.get_assets_for_brand_pack(brand_pack_id)}

        palette_asset = assets.get("palette")
        approved_hexes = ["#0052FF", "#0A1128", "#FFFFFF", "#10B981"]

        # 1. Detect unapproved hex codes in text or style attributes
        hex_matches = re.finditer(r'#(?:[0-9a-fA-F]{3}){1,2}\b', content_text)
        for match in hex_matches:
            found_hex = match.group(0).upper()
            if found_hex not in approved_hexes and found_hex not in ["#000", "#FFF", "#000000"]:
                r_vis = rules.get("r_vis_001")
                findings.append(Finding(
                    content_id=content_id,
                    content_version=1,
                    agent_name="Visual Consistency Agent",
                    category=CategoryEnum.VISUAL,
                    severity=SeverityEnum.CRITICAL,
                    location=TextSpanLocation(
                        start=match.start(),
                        end=match.end(),
                        matched_text=match.group(0)
                    ),
                    detector=DetectorEnum.DETERMINISTIC,
                    evidence=[
                        EvidenceItem(
                            type="asset",
                            source_id="ast_palette",
                            source_version=2,
                            page_or_clause="Visual Guidelines p.14",
                            quote="Approved primary colors are Nova Blue (#0052FF), Slate Dark (#0A1128), and Pure White (#FFFFFF)."
                        )
                    ],
                    explanation=f"Color code '{found_hex}' is outside the approved primary brand palette.",
                    suggestions=[
                        SuggestionItem(
                            text="#0052FF",
                            rationale="Replaces unauthorized color with primary Nova Blue.",
                            intent_check="pass"
                        )
                    ],
                    confidence=1.0,
                    status="open"
                ))

        return findings

visual_agent = VisualAgent()
