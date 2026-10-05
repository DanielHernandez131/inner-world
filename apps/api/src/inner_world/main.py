"""Application factory allows isolated configuration in tests and deployments."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from inner_world.config import Settings
from inner_world.routes import router


def create_app(settings: Settings | None = None) -> FastAPI:
    settings = settings or Settings()
    application = FastAPI(
        title="Inner World API",
        version="0.1.0",
        description="Base de desarrollo. La integración con IA todavía no está implementada.",
    )
    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=False,
        allow_methods=["GET"],
        allow_headers=["Content-Type"],
    )
    application.include_router(router)
    return application


app = create_app()
