"""Application factory allows isolated configuration in tests and deployments."""

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from inner_world.adventures import OpenAIAdventureProvider
from inner_world.config import Settings
from inner_world.exploration import ExplorationError, OpenAIProvider, RequestBudget
from inner_world.routes import router


def create_app(settings: Settings | None = None) -> FastAPI:
    settings = settings or Settings()
    application = FastAPI(
        title="Inner World API",
        version="0.1.0",
        description="Exploración emocional local con interpretación IA revisable.",
    )
    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=False,
        allow_methods=["GET", "POST"],
        allow_headers=["Content-Type"],
    )
    application.state.settings = settings
    application.state.provider = OpenAIProvider(settings)
    application.state.adventure_provider = OpenAIAdventureProvider(
        application.state.provider, settings.adventure_max_output_tokens
    )
    application.state.budget = RequestBudget(
        settings.ai_requests_per_minute, settings.ai_requests_per_day
    )

    @application.exception_handler(RequestValidationError)
    async def invalid_request(request: Request, exc: RequestValidationError):
        return JSONResponse(
            status_code=422,
            content={
                "error": {
                    "code": "invalid_request",
                    "message": "Revisa los campos y límites de la solicitud.",
                }
            },
        )

    @application.exception_handler(ExplorationError)
    async def exploration_error(request: Request, exc: ExplorationError):
        return JSONResponse(
            status_code=exc.status,
            content={
                "error": {
                    "code": exc.code,
                    "message": exc.message,
                }
            },
            headers={"Retry-After": "60"} if exc.status == 429 else None,
        )

    application.include_router(router)
    return application


app = create_app()
