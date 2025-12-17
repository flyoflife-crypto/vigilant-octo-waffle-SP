"use client"

import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import type { OnePagerData, StatusColor } from "@/types/onepager"

interface HeaderProps {
  data: OnePagerData
  setData: (data: OnePagerData) => void
  /**
   * Опциональный флаг для dev-ветки:
   * если нужно прятать NIIC через настройки видимости.
   * В main можно не передавать — по умолчанию true.
   */
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
    <Card className="relative bg-[var(--mars-blue-primary)] text-white p-4 md:p-5 shadow-lg animate-slide-up overflow-hidden">
      {/* Основная адаптивная сетка: 1 колонка на мобильных, 3 смысловые зоны на md+ */}
      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,2fr)_auto_minmax(0,1fr)] gap-4 md:gap-6 items-center">

        {/* ЛЕВАЯ ЗОНА: Название проекта + Даты */}
        <div className="flex flex-col justify-center gap-3 min-w-0">
          <div className="space-y-1">
            <Input
              value={data.projectName}
              onChange={(e) => setData({ ...data, projectName: e.target.value })}
              className="text-xl md:text-2xl font-bold bg-transparent border-none text-white placeholder:text-white/60 p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0 truncate"
              placeholder="Project Name"
            />
          </div>

          {showNiicDate && (
            <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm">
              <span className="opacity-80 font-semibold">NIIC Date:</span>
              <Input
                type="date"
                value={data.niicDate ?? ''}
                onChange={(e) => setData({ ...data, niicDate: e.target.value })}
                className="bg-white/15 border-none text-white w-36 h-7 px-2 rounded text-xs focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
          )}

          <div className="flex items-center gap-2 text-xs md:text-sm">
            <span className="font-semibold">Status Date:</span>
            <Input
              type="date"
              value={data.statusDate ?? ''}
              onChange={(e) => setData({ ...data, statusDate: e.target.value })}
              className="bg-white/10 border-none text-white w-36 h-7 px-2 rounded text-xs focus-visible:ring-0 focus-visible:ring-white/30"
            />
          </div>
        </div>

        {/* ЦЕНТРАЛЬНАЯ ЗОНА: Светофор статуса */}
        <div className="flex justify-center">
          <button
            onClick={() => setData({ ...data, projectStatus: cycleStatus(data.projectStatus) })}
            className="group flex items-center gap-3 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 transition-all active:scale-95"
            title="Click to toggle status"
          >
            <div className={`w-3.5 h-3.5 rounded-full transition-colors duration-300 ${getStatusColor(data.projectStatus)}`} />
            <div className="flex flex-col items-start leading-none">
              <span className="text-[9px] uppercase tracking-widest text-white/70 font-bold mb-0.5">Project Status</span>
              <span className="text-sm font-bold text-white">{getStatusLabel(data.projectStatus)}</span>
            </div>
          </button>
        </div>

        {/* ПРАВАЯ ЗОНА: Лого MARS */}
        <div className="flex justify-end">
          <div className="text-3xl md:text-4xl font-black tracking-[0.5em] leading-none text-white/90 uppercase">
            <span className="inline-block translate-x-[0.35em]">MARS</span>
          </div>
        </div>
      </div>
    </Card>
  )
}