"""Synthetic stories only. Exercise domain guarantees and provider failure boundaries."""

import json
from copy import deepcopy
from io import BytesIO
from urllib.error import HTTPError
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient

from inner_world.config import Settings
from inner_world.exploration import (
    ExplorationError,
    OpenAIProvider,
    RequestBudget,
    analyze,
    validate_turn,
)
from inner_world.main import create_app
from inner_world.schemas import ExplorationRequest, ExplorationTurn


def payload():
    return ExplorationRequest.model_validate(
        {
            "experience_id": str(uuid4()),
            "story": {
                "id": str(uuid4()),
                "text": "Mañana presento un proyecto y temo quedarme en blanco.",
            },
            "answers": [],
        }
    )


def complete(request):
    return ExplorationTurn.model_validate(
        {
            "result": {
                "status": "complete",
                "analysis": {
                    "schema_version": 1,
                    "summary": "Podría haber miedo ante la presentación.",
                    "emotions": [
                        {
                            "emotion": "fear",
                            "intensity": 6,
                            "explanation": "Lo expresa el relato.",
                            "evidence": [
                                {
                                    "source_message_id": str(request.story.id),
                                    "quote": "temo quedarme en blanco",
                                }
                            ],
                        }
                    ],
                    "characters": [],
                    "fragments": [
                        {
                            "kind": "thought",
                            "provenance": "user_quote",
                            "text": "temo quedarme en blanco",
                            "source_message_ids": [str(request.story.id)],
                            "related_emotions": ["fear"],
                        }
                    ],
                },
            }
        }
    )


def question():
    return ExplorationTurn.model_validate(
        {
            "result": {
                "status": "clarification",
                "question": {
                    "id": str(uuid4()),
                    "text": "¿Qué pesa más en este momento?",
                    "options": ["La incertidumbre", "Cómo reaccionará el público", "No lo sé aún"],
                },
            }
        }
    )


class StubProvider:
    def __init__(self, turn):
        self.turn, self.calls = turn, []

    def generate(self, request, repair=False):
        self.calls.append(repair)
        return deepcopy(self.turn)


@pytest.mark.parametrize("tamper", ["quote", "source", "fragment_quote", "fragment_source"])
def test_invented_evidence_and_fragment_sources_are_rejected(tamper):
    request = payload()
    turn = complete(request)
    analysis = turn.result.analysis
    if tamper == "quote":
        analysis.emotions[0].evidence[0].quote = "Una cita inexistente"
    elif tamper == "source":
        analysis.emotions[0].evidence[0].source_message_id = uuid4()
    elif tamper == "fragment_quote":
        analysis.fragments[0].text = "No he dicho esto"
    else:
        analysis.fragments[0].source_message_ids = [uuid4()]
    provider = StubProvider(turn)
    with pytest.raises(ExplorationError) as error:
        analyze(request, provider)
    assert error.value.status == 502
    assert provider.calls == [False, True]


def test_answers_can_support_analysis_but_question_text_cannot():
    request = payload()
    q = question().result.question
    q.text = "¿Te inquieta quedarte en blanco?"
    request = ExplorationRequest.model_validate(
        {
            **request.model_dump(),
            "answers": [
                {
                    "question": q.model_dump(),
                    "message": {"id": uuid4(), "text": "temo quedarme en blanco"},
                }
            ],
        }
    )
    turn = complete(request)
    turn.result.analysis.emotions[0].evidence[0].source_message_id = request.answers[0].message.id
    validate_turn(request, turn)
    turn.result.analysis.emotions[0].evidence[0].source_message_id = q.id
    with pytest.raises(ValueError):
        validate_turn(request, turn)


@pytest.mark.parametrize("finish_now,answer_count", [(True, 0), (False, 2)])
def test_question_limit_is_enforced_even_when_model_ignores_it(finish_now, answer_count):
    request = payload()
    request = ExplorationRequest.model_validate(
        {
            **request.model_dump(),
            "finish_now": finish_now,
            "answers": [
                {
                    "question": question().result.question.model_dump(),
                    "message": {"id": uuid4(), "text": "No lo sé"},
                }
                for _ in range(answer_count)
            ],
        }
    )
    with pytest.raises(ExplorationError):
        analyze(request, StubProvider(question()))


