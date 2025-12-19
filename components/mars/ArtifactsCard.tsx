"use client"

import React, { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, X } from "lucide-react"
import type { OnePagerData } from "@/types/onepager"
import AutoGrowTextarea from "./AutoGrowTextarea"
import { TextFormatMenu } from "@/components/ui/text-format-menu"

interface ArtifactsProps {
  data: OnePagerData
  setData: (data: OnePagerData) => void
}

export function ArtifactsCard({ data, setData }: ArtifactsProps) {
  const [formatMenu, setFormatMenu] = useState<{
    show: boolean
    x: number
    y: number
    type: "artifact" | null
    index: number | null
    selStart: number
    selEnd: number
  }>({ show: false, x: 0, y: 0, type: null, index: null, selStart: 0, selEnd: 0 })

  const addArtifact = () => {
    setData({ ...data, artifacts: [...data.artifacts, { label: "📄 New artifact", url: "#" }] })
  }

  const removeArtifact = (idx: number) => {
    setData({ ...data, artifacts: data.artifacts.filter((_, i) => i !== idx) })
  }

  const updateArtifact = (idx: number, field: "label" | "url", value: string) => {
    const newArtifacts = [...data.artifacts]
    newArtifacts[idx][field] = value
    setData({ ...data, artifacts: newArtifacts })
  }

  const handleContextMenu = (e: React.MouseEvent, index: number) => {
    const target = e.target as HTMLTextAreaElement | null
    const selStart = (target && typeof target.selectionStart === 'number') ? target.selectionStart : 0
    const selEnd = (target && typeof target.selectionEnd === 'number') ? target.selectionEnd : selStart
    if (selEnd > selStart) {
      e.preventDefault()
      setFormatMenu({ show: true, x: e.clientX, y: e.clientY, type: "artifact", index, selStart, selEnd })
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
    const cur = data.artifacts[idx].label || ""
    const next = apply(cur)
    if (next !== cur) updateArtifact(idx, "label", next)

    setFormatMenu((m) => ({ ...m, show: false }))
  }

  return (
    <Card className="p-6 shadow-sm hover:shadow-md transition-shadow h-full">
      <h3 className="text-lg font-bold text-[var(--mars-blue-primary)] mb-4">Artifacts</h3>

      <div className="space-y-2">
        {data.artifacts.map((artifact, idx) => (
          <div key={idx} className="flex items-start gap-2 group border-b border-[var(--mars-gray-border)] py-2">
            <AutoGrowTextarea
              value={artifact.label}
              onChange={(e) => updateArtifact(idx, "label", e.target.value)}
              placeholder="Artifact label or link"
              className="flex-1"
              onContextMenu={(e) => handleContextMenu(e, idx)}
            />
            <Button variant="ghost" size="icon" onClick={() => removeArtifact(idx)} className="opacity-0 group-hover:opacity-100 transition-opacity self-start export-hidden" title="Remove">
              <X className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>

      <Button onClick={addArtifact} variant="outline" size="sm" className="mt-4 gap-2 hover:bg-[var(--mars-blue-primary)] hover:text-white transition-colors bg-transparent export-hidden">
        <Plus className="w-4 h-4" />
        Add Artifact
      </Button>

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

export default ArtifactsCard
