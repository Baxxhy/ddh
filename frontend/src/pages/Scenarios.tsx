import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { ArrowLeft, CircleAlert, FileSearch } from 'lucide-react'
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
  {id?<div className="page-nav"><Link className="nav-back" aria-label="返回首页" to="/"><ArrowLeft aria-hidden="true"/></Link><h1 tabIndex={-1}>{state.status==='ready'?state.rows[0]?.title:'场景介绍'}</h1></div>:<h1 className="home-title" tabIndex={-1}>选择练习场景</h1>}
  {state.status==='loading'&&<p className="state-message" role="status">正在加载场景…</p>}
  {state.status==='error'&&<div className="state-panel connection-state" role="alert"><CircleAlert size={64} aria-hidden="true"/><h2>暂时无法加载</h2><p>{state.message}</p><ActionButton onClick={()=>{setState({status:'loading'});setAttempt(x=>x+1)}}>重新加载</ActionButton></div>}
  {state.status==='ready'&&!state.rows.length&&<div className="empty-state"><FileSearch size={64} aria-hidden="true"/><p className="state-message" role="status">目前没有可显示的练习场景。</p></div>}
  {state.status==='ready'&&(id?state.rows.map(row=><ScenarioIntro key={row.id} scenario={row}/>):<ul className="scenario-list" aria-label="练习场景">{state.rows.map(row=><li key={row.id}><ScenarioTile scenario={row}/></li>)}</ul>)}
 </>
}
