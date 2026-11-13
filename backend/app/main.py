from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from backend.app.config import get_settings
from backend.app.database import get_db
from backend.app.models import ScenarioVersion, ScenarioCurrent


from backend.app.schemas import ScenarioSummary, ScenarioDetail


app = FastAPI(title="点点会 API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=get_settings().allowed_origins,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


@app.get("/api/v1/health")
@app.get("/api/health", include_in_schema=False)
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/v1/scenarios", response_model=list[ScenarioSummary])
def list_scenarios(db: Session = Depends(get_db)) -> list[ScenarioSummary]:
    try:
        rows = db.scalars(
            select(ScenarioVersion)
            .join(ScenarioCurrent, (ScenarioCurrent.scenario_id == ScenarioVersion.scenario_id) & (ScenarioCurrent.version == ScenarioVersion.version))
            .where(ScenarioVersion.active.is_(True))
            .order_by(ScenarioVersion.sort_order)
        ).all()
    except SQLAlchemyError as exc:
        raise HTTPException(status_code=503, detail="场景暂时无法加载，请稍后重试。") from exc
    return [
        ScenarioSummary(id=row.scenario_id, title=row.title, summary=row.summary, goal=row.goal, version=row.version)
        for row in rows
    ]


@app.get("/api/v1/scenarios/{scenario_id}", response_model=ScenarioDetail)
def scenario_detail(scenario_id: str, db: Session = Depends(get_db)) -> ScenarioDetail:
    try:
        row = db.scalar(select(ScenarioVersion).join(ScenarioCurrent, (ScenarioCurrent.scenario_id == ScenarioVersion.scenario_id) & (ScenarioCurrent.version == ScenarioVersion.version)).where(
            ScenarioVersion.scenario_id == scenario_id,
            ScenarioVersion.active.is_(True),
        ))
    except SQLAlchemyError as exc:
        raise HTTPException(status_code=503, detail="场景暂时无法加载，请稍后重试。") from exc
    if row is None:
        raise HTTPException(status_code=404, detail="没有找到这个场景，请返回首页选择。")
    return ScenarioDetail(id=row.scenario_id, title=row.title, summary=row.summary,
                          goal=row.goal, version=row.version, simulation_notice=row.simulation_notice)


from fastapi import Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from backend.app.practice.api import router as practice_router
from backend.app.practice.service import PracticeError

app.include_router(practice_router)


@app.exception_handler(PracticeError)
def practice_error(request: Request, error: PracticeError):
    return JSONResponse(status_code=error.status, content={'code':error.code,'message':error.message,'state':error.state})


@app.exception_handler(SQLAlchemyError)
def database_error(request: Request, error: SQLAlchemyError):
    return JSONResponse(status_code=503, content={'code':'SERVICE_UNAVAILABLE','message':'服务暂时无法连接，请稍后重试。','state':None})


@app.exception_handler(RequestValidationError)
def validation_error(request: Request, error: RequestValidationError):
    return JSONResponse(status_code=422, content={'code':'INVALID_INPUT','message':'提交内容格式不正确，请检查输入后重试。','state':None})
