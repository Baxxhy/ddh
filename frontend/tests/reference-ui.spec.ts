import { startPractice } from './helpers/learning'
import { test, expect } from '@playwright/test'
test('医院搜索筛选真实选项并保留Taro列表',async({page})=>{
 await startPractice(page,'hospital');await page.getByRole('button',{name:'预约挂号',exact:true}).click()
 const search=page.getByRole('searchbox',{name:'搜索医院'})
 await search.fill('不存在的医院');await expect(page.getByRole('status')).toContainText('没有找到医院')
 await search.fill('青禾');await expect(page.getByRole('button',{name:'青禾医院',exact:true})).toBeVisible();await expect(page.getByRole('button',{name:'安和医院',exact:true})).toHaveCount(0)
 await expect(page.locator('.at-list')).toBeVisible();await search.clear();await expect(page.getByRole('button',{name:'安和医院',exact:true})).toBeVisible()
 await page.getByRole('button',{name:'青禾医院',exact:true}).click();await expect(page.getByRole('heading',{level:1})).toHaveText('选择科室')
})
test('页面数字键盘、删除、清空和系统键盘切换',async({page})=>{
 await startPractice(page,'payment')
 for(const name of ['扫一扫','晨光便利店','确认收款方，填写金额'])await page.getByRole('button',{name,exact:true}).click()
 const amount=page.getByLabel('模拟金额（元）')
 for(const name of ['数字 1','数字 2','小数点','数字 5','数字 0'])await page.getByRole('button',{name,exact:true}).click()
 await expect(amount).toHaveValue('12.50');await page.getByRole('button',{name:'删除一位',exact:true}).click();await expect(amount).toHaveValue('12.5')
 await page.getByRole('button',{name:'清空金额',exact:true}).click();await expect(amount).toHaveValue('')
 await page.getByRole('button',{name:'使用系统键盘',exact:true}).click();await expect(amount).toHaveAttribute('inputmode','decimal');await expect(page.getByRole('group',{name:'数字键盘'})).toHaveCount(0)
 await page.getByRole('button',{name:'使用页面键盘',exact:true}).click();await expect(page.getByRole('group',{name:'数字键盘'})).toBeVisible()
 for(const name of ['数字 1','数字 2','小数点','数字 5','数字 0','核对付款信息','确认模拟付款'])await page.getByRole('button',{name,exact:true}).click()
 await expect(page.getByRole('status')).toContainText('模拟支付成功')
})
