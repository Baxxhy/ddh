import { BusFront, TrainFront, ScanLine, MapPin, Route, Compass } from 'lucide-react'
import type { PracticeState } from '../../api/practice'
import { PracticeActions } from '../PracticeActions'
import { SimulationPanel } from '../PracticeChrome'
export function BusScreen({state}: {state:PracticeState}) {
 const node=state.nodeId
 return <SimulationPanel name="演示出行服务" icon={BusFront} tone="bus">
  {node==='B0'&&<div className="service-welcome"><Compass size={40} aria-hidden="true"/><h2>生活服务</h2></div>}
  {node==='B1'&&<div className="travel-route"><MapPin aria-hidden="true"/><h2>选择出行服务</h2></div>}
  {node==='B2'&&<h2>请选择乘坐的交通工具</h2>}
  {node==='B3'&&<div className="bus-pass-heading"><BusFront size={44} aria-hidden="true"/><h2>公交出行</h2><p>打开乘车码，进行模拟扫码。</p></div>}
  {node==='B4'&&<><div className="demo-code" role="img" aria-label="无效演示图形，不能真实乘车"><BusFront size={60} aria-hidden="true"/><strong>模 拟</strong><span>无效演示图形</span><span aria-hidden="true" className="demo-bars">▥ ▥ ▥</span></div><div className="scanner-target"><ScanLine aria-hidden="true"/><p>虚拟扫码器</p></div></>}
  {node==='BM'&&<div className="exploration"><TrainFront size={40} aria-hidden="true"/><h2>这是地铁演示页面</h2><p>本次练习使用公交乘车码，可以切换到公交，或返回选择交通类型。</p></div>}
  {node==='BX'&&<p>这里是其他生活服务。可以返回，找到“出行”继续练习。</p>}
  <PracticeActions key={node} state={state} layout={node==='B2'?'transport-options':''} primaryAction={{B0:'open_travel',B1:'open_transport',B3:'open_bus_code',B4:'align_and_scan',BM:'choose_bus'}[node]} icons={{open_travel:Compass,open_transport:Route,choose_bus:BusFront,choose_metro:TrainFront,open_bus_code:ScanLine,align_and_scan:ScanLine}}/>
 </SimulationPanel>
}
