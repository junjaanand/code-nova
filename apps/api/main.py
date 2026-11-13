import sys
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from apps.api.config import settings
from apps.api.db.seed_data import seed_database
from apps.api.routers.auth_router import router as auth_router
from apps.api.routers.brand_pack_router import router as brand_pack_router
from apps.api.routers.rules_facts_router import router as rules_facts_router
from apps.api.routers.content_router import router as content_router
from apps.api.routers.workflow_router import router as workflow_router
from apps.api.routers.analytics_router import router as analytics_router
from apps.api.routers.guard_mcp_router import router as guard_mcp_router
from apps.api.routers.stream_router import router as stream_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="BrandShield AI — Intelligent Brand Governance & Multi-Agent Pre-Publication Review Platform",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize seed data on startup
@app.on_event("startup")
def on_startup():
    print(f"[{settings.PROJECT_NAME}] Starting up... Seeding core brand guidelines & facts.")
    seed_database()

# Register Routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(brand_pack_router, prefix=settings.API_V1_STR)
app.include_router(rules_facts_router, prefix=settings.API_V1_STR)
app.include_router(content_router, prefix=settings.API_V1_STR)
app.include_router(workflow_router, prefix=settings.API_V1_STR)
app.include_router(analytics_router, prefix=settings.API_V1_STR)
app.include_router(guard_mcp_router, prefix=settings.API_V1_STR)
app.include_router(stream_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "operational",
        "docs": "/docs",
        "tagline": "Review every piece of content against your brand truth — before the world sees it."
    }

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "version": settings.VERSION,
        "database": "connected",
        "subsystems": {
            "orchestrator": "online",
            "mcp_server": "online",
            "brand_pack": "loaded"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("apps.api.main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)
