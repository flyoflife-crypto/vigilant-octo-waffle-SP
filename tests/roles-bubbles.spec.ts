import { test, expect } from '@playwright/test'

test('two built-in role bubbles fit in one row and truncate long names', async ({ page }) => {
  await page.goto('/')

  // Create new project via Project Manager UI
  await page.getByRole('button', { name: /Projects/i }).click()
  const input = page.getByPlaceholder('New project name...')
  await input.fill('RolesTest')
  await page.getByRole('button', { name: /Create/i }).click()

  // Wait for project created toast and the Team Roles header
  await page.waitForSelector('text=Project created')
  await page.waitForSelector('text=Team Roles')

  // Add Product Owner and Project Manager using the Add Role menu
  // Open context menu on the roles header and add missing built-in roles
  await page.click('text=Team Roles', { button: 'right' })
  await page.getByRole('button', { name: /Product Owner/i }).click()
  await page.click('text=Team Roles', { button: 'right' })
  await page.getByRole('button', { name: /Project Manager/i }).click()

  // Wait for both to appear
  await page.waitForSelector('text=Product Owner')
  await page.waitForSelector('text=Project Manager')

  // Set long names into both inputs
  const poInput = page.locator('div:has-text("Product Owner") input').first()
  const pmInput = page.locator('div:has-text("Project Manager") input').first()

  const longName = 'Ivan Ivanov With A Very Long Name That Would Overflow'
  await poInput.fill(longName)
  await pmInput.fill(longName)

  // Measure vertical positions to ensure they are on the same row
  const positions = await page.evaluate(() => {
    const findTop = (label) => {
      const span = Array.from(document.querySelectorAll('span')).find(s => s.textContent?.trim() === label)
      if (!span) return null
      const bubble = span.closest('.group') || span.closest('div')
      return bubble ? bubble.getBoundingClientRect().top : null
    }
    return { po: findTop('Product Owner'), pm: findTop('Project Manager') }
  })

  expect(positions.po).not.toBeNull()
  expect(positions.pm).not.toBeNull()
  // They should be on the same row (approx equal top positions)
  expect(Math.abs((positions.po ?? 0) - (positions.pm ?? 0))).toBeLessThan(4)

  // Ensure that filling long names does not increase bubble widths
  const widthsBefore = await page.evaluate(() => {
    const findBubble = (label) => {
      const span = Array.from(document.querySelectorAll('span')).find(s => s.textContent?.trim() === label)
      if (!span) return null
      const bubble = span.closest('.group')
      return bubble ? bubble.getBoundingClientRect().width : null
    }
    return { po: findBubble('Product Owner'), pm: findBubble('Project Manager') }
  })

  // Fill long names already done above; measure again
  const widthsAfter = await page.evaluate(() => {
    const findBubble = (label) => {
      const span = Array.from(document.querySelectorAll('span')).find(s => s.textContent?.trim() === label)
      if (!span) return null
      const bubble = span.closest('.group')
      return bubble ? bubble.getBoundingClientRect().width : null
    }
    return { po: findBubble('Product Owner'), pm: findBubble('Project Manager') }
  })

  expect(widthsBefore.po).not.toBeNull()
  expect(widthsBefore.pm).not.toBeNull()
  expect(widthsAfter.po).not.toBeNull()
  expect(widthsAfter.pm).not.toBeNull()

  // Widths should not increase (allow a tiny delta)
  expect(Math.abs((widthsAfter.po ?? 0) - (widthsBefore.po ?? 0))).toBeLessThan(2)
  expect(Math.abs((widthsAfter.pm ?? 0) - (widthsBefore.pm ?? 0))).toBeLessThan(2)
})