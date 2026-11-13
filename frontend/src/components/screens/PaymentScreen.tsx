import { ScanLine, Store, Wallet, CircleDollarSign } from 'lucide-react'
import type { PracticeState } from '../../api/practice'
import { PracticeActions } from '../PracticeActions'
import { SelectedSummary, SimulationPanel } from '../PracticeChrome'
export function PaymentScreen({state}: {state:PracticeState}) {
 const node=state.nodeId
 return <SimulationPanel name="演示支付服务" icon={Wallet} tone="payment">
  {node==='P0'&&<div className="payment-home"><ScanLine size={44} aria-hidden="true"/><h2>扫码付款练习</h2></div>}
  {node==='P1'&&<><div className="scan-frame" aria-hidden="true"><ScanLine size={52}/><span>演示收款码</span></div><h2>请选择演示商户</h2></>}
  {node==='P2'&&<><div className="merchant-identity"><Store size={44} aria-hidden="true"/><h2>请确认收款方</h2></div><SelectedSummary state={state} fields={['收款方']}/></>}
  {node==='P3'&&<><SelectedSummary state={state} fields={['收款方']}/><div className="amount-heading"><CircleDollarSign aria-hidden="true"/><h2>填写模拟金额</h2></div></>}
  {node==='P4'&&<><h2>请核对收款方和金额</h2><SelectedSummary state={state} editable/></>}
  {node==='PX'&&<p>这里是其他支付服务的演示页面。可以返回，选择“扫一扫”继续练习。</p>}
  <PracticeActions key={node} state={state} layout={node==='P1'?'merchant-options':''} optionIcon={Store} primaryAction={node==='P0'?'open_scan':node==='P2'?'continue_to_amount':'confirm_payment'} icons={{open_scan:ScanLine}} hideEdits={node==='P4'}/>
 </SimulationPanel>
}
