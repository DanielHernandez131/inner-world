"""Local health, emotion catalog and stateless exploration endpoints."""

from typing import Literal
from uuid import uuid4

from fastapi import APIRouter, Request
from pydantic import BaseModel

from inner_world.adventures import personalize
from inner_world.exploration import analyze
from inner_world.schemas import (
    AdventureRequest,
    AdventureResponse,
    Emotion,
    ExplorationRequest,
    ExplorationResponse,
)

router = APIRouter(prefix="/api/v1")


class HealthResponse(BaseModel):
    status: Literal["ok"] = "ok"
    version: str = "0.1.0"
    ai_enabled: bool = False


class EmotionCatalogEntry(BaseModel):
    id: Emotion
    label: str


@router.get("/health", response_model=HealthResponse, tags=["system"])
def health(request: Request) -> HealthResponse:
    return HealthResponse(ai_enabled=request.app.state.settings.ai_enabled)


@router.get("/emotions", response_model=list[EmotionCatalogEntry], tags=["catalog"])
def emotion_catalog() -> list[EmotionCatalogEntry]:
    labels = (
        "Alegría",
        "Confianza",
        "Miedo",
        "Sorpresa",
        "Tristeza",
        "Aversión",
        "Ira",
        "Anticipación",
    )
    return [
        EmotionCatalogEntry(id=emotion, label=label)
        for emotion, label in zip(Emotion, labels, strict=True)
    ]


@router.post("/explorations/analyze", response_model=ExplorationResponse, tags=["exploration"])
def explore(payload: ExplorationRequest, request: Request) -> ExplorationResponse:
    request.app.state.budget.consume()
    turn = analyze(payload, request.app.state.provider)
    return ExplorationResponse(result=turn.result, request_id=uuid4())


@router.post("/adventures/personalize", response_model=AdventureResponse, tags=["adventure"])
def adventure(payload: AdventureRequest, request: Request) -> AdventureResponse:
    request.app.state.budget.consume()
    return personalize(payload, request.app.state.adventure_provider)
