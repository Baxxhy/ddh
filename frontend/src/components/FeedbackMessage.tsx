import { useEffect, useRef } from 'react'
import { CircleAlert } from 'lucide-react'
export function FeedbackMessage({message}: {message:string}) {
 const ref=useRef<HTMLDivElement>(null)
 useEffect(()=>{ref.current?.focus();ref.current?.scrollIntoView({block:'nearest'})},[message])
 return <div ref={ref} className="feedback" role="alert" tabIndex={-1}><CircleAlert aria-hidden="true"/><p>{message}</p></div>
}
