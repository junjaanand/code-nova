from typing import Dict, Any, List, Optional
from apps.api.db.database import db
from apps.api.agents.orchestrator import orchestrator

class BrandGuardMCPServer:
    """
    Brand Guard MCP Server.
    Allows external AI agents (Claude, ChatGPT, Cursor, agency scripts)
    to query brand rules, lookup verified facts, and pre-check draft content.
    """
    def __init__(self):
        self.server_name = "brand-guard"
        self.version = "1.0.0"

    def get_tool_definitions(self) -> List[Dict[str, Any]]:
        return [
            {
                "name": "check_content",
                "description": "Reviews draft marketing copy against active brand guidelines, verified facts, and terminology.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "text": {"type": "string", "description": "The draft text to evaluate"},
                        "channel": {"type": "string", "description": "Channel: linkedin | email | blog | ad | deck", "default": "linkedin"},
                        "audience": {"type": "string", "description": "Target audience description", "default": "Business"}
                    },
                    "required": ["text"]
                }
            },
            {
                "name": "get_rules",
                "description": "Fetches approved brand guidelines, tone rules, and compliance requirements.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "category": {"type": "string", "description": "Filter by category: tone | terminology | messaging | visual | accessibility | compliance"}
                    }
                }
            },
            {
                "name": "lookup_fact",
                "description": "Searches the verified enterprise facts database for approved pricing, metrics, and dates.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "query": {"type": "string", "description": "Keyword or topic (e.g., 'pricing', 'uptime', 'merchants')"}
                    },
                    "required": ["query"]
                }
            },
            {
                "name": "list_assets",
                "description": "Lists official brand assets, hex palettes, and logo guidelines.",
                "parameters": {"type": "object", "properties": {}}
            }
        ]

    async def execute_tool(self, tool_name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
        if tool_name == "check_content":
            text = arguments.get("text", "")
            channel = arguments.get("channel", "linkedin")
            audience = arguments.get("audience", "Business")
            
            # Run review through BrandShield multi-agent pipeline
            review_res = await orchestrator.run_review(
                content_id="mcp_req",
                content_text=text,
                channel=channel,
                audience=audience
            )
            return {
                "score": review_res["score"],
                "risk_tier": review_res["risk_tier"],
                "findings": [
                    {
                        "category": f.category,
                        "severity": f.severity,
                        "explanation": f.explanation,
                        "evidence": [e.dict() for e in f.evidence],
                        "suggestions": [s.text for s in f.suggestions]
                    }
                    for f in review_res["findings"]
                ]
            }

        elif tool_name == "get_rules":
            category = arguments.get("category")
            bp = db.get_active_brand_pack()
            rules = db.get_rules_for_brand_pack(bp.id if bp else "")
            if category:
                rules = [r for r in rules if r.category == category]
            return {
                "count": len(rules),
                "rules": [
                    {"id": r.id, "category": r.category, "title": r.title, "description": r.description}
                    for r in rules
                ]
            }

        elif tool_name == "lookup_fact":
            query = arguments.get("query", "").lower()
            bp = db.get_active_brand_pack()
            facts = db.get_facts_for_brand_pack(bp.id if bp else "")
            matched = [
                {"id": f.id, "claim_type": f.claim_type, "value": f.value, "source": f.source, "status": f.status}
                for f in facts
                if query in f.value.lower() or query in f.claim_type.lower() or query in f.id.lower()
            ]
            return {"results_count": len(matched), "facts": matched}

        elif tool_name == "list_assets":
            bp = db.get_active_brand_pack()
            assets = db.get_assets_for_brand_pack(bp.id if bp else "")
            return {
                "assets": [
                    {"id": a.id, "type": a.asset_type, "name": a.name, "rules": a.rules}
                    for a in assets
                ]
            }

        raise ValueError(f"Unknown MCP tool: {tool_name}")

    async def handle_request(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """
        JSON-RPC 2.0 request handler for Model Context Protocol (MCP).
        """
        req_id = request.get("id", "1")
        method = request.get("method", "")
        params = request.get("params", {})

        try:
            if method == "tools/list":
                res = {"tools": self.get_tool_definitions()}
            elif method == "tools/call":
                tool_name = params.get("name")
                arguments = params.get("arguments", {})
                res = await self.execute_tool(tool_name, arguments)
            elif method in ["check_content", "get_rules", "lookup_fact", "list_assets"]:
                res = await self.execute_tool(method, params)
            else:
                return {
                    "jsonrpc": "2.0",
                    "id": req_id,
                    "error": {"code": -32601, "message": f"Method '{method}' not found"}
                }

            return {
                "jsonrpc": "2.0",
                "id": req_id,
                "result": res
            }
        except Exception as e:
            return {
                "jsonrpc": "2.0",
                "id": req_id,
                "error": {"code": -32000, "message": str(e)}
            }

brand_guard_mcp = BrandGuardMCPServer()
