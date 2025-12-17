"use client"

import { useState, useEffect } from "react"
import { X, UserPlus } from "lucide-react"
import { Input } from "@/components/ui/input"
import type { OnePagerData, Roles } from "@/types/onepager"

interface RolesStripProps {
  data: OnePagerData
  setData: (data: OnePagerData) => void
  className?: string
}

type RoleKey = keyof Roles
const ROLE_LABELS: Record<RoleKey, string> = {
  sponsor: "Sponsor",
  productOwner: "Product Owner",
  projectManager: "Project Manager",
}

export function RolesStrip({ data, setData, className }: RolesStripProps) {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)
  const [editingLabel, setEditingLabel] = useState<{ type: 'builtin' | 'extra'; key: string } | null>(null)

  useEffect(() => {
    const close = () => setContextMenu(null)
    document.addEventListener("click", close)
    return () => document.removeEventListener("click", close)
  }, [])

  const updateRole = (key: RoleKey, val: string) => {
    setData({ ...data, roles: { ...data.roles, [key]: val } })
  }

  const addExtraRole = () => {
    const id = Date.now().toString()
    const newRole = { id, label: 'Role', name: 'Name' }
    setData({ ...data, extraRoles: [...(data.extraRoles || []), newRole] })
    setContextMenu(null)
  }

  const removeExtraRole = (id: string) => {
    setData({ ...data, extraRoles: (data.extraRoles || []).filter(r => r.id !== id) })
  }

  const updateExtraRole = (id: string, field: 'label' | 'name', val: string) => {
    const newRoles = (data.extraRoles || []).map(r => r.id === id ? { ...r, [field]: val } : r)
    setData({ ...data, extraRoles: newRoles })
  }

  // Show all non-empty built-in roles + any extraRoles
  const activeBuiltins = (Object.keys(data.roles) as RoleKey[]).filter(k => (data.roles[k] ?? '').trim())
  const activeExtra = data.extraRoles || []
  const missingRoles = (Object.keys(ROLE_LABELS) as RoleKey[]).filter(k => !(data.roles[k] ?? '').trim())

  const handleAddBuiltin = (key: RoleKey) => {
    updateRole(key, "Name")
    setContextMenu(null)
  }

  return (
    <div 
      className={`relative p-3 rounded-xl border-2 border-dashed border-gray-200 hover:border-blue-200 transition-colors bg-gray-50/50 ${className ?? ''}`}
      onContextMenu={(e) => { e.preventDefault(); setContextMenu({ x: e.clientX, y: e.clientY }) }}
    >
      <div className="absolute -top-3 left-3 bg-white px-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
        Team Roles
      </div>

      <div className="flex flex-wrap gap-3">
        {activeBuiltins.map(key => (
          <div key={key} className="group relative flex items-center gap-2 bg-white px-3 py-2 rounded-full border border-gray-200 shadow-sm pr-4 min-w-0 w-[calc(50%-0.75rem)] overflow-visible">
            <div className="flex flex-col items-end border-r border-gray-100 pr-2 shrink-0">
               {editingLabel?.type === 'builtin' && editingLabel.key === key ? (
                 <input
                   autoFocus
                   onBlur={(e) => { setEditingLabel(null); setData({ ...data, roleLabels: { ...(data.roleLabels || {}), [key]: e.target.value } }) }}
                   defaultValue={(data.roleLabels && data.roleLabels[key]) ? data.roleLabels[key] : ROLE_LABELS[key]}
                   className="text-[9px] font-bold uppercase text-gray-400 tracking-wider leading-none bg-transparent border-none p-0 truncate"
                 />
               ) : (
                 <span onDoubleClick={() => setEditingLabel({ type: 'builtin', key })} className="text-[9px] font-bold uppercase text-gray-400 tracking-wider leading-none truncate">
                   {data.roleLabels && data.roleLabels[key] ? data.roleLabels[key] : ROLE_LABELS[key]}
                 </span>
               )}
            </div>
            <div className="flex-1 min-w-0 overflow-hidden">
              <Input 
                value={data.roles[key] ?? ''}
                onChange={(e) => updateRole(key, e.target.value)}
                className="h-auto p-0 border-none shadow-none text-sm font-semibold w-full focus-visible:ring-0 truncate overflow-hidden whitespace-nowrap"
                placeholder="Name..."
                title={data.roles[key] ?? ''}
              />
            </div>
            <button 
              onClick={() => updateRole(key, "")}
              title="Remove"
              className="absolute -top-3 -right-3 z-10 bg-white text-gray-400 hover:text-red-500 rounded-full border shadow-sm opacity-0 group-hover:opacity-100 transition-opacity p-0.5 export-hidden"
            >
              <X size={12} />
            </button>
          </div>
        ))}

        {activeExtra.map(r => (
          <div key={r.id} className="group relative flex items-center gap-2 bg-white px-3 py-2 rounded-full border border-gray-200 shadow-sm pr-4 min-w-0 w-[calc(50%-0.75rem)] overflow-visible">
            <div className="flex flex-col items-end border-r border-gray-100 pr-2 shrink-0">
               {editingLabel?.type === 'extra' && editingLabel.key === r.id ? (
                 <input
                   autoFocus
                   onBlur={(e) => { setEditingLabel(null); updateExtraRole(r.id, 'label', e.target.value) }}
                   defaultValue={r.label}
                   className="text-[9px] font-bold uppercase text-gray-400 tracking-wider leading-none bg-transparent border-none p-0 truncate"
                 />
               ) : (
                 <span onDoubleClick={() => setEditingLabel({ type: 'extra', key: r.id })} className="text-[9px] font-bold uppercase text-gray-400 tracking-wider leading-none truncate">
                   {r.label}
                 </span>
               )}
            </div>
            <div className="flex-1 min-w-0 overflow-hidden">
              <Input 
                value={r.name}
                onChange={(e) => updateExtraRole(r.id, 'name', e.target.value)}
                className="h-auto p-0 border-none shadow-none text-sm font-semibold w-full focus-visible:ring-0 truncate overflow-hidden whitespace-nowrap"
                placeholder="Name..."
                title={r.name}
              />
            </div>
            <button 
              onClick={() => removeExtraRole(r.id)}
              title="Remove"
              className="absolute -top-3 -right-3 z-10 bg-white text-gray-400 hover:text-red-500 rounded-full border shadow-sm opacity-0 group-hover:opacity-100 transition-opacity p-0.5 export-hidden"
            >
              <X size={12} />
            </button>
          </div>
        ))}

        <button
          onClick={(e) => { e.stopPropagation(); addExtraRole() }}
          className="flex items-center justify-center h-9 px-3 rounded-full border-2 border-dashed border-gray-300 text-gray-400 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-500 transition-all export-hidden"
          title="Add Role"
        >
          <UserPlus size={16} />
        </button>
      </div>

      {contextMenu && missingRoles.length > 0 && (
        <div 
          className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-100 py-1 min-w-[140px] animate-in fade-in zoom-in-95 export-hidden"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <div className="px-3 py-1.5 text-xs font-bold text-gray-500 border-b bg-gray-50">Add Role</div>
          {missingRoles.map(key => (
            <button 
              key={key} 
              onClick={() => handleAddBuiltin(key as RoleKey)}
              className="w-full text-left px-3 py-2 text-xs hover:bg-blue-50 flex items-center gap-2 text-gray-700"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              {ROLE_LABELS[key as RoleKey]}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
