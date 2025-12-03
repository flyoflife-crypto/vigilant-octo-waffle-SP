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
  return {
    projectName: title,
    niicDate: new Date().toISOString().slice(0, 7),
    projectStatus: "green",
    kpis: [
      { label: "Budget", value: "0", color: "green" },
      { label: "Progress", value: "0%", color: "yellow" }
    ],
    yearGantt: {
      labels: [], 
      rows: ["Stream 1", "Stream 2"], 
      bars: [], 
      milestones: [], 
      nowCol: 0, 
      nowFrac: 0 
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
    roles: { sponsor: "", productOwner: "", projectManager: "" },
    goal: "",
    description: "",
    extraSections: []
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
  
  const updatedProject = {
    ...project,
    id: project.id || Date.now().toString(), // Ensure ID exists
    updatedAt: new Date().toISOString()
  }

  const index = projects.findIndex(p => p.id === updatedProject.id)
  
  if (index >= 0) {
    projects[index] = updatedProject
  } else {
    if (!updatedProject.createdAt) updatedProject.createdAt = new Date().toISOString()
    projects.push(updatedProject)
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
    id: Date.now().toString(),
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
