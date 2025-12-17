"use client"

import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import type { OnePagerData, StatusColor } from "@/types/onepager"

interface HeaderProps {
  data: OnePagerData
  setData: (data: OnePagerData) => void
  showNiicDate?: boolean
}

export function Header({ data, setData, showNiicDate = true }: HeaderProps) {
  const cycleStatus = (current: StatusColor): StatusColor => {
    const cycle: StatusColor[] = ["green", "yellow", "red"]
    const idx = cycle.indexOf(current)
    return cycle[(idx + 1) % cycle.length]
  }

  const getStatusColor = (status: StatusColor) => {
    const colors: Record<StatusColor, string> = {
      green: "bg-[var(--status-green)]",
      yellow: "bg-[var(--status-yellow)]",
      red: "bg-[var(--status-red)]",
    }
    return colors[status]
  }

  const getStatusLabel = (status: StatusColor) => {
    const labels: Record<StatusColor, string> = {
      green: "On Track",
      yellow: "At Risk",
      red: "Delayed",
    }
    return labels[status]
  }

  return (
    <Card className="relative bg-[var(--mars-blue-primary)] text-white p-4 shadow-lg animate-slide-up overflow-hidden">
      
      {/* MARS Logo - абсолютно позиционирован справа, вертикально центрирован */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10">
        <Image
          src="/mars-logo.svg"
          alt="MARS"
          width={180}
          height={53}
          className="h-12 w-auto"
          priority
        />
      </div>
      
      {/* Top Row: Title */}
      <div className="mb-4 pr-48">
        <Input
          value={data.projectName}
          onChange={(e) => setData({ ...data, projectName: e.target.value })}
          className="text-2xl md:text-3xl font-bold bg-transparent border-none text-white placeholder:text-white/60 p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
          placeholder="Project Name"
        />
      </div>

      {/* Bottom Row: Dates (left) + Status (next to dates) */}
      <div className="flex items-end gap-6">
        
        {/* LEFT: Date Inputs stacked vertically */}
        <div className="flex flex-col gap-2">
          {showNiicDate && (
            <div className="flex items-center gap-2">
              <span className="text-gray-300 font-medium text-sm min-w-[90px]">NIIC Date:</span>
              <Input
                type="date"
                value={data.niicDate ?? ''}
                onChange={(e) => setData({ ...data, niicDate: e.target.value })}
                className="bg-white/15 border-none text-white w-36 h-8 px-2 rounded text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="text-gray-300 font-medium text-sm min-w-[90px]">Status Date:</span>
            <Input
              type="date"
              value={data.statusDate ?? ''}
              onChange={(e) => setData({ ...data, statusDate: e.target.value })}
              className="bg-white/15 border-none text-white w-36 h-8 px-2 rounded text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
        </div>

        {/* Traffic Light - RIGHT of dates, LEFT side of card */}
        <button
          onClick={() => setData({ ...data, projectStatus: cycleStatus(data.projectStatus) })}
          className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 transition-all active:scale-95"
          title="Click to toggle status"
        >
          <div className={`w-4 h-4 rounded-full transition-colors duration-300 ${getStatusColor(data.projectStatus)}`} />
          <div className="flex flex-col items-start leading-none">
            <span className="text-[9px] uppercase tracking-widest text-white/70 font-bold mb-0.5">Project Status</span>
            <span className="text-sm font-bold text-white">{getStatusLabel(data.projectStatus)}</span>
          </div>
        </button>
      </div>
    </Card>
  )
}