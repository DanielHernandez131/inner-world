from fastapi.testclient import TestClient

from inner_world.config import Settings
from inner_world.main import create_app


def client() -> TestClient:
    return TestClient(create_app(Settings(_env_file=None)))


def test_api_does_not_claim_ai_is_available():
    response = client().get("/api/v1/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "version": "0.1.0", "ai_enabled": False}


def test_catalog_exposes_all_eight_families_without_duplicates():
    response = client().get("/api/v1/emotions")
    assert response.status_code == 200
    items = response.json()
    assert len(items) == 8
    assert len({item["id"] for item in items}) == 8
    assert next(item for item in items if item["id"] == "disgust")["label"] == "Aversión"


def test_untrusted_origin_is_not_allowed_by_cors():
    response = client().get("/api/v1/health", headers={"Origin": "https://untrusted.example"})
    assert "access-control-allow-origin" not in response.headers


def test_local_origin_is_allowed_without_credentials():
    response = client().get("/api/v1/health", headers={"Origin": "http://localhost:5173"})
    assert response.headers["access-control-allow-origin"] == "http://localhost:5173"
    assert "access-control-allow-credentials" not in response.headers
