from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.auth.routes import router as auth_router
from app.diagnosis.routes import router as diagnosis_router
from app.hospitals.routes import router as hospitals_router
from app.admin.routes import router as admin_router
from app.reports.routes import router as reports_router


def create_app() -> FastAPI:
    settings = get_settings()

    app = FastAPI(
        title="HemaAI — Blood Cancer Detection API",
        description="AI-powered blood cancer screening and hospital finder API",
        version="1.0.0",
        docs_url="/docs",
        redoc_url="/redoc",
    )

    # CORS
    origins = [o.strip() for o in settings.CORS_ORIGINS.split(",")]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Routers
    app.include_router(auth_router)
    app.include_router(diagnosis_router)
    app.include_router(hospitals_router)
    app.include_router(admin_router)
    app.include_router(reports_router)

    @app.get("/", tags=["Health"])
    async def root():
        return {
            "name": "HemaAI API",
            "version": "1.0.0",
            "status": "running",
            "docs": "/docs",
        }

    @app.get("/health", tags=["Health"])
    async def health_check():
        return {"status": "healthy"}

    return app


app = create_app()
