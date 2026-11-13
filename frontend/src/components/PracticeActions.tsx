import { useState } from 'react'
import { Check, type LucideIcon } from 'lucide-react'
import type { PracticeState } from '../api/practice'
import { usePractice } from './PracticeProvider'
import { ActionButton } from './ActionButton'
type Props={state:PracticeState;layout?:string;optionIcon?:LucideIcon;icons?:Record<string,LucideIcon>;primaryAction?:string;hideEdits?:boolean}
const selectionKeys:Record<string,string>={select_hospital:'hospital',select_department:'department',select_doctor:'doctor',select_slot:'slot',scan_demo_code:'merchant'}
export function PracticeActions({state,layout='',optionIcon:OptionIcon,icons={},primaryAction,hideEdits=false}:Props) {
 const {busy,send}=usePractice()
 const [amount,setAmount]=useState(state.selections.amount_fen===undefined?'':(Number(state.selections.amount_fen)/100).toFixed(2))
 return <div className={`practice-actions ${layout}`}>{state.actions.filter(action=>!hideEdits||!action.id.startsWith('edit_')).map(action=>{
  const Icon=icons[action.id]
  if(action.input)return <form key={action.id} onSubmit={event=>{event.preventDefault();void send('actions',action.id,amount)}}><label htmlFor="practice-amount">模拟金额（元）</label><input id="practice-amount" inputMode="decimal" autoComplete="off" value={amount} maxLength={128} onChange={event=>setAmount(event.target.value)} disabled={busy}/><ActionButton disabled={busy} type="submit" variant="primary">{action.label}</ActionButton></form>
  if(action.options.length)return <div key={action.id} role="group" aria-label={action.label}>{action.options.map(option=>{
   const selected=state.selections[selectionKeys[action.id]]===option.id
   return <ActionButton className="option-row" key={option.id} aria-label={option.label} aria-pressed={selected} disabled={busy} onClick={()=>void send('actions',action.id,option.id)}><span className="option-content">{OptionIcon&&<span className="option-icon"><OptionIcon aria-hidden="true"/></span>}<span>{option.label}</span>{selected&&<Check className="selection-check" aria-hidden="true"/>}</span></ActionButton>
  })}</div>
  return <ActionButton key={action.id} disabled={busy} variant={action.id===primaryAction?'primary':''} onClick={()=>void send('actions',action.id)}><span className="button-content">{Icon&&<Icon aria-hidden="true"/>}{action.label}</span></ActionButton>
 })}</div>
}
