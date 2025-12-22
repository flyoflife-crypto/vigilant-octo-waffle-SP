import { openDB, DBSchema, IDBPDatabase } from 'idb'
import type { OnePagerData } from '@/types/onepager'
import type { Project } from './storage'
import type { HistoryState } from './history'

interface MarsDB extends DBSchema {
  projects: {
    key: string
    value: Project
    indexes: { 'by-date': string }
  }
  history: {
    key: string
    value: { projectId: string; history: HistoryState }
  }
  settings: {
    key: string
    value: any
  }
}

let dbInstance: IDBPDatabase<MarsDB> | null = null

async function getDB(): Promise<IDBPDatabase<MarsDB>> {
  if (dbInstance) return dbInstance

  dbInstance = await openDB<MarsDB>('mars-onepager', 1, {
    upgrade(db) {
      const projectStore = db.createObjectStore('projects', { keyPath: 'id' })
      projectStore.createIndex('by-date', 'updatedAt')
      db.createObjectStore('history', { keyPath: 'projectId' })
      db.createObjectStore('settings')
    },
  })

  return dbInstance
}

export async function saveProjectIDB(project: Project): Promise<Project> {
  const db = await getDB()
  
  if (!project.id) {
    project.id = `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    project.createdAt = new Date().toISOString()
  }

  const savedProject: Project = {
    ...project,
    updatedAt: new Date().toISOString(),
  }

  await db.put('projects', savedProject)
  return savedProject
}

export async function getAllProjectsIDB(): Promise<Project[]> {
  const db = await getDB()
  return await db.getAll('projects')
}

export async function getProjectByIdIDB(id: string): Promise<Project | null> {
  const db = await getDB()
  return (await db.get('projects', id)) ?? null
}

export async function deleteProjectIDB(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('projects', id)
  await db.delete('history', id)
}

export async function saveHistoryIDB(projectId: string, history: HistoryState): Promise<void> {
  const db = await getDB()
  await db.put('history', { projectId, history })
}

export async function getHistoryIDB(projectId: string): Promise<HistoryState | null> {
  const db = await getDB()
  const record = await db.get('history', projectId)
  return record?.history ?? null
}

export async function setSettingIDB(key: string, value: any): Promise<void> {
  const db = await getDB()
  await db.put('settings', value, key)
}

export async function getSettingIDB(key: string): Promise<any> {
  const db = await getDB()
  return await db.get('settings', key)
}

export function isIndexedDBAvailable(): boolean {
  try {
    return typeof indexedDB !== 'undefined'
  } catch {
    return false
  }
}
