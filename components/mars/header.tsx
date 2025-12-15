"use client"

import { useState } from "react"
import { EyeOff, Users, UserCheck, Crown } from "lucide-react"
import type { OnePagerData } from "@/types/onepager"

interface HeaderProps {
  data: OnePagerData
  setData: (data: OnePagerData) => void
}

export function Header({ data, setData }: HeaderProps) {
  const [showRoles, setShowRoles] = useState(true)

  const updateProjectName = (name: string) => {
    setData({ ...data, projectName: name || "Untitled Project" })
  }

  const updateNiicDate = (date: string) => {
    setData({ ...data, niicDate: date })
  }

  const updateStatus = (status: "green" | "yellow" | "red") => {
    setData({ ...data, projectStatus: status })
  }

  const toggleRole = (role: keyof NonNullable<OnePagerData["roles"]>) => {
    const current = data.roles?.[role] ?? ""
    const capitalized = role.charAt(0).toUpperCase() + role.slice(1)
    const nextValue = current ? "" : `${capitalized} Name`
    setData({
      ...data,
      roles: {
        ...data.roles,
        [role]: nextValue,
      },
    })
  }

  const statusLabel =
    data.projectStatus === "green"
      ? "On Track"
      : data.projectStatus === "yellow"
      ? "At Risk"
      : "Delayed"

  const statusColor =
    data.projectStatus === "green"
      ? "bg-green-500"
      : data.projectStatus === "yellow"
      ? "bg-yellow-400"
      : "bg-red-500"

  return (
    <div className="relative mb-6">
      {/* Main header bar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-6 rounded-2xl bg-[#0909A8] text-white shadow-md">
        {/* Left: Mars logo */}
        <div className="flex-shrink-0 flex items-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 shadow-lg flex items-center justify-center">
            <span className="text-2xl font-extrabold tracking-wide">MARS</span>
          </div>
        </div>

        {/* Center: Project name + NIIC date */}
        <div className="flex-1 min-w-0 flex flex-col gap-3">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3">
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
          <div className="flex items-center gap-3 text-xs sm:text-sm">
            <span className="font-medium opacity-80">NIIC Date:</span>
            <input
              type="month"
              value={data.niicDate}
              onChange={(e) => updateNiicDate(e.target.value)}
              className="px-3 py-1.5 rounded-lg text-xs sm:text-sm text-gray-900 bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
        </div>

        {/* Right: project status */}
        <div className="flex-shrink-0 flex flex-col items-end gap-2">
          <span className="text-xs uppercase tracking-wide opacity-70">
            Project Status
          </span>
          <button
            type="button"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white text-gray-900 text-xs sm:text-sm font-medium shadow"
          >
            <span
              className={`inline-flex w-2.5 h-2.5 rounded-full ${statusColor}`}
            />
            <span>{statusLabel}</span>
            <span className="sr-only">Change status in side controls</span>
          </button>
          {/* The actual status switch is still controlled elsewhere (TopButtons / side UI),
              here мы только отображаем текущий статус как «светофор» */}
        </div>
      </div>

      {/* Roles cloud (optional) */}
      {showRoles && (
        <div className="mt-3 p-4 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={() => setShowRoles(false)}
            className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
          >
            <EyeOff className="w-3 h-3" />
            <span>Hide roles strip</span>
          </button>

          <div className="flex flex-wrap items-center gap-4 ml-2">
            {/* Project Manager */}
            <button
              type="button"
              onClick={() => toggleRole("projectManager")}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors min-w-[160px]"
            >
              <Users className="w-4 h-4 text-blue-600" />
              <div className="text-left">
                <div className="text-[11px] uppercase tracking-wide text-gray-500">
                  Project Manager
                </div>
                {data.roles?.projectManager ? (
                  <div className="text-sm font-semibold text-gray-900 truncate max-w-[180px]">
                    {data.roles.projectManager}
                  </div>
                ) : (
                  <div className="text-[11px] italic text-gray-400">
                    Click to add
                  </div>
                )}
              </div>
            </button>

            {/* Product Owner */}
            <button
              type="button"
              onClick={() => toggleRole("productOwner")}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors min-w-[160px]"
            >
              <UserCheck className="w-4 h-4 text-green-600" />
              <div className="text-left">
                <div className="text-[11px] uppercase tracking-wide text-gray-500">
                  Product Owner
                </div>
                {data.roles?.productOwner ? (
                  <div className="text-sm font-semibold text-gray-900 truncate max-w-[180px]">
                    {data.roles.productOwner}
                  </div>
                ) : (
                  <div className="text-[11px] italic text-gray-400">
                    Click to add
                  </div>
                )}
              </div>
            </button>

            {/* Sponsor */}
            <button
              type="button"
              onClick={() => toggleRole("sponsor")}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors min-w-[160px]"
            >
              <Crown className="w-4 h-4 text-purple-600" />
              <div className="text-left">
                <div className="text-[11px] uppercase tracking-wide text-gray-500">
                  Sponsor
                </div>
                {data.roles?.sponsor ? (
                  <div className="text-sm font-semibold text-gray-900 truncate max-w-[180px]">
                    {data.roles.sponsor}
                  </div>
                ) : (
                  <div className="text-[11px] italic text-gray-400">
                    Click to add
                  </div>
                )}
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
