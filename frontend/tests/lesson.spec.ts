import { test, expect } from '@playwright/test'
import { completeLesson } from './helpers/learning'
for(const [scene,count] of [['hospital',6],['bus',5],['payment',5]] as const)test(`${scene} 教学先行且练习从零开始`,async({page})=>{
 let sessions=0
 page.on('request',request=>{if(request.method()==='POST'&&request.url().endsWith('/practice/sessions'))sessions++})
 await page.goto(`/scenarios/${scene}`)
 await expect(page.getByRole('button',{name:'开始练习',exact:true})).toHaveCount(0)
 await page.getByRole('button',{name:'开始教学',exact:true}).click()
 await expect(page.locator('.lesson-progress')).toHaveText(`教学 1 / ${count}`)
 await expect(page.getByRole('region',{name:'操作示意'})).toBeVisible()
 await expect(page.getByRole('region',{name:'教学内容'})).not.toContainText('演示')
 await page.getByRole('button',{name:'下一步',exact:true}).click()
 await page.getByRole('button',{name:'上一步',exact:true}).click()
 await expect(page.locator('.lesson-progress')).toHaveText(`教学 1 / ${count}`)
 await completeLesson(page)
 expect(sessions).toBe(0)
 const created=page.waitForResponse(response=>response.url().endsWith('/practice/sessions')&&response.request().method()==='POST')
 await page.getByRole('button',{name:'开始练习',exact:true}).click()
 const state=(await(await created).json()).state
 expect(state.revision).toBe(0);expect(state.selections).toEqual({});expect(state.result).toBeNull()
 await expect(page.locator('.practice')).toBeVisible();await expect(page.locator('.lesson-instruction')).toHaveCount(0)
})
test('教学加载失败可重试',async({page})=>{
 await page.route('**/scenarios/bus/lesson',route=>route.fulfill({status:503,json:{message:'unavailable'}}))
 await page.goto('/learn/bus');await expect(page.getByRole('alert')).toBeVisible()
 await page.unroute('**/scenarios/bus/lesson');await page.getByRole('button',{name:'重新加载',exact:true}).click()
 await expect(page.getByRole('region',{name:'教学内容'})).toBeVisible()
})
