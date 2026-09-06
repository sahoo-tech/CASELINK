"""
CASELINK Backend Application Entrypoint
FastAPI application initialization, CORS middleware, router registration,
startup graph seeding, and request audit middleware.
"""
import time
import uuid
import logging
from datetime import datetime

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.api import auth, cases, entities, graph, timeline, hypotheses, reports

logger = logging.getLogger("caselink")

# ─── FastAPI Application Initialization ─────────────────────────────────────
app = FastAPI(
    title=settings.PROJECT_NAME,
    description=(
        "**CASELINK** — AI-Assisted Investigation Intelligence Platform Prototype.\n\n"
        "**Demo Login Credentials:**\n"
        "- `INV001` / `caselink123` — Investigator (CBI)\n"
        "- `ANL001` / `caselink123` — Analyst (IB)\n"
        "- `ADM001` / `caselink123` — Admin (NIA)\n\n"
        "Use **POST /api/v1/auth/login** to obtain a JWT, "
        "then click **Authorize** (🔓) and paste the token."
    ),
    version="0.1.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    contact={"name": "CASELINK Team — SIH 2026"},
)

# ─── CORS Middleware ─────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Request Timing & Audit Middleware ───────────────────────────────────────
@app.middleware("http")
async def audit_and_timing_middleware(request: Request, call_next):
    """Log every incoming request with timing for audit and performance monitoring."""
    start_time = time.perf_counter()
    request_id = str(uuid.uuid4())[:8]

    # Log incoming request
    logger.info(
        f"[{request_id}] {request.method} {request.url.path} "
        f"| Client: {request.client.host if request.client else 'unknown'}"
    )

    try:
        response = await call_next(request)
    except Exception as exc:
        logger.error(f"[{request_id}] Unhandled exception: {exc}")
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal server error. Please contact system administrator."},
        )

    process_time = round((time.perf_counter() - start_time) * 1000, 2)
    response.headers["X-Request-ID"] = request_id
    response.headers["X-Process-Time-Ms"] = str(process_time)

    logger.info(
        f"[{request_id}] {response.status_code} | {process_time}ms"
    )
    return response


# ─── Application Lifecycle ───────────────────────────────────────────────────
@app.on_event("startup")
async def startup_event():
    """
    On application startup:
    1. Load all mock entity/relationship data into the NetworkX knowledge graph
    2. Log system startup confirmation
    """
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
    )
    logger.info("=" * 60)
    logger.info("CASELINK Investigation Intelligence Platform")
    logger.info("Starting up... loading knowledge graph...")

    try:
        from app.services.graph_builder import graph_builder_service
        graph_builder_service.load_mock_data()
        node_count = graph_builder_service.graph.number_of_nodes()
        edge_count = graph_builder_service.graph.number_of_edges()
        logger.info(f"✅ Knowledge graph loaded: {node_count} nodes, {edge_count} edges")
    except Exception as e:
        logger.warning(f"⚠ Graph loading failed (non-fatal): {e}")

    logger.info("✅ CASELINK backend ready.")
    logger.info(f"   Docs: http://localhost:8000/docs")
    logger.info(f"   API : http://localhost:8000{settings.API_V1_STR}")
    logger.info("=" * 60)


@app.on_event("shutdown")
async def shutdown_event():
    logger.info("CASELINK backend shutting down. Goodbye.")


# ─── Router Registrations ────────────────────────────────────────────────────
# Mount under /api/v1 standard prefix
app.include_router(auth.router,        prefix=settings.API_V1_STR)
app.include_router(cases.router,       prefix=settings.API_V1_STR)
app.include_router(entities.router,    prefix=settings.API_V1_STR)
app.include_router(graph.router,       prefix=settings.API_V1_STR)
app.include_router(timeline.router,    prefix=settings.API_V1_STR)
app.include_router(hypotheses.router,  prefix=settings.API_V1_STR)
app.include_router(reports.router,     prefix=settings.API_V1_STR)

# Also mount under root prefix so requests without /api/v1 work transparently
app.include_router(auth.router,        prefix="", include_in_schema=False)
app.include_router(cases.router,       prefix="", include_in_schema=False)
app.include_router(entities.router,    prefix="", include_in_schema=False)
app.include_router(graph.router,       prefix="", include_in_schema=False)
app.include_router(timeline.router,    prefix="", include_in_schema=False)
app.include_router(hypotheses.router,  prefix="", include_in_schema=False)
app.include_router(reports.router,     prefix="", include_in_schema=False)


# ─── System Endpoints ────────────────────────────────────────────────────────
@app.get(f"{settings.API_V1_STR}/ping", tags=["System"])
@app.get("/ping", tags=["System"])
@app.head(f"{settings.API_V1_STR}/ping", tags=["System"])
@app.head("/ping", tags=["System"])
async def fast_ping():
    """Ultra-lightweight ping endpoint for instant latency checking and keepalive (< 1ms)."""
    return {
        "status": "ok",
        "pong": True,
        "service": settings.PROJECT_NAME,
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }


@app.get(f"{settings.API_V1_STR}/health", tags=["System"])
@app.get("/health", tags=["System"])
@app.head(f"{settings.API_V1_STR}/health", tags=["System"])
@app.head("/health", tags=["System"])
async def health_check():
    """System health and readiness check endpoint with knowledge graph status."""
    try:
        from app.services.graph_builder import graph_builder_service
        graph = graph_builder_service.graph
        nodes = graph.number_of_nodes()
        edges = graph.number_of_edges()
    except Exception:
        nodes = 0
        edges = 0

    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": "0.1.0",
        "environment": settings.ENVIRONMENT,
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "knowledge_graph": {
            "nodes": nodes,
            "edges": edges,
            "status": "loaded" if nodes > 0 else "empty",
        },
    }


@app.get("/", tags=["System"])
async def root():
    """Root endpoint — links to API documentation."""
    return {
        "message": "Welcome to CASELINK Investigation Intelligence API",
        "version": "0.1.0",
        "docs_url": "/docs",
        "redoc_url": "/redoc",
        "health_url": "/health",
        "api_prefix": settings.API_V1_STR,
        "login_endpoint": f"{settings.API_V1_STR}/auth/login",
        "demo_credentials": {
            "investigator": {"official_id": "INV001", "password": "caselink123"},
            "analyst":      {"official_id": "ANL001", "password": "caselink123"},
            "admin":        {"official_id": "ADM001", "password": "caselink123"},
        },
    }
