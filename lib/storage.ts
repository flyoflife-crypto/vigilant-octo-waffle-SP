import type { OnePagerData } from "@/types/onepager"

// --- Types ---
export interface Project {
  id: string
  name: string
  data: OnePagerData
  createdAt: string
  updatedAt: string
}

// --- Constants (REQUIRED for other components) ---
const STORAGE_KEY = "mars-onepager-projects"
const ACTIVE_PROJECT_KEY = "mars-onepager-active"

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
  [1, 2, 3], // Q1
  [4, 5, 6], // Q2
  [7, 8, 9], // Q3
  [10, 11, 12, 13], // Q4
]

// --- Helper: Create Default Data ---
function createDefaultData(title: string): OnePagerData {
  // Generate 12 month labels for year gantt (top: month, bottom: period P and quarter)
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const yearLabels = months.map((m, idx) => {
    const period = String(idx + 1).padStart(2, "0") // P01..P12
    const quarter = Math.floor(idx / 3) + 1
    return { top: m, bottom: `P${period} | Q${quarter}` }
  })

  // Calculate current month for nowCol and fraction within month
  const now = new Date()
  const currentMonth = now.getMonth()
  const startOfMonth = new Date(now.getFullYear(), currentMonth, 1)
  const daysInMonth = new Date(now.getFullYear(), currentMonth + 1, 0).getDate()
  const dayOfMonth = now.getDate() - 1
  const currentMonthFrac = Math.min(1, Math.max(0, dayOfMonth / Math.max(1, daysInMonth)))

  return {
    projectName: title,
    niicDate: new Date().toISOString().slice(0, 7),
    statusDate: new Date().toISOString().slice(0, 10),
    projectStatus: "green",
    kpis: [
      { label: "Budget", value: "0", color: "green" },
      { label: "Progress", value: "0%", color: "yellow" }
    ],
    yearGantt: {
      labels: yearLabels,
      rows: ["Stream 1", "Stream 2"], 
      bars: [], 
      milestones: [], 
      nowCol: currentMonth, 
      nowFrac: currentMonthFrac 
    },
    quarterGantt: {
      labels: [], 
      rows: ["Task 1", "Task 2"], 
      bars: [], 
      milestones: [], 
      nowCol: 0, 
      nowFrac: 0 
    },
    selectedQuarter: 0,
    done: [],
    next: [],
    teamMetrics: [],
    risks: [],
    artifacts: [],
    comments: "",
    roles: { sponsor: null, productOwner: null, projectManager: null },
    extraRoles: [],
    roleLabels: {},
    goal: "",
    description: "",
    extraSections: [],
    showArtifacts: true,
    showNiicDate: true,
  }
}

// --- Local Storage Implementation ---

function getLocalProjects(): Project[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (e) {
    console.error("LS Read Error:", e)
    return []
  }
}

function saveLocalProjects(projects: Project[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
  } catch (e) {
    console.error("LS Write Error:", e)
  }
}

// --- Public API (Identical signature to old API) ---

export async function getAllProjects(): Promise<Project[]> {
  // Simulate async to match interface
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(getLocalProjects())
    }, 100)
  })
}

export async function getProjectById(id: string): Promise<Project | null> {
  const projects = getLocalProjects()
  return projects.find(p => p.id === id) || null
}

export async function saveProject(project: Project): Promise<Project> {
  const projects = getLocalProjects()
  
  // CRITICAL FIX: Never generate a new ID for an existing project.
  // Only generate an ID when this is a brand-new project (no createdAt and no id).
  let projectId = project.id

  if (!projectId) {
    if (!project.createdAt) {
      // New project, generate ID with randomness to prevent collisions
      projectId = `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
      console.log('➕ Generating new project ID:', projectId)
    } else {
      // Project has createdAt but lost its ID - attempt to recover by matching createdAt
      const match = projects.find(p => p.createdAt === project.createdAt)
      if (match) {
        projectId = match.id
        console.log('✅ Recovered missing project ID:', projectId)
      } else {
        // As fallback generate a new ID but log error - this should be rare
        projectId = `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
        console.error('❌ Project missing ID and recovery failed - generating new ID:', projectId)
      }
    }
  }

  const updatedProject: Project = {
    ...project,
    id: projectId!,
    createdAt: project.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  const index = projects.findIndex(p => p.id === updatedProject.id)
  
  if (index >= 0) {
    // Update existing project
    projects[index] = updatedProject
    console.log(`📝 Updated project: ${updatedProject.name} (ID: ${updatedProject.id})`)
  } else {
    // Add new project
    projects.push(updatedProject)
    console.log(`➕ Created new project: ${updatedProject.name} (ID: ${updatedProject.id})`)
  }

  saveLocalProjects(projects)
  return updatedProject
}

export async function deleteProject(id: string): Promise<void> {
  const projects = getLocalProjects()
  const filtered = projects.filter(p => p.id !== id)
  saveLocalProjects(filtered)
  
  // Clear active if deleted
  if (typeof window !== "undefined" && localStorage.getItem(ACTIVE_PROJECT_KEY) === id) {
    localStorage.removeItem(ACTIVE_PROJECT_KEY)
  }
}

export function createNewProject(name: string): Project {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
    name,
    data: createDefaultData(name),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
}

export function getActiveProjectId(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(ACTIVE_PROJECT_KEY)
}

export function setActiveProjectId(id: string) {
  if (typeof window === "undefined") return
  localStorage.setItem(ACTIVE_PROJECT_KEY, id)
}
