from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from app.api.v1.router import api_router
from app.core.config import settings
from app.core.cors import add_cors


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.app_name,
        version="0.1.0",
        description="Stable Module 1 APIs for NEMO CrudeFlow maritime logistics intelligence.",
    )
    add_cors(app)
    app.include_router(api_router, prefix=settings.api_v1_prefix)

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception):
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "timestamp": settings.now_iso(),
                "requestId": getattr(request.state, "request_id", None),
                "source": "mockFallback",
                "error": {
                    "message": "Internal server error",
                    "detail": str(exc) if settings.app_env != "production" else "Unexpected error",
                },
            },
        )

    return app


app = create_app()

