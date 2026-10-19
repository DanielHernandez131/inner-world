"""Synthetic personalization tests; no external requests or real narratives."""

import json
from io import BytesIO
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient

from inner_world.config import Settings
from inner_world.main import create_app


def request_payload():
    return {
        "experience_id": str(uuid4()),
        "template_id": "crossing-v1",
        "summary": "Podría haber incertidumbre ante una presentación ficticia.",
        "emotions": ["fear", "anticipation"],
    }


def personalization():
    return {
        "title": "El bosque de los caminos",
        "introduction": "Un sendero aparece entre árboles atentos al viento.",
        "clearing_detail": "En el claro, unas piedras dibujan posibles caminos.",
        "shelter_detail": "El refugio tiene una mesa donde extender un mapa.",
        "arrival_detail": "Desde la torre se distinguen varios senderos posibles.",
        "reflection_question": "¿Algo de esta historia conecta con tu experiencia?",
    }


def client_with_response(monkeypatch, content=None, envelope=None):
    calls = []
    data = (
        envelope
        if envelope is not None
        else {
            "status": "completed",
            "output": [
                {
                    "content": [
                        {
                            "type": "output_text",
                            "text": json.dumps(
                                content if content is not None else personalization()
                            ),
                        }
                    ]
                }
            ],
            "usage": {"input_tokens": 1000, "output_tokens": 300},
        }
    )

    def respond(request, timeout):
        calls.append(json.loads(request.data))
        assert timeout == 30
        return BytesIO(json.dumps(data).encode())

    monkeypatch.setattr("inner_world.exploration.urlopen", respond)
    app = create_app(
        Settings(
            _env_file=None,
            openai_api_key="synthetic-secret",
            openai_model="synthetic-model",
            adventure_max_output_tokens=1000,
        )
    )
    return TestClient(app), calls


def test_personalization_is_one_bounded_call_with_compact_context_and_actual_usage(monkeypatch):
    client, calls = client_with_response(monkeypatch)
    payload = request_payload()
    result = client.post("/api/v1/adventures/personalize", json=payload)
    assert result.status_code == 200
    assert result.json()["experience_id"] == payload["experience_id"]
    assert result.json()["usage"] == {"input_tokens": 1000, "output_tokens": 300}
    assert result.json()["personalization"] == personalization()
    assert len(calls) == 1
    assert calls[0]["max_output_tokens"] == 1000
    assert calls[0]["store"] is False
    context = json.loads(calls[0]["input"])
    assert set(context) == {"summary", "emotions", "template_id"}
    assert context["summary"] == payload["summary"]
    assert payload["experience_id"] not in calls[0]["input"]
    assert calls[0]["text"]["format"]["strict"] is True


@pytest.mark.parametrize(
    "change",
    [
        {"story": "PRIVATE_STORY"},
        {"summary": "x" * 501},
        {"emotions": []},
        {"emotions": ["fear", "fear"]},
        {"emotions": ["invalid"]},
        {"template_id": "arbitrary-template"},
    ],
)
def test_invalid_context_is_rejected_before_a_paid_call(monkeypatch, change):
    client, calls = client_with_response(monkeypatch)
    result = client.post("/api/v1/adventures/personalize", json={**request_payload(), **change})
    assert result.status_code == 422
    assert "PRIVATE_STORY" not in result.text
    assert not calls


@pytest.mark.parametrize(
    "content",
    [
        {**personalization(), "diagnosis": "unwanted"},
        {**personalization(), "title": "x" * 81},
        {**personalization(), "introduction": ""},
    ],
)
def test_invalid_personalization_never_triggers_automatic_repair(monkeypatch, content):
    client, calls = client_with_response(monkeypatch, content=content)
    result = client.post("/api/v1/adventures/personalize", json=request_payload())
    assert result.status_code == 502
    assert result.json()["error"]["code"] == "invalid_adventure"
    assert len(calls) == 1


@pytest.mark.parametrize(
    "envelope",
    [
        {"status": "incomplete", "output": []},
        {"status": "completed", "output": [{"content": [{"type": "refusal", "refusal": "No"}]}]},
        {
            "status": "completed",
            "output": [{"content": [{"type": "output_text", "text": "not JSON"}]}],
        },
        [],
    ],
)
def test_refusal_truncation_and_malformed_output_fail_without_a_second_call(monkeypatch, envelope):
    client, calls = client_with_response(monkeypatch, envelope=envelope)
    response = client.post("/api/v1/adventures/personalize", json=request_payload())
    assert response.status_code == 502
    assert len(calls) == 1


def test_adventure_and_exploration_share_the_local_budget(monkeypatch):
    client, calls = client_with_response(monkeypatch)
    client.app.state.budget.per_minute = 1
    assert client.post("/api/v1/adventures/personalize", json=request_payload()).status_code == 200
    response = client.post(
        "/api/v1/explorations/analyze",
        json={
            "experience_id": str(uuid4()),
            "story": {
                "id": str(uuid4()),
                "text": "Una experiencia ficticia para comprobar el límite.",
            },
            "answers": [],
        },
    )
    assert response.status_code == 429
    assert response.headers["retry-after"] == "60"
    assert len(calls) == 1


def test_missing_configuration_is_not_replaced_by_a_fake_adventure():
    client = TestClient(create_app(Settings(_env_file=None, openai_api_key="", openai_model="")))
    response = client.post("/api/v1/adventures/personalize", json=request_payload())
    assert response.status_code == 503


def test_timeout_does_not_trigger_a_repair_call(monkeypatch):
    calls = []

    def timeout(*args, **kwargs):
        calls.append(1)
        raise TimeoutError()

    monkeypatch.setattr("inner_world.exploration.urlopen", timeout)
    app = create_app(Settings(_env_file=None, openai_api_key="test", openai_model="test"))
    result = TestClient(app).post("/api/v1/adventures/personalize", json=request_payload())
    assert result.status_code == 504
    assert len(calls) == 1
