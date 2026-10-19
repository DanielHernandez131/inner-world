"""Source of truth for the initial, versioned emotional-analysis contract.

Structural validation is implemented here. Evidence must also be checked against
the source transcript by the exploration service before returning a result.
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


class SourceMessage(ContractModel):
    id: UUID
    text: Annotated[str, Field(min_length=1, max_length=4000)]


class ClarificationQuestion(ContractModel):
    id: UUID
    text: ShortText
    options: Annotated[list[ShortText], Field(min_length=2, max_length=5)]

    @model_validator(mode="after")
    def unique_options(self) -> "ClarificationQuestion":
        if len(set(self.options)) != len(self.options):
            raise ValueError("Options must be unique")
        return self


class ExplorationAnswer(ContractModel):
    question: ClarificationQuestion
    message: SourceMessage


class ExplorationRequest(ContractModel):
    experience_id: UUID
    story: SourceMessage
    answers: Annotated[list[ExplorationAnswer], Field(max_length=2)]
    finish_now: bool = False

    @model_validator(mode="after")
    def check_transcript(self) -> "ExplorationRequest":
        if len(self.story.text) < 20:
            raise ValueError("Story must contain at least 20 characters")
        ids = [self.story.id]
        for answer in self.answers:
            if len(answer.message.text) > 2000:
                raise ValueError("Answer is too long")
            ids.extend([answer.question.id, answer.message.id])
        if len(set(ids)) != len(ids):
            raise ValueError("Transcript IDs must be unique")
        return self


class ClarificationResult(ContractModel):
    status: Literal["clarification"]
    question: ClarificationQuestion


class CompleteResult(ContractModel):
    status: Literal["complete"]
    analysis: EmotionalAnalysis


class InsufficientResult(ContractModel):
    status: Literal["insufficient_context"]
    explanation: ShortText


class ExplorationTurn(ContractModel):
    result: ClarificationResult | CompleteResult | InsufficientResult


class ExplorationResponse(ExplorationTurn):
    request_id: UUID


class TokenUsage(ContractModel):
    input_tokens: Annotated[int, Field(ge=0, strict=True)]
    output_tokens: Annotated[int, Field(ge=0, strict=True)]


class AdventureRequest(ContractModel):
    experience_id: UUID
    template_id: Literal["crossing-v1"]
    summary: ShortText
    emotions: Annotated[list[Emotion], Field(min_length=1, max_length=8)]

    @model_validator(mode="after")
    def unique_emotions(self) -> "AdventureRequest":
        if len(set(self.emotions)) != len(self.emotions):
            raise ValueError("Adventure emotions must be unique")
        return self


class AdventurePersonalization(ContractModel):
    title: Annotated[str, Field(min_length=1, max_length=80)]
    introduction: Annotated[str, Field(min_length=1, max_length=600)]
    clearing_detail: Annotated[str, Field(min_length=1, max_length=220)]
    shelter_detail: Annotated[str, Field(min_length=1, max_length=220)]
    arrival_detail: Annotated[str, Field(min_length=1, max_length=220)]
    reflection_question: Annotated[str, Field(min_length=1, max_length=200)]


class AdventureResponse(ContractModel):
    request_id: UUID
    experience_id: UUID
    template_id: Literal["crossing-v1"]
    personalization: AdventurePersonalization
    usage: TokenUsage | None
