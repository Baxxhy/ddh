import { useEffect, useState } from 'react'
import { Link, Route, Routes, useLocation } from 'react-router'
import { CheckCircle2 } from 'lucide-react'
import { Lesson } from './pages/Lesson'
import { Practice } from './pages/Practice'
import { PracticeProvider } from './components/PracticeProvider'
import { Scenarios } from './pages/Scenarios'
function App() {
 const [large,setLarge]=useState(false)
 const home=useLocation().pathname==='/'
 useEffect(()=>{document.documentElement.dataset.textSize=large?'large':'normal'},[large])
 return <PracticeProvider><div className={`app-shell ${home?'home-shell':''}`}><header className={`app-header ${home?'home-header':'tools-header'}`}>
  {home&&<span className="brand"><span className="brand-mark" aria-hidden="true"><CheckCircle2 size={28}/></span><span>点点会</span></span>}
  <button className="text-size-button" aria-pressed={large} onClick={()=>setLarge(value=>!value)}>大字</button>
 </header><main className="content"><Routes><Route path="/learn/:id" element={<Lesson/>}/><Route path="/practice/:id" element={<Practice/>}/><Route path="/" element={<Scenarios/>}/><Route path="/scenarios/:id" element={<Scenarios key={location.pathname}/>}/><Route path="*" element={<><div className="page-nav"><h1>没有找到这个页面</h1></div><Link className="back-link" to="/">返回首页</Link></>}/></Routes></main></div></PracticeProvider>
}
export default App
