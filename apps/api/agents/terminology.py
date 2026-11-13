import re
from typing import List
from packages.schemas.finding import (
    Finding, TextSpanLocation, EvidenceItem, SuggestionItem,
    DetectorEnum, SeverityEnum, CategoryEnum
)
from packages.schemas.models import Term, Rule
from apps.api.db.database import db

class TerminologyAgent:
    """
    Deterministic rule-based agent that enforces approved brand terms,
    casing rules, and banned terminology using regex word-boundary matching.
    """
    def check(self, content_text: str, content_id: str, brand_pack_id: str) -> List[Finding]:
        findings: List[Finding] = []
        terms = db.get_terms_for_brand_pack(brand_pack_id)
        rules = {r.id: r for r in db.get_rules_for_brand_pack(brand_pack_id)}

        # 1. Match against Term objects (banned variants -> preferred terms)
        for term in terms:
            for banned in term.banned_variants:
                # Case-insensitive or case-sensitive depending on whether casing matters
                is_casing_rule = (banned.lower() == term.preferred_term.lower())
                pattern = rf'\b{re.escape(banned)}\b'
                flags = 0 if is_casing_rule else re.IGNORECASE

                for match in re.finditer(pattern, content_text, flags):
                    matched_str = match.group(0)
                    # If case-insensitive, skip if already preferred casing
                    if not is_casing_rule and matched_str == term.preferred_term:
                        continue

                    # Look up matching rule reference if available
                    evidence_rule_id = "r_term_001" if "novapay" in banned.lower() else "r_term_002"
                    quote_text = term.context_note or f"Use '{term.preferred_term}' instead of '{banned}'."
                    source_ref = "Brand Glossary §2.4"

                    if evidence_rule_id in rules:
                        quote_text = rules[evidence_rule_id].description
                        source_ref = rules[evidence_rule_id].source_page or source_ref

                    findings.append(Finding(
                        content_id=content_id,
                        content_version=1,
                        agent_name="Terminology Agent",
                        category=CategoryEnum.TERMINOLOGY,
                        severity=SeverityEnum.CRITICAL if is_casing_rule else SeverityEnum.WARNING,
                        location=TextSpanLocation(
                            start=match.start(),
                            end=match.end(),
                            matched_text=matched_str
                        ),
                        detector=DetectorEnum.DETERMINISTIC,
                        evidence=[
                            EvidenceItem(
                                type="guideline",
                                source_id=evidence_rule_id,
                                source_version=2,
                                page_or_clause=source_ref,
                                quote=quote_text
                            )
                        ],
                        explanation=f"Found banned variant '{matched_str}'. Guidelines require preferred term '{term.preferred_term}'.",
                        suggestions=[
                            SuggestionItem(
                                text=term.preferred_term,
                                rationale=f"Replaces '{matched_str}' with approved brand standard '{term.preferred_term}'.",
                                intent_check="pass"
                            )
                        ],
                        confidence=1.0,
                        status="open"
                    ))

        # 2. Check for banned regulatory phrases from rules (e.g., "guaranteed returns")
        comp_rule = rules.get("r_term_003")
        if comp_rule:
            banned_regulatory = ["guaranteed returns", "risk-free", "100% safe money", "safe money guarantees", "safe money"]
            for bad_phrase in banned_regulatory:
                for match in re.finditer(rf'\b{re.escape(bad_phrase)}\b', content_text, re.IGNORECASE):
                    findings.append(Finding(
                        content_id=content_id,
                        content_version=1,
                        agent_name="Terminology Agent",
                        category=CategoryEnum.COMPLIANCE,
                        severity=SeverityEnum.CRITICAL,
                        location=TextSpanLocation(
                            start=match.start(),
                            end=match.end(),
                            matched_text=match.group(0)
                        ),
                        detector=DetectorEnum.DETERMINISTIC,
                        evidence=[
                            EvidenceItem(
                                type="guideline",
                                source_id="r_term_003",
                                source_version=2,
                                page_or_clause=comp_rule.source_page or "Regulatory Manual §4.2",
                                quote=comp_rule.description
                            )
                        ],
                        explanation=f"Prohibited regulatory phrase '{match.group(0)}' detected under RBI fintech compliance rules.",
                        suggestions=[
                            SuggestionItem(
                                text="transparent fee structure and secure escrow architecture",
                                rationale="Compliant alternative that conveys safety without illegal guarantee promises.",
                                intent_check="pass"
                            )
                        ],
                        confidence=1.0,
                        status="open"
                    ))

        return findings

terminology_agent = TerminologyAgent()
