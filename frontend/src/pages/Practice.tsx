import { TaroStatus } from '../components/TaroStatus'
import { useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { usePractice } from '../components/PracticeProvider'
import { HospitalScreen, BusScreen, PaymentScreen } from '../components/screens/ScenarioScreens'
export function Practice() {
 const {id}=useParams(), navigate=useNavigate()
 const {state,busy,error,expired,begin,send}=usePractice()
 useEffect(()=>{window.scrollTo(0,0);document.querySelector<HTMLElement>('h1')?.focus()},[state?.nodeId])
 if(!state||state.scenarioId!==id||expired)return <><h1>开始模拟练习</h1>{error&&<p role="alert">{error}</p>}<div className="practice-actions"><button disabled={busy} onClick={()=>void begin(id || '')}>重新开始本次练习</button><Link className="back-link" to="/">返回首页</Link></div><p>刷新页面后需重新开始。</p></>
 const Screen=state.scenarioId==='hospital'?HospitalScreen:state.scenarioId==='bus'?BusScreen:PaymentScreen
 return <section className="practice" aria-busy={busy}>
  <TaroStatus>{`模拟练习 · 第 ${state.step.current} / ${state.step.total} 步`}</TaroStatus>
  <h1 tabIndex={-1}>{state.title}</h1><p className="task">{state.task}</p>
  {Object.keys(state.selectedSummary).length>0&&<dl>{Object.entries(state.selectedSummary).map(([key,value])=><div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}</dl>}
  {(error||state.feedback)&&<p role="alert">{error||state.feedback?.message}</p>}
  {busy&&<p role="status">正在处理，请稍等…</p>}
  {state.result?<p role="status">{state.result.message}</p>:<Screen state={state}/>}
  <p className="simulation-notice">{state.simulationNotice}</p>
  <nav className="practice-actions" aria-label="练习操作">
   {state.canGoBack&&<button disabled={busy} onClick={()=>void send('back')}>返回上一步</button>}
   <button disabled={busy} onClick={()=>void send('restart')}>{state.isComplete?'再练一次':'重新开始'}</button>
   {error&&<button disabled={busy} onClick={()=>void send('state')}>读取当前页面</button>}
   <button disabled={busy} onClick={async()=>{if(await send('exit'))navigate('/')}}>{state.isComplete?'返回首页':'退出练习'}</button>
  </nav>
 </section>
}
