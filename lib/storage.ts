import type { OnePagerData } from "@/types/onepager"

// --- Types ---
export interface Project {
  id: string
  name: string
  data: OnePagerData
  createdAt: string
  updatedAt: string
}

// --- Constants ---
const STORAGE_KEY = "mars-onepager-projects"
const ACTIVE_PROJECT_KEY = "mars-onepager-active"

// Detect if we are running in a standalone environment (Localhost, GitHub Pages, or File)
const IS_STANDALONE = typeof window !== 'undefined' && (
  window.location.hostname === 'localhost' || 
  window.location.hostname.includes('github.io') ||
  window.location.protocol === 'file:' ||
  window.location.hostname === '127.0.0.1'
)

// --- Helper: Create Empty Project Data ---
function createDefaultData(title: string): OnePagerData {
  return {
    projectName: title,
    niicDate: new Date().toISOString().slice(0, 7),
    projectStatus: "green",
    kpis: [
      { label: "Budget", value: "100k", color: "green" },
      { label: "Progress", value: "0%", color: "yellow" }
    ],
    yearGantt: {
      labels: [], 
      rows: ["Workstream 1", "Workstream 2"], 
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

// --- Local Storage Helpers ---
function getLocalProjects(): Project[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (e) {
    console.error("LocalStorage read error:", e)
    return []
  }
}

function saveLocalProjects(projects: Project[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
  } catch (e) {
    console.error("LocalStorage write error:", e)
  }
}

// --- Main API Functions ---

export async function getAllProjects(): Promise<Project[]> {
  // Immediate fallback for standalone modes to prevent hanging
  if (IS_STANDALONE) {
    console.log("🚀 Standalone mode detected: Using LocalStorage")
    return getLocalProjects()
  }

  try {
    // Placeholder for actual SharePoint logic if needed later.
    // For now, we default to LocalStorage to prevent crashes.
    throw new Error("SharePoint connection not configured")
  } catch (error) {
    console.warn("⚠️ SharePoint unavailable, falling back to LocalStorage")
    return getLocalProjects()
  }
}

export async function getProjectById(id: string): Promise<Project | null> {
  const projects = await getAllProjects()
  return projects.find(p => p.id === id) || null
}

export async function saveProject(project: Project): Promise<Project> {
  const projects = getLocalProjects()
  const index = projects.findIndex(p => p.id === project.id)
  
  const updatedProject = {
    ...project,
    id: project.id || Date.now().toString(),
    updatedAt: new Date().toISOString()
  }

  if (index >= 0) {
    projects[index] = updatedProject
  } else {
    if (!updatedProject.createdAt) updatedProject.createdAt = new Date().toISOString()
    projects.push(updatedProject)
  }

  saveLocalProjects(projects)
  console.log("💾 Project saved to LocalStorage:", updatedProject.name)
  return updatedProject
}

export async function deleteProject(id: string): Promise<void> {
  const projects = getLocalProjects()
  const filtered = projects.filter(p => p.id !== id)
  saveLocalProjects(filtered)
  
  if (getActiveProjectId() === id) {
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
