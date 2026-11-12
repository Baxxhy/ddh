import { useEffect, useState } from 'react'

type Scenario = {
  id: string
  title: string
  summary: string
  version: string
}

type LoadState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; scenarios: Scenario[] }

function parseScenarios(value: unknown): Scenario[] {
  if (!Array.isArray(value)) throw new Error('场景数据格式不正确')
  return value.map((item: unknown) => {
    if (
      typeof item !== 'object' ||
      item === null ||
      !('id' in item) ||
      !('title' in item) ||
      !('summary' in item) ||
      !('version' in item) ||
      typeof item.id !== 'string' ||
      typeof item.title !== 'string' ||
      typeof item.summary !== 'string' ||
      typeof item.version !== 'string'
    ) {
      throw new Error('场景数据格式不正确')
    }
    return { id: item.id, title: item.title, summary: item.summary, version: item.version }
  })
}

function App() {
  const [loadState, setLoadState] = useState<LoadState>({ status: 'loading' })
  const [reloadCount, setReloadCount] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/v1/scenarios', { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('场景加载失败')
        return response.json() as Promise<unknown>
      })
      .then((data) => setLoadState({ status: 'ready', scenarios: parseScenarios(data) }))
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return
        setLoadState({ status: 'error' })
      })
    return () => controller.abort()
  }, [reloadCount])

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand-mark" aria-hidden="true">点</div>
        <span className="brand-name">点点会</span>
      </header>

      <main className="content">
        <h1>手机练习</h1>
        <p className="intro">三个生活场景正在准备中</p>

        {loadState.status === 'loading' && (
          <p className="state-message" role="status">正在加载场景…</p>
        )}
        {loadState.status === 'error' && (
          <div className="state-panel" role="alert">
            <p>场景暂时没有加载出来，请再试一次。</p>
            <button type="button" onClick={() => {
              setLoadState({ status: 'loading' })
              setReloadCount((count) => count + 1)
            }}>重新加载</button>
          </div>
        )}
        {loadState.status === 'ready' && loadState.scenarios.length === 0 && (
          <p className="state-message" role="status">目前没有可显示的练习场景。</p>
        )}
        {loadState.status === 'ready' && loadState.scenarios.length > 0 && (
          <ul className="scenario-list" aria-label="练习场景">
            {loadState.scenarios.map((scenario, index) => (
              <li className="scenario-item" key={`${scenario.id}-${scenario.version}`}>
                <span className="scenario-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <h2>{scenario.title}</h2>
                  <p>{scenario.summary}</p>
                  <span className="coming-soon">练习准备中</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>

      <footer className="app-footer">这里展示的场景均使用模拟资料</footer>
    </div>
  )
}

export default App
