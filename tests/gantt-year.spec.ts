import { test, expect } from '@playwright/test'

test('year gantt shows 12 month labels for new project', async ({ page }) => {
  await page.goto('/')

  // Create a new project via Project Manager UI (more reliable than keyboard prompt)
  await page.click('button:has-text("Projects")')
  await page.waitForSelector('text=Project Manager')
  await page.fill('input[placeholder="New project name..."]', 'YearGantt Test')
  await page.click('button:has-text("Create")')

  // Wait for project created toast
  await page.waitForSelector('text=Project created')

  // Ensure TOTAL Plan is visible
  await page.waitForSelector('text=TOTAL Plan')

  // Locate the timeline header for the first Gantt (TOTAL Plan) and count month labels
  const count = await page.evaluate(() => {
    const header = document.querySelector('div.border-b.min-w-max')
    if (!header) return 0
    return Array.from(header.children).filter((c) => (c.className || '').includes('min-w-')).length
  })

  // Expect 12 month labels
  expect(count).toBe(12)
})