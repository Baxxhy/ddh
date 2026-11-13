"""Opt-in real MySQL tests. Uses the separate ddh_phase1_verify database."""
import os
from concurrent.futures import ThreadPoolExecutor
from datetime import timedelta
from hashlib import sha256
import pytest
from alembic import command
from alembic.config import Config
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, select, delete
from sqlalchemy.orm import Session
from backend.app.config import get_settings
from backend.app.database import get_db, get_engine
from backend.app.main import app
from backend.app.models import PracticeSession, ScenarioVersion, ScenarioCurrent
from backend.app.practice import service
from backend.app.seed import seed_scenarios, seed_practice
from test_engine import PATHS

pytestmark = pytest.mark.skipif(os.getenv('DDH_MYSQL_TEST') != '1', reason='Set DDH_MYSQL_TEST=1 for the dedicated MySQL test database')


@pytest.fixture(scope='module')
def mysql():
 settings=get_settings(); original=settings.database_url
 url=get_engine().url.set(database='ddh_phase1_verify')
 settings.database_url=url.render_as_string(hide_password=False)
 try: command.upgrade(Config('backend/alembic.ini'),'head')
 finally: settings.database_url=original
 engine=create_engine(url,pool_pre_ping=True)
 with Session(engine) as db: seed_scenarios(db);seed_practice(db)
 yield engine
 engine.dispose()


@pytest.fixture
def client(mysql):
 def db():
  with Session(mysql) as session: yield session
 app.dependency_overrides[get_db]=db
 with TestClient(app) as client: yield client
 app.dependency_overrides.clear()


def create(client, scene):
 response=client.post('/api/v1/practice/sessions',json={'scenarioId':scene})
 assert response.status_code==200,response.text
 result=response.json()
 return {'X-Practice-Session':result['sessionToken']},result['state']


def move(client,headers,state,action,value=None,expected=200):
 response=client.post('/api/v1/practice/actions',headers=headers,json={'revision':state['revision'],'actionId':action,'value':value})
 assert response.status_code==expected,response.text
 return response.json() if expected==200 else response.json()['state']


@pytest.mark.parametrize('scene',PATHS)
def test_real_mysql_paths_and_closed_sessions(client,mysql,scene):
 headers,state=create(client,scene)
 for action,value in PATHS[scene]:state=move(client,headers,state,action,value)
 assert state['isComplete'] and state['result']
 state=move(client,headers,state,PATHS[scene][-1][0],expected=422)
 with Session(mysql) as db:
  row=db.scalar(select(PracticeSession).where(PracticeSession.token_hash==sha256(headers['X-Practice-Session'].encode()).hexdigest()))
  assert row and row.result_json and row.scenario_version=='2.0'
 revision=state['revision']
 response=client.post('/api/v1/practice/restart',headers=headers,json={'revision':revision})
 assert response.status_code==200
 state=response.json();assert state['selections']=={} and not state['result']
 assert client.post('/api/v1/practice/back',headers=headers,json={'revision':revision}).status_code==409
 assert client.post('/api/v1/practice/exit',headers=headers,json={'revision':state['revision']}).json()=={'closed':True}
 assert client.get('/api/v1/practice/state',headers=headers).status_code==410


def test_invalid_revision_expiry_and_cleanup(client,mysql):
 headers,state=create(client,'payment')
 assert client.get('/api/v1/practice/state',headers={'X-Practice-Session':'wrong'}).status_code==410
 assert client.get('/api/v1/practice/state').status_code==410
 move(client,headers,state,'confirm_payment',expected=422)
 state=move(client,headers,state,'open_scan')
 move(client,headers,state,'scan_demo_code','forged',422)
 state=move(client,headers,state,'scan_demo_code','a')
 state=move(client,headers,state,'continue_to_amount')
 for invalid in ['', 'NaN','0','-1','1.999','999999.99']:
  after=move(client,headers,state,'set_amount',invalid,422)
  assert after['revision']==state['revision'] and after['selections']==state['selections']
 with Session(mysql) as db:
  row=db.scalar(select(PracticeSession).where(PracticeSession.token_hash==sha256(headers['X-Practice-Session'].encode()).hexdigest()))
  row.expires_at=service.now()-timedelta(seconds=1);db.commit()
 assert client.get('/api/v1/practice/state',headers=headers).status_code==410
 from backend.app.practice.cleanup import cleanup
 with Session(mysql) as db: assert cleanup(db)>0


@pytest.mark.parametrize('operations',[('action','action'),('back','action'),('restart','action')])
def test_concurrent_revision_is_atomic(mysql,operations):
 with Session(mysql) as db:created=service.create(db,'hospital')
 token=created['sessionToken']
 with Session(mysql) as db:state=service.operate(db,token,'action',0,'open_registration')
 def request(operation):
  with Session(mysql) as db:
   try:return service.operate(db,token,operation,state['revision'],'select_hospital','a')['revision']
   except service.PracticeError as error:return error.status
 with ThreadPoolExecutor(max_workers=2) as executor: results=list(executor.map(request,operations))
 assert sorted(results)==[2,409]


def test_concurrent_confirmation_single_result(client,mysql):
 headers,state=create(client,'payment')
 for action,value in PATHS['payment'][:-1]:state=move(client,headers,state,action,value)
 def confirm(_):
  with Session(mysql) as db:
   try:return service.operate(db,headers['X-Practice-Session'],'action',state['revision'],'confirm_payment')['revision']
   except service.PracticeError as error:return error.status
 with ThreadPoolExecutor(max_workers=2) as executor:results=list(executor.map(confirm,range(2)))
 assert sorted(results)==[5,409]


def test_explicit_current_and_pinned_history(client,mysql):
 headers,state=create(client,'hospital')
 with Session(mysql) as db:
  original=db.get(ScenarioVersion,('hospital','2.0'))
  for version in ['2.9','2.10']:
   if not db.get(ScenarioVersion,('hospital',version)):
    db.add(ScenarioVersion(scenario_id='hospital',version=version,title=original.title,summary=original.summary,goal=original.goal,simulation_notice=original.simulation_notice,demo_data=original.demo_data,sort_order=1,active=True))
  db.get(ScenarioCurrent,'hospital').version='2.10';db.commit()
 try:
  rows=client.get('/api/v1/scenarios').json()
  assert len(rows)==3 and next(x for x in rows if x['id']=='hospital')['version']=='2.10'
  assert client.get('/api/v1/scenarios/hospital').json()['version']=='2.10'
  assert client.get('/api/v1/practice/state',headers=headers).json()['scenarioVersion']=='2.0'
 finally:
  with Session(mysql) as db:db.get(ScenarioCurrent,'hospital').version='2.0';db.commit()


def test_invalid_contract_and_foreign_options(client):
 assert client.post('/api/v1/practice/sessions',json={'scenarioId':'unknown'}).status_code==404
 headers,state=create(client,'hospital')
 assert client.post('/api/v1/practice/actions',headers=headers,json={'revision':-1,'actionId':'open_registration'}).status_code==422
 state=move(client,headers,state,'open_registration')
 state=move(client,headers,state,'select_hospital','a')
 move(client,headers,state,'select_department','b-internal',422)
 state=move(client,headers,state,'select_department','a-internal')
 move(client,headers,state,'select_doctor','a-surgery-general',422)
 state=move(client,headers,state,'select_doctor','a-internal-general')
 move(client,headers,state,'select_slot','a-internal-special-am',422)
 assert client.get('/api/v1/practice/state',headers=headers).json()['revision']==state['revision']
