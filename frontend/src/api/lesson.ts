import type { PracticeState } from './practice'
export type LessonStep={title:string;instruction:string;actions:PracticeState['actions'];actionId:string;optionId:string|null;exampleValue:string|null;selectedSummary:Record<string,string>}
export type Lesson={scenarioId:string;title:string;version:string;goal:string;steps:LessonStep[]}
export async function loadLesson(id:string,signal:AbortSignal):Promise<Lesson>{
 const base=(import.meta.env.VITE_API_BASE_URL||'/api/v1').replace(/\/$/,'')
 const response=await fetch(`${base}/scenarios/${encodeURIComponent(id)}/lesson`,{signal})
 const data:unknown=await response.json()
 if(!response.ok)throw new Error('教学内容暂时无法打开，请返回或重试。')
 if(!data||typeof data!=='object'||!('steps'in data)||!Array.isArray(data.steps)||!data.steps.length||!('title'in data)||typeof data.title!=='string')throw new Error('教学内容暂时无法读取，请重试。')
 return data as Lesson
}
