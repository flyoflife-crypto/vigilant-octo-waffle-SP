import type { OnePagerData } from "@/types/onepager"
import {
  deleteProjectIDB,
  getAllProjectsIDB,
  getHistoryIDB,
  getProjectByIdIDB,
  getSettingIDB,
  isIndexedDBAvailable,
  saveHistoryIDB,
  saveProjectIDB,
  setSettingIDB,
} from "./storage-idb"
import type { HistoryState } from "./history"

export interface Project {
  id: string
  name: string
  data: OnePagerData
  createdAt: string
  updatedAt: string
}

export interface AppSettings {
  useIndexedDB: boolean
  [key: string]: unknown
}

// Storage keys
const ACTIVE_PROJECT_KEY = "mars-onepager-active"
const PROJECTS_KEY = "mars-onepager-projects"
const PROJECT_PREFIX = "mars-project-"
const HISTORY_PREFIX = "mars-history-"
const SETTINGS_KEY = "mars-onepager-settings"
const APP_SETTINGS_IDB_KEY = "app-settings"

const defaultSettings: AppSettings = { useIndexedDB: false }

export const WEEK_COUNT = 52
export const PERIOD_COUNT = 13

export const weekToPeriod = (weekIndex: number) => Math.min(13, Math.floor(weekIndex / 4) + 1)

export const QUARTER_MONTHS = [
  ["Jan", "Feb", "Mar"],
  ["Apr", "May", "Jun"],
  ["Jul", "Aug", "Sep"],
  ["Oct", "Nov", "Dec"],
]

export const QUARTER_PERIODS: number[][] = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
  [10, 11, 12, 13],
]

const isBrowser = () => typeof window !== "undefined"

function getSettingsLocal(): AppSettings {
  if (!isBrowser()) return defaultSettings
  try {
    const stored = localStorage.getItem(SETTINGS_KEY)
    if (stored) {
      return { ...defaultSettings, ...(JSON.parse(stored) as AppSettings) }
    }
  } catch (error) {
    console.error("[Storage] Failed to read local settings:", error)
  }
  return defaultSettings
}

function saveSettingsLocal(settings: AppSettings): void {
  if (!isBrowser()) return
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  } catch (error) {
    console.error("[Storage] Failed to save local settings:", error)
  }
}

function getActiveProjectIdLocal(): string | null {
  if (!isBrowser()) return null
  return localStorage.getItem(ACTIVE_PROJECT_KEY)
}

function setActiveProjectIdLocal(id: string | null): void {
  if (!isBrowser()) return
  if (id === null) {
    localStorage.removeItem(ACTIVE_PROJECT_KEY)
    return
  }
  localStorage.setItem(ACTIVE_PROJECT_KEY, id)
}

function saveHistoryLocal(projectId: string, history: HistoryState): void {
  if (!isBrowser()) return
  try {
    localStorage.setItem(`${HISTORY_PREFIX}${projectId}`, JSON.stringify(history))
  } catch (error) {
    console.error("[Storage] Failed to save history locally:", error)
  }
}

function loadHistoryLocal(projectId: string): HistoryState | null {
  if (!isBrowser()) return null
  try {
    const stored = localStorage.getItem(`${HISTORY_PREFIX}${projectId}`)
    if (stored) {
      return JSON.parse(stored) as HistoryState
    }
  } catch (error) {
    console.error("[Storage] Failed to load history locally:", error)
  }
  return null
}

/**
 * Migrate legacy data from old localStorage keys to new format
 */
