import { ShieldCheck } from 'lucide-react'
import { useNavigate } from 'react-router'
import type { Scenario } from '../api/scenarios'
import { usePractice } from './PracticeProvider'
import { ActionButton } from './ActionButton'
import { FeedbackMessage } from './FeedbackMessage'
export function ScenarioIntro({scenario}: {scenario:Scenario}) {
 const {begin,busy,error}=usePractice(), navigate=useNavigate()
 return <div className="intro-panel"><section className="task-box" aria-label="本次练习目标"><h2>本次练习</h2><p>{scenario.goal}</p></section><div className="detail-notice"><ShieldCheck aria-hidden="true"/><p>{scenario.simulation_notice}</p></div>{error&&<FeedbackMessage message={error}/>}<div className="practice-actions"><ActionButton variant="primary" disabled={busy} onClick={async()=>{if(await begin(scenario.id))navigate(`/practice/${scenario.id}`)}}>开始练习</ActionButton>{busy&&<p role="status">正在准备练习…</p>}</div></div>
}
