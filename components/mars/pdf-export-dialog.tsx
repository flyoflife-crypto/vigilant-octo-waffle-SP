"use client"

import React from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface PDFExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onExport: (type: "paged" | "full") => void
  isLoading?: boolean
}

export function PDFExportDialog({ open, onOpenChange, onExport, isLoading = false }: PDFExportDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Export to PDF</DialogTitle>
          <DialogDescription>Choose PDF export format</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <button
            onClick={() => {
              onExport("paged")
              onOpenChange(false)
            }}
            disabled={isLoading}
            className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-[var(--mars-blue-primary)] hover:bg-blue-50 transition-all text-left"
          >
            <div className="font-semibold text-[var(--mars-blue-primary)]">📄 Standard Paged PDF</div>
            <div className="text-sm text-gray-600 mt-1">Traditional multi-page format (A4 with page breaks)</div>
          </button>

          <button
            onClick={() => {
              onExport("full")
              onOpenChange(false)
            }}
            disabled={isLoading}
            className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-[var(--mars-blue-primary)] hover:bg-blue-50 transition-all text-left"
          >
            <div className="font-semibold text-[var(--mars-blue-primary)]">📋 Full Page PDF (No Breaks)</div>
            <div className="text-sm text-gray-600 mt-1">Single continuous page with all content visible</div>
          </button>
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
