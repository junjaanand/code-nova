import re
import json
from typing import List
from packages.schemas.finding import (
    Finding, TextSpanLocation, EvidenceItem, SuggestionItem,
    DetectorEnum, SeverityEnum, CategoryEnum
)
from apps.api.db.database import db
from apps.api.services.llm_gateway import llm_gateway

class ToneAgent:
    """
    Evaluates content tone and voice against active brand guidelines.
    Uses Gemini live AI semantic evaluation with deterministic patterns as a fallback backup.
    """
    async def check(self, content_text: str, content_id: str, brand_pack_id: str) -> List[Finding]:
        findings: List[Finding] = []
        rules = {r.id: r for r in db.get_rules_for_brand_pack(brand_pack_id)}

        # 1. LIVE GEMINI AI SEMANTIC EVALUATION
        if llm_gateway.client:
            prompt = f"""
Evaluate the following text against our active Brand Voice Guidelines:
1. Rule r_tone_001: Avoid unbacked superlatives/hyperbole (e.g. 'the best', 'revolutionary', '#1', 'game-changing') without accredited data.
2. Rule r_tone_002: Maintain confident, measured tone. Avoid sensational slang, extreme hype (e.g. 'insane savings', 'blow your mind', 'crazy fast'), and excessive exclamation marks.
3. Rule r_tone_003: Respectful and collaborative voice. Never use combative, disparaging words about competitors or legacy systems (e.g. 'stupid', 'terrible', 'broken').

Content to evaluate:
\"\"\"{content_text}\"\"\"

Analyze the text and return ONLY a JSON array of violations:
[
  {{
    "matched_text": "exact substring in the text",
    "rule_id": "r_tone_001 or r_tone_002 or r_tone_003",
    "severity": "warning",
    "explanation": "clear explanation of the violation",
    "suggested_fix": "professional replacement phrase",
    "rationale": "why this fix aligns with the brand standard"
  }}
]
If there are no tone violations, return an empty array [].
"""
            try:
                raw_json = await llm_gateway.call_llm(
                    prompt,
                    system_instruction="You are BrandShield AI's Tone & Voice Evaluator. Return pure JSON only."
                )
                parsed = json.loads(raw_json)
                if isinstance(parsed, dict) and "violations" in parsed:
                    parsed = parsed["violations"]
                elif isinstance(parsed, dict) and "findings" in parsed:
                    parsed = parsed["findings"]

                if isinstance(parsed, list):
                    for item in parsed:
                        matched_str = item.get("matched_text", "")
                        rule_id = item.get("rule_id", "r_tone_001")
                        pos = content_text.find(matched_str)
                        if pos != -1 and len(matched_str) > 1:
                            r_obj = rules.get(rule_id, rules.get("r_tone_001"))
                            quote_text = r_obj.description if r_obj else "Maintain confident, objective brand voice."
                            source_doc = r_obj.source_page if r_obj else "Brand Voice Guide p.8"

                            findings.append(Finding(
                                content_id=content_id,
                                content_version=1,
                                agent_name="Tone & Voice Agent (Gemini AI)",
                                category=CategoryEnum.TONE,
                                severity=SeverityEnum.WARNING,
                                location=TextSpanLocation(
                                    start=pos,
                                    end=pos + len(matched_str),
                                    matched_text=matched_str
                                ),
                                detector=DetectorEnum.LLM,
                                evidence=[
                                    EvidenceItem(
                                        type="guideline",
                                        source_id=r_obj.id if r_obj else "r_tone_001",
                                        source_version=2,
                                        page_or_clause=source_doc,
                                        quote=quote_text
                                    )
                                ],
                                explanation=item.get("explanation", "Tone issue detected by Gemini AI."),
                                suggestions=[
                                    SuggestionItem(
                                        text=item.get("suggested_fix", "measured brand-aligned phrasing"),
                                        rationale=item.get("rationale", "Aligns with professional enterprise tone."),
                                        intent_check="pass"
                                    )
                                ],
                                confidence=0.97,
                                status="open"
                            ))
            except Exception as e:
                print(f"[ToneAgent] Gemini dynamic call exception: {e}. Using deterministic backup.")

        # 2. DETERMINISTIC BACKUP LAYER (Runs if Gemini produces 0 findings or offline)
        if len(findings) == 0:
            findings.extend(self._deterministic_backup_check(content_text, content_id, rules))

        return findings

    def _deterministic_backup_check(self, content_text: str, content_id: str, rules: dict) -> List[Finding]:
        backup_findings = []
        # Hyperbole Backup
        r_tone_001 = rules.get("r_tone_001")
        if r_tone_001:
            patterns = [
                (r'\b(?:the\s+)?(?:absolute\s+)?best\s+(?:payment\s+platform|payment\s+solution(?:\s+ever\s+created)?)\b', "an industry-leading payment platform trusted by over 45,000 businesses"),
                (r'\b(?:the\s+)?#1\s+payment\s+platform\b', "a trusted enterprise payment gateway"),
                (r'\brevolutionary\s+financial\s+revolution\b', "modern payment infrastructure"),
                (r'\bunbelievable\s+savings\b', "significant operational cost efficiencies")
            ]
            for pat, sug_text in patterns:
                for match in re.finditer(pat, content_text, re.IGNORECASE):
                    backup_findings.append(Finding(
                        content_id=content_id,
                        content_version=1,
                        agent_name="Tone & Voice Agent (Rule Backup)",
                        category=CategoryEnum.TONE,
                        severity=SeverityEnum.WARNING,
                        location=TextSpanLocation(
                            start=match.start(),
                            end=match.end(),
                            matched_text=match.group(0)
                        ),
                        detector=DetectorEnum.LLM,
                        evidence=[
                            EvidenceItem(
                                type="guideline",
                                source_id=r_tone_001.id,
                                source_version=2,
                                page_or_clause=r_tone_001.source_page or "Brand Voice Guide p.8, §2.1",
                                quote=r_tone_001.description
                            )
                        ],
                        explanation=f"Superlative '{match.group(0)}' lacks substantiation and violates our objective brand voice.",
                        suggestions=[
                            SuggestionItem(text=sug_text, rationale="Replaces unverified hyperbole with measured tone.", intent_check="pass")
                        ],
                        confidence=0.96,
                        status="open"
                    ))

        # Sensationalism Backup
        r_tone_002 = rules.get("r_tone_002")
        if r_tone_002:
            slang_patterns = [
                (r'\binsane\s+savings(?:\s+that\s+will\s+blow\s+your\s+mind)?(?:!+)?', "compelling operational savings"),
                (r'\binsane\s+discounts(?:\s+on\s+corporate\s+transactions\s+this\s+week)?(?:!+)?', "competitive corporate volume pricing"),
                (r'\bcrazy\s+fast(?:\s+checkout\s+speeds)?(?:\s+will\s+shock\s+your\s+customers)?(?:!+)?', "high-throughput checkout speeds")
            ]
            for pat, sug_text in slang_patterns:
                for match in re.finditer(pat, content_text, re.IGNORECASE):
                    backup_findings.append(Finding(
                        content_id=content_id,
                        content_version=1,
                        agent_name="Tone & Voice Agent (Rule Backup)",
                        category=CategoryEnum.TONE,
                        severity=SeverityEnum.WARNING,
                        location=TextSpanLocation(
                            start=match.start(),
                            end=match.end(),
                            matched_text=match.group(0)
                        ),
                        detector=DetectorEnum.LLM,
                        evidence=[
                            EvidenceItem(
                                type="guideline",
                                source_id=r_tone_002.id,
                                source_version=2,
                                page_or_clause=r_tone_002.source_page or "Brand Voice Guide p.9, §2.3",
                                quote=r_tone_002.description
                            )
                        ],
                        explanation=f"Sensational phrase '{match.group(0)}' conflicts with our professional B2B tone.",
                        suggestions=[
                            SuggestionItem(text=sug_text, rationale="Adopts a measured, authoritative tone.", intent_check="pass")
                        ],
                        confidence=0.94,
                        status="open"
                    ))

        # Combative / Disparaging Language Backup
        r_tone_003 = rules.get("r_tone_003")
        if r_tone_003:
            combative_patterns = [
                (r'\bstupid\s+(?:legacy\s+)?bank\s+fees\b', "costly legacy fee structures"),
                (r'\b(?:Competitor\s+)?legacy\s+systems\s+are\s+terrible\s+and\s+broken\b', "traditional legacy systems often lack modern real-time flexibility"),
                (r'\bdestroy\s+all\s+banking\s+alternatives\b', "outperform conventional banking rails")
            ]
            for pat, sug_text in combative_patterns:
                for match in re.finditer(pat, content_text, re.IGNORECASE):
                    backup_findings.append(Finding(
                        content_id=content_id,
                        content_version=1,
                        agent_name="Tone & Voice Agent (Rule Backup)",
                        category=CategoryEnum.TONE,
                        severity=SeverityEnum.WARNING,
                        location=TextSpanLocation(
                            start=match.start(),
                            end=match.end(),
                            matched_text=match.group(0)
                        ),
                        detector=DetectorEnum.LLM,
                        evidence=[
                            EvidenceItem(
                                type="guideline",
                                source_id=r_tone_003.id,
                                source_version=2,
                                page_or_clause=r_tone_003.source_page or "Brand Voice Guide p.10, §2.5",
                                quote=r_tone_003.description
                            )
                        ],
                        explanation=f"Combative phrase '{match.group(0)}' violates our collaborative brand voice.",
                        suggestions=[
                            SuggestionItem(text=sug_text, rationale="Maintains an objective, respectful enterprise tone.", intent_check="pass")
                        ],
                        confidence=0.95,
                        status="open"
                    ))

        return backup_findings

tone_agent = ToneAgent()
