import { useNavigate } from 'react-router'
import { RotateCcw, LogOut, CheckCircle2, type LucideIcon } from 'lucide-react'
import type { PracticeState } from '../api/practice'
import { usePractice } from './PracticeProvider'
import { ActionButton } from './ActionButton'
import type { ReactNode } from 'react'

export const sceneNames: Record<string,string>={hospital:'医院挂号',bus:'公交乘车码',payment:'扫码支付'}
export function StepProgress({state}: {state:PracticeState}) {
 const branch=['HX','BX','BM','PX'].includes(state.nodeId)
 return <div className="step-progress">{branch?<p>探索页面 · 可返回继续练习</p>:<><p>第 {state.step.current} / {state.step.total} 步</p><progress aria-label="练习进度" value={state.step.current} max={state.step.total}/></>}</div>
}
export function SimulationPanel({name,icon:Icon,tone,children}: {name:string;icon:LucideIcon;tone:string;children:ReactNode}) {
 return <div className={`simulation-panel ${tone}`}><span className="sr-only"><Icon aria-hidden="true"/>{name}</span><div className="simulation-content">{children}</div></div>
}
const edits:Record<string,string>={'医院':'edit_hospital','科室':'edit_department','门诊':'edit_doctor','就诊时间':'edit_slot','收款方':'edit_merchant','模拟金额':'edit_amount'}
export function SelectedSummary({state,fields,editable=false}: {state:PracticeState;fields?:string[];editable?:boolean}) {
 const {send,busy}=usePractice()
 const entries=Object.entries(state.selectedSummary).filter(([key])=>!fields||fields.includes(key))
 if(!entries.length)return null
 return <dl className="selected-summary">{entries.map(([key,value])=>{
  const action=editable?state.actions.find(action=>action.id===edits[key]):undefined
  return <div key={key} className={action?'review-editable':''}><dt>{key}</dt><dd>{value}</dd>{action&&<ActionButton disabled={busy} onClick={()=>void send('actions',action.id)}>{action.label}</ActionButton>}</div>
 })}</dl>
}
export function PracticeNavigation({state}: {state:PracticeState}) {
 const {send,busy,error}=usePractice(),navigate=useNavigate()
 return <nav className="practice-navigation" aria-label="练习操作">
  {error&&<ActionButton disabled={busy} onClick={()=>void send('state')}>读取当前页面</ActionButton>}
  <div className="secondary-navigation"><ActionButton variant={state.result?'primary':''} disabled={busy} onClick={()=>void send('restart')}><span className="button-content"><RotateCcw size={20} aria-hidden="true"/>{state.result?'再练一次':'重新开始'}</span></ActionButton><ActionButton disabled={busy} onClick={async()=>{if(await send('exit'))navigate('/')}}><span className="button-content"><LogOut size={20} aria-hidden="true"/>{state.result?'返回首页':'退出练习'}</span></ActionButton></div>
 </nav>
}
export function ResultSummary({state}: {state:PracticeState}) {
 if(!state.result)return null
 return <section className={`result-summary ${state.scenarioId}`} aria-label="本次模拟结果"><div className="result-icon"><CheckCircle2 size={40} aria-hidden="true"/></div><h2>{sceneNames[state.scenarioId]}练习已完成</h2>{state.scenarioId==='payment'&&<p className="result-amount">{state.selectedSummary['模拟金额']}</p>}<p role="status">{state.result.message}</p>{state.scenarioId==='bus'?<div className="task-box"><p>已找到公交乘车码，并完成对准虚拟扫码器的操作。</p></div>:<SelectedSummary state={state}/>}</section>
}
