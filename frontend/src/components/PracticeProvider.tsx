import { createContext, useContext, useRef, useState, type ReactNode } from 'react'
import { practiceRequest, PracticeError, type PracticeState } from '../api/practice'
type PracticeContext = {
 state: PracticeState | null; busy: boolean; error: string; expired: boolean
 begin: (id: string) => Promise<boolean>
 send: (path: string, actionId?: string, value?: string) => Promise<boolean>
}
const Context = createContext<PracticeContext | null>(null)
export function PracticeProvider({children}: {children: ReactNode}) {
 const token = useRef<string | undefined>(undefined)
 const lock = useRef(false)
 const [state,setState]=useState<PracticeState | null>(null)
 const [busy,setBusy]=useState(false), [error,setError]=useState(''), [expired,setExpired]=useState(false)
 function fail(error: unknown) {
  if(error instanceof PracticeError) { if(error.state)setState(error.state); if(error.status===410)setExpired(true); setError(error.message) }
  else setError('网络没有连接好。请点击“读取当前页面”确认操作结果，再继续。')
 }
 async function begin(id: string) {
  if(lock.current)return false
  lock.current=true;setBusy(true);setError('')
  try { const response=await practiceRequest<{sessionToken:string;state:PracticeState}>('sessions',undefined,{scenarioId:id});token.current=response.sessionToken;setState(response.state);setExpired(false);return true }
  catch(error){fail(error);return false}finally{lock.current=false;setBusy(false)}
 }
 async function send(path: string, actionId?: string, value?: string) {
  if(lock.current||!state)return false
  lock.current=true;setBusy(true);setError('')
  try {
   if(path==='exit') { await practiceRequest('exit',token.current,{revision:state.revision});token.current=undefined;setState(null) }
   else {const response=await practiceRequest<PracticeState>(path,token.current,path==='state'?undefined:{revision:state.revision,...(actionId?{actionId,value}: {})});setState(response)}
   return true
  }catch(error){fail(error);return false}finally{lock.current=false;setBusy(false)}
 }
 return <Context.Provider value={{state,busy,error,expired,begin,send}}>{children}</Context.Provider>
}
export function usePractice(){const context=useContext(Context);if(!context)throw new Error('PracticeProvider required');return context}
