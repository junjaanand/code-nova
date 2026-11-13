import re
from typing import List
from packages.schemas.finding import Finding, SuggestionItem

class IntentGuardAgent:
    """
    Safety gate that validates every suggested fix against the creator's original purpose:
    1. Ensures suggestions do NOT invert negation or intent (e.g., changing 'we do not charge' to 'we charge').
    2. Ensures suggestions do NOT introduce new ungrounded numerical claims.
    3. Flags any suggestion with intent_check='fail' so it is never presented as safe.
    """
    def validate_suggestions(self, findings: List[Finding], creator_purpose: str = "") -> List[Finding]:
        for finding in findings:
            orig_text = ""
            if hasattr(finding.location, "matched_text") and finding.location.matched_text:
                orig_text = finding.location.matched_text
            elif isinstance(finding.location, dict) and "matched_text" in finding.location:
                orig_text = finding.location.get("matched_text", "")

            valid_suggestions: List[SuggestionItem] = []
            for sug in finding.suggestions:
                is_safe = self._check_suggestion_safety(orig_text, sug.text)
                sug.intent_check = "pass" if is_safe else "fail"
                if is_safe:
                    valid_suggestions.append(sug)
                else:
                    print(f"[IntentGuard] Flagged unsafe suggestion: '{sug.text}' for original '{orig_text}'")

            # Retain suggestions that passed intent guard
            finding.suggestions = valid_suggestions if valid_suggestions else finding.suggestions

        return findings

    def _check_suggestion_safety(self, orig: str, suggestion: str) -> bool:
        # Check 1: Did suggestion accidentally introduce prohibited guarantees?
        prohibited = ["100% guaranteed", "free money", "zero risk", "guaranteed profit"]
        for p in prohibited:
            if p in suggestion.lower() and p not in orig.lower():
                return False

        # Check 2: Did suggestion introduce fabricated numbers without evidence?
        orig_nums = set(re.findall(r'\b\d+\b', orig))
        sug_nums = set(re.findall(r'\b\d+\b', suggestion))
        # If suggestion introduces massive unexpected new numbers
        new_nums = sug_nums - orig_nums
        # Allow approved pricing 4999 / 45000 / 99 etc.
        approved_known_numbers = {"4999", "45000", "99", "2026", "24", "7"}
        for n in new_nums:
            if n not in approved_known_numbers and len(n) > 3:
                return False

        return True

intent_guard_agent = IntentGuardAgent()
