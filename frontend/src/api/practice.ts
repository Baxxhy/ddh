export type PracticeState = {
  scenarioId: string; scenarioVersion: string; nodeId: string; title: string; task: string
  step: { current: number; total: number }; revision: number
  selections: Record<string, string | number>; selectedSummary: Record<string,string>
  actions: { id: string; label: string; options: {id:string;label:string}[]; input: boolean }[]
  feedback: {kind:string;message:string} | null; result: {message:string} | null
  canGoBack: boolean; isComplete: boolean; simulationNotice: string
}
export class PracticeError extends Error {
  constructor(message: string, public status: number, public state?: PracticeState) { super(message) }
}
export async function practiceRequest<T>(path: string, token?: string, body?: object): Promise<T> {
  const base = (import.meta.env.VITE_API_BASE_URL || '/api/v1').replace(/\/$/,'')
  const response = await fetch(`${base}/practice/${path}`, {
    method: body ? 'POST' : 'GET', headers: { ...(body ? {'Content-Type':'application/json'} : {}), ...(token ? {'X-Practice-Session':token} : {}) },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data: unknown = await response.json()
  if (!data || typeof data !== 'object') throw new PracticeError('服务返回的页面暂时无法读取，请重试。', 503)
  const error = data as {message?: string; state?: PracticeState}
  if (!response.ok) throw new PracticeError(error.message || '暂时无法操作，请重试。', response.status, error.state || undefined)
  return data as T
}
