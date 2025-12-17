"use client"

import React, { useRef, useLayoutEffect, useEffect } from "react"

export const AutoGrowTextarea: React.FC<{
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  onContextMenu?: (e: React.MouseEvent<HTMLTextAreaElement>) => void
  placeholder?: string
  className?: string
}> = ({ value, onChange, onContextMenu, placeholder, className }) => {
  const ref = useRef<HTMLTextAreaElement | null>(null)

  const autoresize = () => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }

  useLayoutEffect(() => { autoresize() }, [])
  useEffect(() => { autoresize() }, [value])

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => { onChange(e) }}
      onContextMenu={onContextMenu}
      placeholder={placeholder}
      rows={1}
      style={{ overflow: 'hidden', resize: 'none' }}
      className={
        (
          "w-full px-3 py-2 text-sm rounded-md border border-[var(--mars-gray-border)] " +
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mars-blue-primary)] " +
          "bg-white shadow-sm leading-5 min-h-[36px] break-words break-all " +
          (className ? className : "")
        )
      }
    />
  )
}

export default AutoGrowTextarea
