import { completeLesson, startPractice } from './helpers/learning'
import { test, expect, type Page } from '@playwright/test'
const journeys:Record<string,string[]>={hospital:['预约挂号','青禾医院','内科','普通门诊','周一上午 09:00–09:30','确认模拟预约'],bus:['出行','交通服务','公交','公交乘车码','对准虚拟扫码器，模拟扫码'],payment:['扫一扫','晨光便利店','确认收款方，填写金额','核对付款信息','确认模拟付款']}
async function button(page:Page,name:string){
 if(name==='大字'){await page.getByRole('button',{name,exact:true}).click();return}
 const response=page.waitForResponse(response=>response.url().includes('/practice/')&&response.request().method()==='POST')
 await page.getByRole('button',{name,exact:true}).click()
 const body=await (await response).json()
 const state=body.state||body
 if(state.title){await expect(page.getByRole('heading',{level:1})).toHaveText(state.title);await expect(page.getByRole('heading',{level:1})).toBeFocused()}
}
async function start(page:Page,id:string){await startPractice(page,id)}
async function layout(page:Page){
 await expect(page.locator('.practice')).toHaveAttribute('aria-busy','false')
 await expect(page.getByRole('heading',{level:1})).toBeFocused()
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy()
 const sizes=await page.locator('.practice button').evaluateAll(buttons=>buttons.map(button=>{const box=button.getBoundingClientRect();return {width:box.width,height:box.height}}))
 for(const box of sizes){expect(box.width).toBeGreaterThanOrEqual(60);expect(box.height).toBeGreaterThanOrEqual(60)}
}
for(const width of [360,390,430,768,1280])for(const mode of ['normal','large','200%'])for(const scene of Object.keys(journeys))test(`${scene} ${width}px ${mode} 全流程布局`,async({page})=>{
 await page.setViewportSize({width,height:900});await page.goto('/')
 if(mode==='large')await button(page,'大字')
 if(mode==='200%')await page.evaluate(()=>{document.documentElement.style.fontSize='200%'})
 await page.locator(`a[href="/scenarios/${scene}"]`).click()
 await expect(page.getByRole('button',{name:'开始教学',exact:true})).toBeVisible()
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy()
 await page.getByRole('button',{name:'开始教学',exact:true}).click();await completeLesson(page)
 await button(page,'开始练习')
 for(const label of journeys[scene]){
  await layout(page)
  if(label==='核对付款信息')await page.getByLabel('模拟金额（元）').fill('12.50')
  await button(page,label)
 }
 await layout(page);await expect(page.getByRole('status')).toContainText('模拟')
 if(scene==='hospital')await expect(page.locator('.result-summary')).toContainText('青禾医院')
 if(scene==='payment')await expect(page.locator('.result-summary')).toContainText('12.50')
 await page.screenshot({path:`/tmp/ddh-stage3-${scene}-${width}-${mode}.png`,fullPage:true})
 await button(page,'返回首页');await expect(page.locator('.scenario-item')).toHaveCount(3)
})
async function keyboardButton(page:Page,name:string){
 const target=page.getByRole('button',{name,exact:true});await expect(target).toBeEnabled()
 for(let i=0;i<80;i++){
  if(await target.evaluate(element=>element===document.activeElement)){await page.keyboard.press('Enter');return}
  await page.keyboard.press('Tab')
 }
 throw new Error(`键盘无法到达 ${name}`)
}
for(const scene of Object.keys(journeys))test(`${scene} 键盘完成主要流程`,async({page})=>{
 await page.goto(`/scenarios/${scene}`);await expect(page.getByRole('heading',{level:1})).toBeFocused()
 await keyboardButton(page,'开始教学');await completeLesson(page,name=>keyboardButton(page,name))
 await keyboardButton(page,'开始练习')
 for(const label of journeys[scene]){
  await expect(page.getByRole('heading',{level:1})).toBeFocused()
  if(label==='核对付款信息'){
   for(let i=0;i<30&&!await page.getByLabel('模拟金额（元）').evaluate(el=>el===document.activeElement);i++)await page.keyboard.press('Tab')
   await expect(page.getByLabel('模拟金额（元）')).toBeFocused();await page.keyboard.type('12.50')
  }
  await keyboardButton(page,label)
 }
 await expect(page.getByRole('status')).toContainText('模拟');await keyboardButton(page,'返回首页')
 await expect(page.locator('.scenario-item')).toHaveCount(3)
})
test('同值重选后的连续返回与探索支路进度',async({page})=>{
 await start(page,'hospital');for(const label of journeys.hospital.slice(0,-1))await button(page,label)
 await button(page,'修改医院');await button(page,'青禾医院');await button(page,'返回上一步')
 await expect(page.getByRole('heading',{level:1})).toHaveText('选择医院')
 await button(page,'返回上一步');await expect(page.getByRole('heading',{level:1})).toHaveText('模拟医疗服务')
 await button(page,'退出练习');await start(page,'payment')
 for(const label of journeys.payment.slice(0,3))await button(page,label)
 await page.getByLabel('模拟金额（元）').fill('12.50');await button(page,'核对付款信息')
 await button(page,'更换商户');await button(page,'晨光便利店');await button(page,'返回上一步');await button(page,'返回上一步')
 await expect(page.getByRole('heading',{level:1})).toHaveText('模拟支付应用')
 await button(page,'退出练习');await start(page,'bus');await button(page,'出行');await button(page,'交通服务');await button(page,'地铁')
 await expect(page.getByRole('progressbar')).toHaveCount(0)
 await expect(page.getByText('探索页面 · 可返回继续练习')).toBeVisible()
})
test('配色对比度及大字开关',async({page})=>{
 await page.goto('/');await expect(page.locator('.scenario-item')).toHaveCount(3)
 const ratios=await page.evaluate(()=>{
  const style=getComputedStyle(document.documentElement)
  function light(hex:string){let value=hex.trim().replace('#','');if(value.length===3)value=value.split('').map(x=>x+x).join('');const c=value.match(/../g)!.map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return c[0]*.2126+c[1]*.7152+c[2]*.0722}
  function ratio(a:string,b:string){const x=light(a),y=light(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)}
  return [['--text','--surface'],['--text','--canvas'],['--muted','--canvas'],['--primary','--surface'],['--error','--error-bg'],['--success','--surface']].map(([a,b])=>ratio(style.getPropertyValue(a),style.getPropertyValue(b)))
 })
 for(const ratio of ratios)expect(ratio).toBeGreaterThanOrEqual(4.5)
 const normal=await page.locator('.summary').first().evaluate(el=>parseFloat(getComputedStyle(el).fontSize))
 await button(page,'大字');await expect(page.getByRole('button',{name:'大字',exact:true})).toHaveAttribute('aria-pressed','true')
 expect(await page.locator('.summary').first().evaluate(el=>parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThan(normal)
})
