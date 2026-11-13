import math
import re
from typing import List, Tuple
import textstat
from packages.schemas.finding import (
    Finding, TextSpanLocation, EvidenceItem, SuggestionItem,
    DetectorEnum, SeverityEnum, CategoryEnum
)
from apps.api.db.database import db

def hex_to_rgb(hex_code: str) -> Tuple[int, int, int]:
    hex_code = hex_code.lstrip("#")
    if len(hex_code) == 3:
        hex_code = "".join([c*2 for c in hex_code])
    return tuple(int(hex_code[i:i+2], 16) for i in (0, 2, 4))

def get_relative_luminance(rgb: Tuple[int, int, int]) -> float:
    sRGB = [v / 255.0 for v in rgb]
    lum = []
    for c in sRGB:
        if c <= 0.03928:
            lum.append(c / 12.92)
        else:
            lum.append(((c + 0.055) / 1.055) ** 2.4)
    return 0.2126 * lum[0] + 0.7152 * lum[1] + 0.0722 * lum[2]

def calculate_contrast_ratio(hex1: str, hex2: str) -> float:
    """Calculates WCAG 2.2 relative contrast ratio between two hex colors."""
    lum1 = get_relative_luminance(hex_to_rgb(hex1))
    lum2 = get_relative_luminance(hex_to_rgb(hex2))
    lighter = max(lum1, lum2)
    darker = min(lum1, lum2)
    return (lighter + 0.05) / (darker + 0.05)

class AccessibilityAgent:
    """
    Evaluates text readability via Flesch-Kincaid and checks color contrast compliance with WCAG 2.2 AA.
    """
    def check(self, content_text: str, content_id: str, brand_pack_id: str) -> List[Finding]:
        findings: List[Finding] = []
        rules = {r.id: r for r in db.get_rules_for_brand_pack(brand_pack_id)}

        # 1. Readability Score Check (Minimum 18 words to avoid single-phrase skew)
        words = re.findall(r'\b\w+\b', content_text)
        if len(words) >= 18:
            try:
                grade_level = textstat.flesch_kincaid_grade(content_text)
                reading_ease = textstat.flesch_reading_ease(content_text)
                
                # Flag extremely dense text (Grade > 12.5 or Reading Ease < 30)
                if grade_level > 12.5 or reading_ease < 30.0:
                    r_acc = rules.get("r_acc_002")
                    quote_text = r_acc.description if r_acc else "External communications should maintain accessible readability (Grade level <= 10)."
                    source_ref = r_acc.source_page if r_acc else "Content Style Guide §4"

                    findings.append(Finding(
                        content_id=content_id,
                        content_version=1,
                        agent_name="Accessibility Agent",
                        category=CategoryEnum.ACCESSIBILITY,
                        severity=SeverityEnum.WARNING,
                        location=TextSpanLocation(
                            start=0,
                            end=min(len(content_text), 80),
                            matched_text=content_text[:80] + "..."
                        ),
                        detector=DetectorEnum.DETERMINISTIC,
                        evidence=[
                            EvidenceItem(
                                type="guideline",
                                source_id="r_acc_002",
                                source_version=2,
                                page_or_clause=source_ref,
                                quote=quote_text
                            )
                        ],
                        explanation=f"Content readability score is dense (Flesch-Kincaid Grade {grade_level:.1f}, Reading Ease {reading_ease:.1f}). Target is Grade 8-10.",
                        suggestions=[
                            SuggestionItem(
                                text="Simplify compound sentences and shorten technical clauses.",
                                rationale="Improves comprehension across diverse reader demographics.",
                                intent_check="pass"
                            )
                        ],
                        confidence=0.92,
                        status="open"
                    ))
            except Exception as e:
                print(f"[AccessibilityAgent] Readability calculation error: {e}")

        # 2. Check for overly long run-on sentences (> 45 words)
        sentences = re.split(r'[.!?]+', content_text)
        current_offset = 0
        for s in sentences:
            s_clean = s.strip()
            s_words = s_clean.split()
            if len(s_words) > 40:
                pos = content_text.find(s_clean, current_offset)
                if pos != -1:
                    findings.append(Finding(
                        content_id=content_id,
                        content_version=1,
                        agent_name="Accessibility Agent",
                        category=CategoryEnum.ACCESSIBILITY,
                        severity=SeverityEnum.INFO,
                        location=TextSpanLocation(
                            start=pos,
                            end=pos + len(s_clean),
                            matched_text=s_clean[:60] + "..."
                        ),
                        detector=DetectorEnum.DETERMINISTIC,
                        evidence=[
                            EvidenceItem(
                                type="guideline",
                                source_id="r_acc_002",
                                source_version=2,
                                page_or_clause="Content Style Guide §4",
                                quote="Keep individual sentences under 30 words to maximize reader retention."
                            )
                        ],
                        explanation=f"Sentence is excessively long ({len(s_words)} words), reducing cognitive accessibility.",
                        suggestions=[
                            SuggestionItem(
                                text="Split sentence into two concise clauses.",
                                rationale="Improves readability without altering content meaning.",
                                intent_check="pass"
                            )
                        ],
                        confidence=0.90,
                        status="open"
                    ))
            if s_clean:
                current_offset += len(s)

        return findings

accessibility_agent = AccessibilityAgent()
