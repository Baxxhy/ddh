from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from backend.app.config import get_settings
from backend.app.database import get_db
from backend.app.models import ScenarioVersion


class ScenarioSummary(BaseModel):
    id: str
    title: str
    summary: str
    version: str


app = FastAPI(title="点点会 API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=get_settings().allowed_origins,
    allow_methods=["GET"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/v1/scenarios", response_model=list[ScenarioSummary])
def list_scenarios(db: Session = Depends(get_db)) -> list[ScenarioSummary]:
    try:
        rows = db.scalars(
            select(ScenarioVersion)
            .where(ScenarioVersion.active.is_(True))
            .order_by(ScenarioVersion.sort_order)
        ).all()
    except SQLAlchemyError as exc:
        raise HTTPException(status_code=503, detail="场景暂时无法加载，请稍后重试。") from exc
    return [
        ScenarioSummary(id=row.scenario_id, title=row.title, summary=row.summary, version=row.version)
        for row in rows
    ]
