import { useEffect, useState } from 'react'
import { Link, Route, Routes } from 'react-router'
import { Practice } from './pages/Practice'
import { PracticeProvider } from './components/PracticeProvider'
import { Scenarios } from './pages/Scenarios'
function App() {
  const [large,setLarge]=useState(false)
  useEffect(()=>{document.documentElement.dataset.textSize=large?'large':'normal'},[large])
  return <PracticeProvider><div className="app-shell"><header className="app-header"><span className="brand"><span className="brand-mark" aria-hidden="true">点</span><span>点点会</span></span><button className="text-size-button" aria-pressed={large} onClick={()=>setLarge(value=>!value)}>大字</button></header><main className="content"><Routes><Route path="/practice/:id" element={<Practice />} /><Route path="/" element={<Scenarios />} /><Route path="/scenarios/:id" element={<Scenarios key={location.pathname} />} /><Route path="*" element={<><h1>没有找到这个页面</h1><Link className="back-link" to="/">返回首页</Link></>} /></Routes></main><footer className="app-footer">模拟练习，放心了解</footer></div></PracticeProvider>
}
export default App
