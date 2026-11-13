from collections.abc import Iterator

from fastapi.testclient import TestClient
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool

from backend.app.database import get_db
from backend.app.main import app
from backend.app.models import Base, ScenarioVersion
from backend.app.seed import seed_scenarios


def make_session() -> Iterator[Session]:
    engine = create_engine(
        "sqlite+pysqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    try:
        with Session(engine) as session:
            yield session
    finally:
        engine.dispose()


def test_seed_is_idempotent_and_list_comes_from_database() -> None:
    generator = make_session()
    try:
        session = next(generator)
        assert seed_scenarios(session) == 3
        assert seed_scenarios(session) == 0
        assert len(session.scalars(select(ScenarioVersion)).all()) == 3

        def override_db() -> Iterator[Session]:
            yield session

        app.dependency_overrides[get_db] = override_db
        with TestClient(app) as client:
            response = client.get("/api/v1/scenarios")
        assert response.status_code == 200
        assert [item["id"] for item in response.json()] == ["hospital", "bus", "payment"]
        assert response.json()[0]["title"] == "医院挂号"
    finally:
        app.dependency_overrides.clear()
        generator.close()


def test_empty_database_returns_empty_list() -> None:
    generator = make_session()
    try:
        session = next(generator)

        def override_db() -> Iterator[Session]:
            yield session

        app.dependency_overrides[get_db] = override_db
        with TestClient(app) as client:
            response = client.get("/api/v1/scenarios")
        assert response.status_code == 200
        assert response.json() == []
    finally:
        app.dependency_overrides.clear()
        generator.close()


def test_health_detail_missing_and_database_values() -> None:
    generator = make_session()
    try:
        session = next(generator)
        seed_scenarios(session)
        row = session.get(ScenarioVersion, ('hospital', '1.0'))
        assert row is not None
        row.goal = '数据库中修改后的练习目标'
        session.commit()
        def override_db() -> Iterator[Session]:
            yield session
        app.dependency_overrides[get_db] = override_db
        with TestClient(app) as client:
            assert client.get('/api/v1/health').json() == {'status': 'ok'}
            for scene_id in ['hospital', 'bus', 'payment']:
                result = client.get(f'/api/v1/scenarios/{scene_id}')
                assert result.status_code == 200
                assert result.json()['simulation_notice']
            assert client.get('/api/v1/scenarios/hospital').json()['goal'] == row.goal
            assert client.get('/api/v1/scenarios/missing').status_code == 404
    finally:
        app.dependency_overrides.clear()
        generator.close()
