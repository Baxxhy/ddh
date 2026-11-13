import { useRef, useState } from 'react'
import { Delete, Keyboard } from 'lucide-react'
import { ActionButton } from './ActionButton'
export function AmountEntry({initialValue,busy,onSubmit,label}: {initialValue:string;busy:boolean;onSubmit:(value:string)=>void;label:string}) {
 const [value,setValue]=useState(initialValue),[system,setSystem]=useState(false)
 const input=useRef<HTMLInputElement>(null)
 function digit(key:string){setValue(previous=>(key==='delete'?previous.slice(0,-1):previous+key).slice(0,128))}
 return <form className="amount-form" onSubmit={event=>{event.preventDefault();onSubmit(value)}}><label htmlFor="practice-amount">模拟金额（元）</label><div className="amount-box"><span aria-hidden="true">¥</span><input ref={input} id="practice-amount" inputMode={system?'decimal':'none'} autoComplete="off" value={value} maxLength={128} onChange={event=>setValue(event.target.value)} disabled={busy}/><ActionButton className="clear-amount" aria-label="清空金额" disabled={busy} onClick={()=>setValue('')}>清空</ActionButton></div>
 {!system&&<div className="number-pad" role="group" aria-label="数字键盘">{['1','2','3','4','5','6','7','8','9','.','0','delete'].map(key=><ActionButton disabled={busy} key={key} aria-label={key==='delete'?'删除一位':key==='.'?'小数点':`数字 ${key}`} onClick={()=>digit(key)}>{key==='delete'?<Delete aria-hidden="true"/>:key}</ActionButton>)}</div>}
 <ActionButton className="keyboard-switch" disabled={busy} onClick={()=>{setSystem(previous=>!previous);input.current?.focus()}}><span className="button-content"><Keyboard aria-hidden="true"/>{system?'使用页面键盘':'使用系统键盘'}</span></ActionButton><ActionButton disabled={busy} type="submit" variant="primary">{label}</ActionButton></form>
}
