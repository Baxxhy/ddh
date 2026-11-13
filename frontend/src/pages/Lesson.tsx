import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { ArrowLeft, ArrowRight, Hand, CheckCircle2 } from 'lucide-react'
import AtList from 'taro-ui/dist/components/list'
import { loadLesson, type Lesson as LessonData } from '../api/lesson'
import { ActionButton } from '../components/ActionButton'
import { FeedbackMessage } from '../components/FeedbackMessage'
import { usePractice } from '../components/PracticeProvider'
export function Lesson(){
 const {id}=useParams(),navigate=useNavigate(),{begin,busy,error}=usePractice()
 const [lesson,setLesson]=useState<LessonData|null>(null),[failure,setFailure]=useState(''),[attempt,setAttempt]=useState(0),[index,setIndex]=useState(0)
 useEffect(()=>{
  const controller=new AbortController()
  loadLesson(id||'',controller.signal).then(data=>{setLesson(data);setIndex(0)}).catch((error:unknown)=>{if(!controller.signal.aborted)setFailure(error instanceof Error?error.message:'教学暂时无法打开。')})
  return()=>controller.abort()
 },[id,attempt])
 useEffect(()=>{window.scrollTo(0,0);document.querySelector<HTMLElement>('h1')?.focus()},[index,lesson])
 const step=lesson?.steps[index]
 return <section className="lesson-page"><div className="page-nav"><Link className="nav-back" to={`/scenarios/${id}`} aria-label="返回场景"><ArrowLeft aria-hidden="true"/></Link><h1 tabIndex={-1}>{lesson?`${lesson.title}教学`:'操作教学'}</h1></div>
 {failure?<><FeedbackMessage message={failure}/><ActionButton onClick={()=>{setFailure('');setAttempt(x=>x+1)}}>重新加载</ActionButton></>:!lesson?<p role="status">正在加载教学…</p>:step&&<>
  <p className="lesson-progress">教学 {index+1} / {lesson.steps.length}</p>
  <section className="lesson-instruction" aria-label="教学内容"><span className="lesson-hand"><Hand aria-hidden="true"/></span><div><h2>{step.title}</h2><p>{step.instruction}</p></div></section>
  <section className="lesson-preview" aria-label="操作示意"><p className="lesson-preview-label">操作位置</p>
   {Object.keys(step.selectedSummary).length>0&&<dl className="selected-summary">{Object.entries(step.selectedSummary).map(([key,value])=><div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}</dl>}
   {step.exampleValue&&<p className="lesson-amount">¥ {step.exampleValue}</p>}
   <AtList hasBorder={false} className="choice-list">{step.actions.flatMap(action=>action.options.length?action.options.map(option=><div className={`lesson-choice ${action.id===step.actionId&&option.id===step.optionId?'recommended':''}`} key={`${action.id}-${option.id}`}><span>{option.label}</span>{action.id===step.actionId&&option.id===step.optionId&&<CheckCircle2 aria-hidden="true"/>}</div>):[<div className={`lesson-choice ${action.id===step.actionId?'recommended':''}`} key={action.id}><span>{action.label}</span>{action.id===step.actionId&&<CheckCircle2 aria-hidden="true"/>}</div>])}</AtList>
  </section>
  {error&&<FeedbackMessage message={error}/>}
  <nav className="lesson-navigation" aria-label="教学导航">{index>0&&<ActionButton disabled={busy} onClick={()=>setIndex(value=>value-1)}>上一步</ActionButton>}{index<lesson.steps.length-1?<ActionButton variant="primary" onClick={()=>setIndex(value=>value+1)}><span className="button-content">下一步<ArrowRight aria-hidden="true"/></span></ActionButton>:<ActionButton variant="primary" disabled={busy} onClick={async()=>{if(await begin(id||''))navigate(`/practice/${id}`)}}>开始练习</ActionButton>}</nav>
 </>}
 </section>
}
