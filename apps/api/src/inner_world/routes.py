"""Only foundation endpoints are live; exploration is specified in docs."""

from typing import Literal

from fastapi import APIRouter
from pydantic import BaseModel

from inner_world.schemas import Emotion

router = APIRouter(prefix="/api/v1")


class HealthResponse(BaseModel):
    status: Literal["ok"] = "ok"
    version: str = "0.1.0"
    ai_enabled: bool = False


class EmotionCatalogEntry(BaseModel):
    id: Emotion
    label: str


@router.get("/health", response_model=HealthResponse, tags=["system"])
def health() -> HealthResponse:
    return HealthResponse()


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
