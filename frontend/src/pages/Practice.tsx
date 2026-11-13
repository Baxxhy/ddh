import { useEffect } from 'react'
import { Link, useParams } from 'react-router'
import { TaroStatus } from '../components/TaroStatus'
import { usePractice } from '../components/PracticeProvider'
import { HospitalScreen, BusScreen, PaymentScreen } from '../components/screens/ScenarioScreens'
import { StepProgress, PracticeNavigation, ResultSummary, sceneNames } from '../components/PracticeChrome'
import { FeedbackMessage } from '../components/FeedbackMessage'
import { ActionButton } from '../components/ActionButton'
export function Practice() {
 const {id}=useParams()
 const {state,busy,error,expired,begin}=usePractice()
 useEffect(()=>{window.scrollTo(0,0);document.querySelector<HTMLElement>('h1')?.focus()},[state?.nodeId])
 if(!state||state.scenarioId!==id||expired)return <><h1 tabIndex={-1}>开始模拟练习</h1>{error&&<FeedbackMessage message={error}/>}<div className="practice-actions"><ActionButton variant="primary" disabled={busy} onClick={()=>void begin(id||'')}>重新开始本次练习</ActionButton><Link className="back-link" to="/">返回首页</Link></div><p>刷新页面后需重新开始。</p></>
 const Screen=state.scenarioId==='hospital'?HospitalScreen:state.scenarioId==='bus'?BusScreen:PaymentScreen
 return <section className="practice" aria-busy={busy}>
  <TaroStatus>模拟练习</TaroStatus>
  <div className="practice-heading"><p className="scene-name">{sceneNames[state.scenarioId]}</p><h1 tabIndex={-1}>{state.title}</h1></div>
  <StepProgress state={state}/>
  {!state.result&&<details className="practice-task" open><summary>本次任务</summary><p>{state.task}</p></details>}
  {(error||state.feedback)&&<FeedbackMessage message={error||state.feedback!.message}/>}
  {busy&&<p role="status" className="loading-message">正在处理，请稍等…</p>}
  {state.result?<ResultSummary state={state}/>:<Screen state={state}/>}
  <p className="simulation-notice">{state.simulationNotice}</p>
  <PracticeNavigation state={state}/>
 </section>
}
