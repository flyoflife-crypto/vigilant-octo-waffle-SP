"use client"

import { useState, useEffect } from "react"
import { X, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import type { OnePagerData, StatusColor, KPI } from "@/types/onepager"

interface KpiStripProps {
  data: OnePagerData
  setData: (data: OnePagerData) => void
  className?: string
}

export function KpiStrip({ data, setData, className }: KpiStripProps) {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; idx: number | null } | null>(null)

  useEffect(() => {
    const close = () => setContextMenu(null)
    document.addEventListener("click", close)
    return () => document.removeEventListener("click", close)
  }, [])

  const updateKpi = (idx: number, field: keyof KPI, val: string) => {
    const newKpis = [...data.kpis]
    newKpis[idx] = { ...newKpis[idx], [field]: val }
    setData({ ...data, kpis: newKpis })
  }

  const changeColor = (idx: number, color: StatusColor) => {
    const newKpis = [...data.kpis]
    newKpis[idx] = { ...newKpis[idx], color }
    setData({ ...data, kpis: newKpis })
    setContextMenu(null)
  }

  const addKpi = () => {
    const newKpi: KPI = { label: "METRIC", value: "0", color: "green" }
    setData({ ...data, kpis: [...data.kpis, newKpi] })
    setContextMenu(null)
  }

  const removeKpi = (idx: number) => {
    const newKpis = data.kpis.filter((_, i) => i !== idx)
    setData({ ...data, kpis: newKpis })
    setContextMenu(null)
  }

  const handleContext = (e: React.MouseEvent, idx: number | null) => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({ x: e.clientX, y: e.clientY, idx })
  }

  const getColorStyles = (color: StatusColor) => {
    switch (color) {
      case "green": return "bg-green-50 border-green-200 hover:border-green-300"
      case "yellow": return "bg-yellow-50 border-yellow-200 hover:border-yellow-300"
      case "red": return "bg-red-50 border-red-200 hover:border-red-300"
      default: return "bg-white border-gray-200"
    }
  }

  return (
    <div 
      className={`relative p-3 rounded-xl border-2 border-dashed border-gray-200 hover:border-blue-200 transition-colors bg-gray-50/50 ${className ?? ''}`}
      onContextMenu={(e) => handleContext(e, null)}
    >
      <div className="absolute -top-3 left-3 bg-white px-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
        Key Metrics
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {data.kpis.map((kpi, idx) => (
          <div
            key={idx}
            className={`group relative flex flex-col items-center justify-center p-2 rounded-lg border shadow-sm min-w-0 h-[64px] transition-all ${getColorStyles(kpi.color)}`}
            onContextMenu={(e) => handleContext(e, idx)}
          >
            <Input
              value={kpi.value}
              onChange={(e) => updateKpi(idx, "value", e.target.value)}
              className="text-center font-semibold text-base bg-transparent border-none p-0 h-auto shadow-none focus-visible:ring-0"
            />
            <Input
              value={kpi.label}
              onChange={(e) => updateKpi(idx, "label", e.target.value)}
              className="text-center text-[10px] font-semibold uppercase tracking-wider text-gray-500 bg-transparent border-none p-0 h-auto shadow-none focus-visible:ring-0 mt-1 break-words"
              style={{ wordBreak: 'break-word' }}
            />
            
            {/* Hover Remove */}
            <button 
              onClick={() => removeKpi(idx)}
              className="absolute -top-2 -right-2 bg-white text-red-500 rounded-full p-0.5 shadow border opacity-0 group-hover:opacity-100 transition-opacity export-hidden"
              title="Remove"
            >
              <X size={12} />
            </button>
          </div>
        ))}

        {/* Add Button Placeholder */}
        <button
          onClick={addKpi}
          className="flex flex-col items-center justify-center h-[64px] rounded-lg border-2 border-dashed border-gray-300 text-gray-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-all export-hidden"
          title="Add"
        >
          <Plus size={18} />
          <span className="text-[9px] font-bold uppercase mt-1">Add</span>
        </button>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div 
          className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-100 py-1 min-w-[140px] animate-in fade-in zoom-in-95 duration-100 export-hidden"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          {contextMenu.idx !== null ? (
            <>
              <div className="px-3 py-1.5 text-xs font-bold text-gray-500 border-b bg-gray-50">Edit Metric</div>
              <div className="p-1.5 flex gap-1 justify-center border-b">
                {(["green", "yellow", "red"] as StatusColor[]).map(c => (
                   <button 
                     key={c}
                     onClick={() => changeColor(contextMenu.idx!, c)}
                     className={`w-6 h-6 rounded-full border-2 ${c === "green" ? "bg-green-400 border-green-200" : c === "yellow" ? "bg-yellow-400 border-yellow-200" : "bg-red-400 border-red-200"}`} 
                   />
                ))}
              </div>
              <button onClick={() => removeKpi(contextMenu.idx!)} className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2">
                <X size={14} /> Delete
              </button>
            </>
          ) : (
            <button onClick={addKpi} className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 flex items-center gap-2">
              <Plus size={14} /> Add New Metric
            </button>
          )}
        </div>
      )}
    </div>
  )
}