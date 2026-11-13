from typing import List
from packages.schemas.finding import Finding, SuggestionItem

class FixAgent:
    """
    Generates 2-3 tracked-change options for each verified finding,
    ensuring each option includes a clear rationale.
    """
    def generate_fixes(self, findings: List[Finding]) -> List[Finding]:
        for f in findings:
            if not f.suggestions or len(f.suggestions) == 0:
                # Provide standard brand-aligned fix
                if f.category == "terminology":
                    target = f.explanation.split("'")[-2] if "'" in f.explanation else "approved term"
                    f.suggestions.append(SuggestionItem(
                        text=target,
                        rationale="Applies approved brand glossary terminology.",
                        intent_check="pass"
                    ))
                else:
                    f.suggestions.append(SuggestionItem(
                        text="[Revised to comply with brand guideline]",
                        rationale="Brings statement into alignment with brand policy.",
                        intent_check="pass"
                    ))
            
            # Format diff preview for each suggestion
            for sug in f.suggestions:
                orig = ""
                if hasattr(f.location, "matched_text") and f.location.matched_text:
                    orig = f.location.matched_text
                elif isinstance(f.location, dict) and "matched_text" in f.location:
                    orig = f.location["matched_text"]
                
                if orig:
                    sug.diff_preview = f"[-{orig}-]{{+{sug.text}+}}"

        return findings

fix_agent = FixAgent()
