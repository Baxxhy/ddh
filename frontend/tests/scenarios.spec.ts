import { test, expect } from '@playwright/test'
test('真实接口、三个场景介绍与返回', async ({ page }) => {
  for (const [id, title] of [['hospital','医院挂号'],['bus','公交乘车码'],['payment','扫码支付']]) {
    await page.goto('/')
    await expect(page.locator('.scenario-item')).toHaveCount(3)
    await page.locator(`a[href="/scenarios/${id}"]`).click()
    await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: '开始练习', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: '开始练习', exact: true })).toBeEnabled()
    await page.getByRole('link', { name: '返回首页' }).click()
    await expect(page.locator('.scenario-item')).toHaveCount(3)
  }
})
test('失败重试、加载、空数据与无效入口', async ({ page }) => {
  await page.route('**/api/v1/scenarios', route => route.fulfill({ status: 503, body: '{}' }))
  await page.goto('/')
  await expect(page.getByRole('alert')).toBeVisible()
  await page.unroute('**/api/v1/scenarios')
  await page.getByRole('button', { name: '重新加载' }).click()
  await expect(page.locator('.scenario-item')).toHaveCount(3)
  await page.route('**/api/v1/scenarios', async route => { await new Promise(resolve => setTimeout(resolve, 500)); await route.fulfill({ json: [] }) })
  await page.goto('/')
  await expect(page.getByRole('status')).toContainText('正在加载')
  await expect(page.getByRole('status')).toContainText('目前没有')
  await page.goto('/scenarios/unknown')
  await expect(page.getByRole('alert')).toContainText('没有找到')
})
for (const width of [360,390,430,1280]) test(`布局 ${width}`, async ({ page }) => {
  await page.setViewportSize({ width, height: 900 })
  await page.goto('/')
  await expect(page.locator('.scenario-item')).toHaveCount(3)
  for (const zoom of ['100%','200%']) {
    await page.evaluate(value => { document.documentElement.style.fontSize = value }, zoom)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy()
    for (const link of await page.locator('.scenario-item').all()) expect((await link.boundingBox())!.height).toBeGreaterThanOrEqual(60)
  }
  await page.locator('.scenario-item').first().click()
  await expect(page.getByRole('button', { name: '开始练习', exact: true })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy()
})
