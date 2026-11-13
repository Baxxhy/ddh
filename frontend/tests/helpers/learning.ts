import { expect, type Page } from '@playwright/test'
export async function completeLesson(page:Page,activate?:(name:string)=>Promise<void>){
 await expect(page.getByRole('region',{name:'教学内容'})).toBeVisible()
 while(await page.getByRole('button',{name:'下一步',exact:true}).count()){
  await expect(page.getByRole('heading',{level:1})).toBeFocused()
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy()
  const progress=await page.locator('.lesson-progress').innerText()
  if(activate)await activate('下一步');else await page.getByRole('button',{name:'下一步',exact:true}).click()
  await expect(page.locator('.lesson-progress')).not.toHaveText(progress)
 }
 await expect(page.getByRole('button',{name:'开始练习',exact:true})).toBeVisible()
}
export async function startPractice(page:Page,id:string){
 await page.goto(`/scenarios/${id}`)
 await page.getByRole('button',{name:'开始教学',exact:true}).click()
 await completeLesson(page)
 await page.getByRole('button',{name:'开始练习',exact:true}).click()
 await expect(page.locator('.practice')).toBeVisible()
}
