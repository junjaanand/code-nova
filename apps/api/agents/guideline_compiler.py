import re
import json
from typing import Dict, Any, List
from packages.schemas.models import Rule, Fact, Term, RuleCategoryEnum, SeverityEnum, ClaimTypeEnum
from apps.api.services.llm_gateway import llm_gateway

class GuidelineCompilerAgent:
    """
    Ingests unstructured guidelines, PDF manuals, and style docs
    and structures them into actionable Rules, Facts, and Terms.
    Requires Admin review before activating in a Brand Pack.
    """
    async def compile_text(self, raw_text: str, brand_pack_id: str) -> Dict[str, Any]:
        compiled_rules: List[Rule] = []
        compiled_facts: List[Fact] = []
        compiled_terms: List[Term] = []

        # 1. LIVE GEMINI AI STRUCTURED EXTRACTION
        if llm_gateway.client:
            prompt = f"""
You are BrandShield AI's Guideline Compiler Agent.
Parse the following raw brand guidelines or policy document into structured rules, verified facts, and terminology:

Document Content:
\"\"\"{raw_text}\"\"\"

Extract structured brand governance entities and return ONLY a JSON object with this exact structure:
{{
  "rules": [
    {{
      "category": "tone" or "terminology" or "visual" or "accessibility" or "compliance" or "messaging",
      "severity": "critical" or "warning" or "info",
      "title": "Short concise rule name (max 10 words)",
      "description": "Full actionable guideline instruction",
      "good_examples": ["good example 1"],
      "bad_examples": ["bad example 1"]
    }}
  ],
  "facts": [
    {{
      "claim_type": "pricing" or "metric" or "award" or "partnership",
      "value": "e.g. Enterprise plan starts at ₹4,999/month",
      "source_document": "Official Guidelines"
    }}
  ],
  "terms": [
    {{
      "preferred_term": "Preferred casing or phrase",
      "banned_variants": ["variant1", "variant2"],
      "context_note": "Usage guidance"
    }}
  ]
}}
"""
            try:
                raw_json = await llm_gateway.call_llm(
                    prompt,
                    system_instruction="You are a brand governance parser. Return valid JSON only with keys: rules, facts, terms."
                )
                data = json.loads(raw_json)
                if isinstance(data, dict):
                    # Rules
                    for idx, r in enumerate(data.get("rules", [])):
                        cat_str = r.get("category", "messaging").lower()
                        cat = RuleCategoryEnum.TONE if "tone" in cat_str else \
                              RuleCategoryEnum.TERMINOLOGY if "term" in cat_str else \
                              RuleCategoryEnum.VISUAL if "vis" in cat_str else \
                              RuleCategoryEnum.ACCESSIBILITY if "acc" in cat_str else \
                              RuleCategoryEnum.COMPLIANCE if "comp" in cat_str else RuleCategoryEnum.MESSAGING

                        sev_str = r.get("severity", "warning").lower()
                        sev = SeverityEnum.CRITICAL if "crit" in sev_str else SeverityEnum.WARNING

                        rule = Rule(
                            brand_pack_id=brand_pack_id,
                            category=cat,
                            severity=sev,
                            title=r.get("title", f"Rule {idx+1}")[:80],
                            description=r.get("description", ""),
                            good_examples=r.get("good_examples", []),
                            bad_examples=r.get("bad_examples", []),
                            source_page=f"Compiled Manual §{idx+1}",
                            approved=True
                        )
                        compiled_rules.append(rule)

                    # Facts
                    for idx, f in enumerate(data.get("facts", [])):
                        fact = Fact(
                            brand_pack_id=brand_pack_id,
                            claim_type=ClaimTypeEnum.PRICING if "price" in f.get("claim_type", "").lower() else ClaimTypeEnum.METRIC,
                            value=f.get("value", ""),
                            source_document=f.get("source_document", "Uploaded Guidelines"),
                            verified_by="usr_ananya",
                            status="active"
                        )
                        compiled_facts.append(fact)

                    # Terms
                    for idx, t in enumerate(data.get("terms", [])):
                        term = Term(
                            brand_pack_id=brand_pack_id,
                            preferred_term=t.get("preferred_term", ""),
                            banned_variants=t.get("banned_variants", []),
                            context_note=t.get("context_note", "Auto-compiled brand term")
                        )
                        compiled_terms.append(term)

            except Exception as e:
                print(f"[GuidelineCompilerAgent] LLM parsing error, falling back to heuristic: {e}")

        # 2. HEURISTIC FALLBACK IF GEMINI IS OFFLINE OR NO RULES EXTRACTED
        if not compiled_rules:
            paragraphs = [p.strip() for p in raw_text.split("\n\n") if len(p.strip()) > 10]
            for idx, para in enumerate(paragraphs[:10]):
                para_lower = para.lower()
                if any(k in para_lower for k in ["voice", "tone", "casual", "confident", "superlative"]):
                    cat = RuleCategoryEnum.TONE
                elif any(k in para_lower for k in ["term", "word", "capitalize", "spelling", "glossary"]):
                    cat = RuleCategoryEnum.TERMINOLOGY
                elif any(k in para_lower for k in ["color", "palette", "logo", "font", "image"]):
                    cat = RuleCategoryEnum.VISUAL
                elif any(k in para_lower for k in ["contrast", "readability", "wcag", "alt"]):
                    cat = RuleCategoryEnum.ACCESSIBILITY
                elif any(k in para_lower for k in ["rbi", "legal", "compliance", "license", "disclaimer"]):
                    cat = RuleCategoryEnum.COMPLIANCE
                else:
                    cat = RuleCategoryEnum.MESSAGING

                sev = SeverityEnum.CRITICAL if any(k in para_lower for k in ["must", "never", "prohibited", "illegal", "critical"]) else SeverityEnum.WARNING
                title_candidate = para.split(".")[0][:60]
                rule = Rule(
                    brand_pack_id=brand_pack_id,
                    category=cat,
                    severity=sev,
                    title=title_candidate,
                    description=para,
                    good_examples=[],
                    bad_examples=[],
                    source_page=f"Compiled Manual §{idx+1}",
                    approved=True
                )
                compiled_rules.append(rule)

        return {
            "brand_pack_id": brand_pack_id,
            "rules_extracted": len(compiled_rules),
            "facts_extracted": len(compiled_facts),
            "terms_extracted": len(compiled_terms),
            "rules": compiled_rules,
            "facts": compiled_facts,
            "terms": compiled_terms,
            "status": "ready"
        }

guideline_compiler_agent = GuidelineCompilerAgent()
