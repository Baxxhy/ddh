"""Run periodically with cron: python -m backend.app.practice.cleanup."""
from sqlalchemy import delete, or_, select
from sqlalchemy.orm import Session
from backend.app.database import get_engine
from backend.app.models import PracticeSession
from backend.app.practice.service import now


def cleanup(db: Session, limit: int = 500) -> int:
    ids = list(db.scalars(select(PracticeSession.id).where(or_(PracticeSession.expires_at <= now(), PracticeSession.closed_at.is_not(None))).limit(limit)))
    if ids: db.execute(delete(PracticeSession).where(PracticeSession.id.in_(ids)))
    db.commit()
    return len(ids)


if __name__ == '__main__':
    with Session(get_engine()) as db:
        print(f'已清理 {cleanup(db)} 条失效临时会话。')
