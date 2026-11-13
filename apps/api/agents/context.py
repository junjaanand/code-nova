from typing import Dict, Any
from packages.schemas.models import ChannelEnum, RiskTierEnum

class ContextAgent:
    """
    Evaluates submission metadata, target channel constraints, and publication sensitivity.
    """
    def evaluate(self, channel: str, audience: str, creator_purpose: str, text: str) -> Dict[str, Any]:
        # High sensitivity channels
        channel_lower = channel.lower()
        is_external = channel_lower in ["linkedin", "ad", "press_release", "website", "deck"]
        
        # Check for financial/regulatory keywords that escalate risk
        high_risk_triggers = ["pricing", "guarantee", "return", "invest", "rbi", "license", "credit", "fee"]
        escalate_risk = any(t in text.lower() for t in high_risk_triggers)

        initial_risk = RiskTierEnum.STANDARD
        if is_external and escalate_risk:
            initial_risk = RiskTierEnum.ELEVATED

        return {
            "channel": channel,
            "audience": audience or "General Business Audience",
            "is_external": is_external,
            "creator_purpose": creator_purpose,
            "initial_risk_tier": initial_risk
        }

context_agent = ContextAgent()
