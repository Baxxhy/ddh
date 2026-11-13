import { Hospital, Stethoscope, CalendarDays, UserRound, LayoutGrid } from 'lucide-react'
import type { PracticeState } from '../../api/practice'
import { PracticeActions } from '../PracticeActions'
import { SelectedSummary, SimulationPanel } from '../PracticeChrome'
export function HospitalScreen({state}: {state:PracticeState}) {
 const node=state.nodeId
 return <SimulationPanel name="演示医疗服务" icon={Hospital} tone="hospital">
  {node==='H0'&&<div className="service-banner hospital-banner"><Stethoscope size={40} aria-hidden="true"/><h2>门诊服务</h2></div>}
  {node==='H1'&&<h2>可选医院</h2>}
  {node==='H2'&&<><SelectedSummary state={state} fields={['医院']}/><h2 className="section-title">就诊科室</h2></>}
  {node==='H3'&&<><SelectedSummary state={state} fields={['医院','科室']}/><h2 className="section-title">可选门诊</h2></>}
  {node==='H4'&&<><SelectedSummary state={state} fields={['门诊']}/><h2 className="section-title">演示就诊时段</h2></>}
  {node==='H5'&&<><h2>请核对预约信息</h2><SelectedSummary state={state} editable/></>}
  {node==='HX'&&<p>这里是其他医疗服务的演示页面。可以返回，继续预约挂号练习。</p>}
  <PracticeActions key={node} state={state} layout={node==='H2'?'department-options':node==='H4'?'time-options':'hospital-options'} optionIcon={node==='H1'?Hospital:node==='H2'?LayoutGrid:node==='H3'?UserRound:CalendarDays} primaryAction={node==='H0'?'open_registration':'confirm_registration'} icons={{open_registration:Stethoscope}} hideEdits={node==='H5'} searchable={node==='H1'}/>
 </SimulationPanel>
}
