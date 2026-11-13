import { useState } from 'react'
import type { PracticeState } from '../api/practice'
import { usePractice } from './PracticeProvider'
export function PracticeActions({state}: {state:PracticeState}) {
 const {busy,send}=usePractice()
 const [amount,setAmount]=useState(state.selections.amount_fen === undefined ? '' : (Number(state.selections.amount_fen)/100).toFixed(2))
 return <div className="practice-actions">{state.actions.map(action=>action.input ? <form key={action.id} onSubmit={event=>{event.preventDefault();void send('actions',action.id,amount)}}>
   <label htmlFor="practice-amount">模拟金额（元）</label><input id="practice-amount" inputMode="decimal" autoComplete="off" value={amount} maxLength={128} onChange={event=>setAmount(event.target.value)} disabled={busy}/>
   <button disabled={busy} type="submit">{action.label}</button>
  </form> : action.options.length ? <div key={action.id} role="group" aria-label={action.label}>{action.options.map(option=><button type="button" key={option.id} disabled={busy} onClick={()=>void send('actions',action.id,option.id)}>{option.label}</button>)}</div> : <button type="button" key={action.id} disabled={busy} onClick={()=>void send('actions',action.id)}>{action.label}</button>)}</div>
}
