from sqlalchemy.orm import Session

from backend.app.database import get_engine
from backend.app.fixtures import SCENARIOS
from backend.app.models import Base, ScenarioVersion


def seed_scenarios(session: Session) -> int:
    added = 0
    for item in SCENARIOS:
        key = (item.scenario_id, item.version)
        if session.get(ScenarioVersion, key) is not None:
            continue
        session.add(
            ScenarioVersion(
                scenario_id=item.scenario_id,
                version=item.version,
                title=item.title,
                summary=item.summary,
                demo_data=item.demo_data,
                sort_order=item.sort_order,
                active=True,
            )
        )
        added += 1
    session.commit()
    return added


def main() -> None:
    engine = get_engine()
    Base.metadata.create_all(engine)
    with Session(engine) as session:
        count = seed_scenarios(session)
    print(f"场景初始化完成，新增 {count} 条演示场景。")


if __name__ == "__main__":
    main()
