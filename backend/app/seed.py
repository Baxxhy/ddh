from sqlalchemy.orm import Session

from backend.app.database import get_engine
from backend.app.fixtures import SCENARIOS
from backend.app.models import ScenarioVersion, ScenarioCurrent


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
                goal=item.goal,
                simulation_notice=item.simulation_notice,
                demo_data=item.demo_data,
                sort_order=item.sort_order,
                active=True,
            )
        )
        added += 1
    session.flush()
    for item in SCENARIOS:
        if session.get(ScenarioCurrent, item.scenario_id) is None:
            session.add(ScenarioCurrent(scenario_id=item.scenario_id, version=item.version))
    session.commit()
    return added


PRACTICE_VERSION = '2.1'


def seed_practice(session: Session) -> int:
    from backend.app.practice.catalog import demo_config
    added = 0
    for item in SCENARIOS:
        if session.get(ScenarioVersion, (item.scenario_id, PRACTICE_VERSION)) is not None:
            continue
        config = demo_config(item.scenario_id)
        session.add(ScenarioVersion(scenario_id=item.scenario_id, version=PRACTICE_VERSION, title=item.title, summary=item.summary, goal=config['task'], simulation_notice=item.simulation_notice, demo_data=config, sort_order=item.sort_order, active=True))
        session.flush()
        current = session.get(ScenarioCurrent, item.scenario_id)
        if current is None: session.add(ScenarioCurrent(scenario_id=item.scenario_id, version=PRACTICE_VERSION))
        elif current.version in {'1.0','2.0'}: current.version = PRACTICE_VERSION
        added += 1
    session.commit()
    return added


def main() -> None:
    with Session(get_engine()) as session:
        count = seed_scenarios(session) + seed_practice(session)
    print(f"场景初始化完成，新增 {count} 条演示场景。")


if __name__ == "__main__":
    main()
