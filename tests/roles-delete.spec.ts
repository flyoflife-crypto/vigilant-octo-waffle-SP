import { test, expect } from '@playwright/test'

test('role bubble delete button appears on hover and is positioned over bubble', async ({ page }) => {
  await page.goto('/')

  // Create project
  await page.getByRole('button', { name: /Projects/i }).click()
  const input = page.getByPlaceholder('New project name...')
  await input.fill('RolesDeleteTest')
  await page.getByRole('button', { name: /Create/i }).click()
  await page.waitForSelector('text=Project created')

  // Add Product Owner via context menu
  await page.click('text=Team Roles', { button: 'right' })
  await page.getByRole('button', { name: /Product Owner/i }).click()

  // Find bubble and hover it
  const bubble = page.locator('div.group:has-text("Product Owner")').first()
  await bubble.hover()

  // Locate the remove button by title
  const removeBtn = bubble.locator('button[title="Remove"]').first()
  await expect(removeBtn).toBeVisible()

  // Measure positions: remove button should be above bubble's top (y less than bubble.top + small threshold)
  const { bubbleTop, btnTop } = await page.evaluate(({ index, selector }) => {
    const bubbleEl = document.querySelectorAll('div.group')[index]
    const btn = bubbleEl?.querySelector(selector)
    const bubbleTop = bubbleEl?.getBoundingClientRect().top ?? 0
    const btnTop = btn?.getBoundingClientRect().top ?? 0
    return { bubbleTop, btnTop }
  }, { index: 0, selector: 'button[title="Remove"]' })

  expect(btnTop).toBeLessThan(bubbleTop + 6)
})