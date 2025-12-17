import { test, expect } from '@playwright/test'

test('screenshot mode hides interactive elements', async ({ page }) => {
  await page.goto('/')
  await page.waitForSelector('text=Artifacts')

  const addArtifact = page.getByRole('button', { name: /Add Artifact/i })
  await expect(addArtifact).toBeVisible()

  // enable screenshot mode by adding the class to body
  await page.evaluate(() => document.body.classList.add('screenshot-mode'))

  // now the button should be hidden via CSS
  await expect(addArtifact).toBeHidden()

  // also check Add Risk button
  const addRisk = page.getByRole('button', { name: /Add Risk/i })
  await expect(addRisk).toBeHidden()
})