function migrateLegacyData(): void {
  if (typeof window === "undefined") return

  try {
    const hasMigrated = localStorage.getItem("mars-migrated")
    if (hasMigrated) return

    console.log("🔍 [Migration] Searching for legacy data in localStorage...")
    
    let foundLegacyData = false
    const allKeys = Object.keys(localStorage)
    console.log(`[Migration] Found ${allKeys.length} keys in localStorage:`, allKeys)

    // Filter keys that might contain project data
    const candidateKeys = allKeys.filter(key => 
      key.includes('mars') || 
      key.includes('onepager') || 
      key.includes('project') || 
      key.includes('gantt') ||
      key.includes('data')
    )

    console.log("[Migration] Candidate keys:", candidateKeys)

    for (const key of candidateKeys) {
      // Skip system keys
      if (key === 'mars-migrated' || 
          key.startsWith('mars-history-') || 
          key.startsWith('pref.') ||
          key === 'tp' || 
          key === 'comments' ||
          key === 'artifacts' ||
          key === 'showNiicDate') {
        continue
      }

      const valueJson = localStorage.getItem(key)
      if (!valueJson) continue

      try {
        const data = JSON.parse(valueJson)
        
        // Check if this looks like OnePagerData
        const isValidData = (
          data &&
          typeof data === 'object' &&
          (data.projectName || data.yearGantt || data.quarterGantt || data.kpis)
        )

        if (isValidData) {
          console.log(`✅ [Migration] Found valid project data in key: ${key}`)
          
          const migratedProject: Project = {
            id: `project-migrated-${Date.now()}`,
            name: data.projectName || "Migrated Project",
            data: data,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }

          localStorage.setItem(PROJECT_PREFIX + migratedProject.id, JSON.stringify(migratedProject))
          
          const projectIds = [migratedProject.id]
          localStorage.setItem(PROJECTS_KEY, JSON.stringify(projectIds))
          localStorage.setItem(ACTIVE_PROJECT_KEY, migratedProject.id)

          foundLegacyData = true
          console.log(`✅ [Migration] Successfully migrated from ${key}`)
          break
        }
      } catch (e) {
        console.warn(`[Migration] Skipped key ${key}:`, e)
      }
    }

    localStorage.setItem("mars-migrated", "true")

    if (foundLegacyData) {
      console.log("✅✅✅ [Migration] Legacy data migration completed successfully!")
    } else {
      console.log("ℹ️ [Migration] No legacy data found, starting fresh")
    }
  } catch (error) {
    console.error("❌ [Migration] Migration failed:", error)
  }
}

let migrationAttempted = false
let migrationPromise: Promise<void> | null = null

async function getAllProjectsLocal(): Promise<Project[]> {
  if (!isBrowser()) return []
  migrateLegacyData()

  try {
    const projectsJson = localStorage.getItem(PROJECTS_KEY)
    if (!projectsJson) return []

    const projectIds: string[] = JSON.parse(projectsJson)
    const projects: Project[] = []

    for (const id of projectIds) {
      const projectJson = localStorage.getItem(PROJECT_PREFIX + id)
      if (projectJson) {
        try {
          projects.push(JSON.parse(projectJson))
        } catch (e) {
          console.error(`[Storage] Failed to parse project ${id}:`, e)
        }
      }
    }
    return projects
  } catch (error) {
    console.error("[Storage] Failed to load projects:", error)
    return []
  }
}

async function getProjectByIdLocal(id: string): Promise<Project | null> {
  if (!isBrowser() || !id) return null
  try {
    const projectJson = localStorage.getItem(PROJECT_PREFIX + id)
    if (!projectJson) return null
    return JSON.parse(projectJson)
  } catch (error) {
    console.error(`[Storage] Failed to get project ${id}:`, error)
    return null
  }
}

