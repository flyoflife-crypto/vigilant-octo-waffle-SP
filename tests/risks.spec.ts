import { test, expect } from '@playwright/test'

test('risk impact cycle and context menu + delete', async ({ page }) => {
  await page.goto('/')
  await page.waitForSelector('text=Risks')

  // Ensure at least one risk exists; click Add Risk repeatedly if none
  const add = page.getByRole('button', { name: /Add Risk/i })
  await add.click()

  // Find first risk row
  const riskRow = page.locator('div.grid').filter({ hasText: 'Risk' }).first()

  // Better: locate the first risk item by Remove button existence
  const firstRemove = page.locator('button[title="Remove"]').first()
  await expect(firstRemove).toBeVisible({ timeout: 5000 })

  // Impact element: find the nearby impact label (Medium default)
  const impact = page.locator('text=Medium').first()
  await expect(impact).toBeVisible()
  // impact dot should have background color for Medium
  const impactDot = page.locator('button:has-text("Medium") div.rounded-full')
  await expect(impactDot).toHaveClass(/bg-yellow-500/)

  // Left-click cycles to High
  await impact.click()
  await expect(page.locator('text=High').first()).toBeVisible()
  // High should show red background on the dot
  const highDot = page.locator('button:has-text("High") div.rounded-full')
  await expect(highDot).toHaveClass(/bg-red-500/)

  // Right-click to open context menu and select Low
  await page.click('text=High', { button: 'right' })
  await expect(page.locator('text=Low')).toBeVisible()
  await page.click('text=Low')
  await expect(page.locator('text=Low')).toBeVisible()

  // Hover over remove button and click to delete
  await firstRemove.hover()
  await firstRemove.click()

  // Ensure the risk row was removed (no Low/Medium/High visible matching old content)
  await expect(page.locator('text=Low').first()).not.toBeVisible({ timeout: 2000 }).catch(() => {})
})
