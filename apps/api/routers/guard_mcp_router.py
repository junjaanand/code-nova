from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import Dict, Any, Optional
from apps.api.mcp.brand_guard_mcp import brand_guard_mcp

router = APIRouter(prefix="/guard", tags=["Brand Guard API & MCP Server"])

class GuardCheckRequest(BaseModel):
    text: str
    channel: str = "linkedin"
    audience: str = "General Business"

class MCPRpcRequest(BaseModel):
    jsonrpc: str = "2.0"
    method: str
    params: Optional[Dict[str, Any]] = None
    id: Optional[Any] = 1

@router.post("/check")
async def guard_check(req: GuardCheckRequest):
    return await brand_guard_mcp.execute_tool("check_content", {
        "text": req.text,
        "channel": req.channel,
        "audience": req.audience
    })

@router.get("/rules")
async def guard_rules(category: Optional[str] = None):
    return await brand_guard_mcp.execute_tool("get_rules", {"category": category})

@router.get("/facts")
async def guard_facts(query: str = ""):
    return await brand_guard_mcp.execute_tool("lookup_fact", {"query": query})

@router.get("/assets")
async def guard_assets():
    return await brand_guard_mcp.execute_tool("list_assets", {})

@router.post("/mcp")
async def mcp_json_rpc(req: MCPRpcRequest):
    """
    Standard Model Context Protocol (MCP) JSON-RPC 2.0 handler.
    Allows external tools (ChatGPT, Claude, Cursor) to interact with Brand Guard.
    """
    if req.method == "tools/list":
        return {
            "jsonrpc": "2.0",
            "id": req.id,
            "result": {
                "tools": brand_guard_mcp.get_tool_definitions()
            }
        }
    elif req.method == "tools/call":
        params = req.params or {}
        tool_name = params.get("name")
        arguments = params.get("arguments", {})
        try:
            result = await brand_guard_mcp.execute_tool(tool_name, arguments)
            return {
                "jsonrpc": "2.0",
                "id": req.id,
                "result": {
                    "content": [{"type": "text", "text": str(result)}]
                }
            }
        except Exception as e:
            return {
                "jsonrpc": "2.0",
                "id": req.id,
                "error": {"code": -32603, "message": str(e)}
            }

    return {
        "jsonrpc": "2.0",
        "id": req.id,
        "error": {"code": -32601, "message": f"Method {req.method} not found"}
    }
