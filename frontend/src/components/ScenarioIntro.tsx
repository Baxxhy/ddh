import { ShieldCheck } from 'lucide-react'
import { useNavigate } from 'react-router'
import type { Scenario } from '../api/scenarios'
import { usePractice } from './PracticeProvider'
import { ActionButton } from './ActionButton'
import { FeedbackMessage } from './FeedbackMessage'
import { ScenarioIcon } from './ScenarioIcon'
export function ScenarioIntro({scenario}: {scenario:Scenario}) {
 const {begin,busy,error}=usePractice(),navigate=useNavigate()
 return <div className={`intro-panel ${scenario.id}`}><div className="intro-hero"><div className="intro-pict"><ScenarioIcon id={scenario.id}/></div><p className="intro-title">{scenario.title}</p><p className="intro-goal">{scenario.goal}</p></div><div className="detail-notice"><ShieldCheck aria-hidden="true"/><p>{scenario.simulation_notice}</p></div>{error&&<FeedbackMessage message={error}/>}<div className="intro-bottom"><ActionButton variant="primary" disabled={busy} onClick={async()=>{if(await begin(scenario.id))navigate(`/practice/${scenario.id}`)}}>开始练习</ActionButton>{busy&&<p role="status">正在准备练习…</p>}</div></div>
}
