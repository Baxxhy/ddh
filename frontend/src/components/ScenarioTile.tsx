import { Link } from 'react-router'
import { ChevronRight } from 'lucide-react'
import type { Scenario } from '../api/scenarios'
import { ScenarioIcon } from './ScenarioIcon'
export function ScenarioTile({scenario}: {scenario:Scenario}) {
 return <Link className="scenario-item" to={`/scenarios/${scenario.id}`}><span className="scenario-icon"><ScenarioIcon id={scenario.id}/></span><span><strong>{scenario.title}</strong><span className="summary">{scenario.summary}</span></span><ChevronRight size={20} aria-hidden="true"/></Link>
}
