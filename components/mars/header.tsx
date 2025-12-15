"use client"

import { useEffect, useMemo, useState } from "react"
import type React from "react"
import { Crown, Edit3, MoreVertical, UserCheck, Users, X } from "lucide-react"
import type { OnePagerData, Roles, StatusColor } from "@/types/onepager"

interface HeaderProps {
  data: OnePagerData
  setData: (data: OnePagerData) => void
}

const STATUS_OPTIONS: { value: StatusColor; label: string; helper: string }[] = [
  { value: "green", label: "On Track", helper: "All good" },
  { value: "yellow", label: "At Risk", helper: "Needs attention" },
  { value: "red", label: "Delayed", helper: "Action required" },
]

const roleMeta: { key: keyof Roles; label: string; Icon: typeof Users }[] = [
  { key: "sponsor", label: "Sponsor", Icon: Crown },
  { key: "productOwner", label: "Product Owner", Icon: UserCheck },
  { key: "projectManager", label: "Project Manager", Icon: Users },
]

const formatMonth = (value: string) => {
  if (!value) return ""
  const date = new Date(`${value}-01`)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(date)
}

const formatDate = (value: string) => {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "2-digit" }).format(date)
}

export function Header({ data, setData }: HeaderProps) {
  const [editingRole, setEditingRole] = useState<keyof Roles | null>(null)
  const [roleMenu, setRoleMenu] = useState<{ role: keyof Roles; x: number; y: number } | null>(null)
  const [areaMenu, setAreaMenu] = useState<{ x: number; y: number } | null>(null)

  const roles = useMemo<Roles>(() => data.roles ?? { sponsor: "", productOwner: "", projectManager: "" }, [data.roles])

  useEffect(() => {
    const closeMenus = () => {
      setRoleMenu(null)
      setAreaMenu(null)
      setEditingRole(null)
    }
    document.addEventListener("click", closeMenus)
    return () => document.removeEventListener("click", closeMenus)
  }, [])

  const updateProjectName = (name: string) => {
    setData({ ...data, projectName: name || "Untitled Project" })
  }

  const updateNiicDate = (date: string) => {
    setData({ ...data, niicDate: date })
  }

  const updateStatusDate = (date: string) => {
    setData({ ...data, statusDate: date })
  }

  const updateStatus = (status: StatusColor) => {
    setData({ ...data, projectStatus: status })
  }

  const updateKpi = (label: string, value: string) => {
    const idx = data.kpis.findIndex((k) => k.label.toLowerCase() === label.toLowerCase())
    const updated = [...data.kpis]
    if (idx >= 0) updated[idx] = { ...updated[idx], value }
    else updated.unshift({ label, value, color: label.toLowerCase() === "progress" ? "yellow" : "green" })
    setData({ ...data, kpis: updated })
  }

  const updateRole = (key: keyof Roles, value: string) => {
    setData({ ...data, roles: { ...roles, [key]: value } })
  }

  const handleRoleContext = (e: React.MouseEvent, key: keyof Roles) => {
    e.preventDefault()
    setRoleMenu({ role: key, x: e.clientX, y: e.clientY })
  }

  const handleAreaContext = (e: React.MouseEvent) => {
    e.preventDefault()
    const hasEmpty = roleMeta.some((r) => !roles[r.key])
    if (!hasEmpty) return
    setAreaMenu({ x: e.clientX, y: e.clientY })
  }

  const renderRoleBubble = (key: keyof Roles, label: string, Icon: typeof Users) => {
    const value = roles[key] || ""
    const isEditing = editingRole === key

    return (
      <div
        key={key}
        className="relative rounded-2xl bg-white shadow-sm border border-gray-200 px-4 py-3 min-w-[180px] cursor-text"
        onContextMenu={(e) => handleRoleContext(e, key)}
        onClick={(e) => {
          e.stopPropagation()
          setEditingRole(key)
        }}
      >
        <button
          type="button"
          className="absolute right-2 top-2 text-gray-400 hover:text-gray-700"
          onClick={(e) => {
            e.stopPropagation()
            updateRole(key, "")
          }}
          aria-label={`Clear ${label}`}
        >
          <X className="w-4 h-4" />
        </button>
        <div className="flex items-start gap-2">
          <div className="mt-0.5">
            <Icon className="w-5 h-5 text-[#0909A8]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] uppercase tracking-wide text-gray-500">{label}</div>
            {isEditing ? (
              <input
                autoFocus
                defaultValue={value}
                onBlur={(e) => updateRole(key, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    updateRole(key, (e.target as HTMLInputElement).value)
                    setEditingRole(null)
                  }
                }}
                className="mt-1 w-full rounded-md border border-gray-200 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#0909A8]/30"
              />
            ) : (
              <div className="mt-1 text-sm font-semibold text-gray-900 truncate">
                {value || "Add name"}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  const budgetValue = data.kpis.find((k) => k.label.toLowerCase() === "budget")?.value || "0"
  const progressValue = data.kpis.find((k) => k.label.toLowerCase() === "progress")?.value || "0%"

  const statusColor =
    data.projectStatus === "green"
      ? "bg-green-500"
      : data.projectStatus === "yellow"
      ? "bg-yellow-400"
      : "bg-red-500"

  return (
    <div className="relative mb-6 space-y-3">
      <div className="rounded-2xl bg-[#0909A8] text-white shadow-md p-6 space-y-5">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          <div className="flex-1 space-y-4 min-w-0">
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <h1
                  contentEditable
                  suppressContentEditableWarning
                  className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight bg-white/5 px-4 py-2 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/40"
                  onBlur={(e) => updateProjectName(e.currentTarget.textContent || "")}
                >
                  {data.projectName}
                </h1>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm">
              {data.showNiicDate !== false && (
                <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-xl px-3 py-2">
                  <span className="font-medium opacity-90">NIIC Date</span>
                  <input
                    lang="en"
                    type="month"
                    value={data.niicDate}
                    onChange={(e) => updateNiicDate(e.target.value)}
                    className="px-2 py-1 rounded-md text-xs sm:text-sm text-gray-900 bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                  <span className="text-[11px] opacity-80">{formatMonth(data.niicDate)}</span>
                </div>
              )}

              <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-xl px-3 py-2">
                <span className="font-medium opacity-90">Status Date</span>
                <input
                  lang="en"
                  type="date"
                  value={data.statusDate}
                  onChange={(e) => updateStatusDate(e.target.value)}
                  className="px-2 py-1 rounded-md text-xs sm:text-sm text-gray-900 bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
                <span className="text-[11px] opacity-80">{formatDate(data.statusDate)}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-4 w-full lg:w-auto">
            <div className="flex items-center gap-3">
              <div className="bg-white/10 border border-white/20 rounded-2xl px-3 py-2 flex items-center gap-2">
                <span className="text-xs uppercase opacity-80">Status</span>
                <span className={`inline-flex w-3 h-3 rounded-full ${statusColor}`} aria-hidden />
              </div>
            </div>
            <div className="rounded-3xl bg-white text-[#0909A8] px-6 py-3 text-3xl font-black tracking-[0.3em] shadow-lg uppercase">
              MARS
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-2xl px-3 py-2">
            <span className="text-xs uppercase opacity-80">Traffic light</span>
            <div className="flex items-center gap-2">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => updateStatus(opt.value)}
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs border border-white/20 transition-colors ${
                    data.projectStatus === opt.value ? "bg-white text-[#0909A8]" : "bg-white/10 text-white"
                  }`}
                >
                  <span
                    className={`inline-flex w-3 h-3 rounded-full ${
                      opt.value === "green"
                        ? "bg-green-500"
                        : opt.value === "yellow"
                        ? "bg-yellow-400"
                        : "bg-red-500"
                    }`}
                  />
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[{ label: "Budget", value: budgetValue }, { label: "Progress", value: progressValue }].map((tile) => (
            <div
              key={tile.label}
              className="rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm"
            >
              <div className="text-xs uppercase tracking-wide opacity-80">{tile.label}</div>
              <input
                value={tile.value}
                onChange={(e) => updateKpi(tile.label, e.target.value)}
                className="mt-2 w-full rounded-lg border border-white/30 bg-white/90 text-[#0909A8] px-3 py-2 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-[#0909A8]/40"
              />
            </div>
          ))}
        </div>
      </div>

      <div
        className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-wrap items-center gap-4"
        onContextMenu={handleAreaContext}
      >
        <div className="text-xs uppercase tracking-wide text-gray-500">Roles</div>
        <div className="flex flex-wrap gap-3">
          {roleMeta.map((role) => renderRoleBubble(role.key, role.label, role.Icon))}
        </div>
      </div>

      {roleMenu && (
        <div
          style={{ top: roleMenu.y, left: roleMenu.x }}
          className="fixed z-50 w-40 rounded-md bg-white shadow-lg border border-gray-200 py-1 text-sm"
        >
          <button
            className="w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center gap-2"
            onClick={() => {
              setEditingRole(roleMenu.role)
              setRoleMenu(null)
            }}
          >
            <Edit3 className="w-4 h-4" /> Edit name
          </button>
          <button
            className="w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center gap-2"
            onClick={() => {
              updateRole(roleMenu.role, "")
              setRoleMenu(null)
            }}
          >
            <X className="w-4 h-4" /> Remove role
          </button>
        </div>
      )}

      {areaMenu && (
        <div
          style={{ top: areaMenu.y, left: areaMenu.x }}
          className="fixed z-50 w-48 rounded-md bg-white shadow-lg border border-gray-200 py-1 text-sm"
        >
          {roleMeta
            .filter((r) => !roles[r.key])
            .map((r) => (
              <button
                key={r.key}
                className="w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center gap-2"
                onClick={() => {
                  updateRole(r.key, r.label)
                  setAreaMenu(null)
                }}
              >
                <MoreVertical className="w-4 h-4" /> Add {r.label}
              </button>
            ))}
        </div>
      )}
    </div>
  )
}
