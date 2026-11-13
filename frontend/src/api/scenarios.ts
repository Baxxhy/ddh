export type Scenario = { id: string; title: string; summary: string; goal: string; version: string; simulation_notice?: string }
export async function loadScenarios(id: string | undefined, signal: AbortSignal): Promise<Scenario[]> {
  const base = (import.meta.env.VITE_API_BASE_URL || '/api/v1').replace(/\/$/, '')
  const response = await fetch(`${base}/scenarios${id ? `/${encodeURIComponent(id)}` : ''}`, { signal })
  if (!response.ok) throw new Error(response.status === 404 ? '没有找到这个场景，请返回首页选择。' : '场景暂时没有加载出来，请检查网络后重试。')
  const data: unknown = await response.json()
  const rows: unknown[] = id ? [data] : Array.isArray(data) ? data : []
  if (!id && !Array.isArray(data)) throw new Error('场景数据暂时无法读取，请重试。')
  return rows.map(row => {
    if (!row || typeof row !== 'object' || !['id','title','summary','goal','version'].every(key => key in row && typeof Reflect.get(row, key) === 'string')) throw new Error('场景数据暂时无法读取，请重试。')
    if (id && (!('simulation_notice' in row) || typeof row.simulation_notice !== 'string')) throw new Error('场景介绍暂时无法读取，请重试。')
    return row as Scenario
  })
}