async function saveProjectLocal(project: Project): Promise<Project> {
  if (!isBrowser()) throw new Error("localStorage is only available in the browser")
  if (!project.id) {
    project.id = `project-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
    project.createdAt = new Date().toISOString()
  }

  const savedProject: Project = {
    ...project,
    updatedAt: new Date().toISOString(),
  }

  localStorage.setItem(PROJECT_PREFIX + savedProject.id, JSON.stringify(savedProject))

  const projectsJson = localStorage.getItem(PROJECTS_KEY)
  const projectIds: string[] = projectsJson ? JSON.parse(projectsJson) : []

  if (!projectIds.includes(savedProject.id)) {
    projectIds.push(savedProject.id)
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projectIds))
  }

  return savedProject
}

async function deleteProjectLocal(id: string): Promise<void> {
  if (!isBrowser() || !id) return

  try {
    localStorage.removeItem(PROJECT_PREFIX + id)

    const projectsJson = localStorage.getItem(PROJECTS_KEY)
    if (projectsJson) {
      const projectIds: string[] = JSON.parse(projectsJson)
      const filtered = projectIds.filter((pid) => pid !== id)
      localStorage.setItem(PROJECTS_KEY, JSON.stringify(filtered))
    }

    if (getActiveProjectIdLocal() === id) {
      localStorage.removeItem(ACTIVE_PROJECT_KEY)
    }
  } catch (error) {
    console.error(`[Storage] Failed to delete project ${id}:`, error)
  }
}

async function ensureIndexedDBMigration(): Promise<void> {
  if (migrationAttempted) return migrationPromise ?? Promise.resolve()
  migrationAttempted = true
  if (!isBrowser() || !isIndexedDBAvailable()) return

  migrationPromise = (async () => {
    const localSettings = getSettingsLocal()
    if (localSettings.useIndexedDB) return

    const localProjects = await getAllProjectsLocal()
    const activeId = getActiveProjectIdLocal()
    try {
      if (!localProjects.length && !activeId) {
        const updatedSettings: AppSettings = { ...localSettings, useIndexedDB: true }
        await setSettingIDB(APP_SETTINGS_IDB_KEY, updatedSettings)
        saveSettingsLocal(updatedSettings)
        return
      }

      for (const project of localProjects) {
        await saveProjectIDB(project)
        const history = loadHistoryLocal(project.id)
        if (history) {
          await saveHistoryIDB(project.id, history)
        }
      }

      if (activeId) {
        await setSettingIDB(ACTIVE_PROJECT_KEY, activeId)
      }

      const updatedSettings: AppSettings = { ...localSettings, useIndexedDB: true }
      await setSettingIDB(APP_SETTINGS_IDB_KEY, updatedSettings)
      saveSettingsLocal(updatedSettings)
    } catch (error) {
      console.error("[Storage] Failed to migrate to IndexedDB:", error)
    }
  })()

  return migrationPromise
}

export async function getSettings(): Promise<AppSettings> {
  if (!isBrowser()) return defaultSettings
  const local = getSettingsLocal()
  let merged = { ...defaultSettings, ...local }

  if (!isIndexedDBAvailable()) return merged

  try {
    const stored = await getSettingIDB(APP_SETTINGS_IDB_KEY)
    if (stored) {
      merged = { ...merged, ...(stored as AppSettings) }
      saveSettingsLocal(merged)
    }
  } catch (error) {
    console.error("[Storage] Failed to read settings from IndexedDB:", error)
  }

  return merged
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  if (!isBrowser()) return
  const merged = { ...defaultSettings, ...settings }
  saveSettingsLocal(merged)

  if (!isIndexedDBAvailable()) return
  try {
    await setSettingIDB(APP_SETTINGS_IDB_KEY, merged)
  } catch (error) {
    console.error("[Storage] Failed to save settings to IndexedDB:", error)
  }
}

export async function shouldUseIndexedDB(): Promise<boolean> {
  if (!isBrowser() || !isIndexedDBAvailable()) return false
  const settings = await getSettings()
  return !!settings.useIndexedDB
}

export async function getAllProjects(): Promise<Project[]> {
  if (!isBrowser()) return []

  await ensureIndexedDBMigration()

  if (await shouldUseIndexedDB()) {
    try {
      return await getAllProjectsIDB()
    } catch (error) {
      console.error("[Storage] IndexedDB getAllProjects failed, falling back:", error)
    }
  }

  return await getAllProjectsLocal()
}

export async function getProjectById(id: string): Promise<Project | null> {
  if (!id || !isBrowser()) return null

  await ensureIndexedDBMigration()

  if (await shouldUseIndexedDB()) {
    try {
      return await getProjectByIdIDB(id)
    } catch (error) {
      console.error(`[Storage] IndexedDB getProjectById failed (${id}), falling back:`, error)
    }
  }

  return await getProjectByIdLocal(id)
}

export async function getActiveProjectId(): Promise<string | null> {
  if (!isBrowser()) return null

  await ensureIndexedDBMigration()

  if (await shouldUseIndexedDB()) {
    try {
      const id = await getSettingIDB(ACTIVE_PROJECT_KEY)
      if (typeof id === "string") {
        return id
      }
    } catch (error) {
      console.error("[Storage] IndexedDB getActiveProjectId failed, falling back:", error)
    }
  }

  return getActiveProjectIdLocal()
}

export async function setActiveProjectId(id: string | null): Promise<void> {
  setActiveProjectIdLocal(id)
  if (!isBrowser()) return

  if (await shouldUseIndexedDB()) {
    try {
      await setSettingIDB(ACTIVE_PROJECT_KEY, id)
    } catch (error) {
      console.error("[Storage] IndexedDB setActiveProjectId failed, keeping local backup:", error)
    }
  }
}

export async function saveProject(project: Project): Promise<Project> {
  if (!isBrowser()) {
    throw new Error("Storage is only available in the browser")
  }

  await ensureIndexedDBMigration()

  if (await shouldUseIndexedDB()) {
    try {
      return await saveProjectIDB(project)
    } catch (error) {
      console.error("[Storage] IndexedDB saveProject failed, falling back to localStorage:", error)
    }
  }

  return await saveProjectLocal(project)
}

export async function deleteProject(id: string): Promise<void> {
  if (!isBrowser() || !id) return

  await ensureIndexedDBMigration()

  if (await shouldUseIndexedDB()) {
    try {
      await deleteProjectIDB(id)
      return
    } catch (error) {
      console.error("[Storage] IndexedDB deleteProject failed, falling back:", error)
    }
  }

  await deleteProjectLocal(id)
}

export async function saveHistoryRecord(projectId: string, history: HistoryState): Promise<void> {
  if (!isBrowser()) return

  await ensureIndexedDBMigration()

  if (await shouldUseIndexedDB()) {
    try {
      await saveHistoryIDB(projectId, history)
      return
    } catch (error) {
      console.error("[Storage] IndexedDB saveHistory failed, falling back:", error)
    }
  }

  saveHistoryLocal(projectId, history)
}

export async function getHistoryRecord(projectId: string): Promise<HistoryState | null> {
  if (!isBrowser()) return null

  await ensureIndexedDBMigration()

  if (await shouldUseIndexedDB()) {
    try {
      const history = await getHistoryIDB(projectId)
      if (history) return history
    } catch (error) {
      console.error("[Storage] IndexedDB getHistory failed, falling back:", error)
    }
  }

  return loadHistoryLocal(projectId)
}

export function createNewProject(name: string, templateData?: OnePagerData): Project {
  const defaultData: OnePagerData = templateData || {
    projectName: name,
    niicDate: new Date().toISOString().slice(0, 7),
    kpis: [
      { label: "Money Plan", value: "1000", color: "green" },
      { label: "Money Fact", value: "850", color: "yellow" },
      { label: "Benefits", value: "150", color: "green" },
    ],
    roles: {
      sponsor: "Sponsor Name",
      productOwner: "PO Name",
      projectManager: "PM Name",
    },
    projectStatus: "green",
    goal: "Project goal and objectives",
    description: "Detailed project description and context",
    yearGantt: {
      labels: [
        { top: "Jan", bottom: "P01 | Q1" },
        { top: "Feb", bottom: "P02 | Q1" },
        { top: "Mar", bottom: "P03 | Q1" },
        { top: "Apr", bottom: "P04 | Q2" },
        { top: "May", bottom: "P05 | Q2" },
        { top: "Jun", bottom: "P06 | Q2" },
        { top: "Jul", bottom: "P07 | Q3" },
        { top: "Aug", bottom: "P08 | Q3" },
        { top: "Sep", bottom: "P09 | Q3" },
        { top: "Oct", bottom: "P10 | Q4" },
        { top: "Nov", bottom: "P11 | Q4" },
        { top: "Dec", bottom: "P12 | Q4" },
        { top: "Dec", bottom: "P13 | Q4" },
      ],
      rows: ["Workstream 1", "Workstream 2", "Workstream 3"],
      bars: [
        { row: 0, start: 0, end: 3, label: "Phase 1", status: "green" },
        { row: 1, start: 4, end: 7, label: "Phase 2", status: "yellow" },
        { row: 2, start: 8, end: 11, label: "Phase 3", status: "green" },
      ],
      milestones: [
        { row: null, at: 2, label: "Q1 Review" },
        { row: null, at: 5, label: "Q2 Review" },
        { row: null, at: 8, label: "Q3 Review" },
        { row: null, at: 12, label: "Year End" },
      ],
      nowCol: 5,
      nowFrac: 0.5,
    },
    quarterGantt: {
      labels: Array.from({ length: 52 }, (_, i) => {
        const period = weekToPeriod(i)
        const week = (i % 4) + 1
        const quarterIndex = Math.floor(i / 12)
        const monthInQuarter = Math.floor((i % 12) / 4)
        const month = QUARTER_MONTHS[quarterIndex]?.[monthInQuarter] || "Dec"
        return {
          top: `P${period.toString().padStart(2, "0")}`,
          bottom: `${month} | W${week}`,
        }
      }),
      rows: ["Task 1", "Task 2", "Task 3"],
      bars: [
        { row: 0, start: 0, end: 3, label: "Sprint 1", status: "green" },
        { row: 1, start: 4, end: 7, label: "Sprint 2", status: "green" },
      ],
      milestones: [{ row: null, at: 8, label: "Q1 End" }],
      nowCol: 5,
      nowFrac: 0.5,
    },
    selectedQuarter: 0,
    done: ["Completed task 1", "Completed task 2"],
    next: ["Upcoming task 1", "Upcoming task 2"],
    teamMetrics: [
      { label: "Velocity", value: "85%", color: "green" },
      { label: "Quality", value: "92%", color: "green" },
      { label: "Budget", value: "78%", color: "yellow" },
    ],
    risks: [
      { risk: "Vendor dependency", impact: "red", mitigation: "Multi-vendor strategy" },
      { risk: "Resource availability", impact: "yellow", mitigation: "Cross-training team members" },
    ],
    artifacts: [
      { label: "📄 Passport", url: "#" },
      { label: "👥 Team", url: "#" },
      { label: "📋 Task Tracking", url: "#" },
      { label: "📑 NIIC Presentation", url: "#" },
    ],
    comments: "",
    extraSections: [],
  }

  console.log(`[Storage] Created new project template: ${name}`)
  return {
    id: "",
    name,
    data: defaultData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

// Debug utilities
export function debugLocalStorage(): void {
  if (typeof window === "undefined") return

  console.log("=== 🔍 localStorage Debug ===")
  console.log("Total keys:", localStorage.length)
  
  const data: Record<string, any> = {}
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key) {
      const value = localStorage.getItem(key)
      try {
        data[key] = JSON.parse(value!)
      } catch {
        data[key] = value
      }
    }
  }
  
  console.log("All localStorage data:", data)
  
  const projectKeys = Object.keys(data).filter(k => 
    k.includes('mars') || k.includes('onepager') || k.includes('project')
  )
  console.log("Project-related keys:", projectKeys)
}
