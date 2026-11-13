import re
from typing import List
from packages.schemas.finding import (
    Finding, TextSpanLocation, EvidenceItem, SuggestionItem,
    DetectorEnum, SeverityEnum, CategoryEnum
)
from apps.api.db.database import db

class MessagingAgent:
    """
    Evaluates strategic messaging alignment, value propositions,
    and product positioning against Brand Pack rules.
    """
    async def check(self, content_text: str, content_id: str, brand_pack_id: str) -> List[Finding]:
        findings: List[Finding] = []
        rules = {r.id: r for r in db.get_rules_for_brand_pack(brand_pack_id)}

        # Check for deprecated product name NovaCard
        r_term_004 = rules.get("r_term_004")
        if r_term_004:
            for match in re.finditer(r'\bNovaCard\b', content_text):
                findings.append(Finding(
                    content_id=content_id,
                    content_version=1,
                    agent_name="Messaging Agent",
                    category=CategoryEnum.MESSAGING,
                    severity=SeverityEnum.WARNING,
                    location=TextSpanLocation(
                        start=match.start(),
                        end=match.end(),
                        matched_text=match.group(0)
                    ),
                    detector=DetectorEnum.DETERMINISTIC,
                    evidence=[
                        EvidenceItem(
                            type="guideline",
                            source_id=r_term_004.id,
                            source_version=2,
                            page_or_clause=r_term_004.source_page or "Product Naming Notice v2",
                            quote=r_term_004.description
                        )
                    ],
                    explanation="'NovaCard' is deprecated. The active corporate card product is 'Nova Corporate Credit'.",
                    suggestions=[
                        SuggestionItem(
                            text="Nova Corporate Credit",
                            rationale="Aligns product mention with current commercial portfolio.",
                            intent_check="pass"
                        )
                    ],
                    confidence=1.0,
                    status="open"
                ))

        return findings

messaging_agent = MessagingAgent()
