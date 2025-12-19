import { test, expect } from '@playwright/test'

test('app loads and creates first project, storage logs appear', async ({ page }) => {
  const msgs: string[] = []
  page.on('console', (msg) => msgs.push(msg.text()))

  await page.goto('/')

  await expect(page.locator('input[value="My First Project"]')).toBeVisible({ timeout: 10000 })

  const joined = msgs.join('\n')
  expect(joined).toContain('Migration')
  expect(joined).toContain('No projects found')

  const projectsRaw = await page.evaluate(() => localStorage.getItem('mars-onepager-projects'))
  expect(projectsRaw).not.toBeNull()
  const projects = JSON.parse(projectsRaw as string)
  expect(Array.isArray(projects)).toBeTruthy()
  expect(projects.length).toBeGreaterThan(0)
})

test('legacy migration migrates old-project-data to new project', async ({ page }) => {
  // Setup legacy data *before* page loads so migration runs on first load
  await page.addInitScript(() => {
    localStorage.setItem('old-project-data', JSON.stringify({
      projectName: 'Legacy Project',
      yearGantt: { labels: [], rows: [], bars: [], milestones: [], nowCol: 0, nowFrac: 0 },
      quarterGantt: { labels: [], rows: [], bars: [], milestones: [], nowCol: 0, nowFrac: 0 },
      kpis: []
    }))
    localStorage.removeItem('mars-migrated')
  })

  const msgs: string[] = []
  page.on('console', (msg) => msgs.push(msg.text()))

  await page.goto('/')

  // Wait for migration to populate projects list
  await page.waitForFunction(() => !!(localStorage.getItem('mars-onepager-projects')), { timeout: 5000 })

  // Verify localStorage contains migrated project
  const projectsRaw = await page.evaluate(() => localStorage.getItem('mars-onepager-projects'))
  expect(projectsRaw).not.toBeNull()
  const projectIds = JSON.parse(projectsRaw as string)
  expect(Array.isArray(projectIds)).toBeTruthy()
  expect(projectIds.length).toBeGreaterThan(0)

  // Ensure migrated project entry exists and contains projectName
  const migratedId = projectIds[0]
  const migratedRaw = await page.evaluate((id) => localStorage.getItem('mars-project-' + id), migratedId)
  expect(migratedRaw).not.toBeNull()
  const migrated = JSON.parse(migratedRaw as string)
  expect(migrated.data?.projectName || migrated.name).toBe('Legacy Project')

  await expect(page.locator('input[placeholder="Project Name"]')).toHaveValue('Legacy Project', { timeout: 10000 })

  const joined = msgs.join('\n')
  console.log('CONSOLE LOGS:\n', joined)
  expect(joined).toContain('Found valid project data in key: old-project-data')
  expect(joined).toContain('Successfully migrated from old-project-data')
})
