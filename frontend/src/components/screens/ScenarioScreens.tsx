import type { PracticeState } from '../../api/practice'
import { PracticeActions } from '../PracticeActions'
export function HospitalScreen({state}: {state:PracticeState}) { return <PracticeActions key={state.nodeId} state={state}/> }
export function BusScreen({state}: {state:PracticeState}) { return <>{state.nodeId==='B4' && <div className="demo-code" role="img" aria-label="无效演示图形，不能真实乘车"><span aria-hidden="true">▧ 模拟 ▧</span><p>无效演示图形</p></div>}<PracticeActions key={state.nodeId} state={state}/></> }
export function PaymentScreen({state}: {state:PracticeState}) { return <PracticeActions key={state.nodeId} state={state}/> }
