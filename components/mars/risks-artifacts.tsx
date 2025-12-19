"use client"

import type { OnePagerData } from "@/types/onepager"
import { RisksCard } from "./RisksCard"
import { ArtifactsCard } from "./ArtifactsCard"

interface RisksArtifactsProps {
  data: OnePagerData
  setData: (data: OnePagerData) => void
}

export function RisksArtifacts({ data, setData }: RisksArtifactsProps) {
  return (
    <div className="animate-slide-up">
      <div className="grid md:grid-cols-2 gap-5">
        <RisksCard data={data} setData={setData} />
        <ArtifactsCard data={data} setData={setData} />
      </div>
    </div>
  )
}

// Backwards-compatible named exports used elsewhere
export { RisksCard as RisksCardInline }
export { ArtifactsCard as ArtifactsCardInline }
