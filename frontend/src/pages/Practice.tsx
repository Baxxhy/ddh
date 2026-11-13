import { useEffect } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link, useParams } from 'react-router'
import { TaroStatus } from '../components/TaroStatus'
import { usePractice } from '../components/PracticeProvider'
import { HospitalScreen, BusScreen, PaymentScreen } from '../components/screens/ScenarioScreens'
import { StepProgress, PracticeNavigation, ResultSummary } from '../components/PracticeChrome'
import { FeedbackMessage } from '../components/FeedbackMessage'
import { ActionButton } from '../components/ActionButton'
export function Practice() {
 const {id}=useParams()
 const {state,busy,error,expired,begin,send}=usePractice()
 useEffect(()=>{window.scrollTo(0,0);document.querySelector<HTMLElement>('h1')?.focus()},[state?.nodeId])
 if(!state||state.scenarioId!==id||expired)return <><div className="page-nav"><h1 tabIndex={-1}>开始模拟练习</h1></div>{error&&<FeedbackMessage message={error}/>}<div className="practice-actions"><ActionButton variant="primary" disabled={busy} onClick={()=>void begin(id||'')}>重新开始本次练习</ActionButton><Link className="back-link" to="/">返回首页</Link></div><p>刷新页面后需重新开始。</p></>
 const Screen=state.scenarioId==='hospital'?HospitalScreen:state.scenarioId==='bus'?BusScreen:PaymentScreen
 return <section className="practice" aria-busy={busy}>
  <div className="page-nav">{state.canGoBack&&<ActionButton className="nav-back" aria-label="返回上一步" disabled={busy} onClick={()=>void send('back')}><ArrowLeft aria-hidden="true"/></ActionButton>}<h1 tabIndex={-1}>{state.title}</h1></div>
  <div className="practice-meta"><TaroStatus>模拟练习</TaroStatus><StepProgress state={state}/></div>
  {!state.result&&<details className="practice-task"><summary>本次任务</summary><p>{state.task}</p></details>}
  {(error||state.feedback)&&<FeedbackMessage message={error||state.feedback!.message}/>}
  {busy&&<p role="status" className="loading-message">正在处理，请稍等…</p>}
  {state.result?<ResultSummary state={state}/>:<Screen state={state}/>}
  <PracticeNavigation state={state}/>
 </section>
}
