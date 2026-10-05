"""Source of truth for the initial, versioned emotional-analysis contract.

Structural validation is implemented here. Evidence must also be checked against
the source transcript by the future exploration service before any result is saved.
"""

from enum import StrEnum
from typing import Annotated, Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, model_validator

ShortText = Annotated[str, Field(min_length=1, max_length=500)]


class Emotion(StrEnum):
    JOY = "joy"
    TRUST = "trust"
    FEAR = "fear"
    SURPRISE = "surprise"
    SADNESS = "sadness"
    DISGUST = "disgust"
    ANGER = "anger"
    ANTICIPATION = "anticipation"


class ContractModel(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)


class Evidence(ContractModel):
    source_message_id: UUID
    quote: ShortText


class EmotionReading(ContractModel):
    emotion: Emotion
    intensity: Annotated[int, Field(ge=1, le=10, strict=True)]
    explanation: ShortText
    evidence: Annotated[list[Evidence], Field(min_length=1, max_length=3)]


class CharacterVoice(ContractModel):
    emotion: Emotion
    text: ShortText


class FragmentCandidate(ContractModel):
    kind: Literal["thought", "discovery", "possibility"]
    provenance: Literal["user_quote", "user_paraphrase", "ai_hypothesis"]
    text: ShortText
    source_message_ids: Annotated[list[UUID], Field(min_length=1, max_length=5)]
    related_emotions: Annotated[list[Emotion], Field(max_length=8)]

    @model_validator(mode="after")
    def check_provenance(self) -> "FragmentCandidate":
        if self.kind == "thought" and self.provenance == "ai_hypothesis":
            raise ValueError("A generated hypothesis must not be attributed as a user thought")
        if len(set(self.related_emotions)) != len(self.related_emotions):
            raise ValueError("Fragment emotions must be unique")
        if len(set(self.source_message_ids)) != len(self.source_message_ids):
            raise ValueError("Source message references must be unique")
        return self


class EmotionalAnalysis(ContractModel):
    schema_version: Literal[1]
    summary: ShortText
    emotions: Annotated[list[EmotionReading], Field(max_length=8)]
    characters: Annotated[list[CharacterVoice], Field(max_length=8)]
    fragments: Annotated[list[FragmentCandidate], Field(max_length=4)]

    @model_validator(mode="after")
    def check_relationships(self) -> "EmotionalAnalysis":
        emotion_ids = [item.emotion for item in self.emotions]
        character_ids = [item.emotion for item in self.characters]
        if len(set(emotion_ids)) != len(emotion_ids):
            raise ValueError("Each emotion may appear only once")
        if len(set(character_ids)) != len(character_ids):
            raise ValueError("Each character may appear only once")
        if not set(character_ids).issubset(emotion_ids):
            raise ValueError("Character voices must refer to identified emotions")
        if any(not set(f.related_emotions).issubset(emotion_ids) for f in self.fragments):
            raise ValueError("Fragment emotions must refer to identified emotions")
        return self
