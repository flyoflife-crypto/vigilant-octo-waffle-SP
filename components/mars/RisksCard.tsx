"use client"

import React, { useState, useRef, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TextFormatMenu } from "@/components/ui/text-format-menu"
import { Plus, X } from "lucide-react"
import type { OnePagerData, StatusColor } from "@/types/onepager"
import AutoGrowTextarea from "./AutoGrowTextarea"

interface RisksProps {
  data: OnePagerData
  setData: (data: OnePagerData) => void
}

export function RisksCard({ data, setData }: RisksProps) {
  const [formatMenu, setFormatMenu] = useState<{
    show: boolean
    x: number
    y: number
    type: "risk" | "mitigation" | null
    index: number | null
    selStart: number
    selEnd: number
  }>({ show: false, x: 0, y: 0, type: null, index: null, selStart: 0, selEnd: 0 })

  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; riskIndex: number } | null>(null)
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setContextMenu(null)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const addRisk = () => {
    setData({
      ...data,
      risks: [...data.risks, { risk: "New risk", impact: "yellow", mitigation: "Mitigation plan" }],
    })
  }

  const removeRisk = (idx: number) => {
    setData({ ...data, risks: data.risks.filter((_, i) => i !== idx) })
  }

  const updateRisk = (idx: number, field: keyof (typeof data.risks)[0], value: string | StatusColor) => {
    const newRisks = [...data.risks]
    newRisks[idx][field] = value as any
    setData({ ...data, risks: newRisks })
  }

  const handleImpactClick = (e: React.MouseEvent, idx: number) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.button === 2 || (e.button === 0 && e.ctrlKey)) {
      setContextMenu({ x: e.clientX, y: e.clientY, riskIndex: idx })
      return
    }

    if (e.button === 0 && !e.ctrlKey) {
      const cycle: StatusColor[] = ["green", "yellow", "red"]
      const cur = data.risks[idx].impact
      const next = cycle[(cycle.indexOf(cur) + 1) % cycle.length]
      updateRisk(idx, "impact", next)
    }
  }

  const handleImpactMouseDown = (e: React.MouseEvent, idx: number) => {
    if (e.button === 0 && !e.ctrlKey) {
      const timer = setTimeout(() => {
        setContextMenu({ x: e.clientX, y: e.clientY, riskIndex: idx })
      }, 500)
      setLongPressTimer(timer)
    }
  }

  const handleImpactMouseUp = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer)
      setLongPressTimer(null)
    }
  }

  const setImpact = (impact: StatusColor) => {
    if (contextMenu) {
      updateRisk(contextMenu.riskIndex, "impact", impact)
      setContextMenu(null)
    }
  }

  const getImpactColor = (impact: StatusColor) => {
    switch (impact) {
      case "green":
        return "bg-green-500"
      case "yellow":
        return "bg-yellow-500"
      case "red":
        return "bg-red-500"
    }
  }

  const getImpactLabel = (impact: StatusColor) => {
    switch (impact) {
      case "green":
        return "Low"
      case "yellow":
        return "Medium"
      case "red":
        return "High"
    }
  }

  const handleContextMenu = (e: React.MouseEvent, type: "risk" | "mitigation", index: number) => {
    const target = e.target as HTMLTextAreaElement | null
    const selStart = (target && typeof target.selectionStart === 'number') ? target.selectionStart : 0
    const selEnd = (target && typeof target.selectionEnd === 'number') ? target.selectionEnd : selStart
    if (selEnd > selStart) {
      e.preventDefault()
      setFormatMenu({ show: true, x: e.clientX, y: e.clientY, type, index, selStart, selEnd })
    }
  }

  const handleFormat = (format: "bold" | "italic" | "underline" | "link" | "code") => {
    if (formatMenu.type === null || formatMenu.index === null) return

    const startOffset = formatMenu.selStart
    const endOffset = formatMenu.selEnd
    if (endOffset <= startOffset) return

    const getSlice = (src: string) => ({ head: src.substring(0, startOffset), mid: src.substring(startOffset, endOffset), tail: src.substring(endOffset) })

    const apply = (src: string) => {
      const { head, mid, tail } = getSlice(src)
      let wrapped = mid
      switch (format) {
        case "bold": wrapped = `**${mid}**`; break
        case "italic": wrapped = `*${mid}*`; break
        case "underline": wrapped = `__${mid}__`; break
        case "link": {
          const url = prompt("Enter URL:")
          if (!url) return src
          wrapped = `[${mid}](${url})`
          break
        }
        case "code": wrapped = `\`${mid}\``; break
      }
      return head + wrapped + tail
    }

    const idx = formatMenu.index
    if (formatMenu.type === "risk") {
      const cur = data.risks[idx].risk || ""
      const next = apply(cur)
      if (next !== cur) updateRisk(idx, "risk", next)
    } else if (formatMenu.type === "mitigation") {
      const cur = data.risks[idx].mitigation || ""
      const next = apply(cur)
      if (next !== cur) updateRisk(idx, "mitigation", next)
    }

    setFormatMenu((m) => ({ ...m, show: false }))
  }

  return (
    <Card className="p-6 shadow-sm hover:shadow-md transition-shadow h-full">
      <h3 className="text-lg font-bold text-[var(--mars-blue-primary)] mb-4">Risks</h3>

      <div className="space-y-2">
        <div className="grid grid-cols-[1fr_100px_1fr] gap-2 pb-2 border-b border-[var(--mars-gray-border)] font-semibold text-sm text-gray-600">
          <div>Risk</div>
          <div className="text-center">Impact</div>
          <div>Mitigation</div>
        </div>

        {data.risks.map((risk, idx) => (
          <div key={idx} className="grid grid-cols-[1fr_100px_1fr] gap-2 items-start group border-b border-[var(--mars-gray-border)] py-2 relative">
            <AutoGrowTextarea
              value={risk.risk}
              onChange={(e) => updateRisk(idx, "risk", e.target.value)}
              onContextMenu={(e) => handleContextMenu(e, "risk", idx)}
              placeholder="Risk description"
            />

            <button
              onContextMenu={(e) => handleImpactClick(e, idx)}
              onClick={(e) => handleImpactClick(e, idx)}
              onMouseDown={(e) => handleImpactMouseDown(e, idx)}
              onMouseUp={handleImpactMouseUp}
              onMouseLeave={handleImpactMouseUp}
              className="self-center flex items-center justify-center gap-2 min-h-[36px] px-2 rounded border border-[var(--mars-gray-border)] hover:bg-gray-50 transition-colors cursor-pointer"
              title="Right-click or Ctrl+Click to change"
            >
              <div className={`w-3 h-3 rounded-full ${getImpactColor(risk.impact)}`} />
              <span className="text-xs">{getImpactLabel(risk.impact)}</span>
            </button>

            <div className="flex items-center gap-2">
              <AutoGrowTextarea
                value={risk.mitigation}
                onChange={(e) => updateRisk(idx, "mitigation", e.target.value)}
                onContextMenu={(e) => handleContextMenu(e, "mitigation", idx)}
                placeholder="Mitigation plan"
                className="flex-1"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeRisk(idx)}
                className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 export-hidden"
                title="Remove"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Button onClick={addRisk} variant="outline" size="sm" className="mt-4 gap-2 hover:bg-[var(--mars-blue-primary)] hover:text-white transition-colors bg-transparent export-hidden">
        <Plus className="w-4 h-4" />
        Add Risk
      </Button>

      {contextMenu && (
        <div ref={menuRef} className="fixed bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50 min-w-[140px] text-gray-900 export-hidden" style={{ left: contextMenu.x, top: contextMenu.y }}>
          <button onClick={() => setImpact("green")} className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-sm">
            <div className="w-4 h-4 rounded-full bg-green-500" />
            Low
          </button>
          <button onClick={() => setImpact("yellow")} className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-sm">
            <div className="w-4 h-4 rounded-full bg-yellow-500" />
            Medium
          </button>
          <button onClick={() => setImpact("red")} className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-sm">
            <div className="w-4 h-4 rounded-full bg-red-500" />
            High
          </button>
        </div>
      )}

      {formatMenu.show && (
        <TextFormatMenu
          position={{ x: formatMenu.x, y: formatMenu.y }}
          onFormat={handleFormat}
          onClose={() => setFormatMenu({ show: false, x: 0, y: 0, type: null, index: null, selStart: 0, selEnd: 0 })}
        />
      )}
    </Card>
  )
}

export default RisksCard
