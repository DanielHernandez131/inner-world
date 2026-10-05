import json
from copy import deepcopy
from pathlib import Path

import pytest
from pydantic import ValidationError

from inner_world.schemas import EmotionalAnalysis

FIXTURE = Path(__file__).resolve().parents[3] / "contracts/examples/emotional-analysis.json"


def example():
    return json.loads(FIXTURE.read_text())


def test_example_round_trips_without_changing_the_contract():
    payload = example()
    parsed = EmotionalAnalysis.model_validate(payload)
    assert parsed.model_dump(mode="json") == payload


@pytest.mark.parametrize("intensity", [0, 11, 4.5, "7", True])
def test_out_of_range_or_coerced_intensity_is_rejected(intensity):
    payload = example()
    payload["emotions"][0]["intensity"] = intensity
    with pytest.raises(ValidationError):
        EmotionalAnalysis.model_validate(payload)


def test_duplicate_emotion_is_rejected():
    payload = example()
    payload["emotions"].append(deepcopy(payload["emotions"][0]))
    with pytest.raises(ValidationError):
        EmotionalAnalysis.model_validate(payload)


def test_unknown_fields_and_unknown_emotions_are_rejected():
    payload = example()
    payload["diagnosis"] = "invented"
    with pytest.raises(ValidationError):
        EmotionalAnalysis.model_validate(payload)
    payload = example()
    payload["emotions"][0]["emotion"] = "anxiety"
    with pytest.raises(ValidationError):
        EmotionalAnalysis.model_validate(payload)


def test_character_cannot_reference_an_absent_emotion():
    payload = example()
    payload["characters"][0]["emotion"] = "anger"
    with pytest.raises(ValidationError):
        EmotionalAnalysis.model_validate(payload)


def test_generated_hypothesis_cannot_be_saved_as_user_thought():
    payload = example()
    payload["fragments"][0]["kind"] = "thought"
    payload["fragments"][0]["provenance"] = "ai_hypothesis"
    with pytest.raises(ValidationError):
        EmotionalAnalysis.model_validate(payload)


def test_empty_emotions_are_allowed_when_context_is_insufficient():
    parsed = EmotionalAnalysis.model_validate(
        {
            "schema_version": 1,
            "summary": "No hay contexto suficiente.",
            "emotions": [],
            "characters": [],
            "fragments": [],
        }
    )
    assert parsed.emotions == []
