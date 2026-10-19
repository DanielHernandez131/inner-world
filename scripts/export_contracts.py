"""Export reproducible public contracts from Python models, without starting a server."""

import json
from pathlib import Path

from inner_world.main import create_app
from inner_world.schemas import (
    AdventureRequest,
    AdventureResponse,
    EmotionalAnalysis,
    ExplorationRequest,
    ExplorationResponse,
)

ROOT = Path(__file__).resolve().parents[1]


def write_json(name: str, payload: dict) -> None:
    (ROOT / "contracts" / name).write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )


write_json("emotional-analysis.schema.json", EmotionalAnalysis.model_json_schema())
write_json("openapi.json", create_app().openapi())

write_json("exploration-request.schema.json", ExplorationRequest.model_json_schema())
write_json("exploration-response.schema.json", ExplorationResponse.model_json_schema())

write_json("adventure-request.schema.json", AdventureRequest.model_json_schema())
write_json("adventure-response.schema.json", AdventureResponse.model_json_schema())
