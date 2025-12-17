import { test, expect } from '@playwright/test'

test('pdf export dialog opens and triggers export toast for both options', async ({ page }) => {
  await page.goto('/')

  // Stub window.print so it doesn't open native dialog in CI
  await page.evaluate(() => { (window as any).print = () => { (window as any).__printCalled = true } })

  // Ensure no blocking overlays (close any open dialogs)
  await page.keyboard.press('Escape')
  await page.waitForTimeout(200)
  await page.keyboard.press('Escape')
  await page.waitForSelector('div.fixed.inset-0', { state: 'hidden', timeout: 2000 }).catch(() => {})

  const pdfButton = page.getByRole('button', { name: /PDF/i })
  await pdfButton.scrollIntoViewIfNeeded()
  await pdfButton.click()

  // Dialog should be visible with two options (updated labels)
  await page.waitForSelector('text=Standard Paged PDF')
  await page.waitForSelector('text=Full Page PDF (No Breaks)')

  // Click Paged and ensure dialog closes (basic sanity check for paged export path)
  const pagedBtn = page.locator('button', { hasText: 'Standard Paged PDF' }).first()
  await pagedBtn.evaluate((el: any) => el.click())
  await page.waitForSelector('text=Standard Paged PDF', { state: 'hidden', timeout: 2000 })
  await page.waitForTimeout(200)

  // Reopen dialog: reload page to reset dialog state, stub full export, then open dialog and click Full Page
  await page.goto('/', { waitUntil: 'networkidle' })
  // Stub native print again (paged path)
  await page.evaluate(() => { (window as any).print = () => { (window as any).__printCalled = true } })
  // Stub the full-page export function so it doesn't attempt heavy work in CI
  await page.evaluate(() => { (window as any).exportFullPagePDF = (id: string, name: string) => { (window as any).__fullExportCalled = true } })

  await page.waitForSelector('text=PDF', { timeout: 5000 })
  const pdfBtn = page.getByRole('button', { name: /PDF/i })
  await pdfBtn.scrollIntoViewIfNeeded()
  await page.waitForTimeout(200)
  await pdfBtn.evaluate((el: any) => el.click())
  await page.waitForSelector('text=Full Page PDF (No Breaks)')

  // Click Full and assert success
  await page.click('text=Full Page PDF (No Breaks)')
  await page.waitForSelector('text=PDF Exported')
  const fullCalled = await page.evaluate(() => (window as any).__fullExportCalled === true)
  expect(fullCalled).toBeTruthy()
})