import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { loadScenarios, type Scenario } from '../api/scenarios'
import { ScenarioTile } from '../components/ScenarioTile'
import { ScenarioIntro } from '../components/ScenarioIntro'
import { ActionButton } from '../components/ActionButton'
type State = { status: 'loading' } | { status: 'error'; message: string } | { status: 'ready'; rows: Scenario[] }
export function Scenarios() {
 const {id}=useParams()
 const [state,setState]=useState<State>({status:'loading'})
 const [attempt,setAttempt]=useState(0)
 useEffect(()=>{
  const controller=new AbortController()
  loadScenarios(id,controller.signal).then(rows=>setState({status:'ready',rows})).catch((error:unknown)=>{
   if(!controller.signal.aborted)setState({status:'error',message:error instanceof Error?error.message:'请稍后重试。'})
  })
  return ()=>controller.abort()
 },[id,attempt])
 useEffect(()=>{window.scrollTo(0,0);document.querySelector<HTMLElement>('h1')?.focus()},[id,state.status])
 return <>
  {id&&<Link className="back-link" to="/"><ArrowLeft aria-hidden="true"/>返回首页</Link>}
  <h1 tabIndex={-1}>{id?state.status==='ready'?state.rows[0]?.title:'场景介绍':'选择练习场景'}</h1>
  {state.status==='loading'&&<p className="state-message" role="status">正在加载场景…</p>}
  {state.status==='error'&&<div className="state-panel" role="alert"><p>{state.message}</p><ActionButton onClick={()=>{setState({status:'loading'});setAttempt(x=>x+1)}}>重新加载</ActionButton></div>}
  {state.status==='ready'&&!state.rows.length&&<p className="state-message" role="status">目前没有可显示的练习场景。</p>}
  {state.status==='ready'&&(id?state.rows.map(row=><ScenarioIntro key={row.id} scenario={row}/>):<ul className="scenario-list" aria-label="练习场景">{state.rows.map(row=><li key={row.id}><ScenarioTile scenario={row}/></li>)}</ul>)}
 </>
}
