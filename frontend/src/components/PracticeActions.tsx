import AtList from 'taro-ui/dist/components/list'
import { useState } from 'react'
import { AmountEntry } from './AmountEntry'
import { Check, ChevronRight, Search, type LucideIcon } from 'lucide-react'
import type { PracticeState } from '../api/practice'
import { usePractice } from './PracticeProvider'
import { ActionButton } from './ActionButton'
type Props={state:PracticeState;layout?:string;optionIcon?:LucideIcon;icons?:Record<string,LucideIcon>;primaryAction?:string;hideEdits?:boolean;searchable?:boolean}
const selectionKeys:Record<string,string>={select_hospital:'hospital',select_department:'department',select_doctor:'doctor',select_slot:'slot',scan_demo_code:'merchant'}
export function PracticeActions({state,layout='',optionIcon:OptionIcon,icons={},primaryAction,hideEdits=false,searchable=false}:Props) {
 const {busy,send}=usePractice()
 const [query,setQuery]=useState('')
 return <div className={`practice-actions ${layout}`}>{state.actions.filter(action=>!hideEdits||!action.id.startsWith('edit_')).map(action=>{
  const Icon=icons[action.id]
  if(action.input)return <AmountEntry key={action.id} initialValue={state.selections.amount_fen===undefined?'':(Number(state.selections.amount_fen)/100).toFixed(2)} busy={busy} label={action.label} onSubmit={value=>void send('actions',action.id,value)}/>
  if(action.options.length)return <div key={action.id} role="group" aria-label={action.label}>{searchable&&<label className="search-field"><Search aria-hidden="true"/><input type="search" aria-label="搜索医院" placeholder="搜索医院" value={query} onChange={event=>setQuery(event.target.value)}/></label>}<AtList hasBorder={false} className="choice-list">{action.options.filter(option=>option.label.includes(query.trim())).map(option=>{
   const selected=state.selections[selectionKeys[action.id]]===option.id
   return <ActionButton className="option-row" key={option.id} aria-label={option.label} aria-pressed={selected} disabled={busy} onClick={()=>void send('actions',action.id,option.id)}><span className="option-content">{OptionIcon&&<span className="option-icon"><OptionIcon aria-hidden="true"/></span>}<span>{option.label}</span>{selected?<Check className="selection-check" aria-hidden="true"/>:<ChevronRight className="row-chevron" aria-hidden="true"/>}</span></ActionButton>
  })}</AtList>{!action.options.some(option=>option.label.includes(query.trim()))&&<p role="status">没有找到医院，请修改搜索内容。</p>}</div>
  return <ActionButton key={action.id} disabled={busy} variant={action.id===primaryAction?'primary':''} onClick={()=>void send('actions',action.id)}><span className="button-content">{Icon&&<Icon aria-hidden="true"/>}{action.label}</span></ActionButton>
 })}</div>
}
