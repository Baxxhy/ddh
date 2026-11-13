from datetime import datetime, timedelta, timezone
from hashlib import sha256
import secrets
from sqlalchemy import select
from sqlalchemy.orm import Session
from backend.app.models import PracticeSession, ScenarioVersion, ScenarioCurrent
from backend.app.practice import engine
from backend.app.practice.schemas import PracticeState


def now() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


class PracticeError(Exception):
    def __init__(self, status: int, code: str, message: str, state: dict | None = None):
        self.status, self.code, self.message, self.state = status, code, message, state


def raw(row: PracticeSession) -> dict:
    return {'nodeId': row.node_id, 'selections': row.selections_json, 'returnStack': row.return_stack_json, 'result': row.result_json}


def config_for(db: Session, row: PracticeSession) -> dict:
    version = db.get(ScenarioVersion, (row.scenario_id, row.scenario_version))
    if version is None or version.demo_data.get('engineVersion') != 2:
        raise PracticeError(503, 'SCENARIO_UNAVAILABLE', '当前场景版本暂不可用，请退出后重新开始。')
    return version.demo_data


def view(row: PracticeSession, config: dict, feedback: str | None = None) -> dict:
    state = raw(row)
    total = {'hospital':7,'bus':6,'payment':6}[row.scenario_id]
    nodes = {'hospital':['H0','H1','H2','H3','H4','H5','H6'], 'bus':['B0','B1','B2','B3','B4','B6'], 'payment':['P0','P1','P2','P3','P4','P5']}[row.scenario_id]
    current = nodes.index(row.node_id)+1 if row.node_id in nodes else 1
    return PracticeState(
        scenarioId=row.scenario_id, scenarioVersion=row.scenario_version, **state,
        title=engine.TITLES[row.node_id], task=config['task'], step={'current':current,'total':total},
        selectedSummary=engine.summary(row.scenario_id,state,config), revision=row.revision,
        actions=engine.actions(row.scenario_id,state,config), feedback={'kind':'error','message':feedback} if feedback else None,
        canGoBack=bool(row.return_stack_json) and row.result_json is None, isComplete=row.result_json is not None,
        simulationNotice='模拟练习，不会产生真实预约、乘车记录或资金交易。',
    ).model_dump()


def create(db: Session, scenario: str) -> dict:
    current = db.get(ScenarioCurrent, scenario)
    version = db.get(ScenarioVersion, (scenario,current.version)) if current else None
    if version is None or not version.active: raise PracticeError(404, 'SCENARIO_NOT_FOUND', '场景不存在，请返回首页选择。')
    if version.demo_data.get('engineVersion') != 2: raise PracticeError(503, 'SCENARIO_UNAVAILABLE', '场景尚未准备好，请先初始化演示资料。')
    token = secrets.token_urlsafe(32)
    timestamp = now()
    state = engine.initial(scenario)
    row = PracticeSession(token_hash=sha256(token.encode()).hexdigest(), scenario_id=scenario, scenario_version=version.version,
        node_id=state['nodeId'], selections_json={}, return_stack_json=[], revision=0, result_json=None,
        created_at=timestamp, updated_at=timestamp, expires_at=timestamp+timedelta(hours=2), closed_at=None)
    db.add(row)
    db.flush()
    response = {'sessionToken':token, 'state':view(row, version.demo_data)}
    db.commit()
    return response


def operate(db: Session, token: str | None, operation: str, revision: int | None = None, action: str = '', value: str | None = None) -> dict:
    if not token or len(token) > 128: raise PracticeError(410, 'SESSION_EXPIRED', '本次练习已失效，请重新开始。')
    row = db.scalar(select(PracticeSession).where(PracticeSession.token_hash == sha256(token.encode()).hexdigest()).with_for_update())
    if row is None or row.closed_at is not None or row.expires_at <= now():
        raise PracticeError(410, 'SESSION_EXPIRED', '本次练习已结束或已过期，请重新开始。')
    config = config_for(db,row)
    if operation == 'state':
        result = view(row,config)
        db.commit()
        return result
    if revision != row.revision:
        raise PracticeError(409, 'REVISION_CONFLICT', '页面已更新，请查看当前内容后再操作。', view(row,config))
    if operation == 'exit':
        row.closed_at = now()
        row.revision += 1
        db.commit()
        return {'closed':True}
    try:
        state = engine.initial(row.scenario_id) if operation == 'restart' else engine.back(raw(row)) if operation == 'back' else engine.transition(row.scenario_id,raw(row),config,action,value)
    except engine.RuleError as error:
        raise PracticeError(422, 'INVALID_ACTION', str(error), view(row,config,str(error))) from error
    row.node_id, row.selections_json = state['nodeId'], state['selections']
    row.return_stack_json, row.result_json = state['returnStack'], state['result']
    row.revision += 1
    row.updated_at = now()
    row.expires_at = row.updated_at + timedelta(hours=2)
    result = view(row,config)
    db.commit()
    return result
