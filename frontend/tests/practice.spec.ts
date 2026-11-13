import { startPractice } from './helpers/learning'
import { test, expect, type Page } from '@playwright/test'
async function click(page: Page,name: string) { await page.getByRole('button',{name,exact:true}).click() }
async function start(page:Page,id:string){await startPractice(page,id)}
async function hospital(page:Page){for(const label of ['青禾医院','内科','普通门诊','周一上午 09:00–09:30'])await click(page,label)}
async function amount(page:Page,value:string){await page.getByLabel('模拟金额（元）').fill(value);await click(page,'核对付款信息')}
test('医院：探索、选错、修改、返回、成功、再练及退出',async({page})=>{
 await start(page,'hospital')
 await click(page,'查看其他医疗服务');await expect(page.getByRole('heading',{name:'其他医疗服务'})).toBeVisible();await click(page,'返回上一步')
 await click(page,'预约挂号')
 for(const label of ['安和医院','外科','专科门诊','周一下午 14:00–14:30'])await click(page,label)
 await click(page,'确认模拟预约');await expect(page.getByRole('alert')).toContainText('不符')
 await click(page,'修改医院');await hospital(page)
 await click(page,'修改科室');await click(page,'内科');await click(page,'普通门诊');await click(page,'周一上午 09:00–09:30')
 await click(page,'修改门诊');await click(page,'普通门诊');await click(page,'周一上午 09:00–09:30')
 await click(page,'修改时间');await click(page,'周一下午 14:00–14:30');await click(page,'确认模拟预约');await expect(page.getByRole('alert')).toContainText('不符')
 await click(page,'返回上一步');await click(page,'周一上午 09:00–09:30');await click(page,'确认模拟预约')
 await expect(page.getByRole('status')).toContainText('模拟预约成功')
 await click(page,'再练一次');await expect(page.getByRole('button',{name:'预约挂号',exact:true})).toBeVisible()
 await click(page,'退出练习');await expect(page.locator('.scenario-item')).toHaveCount(3)
})
test('公交：其他服务、地铁、未对准、重试与完成',async({page})=>{
 await start(page,'bus');await click(page,'查看其他生活服务');await click(page,'返回上一步')
 await click(page,'出行');await click(page,'交通服务');await click(page,'地铁');await click(page,'返回上一步')
 await click(page,'地铁');await click(page,'切换到公交');await click(page,'公交乘车码')
 await expect(page.getByRole('img',{name:'练习乘车码'})).toBeVisible()
 await click(page,'未对准，尝试扫码');await expect(page.getByRole('alert')).toContainText('未对准')
 await click(page,'对准虚拟扫码器，模拟扫码');await expect(page.getByRole('status')).toContainText('模拟乘车成功')
 await click(page,'返回首页');await expect(page.locator('.scenario-item')).toHaveCount(3)
})
test('支付：其他入口、错误商户、非法金额、修改后完成',async({page})=>{
 await start(page,'payment');await click(page,'查看其他支付服务');await click(page,'返回上一步');await click(page,'扫一扫')
 await click(page,'邻里水果店');await click(page,'确认收款方，填写金额')
 for(const value of ['','abc','-1','0','1.999','999999.99']) {await amount(page,value);await expect(page.getByRole('alert')).toBeVisible()}
 await amount(page,'12.50');await click(page,'确认模拟付款');await expect(page.getByRole('alert')).toContainText('不符')
 await click(page,'更换商户');await click(page,'晨光便利店');await click(page,'确认收款方，填写金额')
 await expect(page.getByLabel('模拟金额（元）')).toHaveValue('')
 await amount(page,'1.00');await click(page,'确认模拟付款');await expect(page.getByRole('alert')).toContainText('不符')
 await click(page,'修改金额');await amount(page,'12.50');await click(page,'确认模拟付款')
 await expect(page.getByRole('status')).toContainText('模拟支付成功')
 await click(page,'返回首页');await expect(page.locator('.scenario-item')).toHaveCount(3)
})
test('刷新不伪造会话，重新开始可用',async({page})=>{
 await start(page,'bus');await page.reload();await click(page,'重新开始本次练习');await expect(page.getByRole('button',{name:'出行',exact:true})).toBeVisible()
})

test('旧页面冲突读取服务端状态；网络失败可恢复',async({page})=>{
 const created=page.waitForResponse(response=>response.url().endsWith('/practice/sessions')&&response.request().method()==='POST')
 await start(page,'bus')
 const session=await (await created).json()
 const response=await page.request.post('/api/v1/practice/actions',{headers:{'X-Practice-Session':session.sessionToken},data:{revision:0,actionId:'open_travel'}})
 expect(response.status()).toBe(200)
 await click(page,'出行');await expect(page.getByRole('alert')).toContainText('页面已更新')
 await expect(page.getByRole('button',{name:'交通服务',exact:true})).toBeVisible()
 await page.route('**/practice/actions',route=>route.abort())
 await click(page,'交通服务');await expect(page.getByRole('alert')).toContainText('网络没有连接好')
 await page.unroute('**/practice/actions');await click(page,'读取当前页面')
 await click(page,'交通服务');await expect(page.getByRole('button',{name:'公交',exact:true})).toBeVisible()
})

test('练习页面在手机宽度和200%字号下可操作',async({page})=>{
 for(const width of [360,390,430,1280]){
  await page.setViewportSize({width,height:900})
  for(const id of ['hospital','bus','payment']){
   await start(page,id)
   await page.evaluate(()=>{document.documentElement.style.fontSize='200%'})
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy()
   for(const button of await page.locator('.practice button').all())expect((await button.boundingBox())!.height).toBeGreaterThanOrEqual(60)
   await page.screenshot({path:`/tmp/ddh-${id}-${width}.png`,fullPage:true})
   await page.evaluate(()=>{document.documentElement.style.fontSize='100%'})
   await click(page,'退出练习')
  }
 }
})