def test_complete_and_insufficient_context_are_allowed_without_questions():
    request = payload()
    request.finish_now = True
    assert analyze(request, StubProvider(complete(request))).result.status == "complete"
    turn = ExplorationTurn.model_validate(
        {"result": {"status": "insufficient_context", "explanation": "Necesito más contexto."}}
    )
    assert analyze(request, StubProvider(turn)).result.status == "insufficient_context"


def test_endpoint_is_stateless_and_does_not_echo_sensitive_validation_input():
    app = create_app(Settings(_env_file=None))
    request = payload()
    app.state.provider = StubProvider(complete(request))
    client = TestClient(app)
    result = client.post("/api/v1/explorations/analyze", json=request.model_dump(mode="json"))
    assert result.status_code == 200
    assert result.json()["result"]["status"] == "complete"
    invalid = request.model_dump(mode="json")
    invalid["private_text"] = "DO_NOT_REFLECT"
    response = client.post("/api/v1/explorations/analyze", json=invalid)
    assert response.status_code == 422
    assert "DO_NOT_REFLECT" not in response.text
    assert request.story.text not in response.text


def test_missing_provider_returns_503_without_fabrication():
    client = TestClient(create_app(Settings(_env_file=None, openai_api_key="", openai_model="")))
    response = client.post("/api/v1/explorations/analyze", json=payload().model_dump(mode="json"))
    assert response.status_code == 503
    assert response.json()["error"]["code"] == "provider_not_configured"


@pytest.mark.parametrize(
    "error,status",
    [
        (TimeoutError(), 504),
        (HTTPError("url", 429, "limit", {}, None), 429),
        (HTTPError("url", 401, "secret", {}, None), 502),
    ],
)
def test_provider_errors_are_sanitized(monkeypatch, error, status):
    def fail(*args, **kwargs):
        raise error

    monkeypatch.setattr("inner_world.exploration.urlopen", fail)
    provider = OpenAIProvider(
        Settings(_env_file=None, openai_api_key="test-secret", openai_model="test-model")
    )
    with pytest.raises(ExplorationError) as result:
        analyze(payload(), provider)
    assert result.value.status == status
    assert "test-secret" not in result.value.message


def test_real_adapter_serializes_structured_output_and_disables_response_storage(monkeypatch):
    request = payload()
    turn = complete(request)

    def respond(http_request, timeout):
        body = json.loads(http_request.data)
        assert body["store"] is False
        assert body["text"]["format"]["strict"] is True
        assert body["text"]["format"]["schema"]["additionalProperties"] is False
        assert timeout == 30
        return BytesIO(
            json.dumps(
                {
                    "status": "completed",
                    "output": [
                        {
                            "content": [
                                {
                                    "type": "output_text",
                                    "text": turn.model_dump_json(),
                                }
                            ]
                        }
                    ],
                }
            ).encode()
        )

    monkeypatch.setattr("inner_world.exploration.urlopen", respond)
    provider = OpenAIProvider(
        Settings(_env_file=None, openai_api_key="test-secret", openai_model="test-model")
    )
    assert analyze(request, provider).result.status == "complete"


def test_non_json_response_has_only_one_repair(monkeypatch):
    calls = []

    def respond(*args, **kwargs):
        calls.append(1)
        return BytesIO(b"not JSON")

    monkeypatch.setattr("inner_world.exploration.urlopen", respond)
    provider = OpenAIProvider(
        Settings(_env_file=None, openai_api_key="test-secret", openai_model="test-model")
    )
    with pytest.raises(ExplorationError) as result:
        analyze(payload(), provider)
    assert result.value.status == 502
    assert len(calls) == 2


def test_local_budget_is_bounded():
    budget = RequestBudget(1, 2)
    budget.consume()
    with pytest.raises(ExplorationError) as result:
        budget.consume()
    assert result.value.status == 429
