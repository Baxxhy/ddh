import { useNavigate } from 'react-router'
import type { Scenario } from '../api/scenarios'
import { ActionButton } from './ActionButton'
import { ScenarioIcon } from './ScenarioIcon'
export function ScenarioIntro({scenario}: {scenario:Scenario}) {
 const navigate=useNavigate()
 return <div className={`intro-panel ${scenario.id}`}><div className="intro-hero"><div className="intro-pict"><ScenarioIcon id={scenario.id}/></div><p className="intro-title">{scenario.title}</p><p className="intro-goal">{scenario.goal}</p></div><div className="intro-bottom"><p className="learning-order">1 看教学 → 2 自己练习</p><ActionButton variant="primary" onClick={()=>navigate(`/learn/${scenario.id}`)}>开始教学</ActionButton></div></div>
}
