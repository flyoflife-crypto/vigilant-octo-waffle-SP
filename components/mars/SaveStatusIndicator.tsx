'use client'

import { useEffect, useState } from 'react'
import { AlertCircle, Check, Loader2 } from 'lucide-react'

export type SaveStatus = 'saving' | 'saved' | 'error'

interface SaveStatusIndicatorProps {
  status: SaveStatus
  lastSaved?: Date
}

export function SaveStatusIndicator({ status, lastSaved }: SaveStatusIndicatorProps) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (status === 'saving' || status === 'error') {
      setShow(true)
      return
    }

    if (status === 'saved') {
      setShow(true)
      const timer = setTimeout(() => setShow(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [status])

  if (!show) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 export-hidden print:hidden animate-in fade-in slide-in-from-bottom-2">
      <div
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg transition-all
          ${status === 'saved' ? 'bg-green-50 text-green-700 border border-green-200' : ''}
          ${status === 'saving' ? 'bg-blue-50 text-blue-700 border border-blue-200' : ''}
          ${status === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : ''}
        `}
      >
        {status === 'saving' && <Loader2 className="w-4 h-4 animate-spin" />}
        {status === 'saved' && <Check className="w-4 h-4" />}
        {status === 'error' && <AlertCircle className="w-4 h-4" />}

        <span className="text-sm font-medium">
          {status === 'saving' && 'Saving...'}
          {status === 'saved' && 'All changes saved'}
          {status === 'error' && 'Save failed'}
        </span>

        {status === 'saved' && lastSaved && (
          <span className="text-xs opacity-60">
            {lastSaved.toLocaleTimeString()}
          </span>
        )}
      </div>
    </div>
  )
}
