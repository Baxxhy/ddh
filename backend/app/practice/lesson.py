"""Read-only teaching previews derived from the same versioned scenario rules."""
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models import ScenarioCurrent, ScenarioVersion
from backend.app.practice import engine
from backend.app.practice.schemas import Action
from backend.app.practice.service import PracticeError


class LessonStep(BaseModel):
    title: str
    instruction: str
    actions: list[Action]
    actionId: str
    optionId: str | None
    exampleValue: str | None
    selectedSummary: dict[str,str]


class Lesson(BaseModel):
    scenarioId: str
    title: str
    version: str
    goal: str
    steps: list[LessonStep]


def build_lesson(row: ScenarioVersion) -> Lesson:
    config = row.demo_data
    if config.get('engineVersion') != 2:
        raise PracticeError(503, 'LESSON_UNAVAILABLE', '教学内容暂时无法打开，请稍后重试。')
    target = config.get('target', {})
    paths = {
        'hospital': [('open_registration', None), *[('select_'+key,target.get(key)) for key in ['hospital','department','doctor','slot']], ('confirm_registration',None)],
        'bus': [(action,None) for action in ['open_travel','open_transport','choose_bus','open_bus_code','align_and_scan']],
        'payment': [('open_scan',None),('scan_demo_code',target.get('merchant')),('continue_to_amount',None),('set_amount', f"{target.get('amount_fen',0)//100}.{target.get('amount_fen',0)%100:02d}"),('confirm_payment',None)],
    }
    reasons = {
        'open_registration':'先找到预约挂号入口。', 'select_hospital':'医院名称要与本次任务一致。',
        'select_department':'根据需要选择科室。', 'select_doctor':'接着选择门诊。', 'select_slot':'看清日期和时间后再选择。',
        'confirm_registration':'最后核对医院、科室、门诊和时间，再确认预约。',
        'open_travel':'先从生活服务中找到出行。','open_transport':'进入交通服务。','choose_bus':'乘公交要选择公交入口。',
        'open_bus_code':'找到公交乘车码。','align_and_scan':'将乘车码对准扫码器后再扫码。',
        'open_scan':'先打开扫一扫。','scan_demo_code':'选择收款方的收款码。','continue_to_amount':'看清商户名称，确认收款方。',
        'set_amount':'输入金额，小数点后最多两位。','confirm_payment':'确认商户和金额都正确，再付款。',
    }
    state=engine.initial(row.scenario_id)
    steps=[]
    for action_id,value in paths[row.scenario_id]:
        available=engine.actions(row.scenario_id,state,config)
        action=next(action for action in available if action['id']==action_id)
        label=next((option['label'] for option in action['options'] if option['id']==value),action['label'])
        instruction=reasons[action_id] + (f' 本次选择“{label}”。' if action['options'] else f' 本次填写 {value} 元。' if action['input'] else '')
        steps.append(LessonStep(title=engine.TITLES[state['nodeId']],instruction=instruction,actions=available,actionId=action_id,optionId=value if action['options'] else None,exampleValue=value if action['input'] else None,selectedSummary=engine.summary(row.scenario_id,state,config)))
        state=engine.transition(row.scenario_id,state,config,action_id,value)
    return Lesson(scenarioId=row.scenario_id,title=row.title,version=row.version,goal=config['task'],steps=steps)


router=APIRouter(prefix='/api/v1/scenarios',tags=['操作教学'])


@router.get('/{scenario_id}/lesson',response_model=Lesson)
def get_lesson(scenario_id:str, db:Session=Depends(get_db)) -> Lesson:
    current=db.get(ScenarioCurrent,scenario_id)
    row=db.get(ScenarioVersion,(scenario_id,current.version)) if current else None
    if row is None or not row.active:
        raise PracticeError(404,'SCENARIO_NOT_FOUND','没有找到这个场景，请返回首页选择。')
    return build_lesson(row)
