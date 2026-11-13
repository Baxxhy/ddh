from fastapi import APIRouter, Depends, Header
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.practice import service
from backend.app.practice.schemas import CreateRequest, RevisionRequest, ActionRequest, Created, PracticeState
router = APIRouter(prefix='/api/v1/practice', tags=['模拟练习'])


@router.post('/sessions', response_model=Created)
def create_session(body: CreateRequest, db: Session = Depends(get_db)):
    return service.create(db, body.scenarioId)


@router.get('/state', response_model=PracticeState)
def get_state(x_practice_session: str | None = Header(default=None), db: Session = Depends(get_db)):
    return service.operate(db, x_practice_session, 'state')


@router.post('/actions', response_model=PracticeState)
def action(body: ActionRequest, x_practice_session: str | None = Header(default=None), db: Session = Depends(get_db)):
    return service.operate(db, x_practice_session, 'action', body.revision, body.actionId, body.value)


@router.post('/back', response_model=PracticeState)
def back(body: RevisionRequest, x_practice_session: str | None = Header(default=None), db: Session = Depends(get_db)):
    return service.operate(db, x_practice_session, 'back', body.revision)


@router.post('/restart', response_model=PracticeState)
def restart(body: RevisionRequest, x_practice_session: str | None = Header(default=None), db: Session = Depends(get_db)):
    return service.operate(db, x_practice_session, 'restart', body.revision)


@router.post('/exit')
def exit_session(body: RevisionRequest, x_practice_session: str | None = Header(default=None), db: Session = Depends(get_db)):
    return service.operate(db, x_practice_session, 'exit', body.revision)
