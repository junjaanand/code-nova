import asyncio
import json
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from apps.api.db.database import db
from apps.api.agents.orchestrator import orchestrator

router = APIRouter(prefix="/stream", tags=["Real-time Streaming (SSE)"])

@router.get("/review/{content_id}")
async def stream_review(content_id: str):
    item = db.content_items.get(content_id)
    if not item:
        raise HTTPException(status_code=404, detail="Content item not found")

    async def event_generator():
        queue = asyncio.Queue()

        async def on_progress(event):
            await queue.put(event)

        # Launch review asynchronously
        review_task = asyncio.create_task(orchestrator.run_review(
            content_id=item.id,
            content_text=item.current_text,
            channel=item.channel.value if hasattr(item.channel, "value") else str(item.channel),
            audience=item.audience,
            creator_purpose=item.creator_purpose,
            progress_callback=on_progress
        ))

        while not review_task.done() or not queue.empty():
            try:
                event = await asyncio.wait_for(queue.get(), timeout=0.2)
                data = json.dumps(event)
                yield f"data: {data}\n\n"
            except asyncio.TimeoutError:
                # Keep-alive heartbeat comment
                yield ": ping\n\n"

        # Final result check
        try:
            res = await review_task
            final_data = json.dumps({
                "step": "done",
                "score": res["score"],
                "risk_tier": res["risk_tier"],
                "findings_count": res["findings_count"],
                "progress_pct": 100
            })
            yield f"data: {final_data}\n\n"
        except Exception as e:
            err_data = json.dumps({"step": "error", "error": str(e)})
            yield f"data: {err_data}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )
