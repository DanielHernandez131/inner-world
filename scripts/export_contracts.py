"""Export reproducible public contracts from Python models, without starting a server."""

import json
from pathlib import Path

from inner_world.main import create_app
from inner_world.schemas import EmotionalAnalysis

ROOT = Path(__file__).resolve().parents[1]


def write_json(name: str, payload: dict) -> None:
    (ROOT / "contracts" / name).write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )


write_json("emotional-analysis.schema.json", EmotionalAnalysis.model_json_schema())
write_json("openapi.json", create_app().openapi())
