from types import SimpleNamespace
import pytest
from backend.app.practice.catalog import demo_config
from backend.app.practice.lesson import build_lesson
from backend.app.practice.service import PracticeError


@pytest.mark.parametrize('scene,count',[('hospital',6),('bus',5),('payment',5)])
def test_lesson_follows_current_options_and_goal(scene,count):
 config=demo_config(scene)
 row=SimpleNamespace(scenario_id=scene,title=scene,version='2.1',demo_data=config)
 lesson=build_lesson(row)
 assert len(lesson.steps)==count
 assert lesson.goal==config['task']
 for step in lesson.steps:
  action=next(action for action in step.actions if action.id==step.actionId)
  if action.options:assert step.optionId in [option.id for option in action.options]
  assert step.instruction
 assert '演示' not in lesson.model_dump_json()


def test_lesson_uses_database_labels_and_amount():
 config=demo_config('payment');config['merchants'][0]['label']='小满书店';config['target']['amount_fen']=2345
 row=SimpleNamespace(scenario_id='payment',title='支付',version='custom',demo_data=config)
 lesson=build_lesson(row)
 assert '小满书店' in lesson.steps[1].instruction
 assert lesson.steps[3].exampleValue=='23.45'


def test_legacy_lesson_unavailable():
 with pytest.raises(PracticeError) as error:build_lesson(SimpleNamespace(demo_data={}))
 assert error.value.status==503
