from typing import List, Dict, Any
from packages.schemas.finding import Finding
from packages.schemas.models import RiskTierEnum, RoleEnum

class RiskRouterAgent:
    """
    Computes overall brand compliance score (0-100), assigns risk tier,
    and determines the required human approval routing.
    """
    def route(self, findings: List[Finding]) -> Dict[str, Any]:
        critical_count = sum(1 for f in findings if f.severity == "critical")
        warning_count = sum(1 for f in findings if f.severity == "warning")
        info_count = sum(1 for f in findings if f.severity == "info")

        # Score calculation: 100 base, deductions for findings
        score = 100 - (critical_count * 18) - (warning_count * 8) - (info_count * 2)
        score = max(0, min(100, score))

        # Risk Tier Assignment
        if critical_count >= 1 or score < 65:
            risk_tier = RiskTierEnum.HIGH
            assigned_role = RoleEnum.REVIEWER
            reviewer_desc = "Legal & Compliance Reviewer"
        elif warning_count >= 2 or score < 85:
            risk_tier = RiskTierEnum.ELEVATED
            assigned_role = RoleEnum.MANAGER
            reviewer_desc = "Content Manager"
        else:
            risk_tier = RiskTierEnum.STANDARD
            assigned_role = RoleEnum.CREATOR
            reviewer_desc = "Self-Resolution / Fast-track Approval"

        return {
            "score": score,
            "risk_tier": risk_tier,
            "required_role": assigned_role,
            "reviewer_desc": reviewer_desc,
            "critical_count": critical_count,
            "warning_count": warning_count,
            "info_count": info_count,
            "total_findings": len(findings)
        }

risk_router_agent = RiskRouterAgent()
