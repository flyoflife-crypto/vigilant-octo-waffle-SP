import type { OnePagerData } from "@/types/onepager"

export interface Project {
  id: string
  name: string
  data: OnePagerData
  createdAt: string
  updatedAt: string
}

// Storage keys
const ACTIVE_PROJECT_KEY = "mars-onepager-active"
const PROJECTS_KEY = "mars-onepager-projects"
const PROJECT_PREFIX = "mars-project-"

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

export async function getAllProjects(): Promise<Project[]> {
  if (typeof window === "undefined") return []

  migrateLegacyData()

  try {
    const projectsJson = localStorage.getItem(PROJECTS_KEY)
    if (!projectsJson) {
      console.log("[Storage] No projects found in localStorage")
      return []
    }

    const projectIds: string[] = JSON.parse(projectsJson)
    console.log(`[Storage] Loading ${projectIds.length} projects`)
    
    const projects: Project[] = []

    for (const id of projectIds) {
      const projectJson = localStorage.getItem(PROJECT_PREFIX + id)
      if (projectJson) {
        try {
          const project = JSON.parse(projectJson)
          projects.push(project)
        } catch (e) {
          console.error(`[Storage] Failed to parse project ${id}:`, e)
        }
      }
    }

    console.log(`[Storage] Loaded ${projects.length} projects successfully`)
    return projects
  } catch (error) {
    console.error("[Storage] Failed to load projects:", error)
    return []
  }
}

export async function getProjectById(id: string): Promise<Project | null> {
  if (!id || typeof window === "undefined") return null

  try {
    const projectJson = localStorage.getItem(PROJECT_PREFIX + id)
    if (!projectJson) {
      console.warn(`[Storage] Project ${id} not found`)
      return null
    }
    return JSON.parse(projectJson)
  } catch (error) {
    console.error(`[Storage] Failed to get project ${id}:`, error)
    return null
  }
}

export function getActiveProjectId(): string | null {
  if (typeof window === "undefined") return null
  const id = localStorage.getItem(ACTIVE_PROJECT_KEY)
  console.log(`[Storage] Active project ID: ${id}`)
  return id
}

export function setActiveProjectId(id: string): void {
  if (typeof window === "undefined") return
  localStorage.setItem(ACTIVE_PROJECT_KEY, id)
  console.log(`[Storage] Set active project: ${id}`)
}

export async function saveProject(project: Project): Promise<Project> {
  if (typeof window === "undefined") {
    throw new Error("localStorage is only available in the browser")
  }

  try {
    if (!project.id) {
      project.id = `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      project.createdAt = new Date().toISOString()
      console.log(`[Storage] Created new project ID: ${project.id}`)
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
      console.log(`[Storage] Added project ${savedProject.id} to projects list`)
    }

    console.log(`[Storage] Saved project ${savedProject.id} successfully`)
    return savedProject
  } catch (error) {
    console.error("[Storage] Failed to save project:", error)
    throw error
  }
}

export async function deleteProject(id: string): Promise<void> {
  if (!id || typeof window === "undefined") return

  try {
    localStorage.removeItem(PROJECT_PREFIX + id)

    const projectsJson = localStorage.getItem(PROJECTS_KEY)
    if (projectsJson) {
      const projectIds: string[] = JSON.parse(projectsJson)
      const filtered = projectIds.filter((pid) => pid !== id)
      localStorage.setItem(PROJECTS_KEY, JSON.stringify(filtered))
    }

    if (getActiveProjectId() === id) {
      localStorage.removeItem(ACTIVE_PROJECT_KEY)
    }

    console.log(`[Storage] Deleted project ${id}`)
  } catch (error) {
    console.error(`[Storage] Failed to delete project ${id}:`, error)
  }
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