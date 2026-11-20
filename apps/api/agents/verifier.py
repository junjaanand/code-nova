import hashlib
from typing import List, Tuple, Dict, Any
from packages.schemas.finding import Finding
from apps.api.db.database import db

class VerifierAgent:
    """
    The 'No citation, no flag' Gatekeeper with Abstention Engine.
    Every candidate finding from specialist agents MUST pass through this critic.
    Any finding lacking valid, grounded evidence from the active Brand Pack is pruned,
    causing the system to explicitly ABSTAIN rather than hallucinate policies.
    """
    def verify(self, raw_findings: List[Finding], brand_pack_id: str) -> Tuple[List[Finding], List[Finding]]:
        approved_findings: List[Finding] = []
        dropped_findings: List[Finding] = []

        rules = {r.id: r for r in db.get_rules_for_brand_pack(brand_pack_id)}
        facts = {f.id: f for f in db.get_facts_for_brand_pack(brand_pack_id)}
        assets = {a.id: a for a in db.get_assets_for_brand_pack(brand_pack_id)}

        for finding in raw_findings:
            # Rule 1: Must have at least 1 evidence item
            if not finding.evidence or len(finding.evidence) == 0:
                print(f"[VerifierAgent] ABSTAINED on flag {finding.id}: empty evidence list.")
                dropped_findings.append(finding)
                continue

            # Rule 2: Minimum confidence calibration threshold
            if finding.confidence < 0.70:
                print(f"[VerifierAgent] ABSTAINED on flag {finding.id}: confidence {finding.confidence} below threshold 0.70.")
                dropped_findings.append(finding)
                continue

            # Rule 3: Citation Grounding Check
            citation_grounded = False
            for ev in finding.evidence:
                if ev.type == "guideline" and ev.source_id in rules:
                    citation_grounded = True
                    # Attach cryptographic SHA-256 citation grounding stamp
                    ev.citation_hash = hashlib.sha256(f"{ev.source_id}:{ev.quote}".encode()).hexdigest()[:10]
                    break
                elif ev.type == "fact" and ev.source_id in facts:
                    citation_grounded = True
                    ev.citation_hash = hashlib.sha256(f"{ev.source_id}:{ev.quote}".encode()).hexdigest()[:10]
                    break
                elif ev.type == "asset" and ev.source_id in assets:
                    citation_grounded = True
                    ev.citation_hash = hashlib.sha256(f"{ev.source_id}:{ev.quote}".encode()).hexdigest()[:10]
                    break

            if not citation_grounded:
                print(f"[VerifierAgent] KILLED flag {finding.id}: citation source '{finding.evidence[0].source_id}' not grounded in active Brand Pack.")
                dropped_findings.append(finding)
                continue

            # If all checks pass, finding is verified and grounded
            approved_findings.append(finding)

        return approved_findings, dropped_findings

verifier_agent = VerifierAgent()
