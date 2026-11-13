import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { ArrowLeft, ChevronRight } from 'lucide-react'
import { loadScenarios, type Scenario } from '../api/scenarios'
import { ScenarioIcon } from '../components/ScenarioIcon'
type State = { status: 'loading' } | { status: 'error'; message: string } | { status: 'ready'; rows: Scenario[] }
export function Scenarios() {
  const { id } = useParams()
  const [state, setState] = useState<State>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    loadScenarios(id, controller.signal).then(rows => setState({ status: 'ready', rows })).catch((error: unknown) => {
      if (!controller.signal.aborted) setState({ status: 'error', message: error instanceof Error ? error.message : '请稍后重试。' })
    })
    return () => controller.abort()
  }, [id, attempt])
  useEffect(() => { window.scrollTo(0, 0); document.querySelector<HTMLElement>('h1')?.focus() }, [id, state.status])
  return <>
    {id && <Link className="back-link" to="/"><ArrowLeft aria-hidden="true" />返回首页</Link>}
    <h1 tabIndex={-1}>{id ? state.status === 'ready' ? state.rows[0]?.title : '场景介绍' : '选择练习场景'}</h1>
    {state.status === 'loading' && <p role="status">正在加载场景…</p>}
    {state.status === 'error' && <div className="state-panel" role="alert"><p>{state.message}</p><button onClick={() => { setState({ status: 'loading' }); setAttempt(x => x + 1) }}>重新加载</button></div>}
    {state.status === 'ready' && !state.rows.length && <p role="status">目前没有可显示的练习场景。</p>}
    {state.status === 'ready' && (id ? state.rows.map(row => <div className="detail" key={row.id}>
      <p>{row.summary}</p><h2>练习目标</h2><p>{row.goal}</p><h2>模拟练习</h2><p>{row.simulation_notice}</p><p className="coming-soon">练习功能即将开放</p>
    </div>) : <ul className="scenario-list">{state.rows.map(row => <li key={row.id}><Link className="scenario-item" to={`/scenarios/${row.id}`}><span className="scenario-icon"><ScenarioIcon id={row.id} /></span><span><strong>{row.title}</strong><span className="summary">{row.summary}</span></span><ChevronRight aria-hidden="true" /></Link></li>)}</ul>)}
  </>
}
