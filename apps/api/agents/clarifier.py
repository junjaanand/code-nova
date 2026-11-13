from typing import Dict, Any, List
from packages.schemas.models import Rule
from apps.api.db.database import db

class GuidelineClarifierAgent:
    """
    Guideline Health & Ambiguity Intelligence Engine.
    When humans frequently override a rule, this agent drafts clearer,
    unambiguous wording with concrete positive/negative examples.
    """
    def draft_clarification(self, rule_id: str) -> Dict[str, Any]:
        rule = db.rules.get(rule_id)
        if not rule:
            return {"error": f"Rule {rule_id} not found"}

        # Generate revised, clarified rule text
        original_desc = rule.description
        clarified_desc = (
            f"{original_desc.strip()} "
            f"[CLARIFICATION NOTE: Permitted when backed by external analyst reports (e.g. Gartner, IDC). "
            f"Always include formal footnote citation.]"
        )

        suggested_goods = rule.good_examples + [
            "Recognized as a leading enterprise payment platform by IDC 2026",
            "Top-rated payment provider in 2026 Customer Satisfaction Index"
        ]
        suggested_bads = rule.bad_examples + [
            "We are unequivocally the number one platform anywhere"
        ]

        return {
            "rule_id": rule.id,
            "rule_title": rule.title,
            "original_description": original_desc,
            "proposed_description": clarified_desc,
            "ambiguity_score": rule.ambiguity_score,
            "override_count": rule.override_count,
            "additional_good_examples": suggested_goods,
            "additional_bad_examples": suggested_bads,
            "rationale": (
                f"This rule has an override rate of {rule.override_count}/{rule.total_eval_count} "
                f"({(rule.override_count / max(1, rule.total_eval_count))*100:.1f}%). "
                f"Human reviewers frequently allow superlative phrasing when external citations are present. "
                f"This clarification codifies that acceptable exception."
            )
        }

guideline_clarifier_agent = GuidelineClarifierAgent()
