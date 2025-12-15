"use client"

import { useCallback, useState } from "react"
import { FileText, Printer } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { exportToPDF, type PDFExportMode } from "@/lib/pdf-export"

interface PDFExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  onError?: (error: Error) => void
}

export function PDFExportDialog({
  open,
  onOpenChange,
  onSuccess,
  onError,
}: PDFExportDialogProps) {
  const [mode, setMode] = useState<PDFExportMode>("single-page")
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = useCallback(async () => {
    try {
      setIsExporting(true)
      await exportToPDF("#onepagerRoot", { mode })
      onSuccess?.()
      onOpenChange(false)
    } catch (error) {
      console.error(error)
      onError?.(error as Error)
    } finally {
      setIsExporting(false)
    }
  }, [mode, onError, onOpenChange, onSuccess])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Export to PDF</DialogTitle>
          <DialogDescription>
            Choose how you want to export your one-pager. Interactive UI elements are hidden during export for a clean capture.
          </DialogDescription>
        </DialogHeader>

        <RadioGroup value={mode} onValueChange={(value) => setMode(value as PDFExportMode)}>
          <Label className="border rounded-lg p-4 gap-3 cursor-pointer transition hover:border-[var(--mars-blue-primary)]"
            htmlFor="pdf-single">
            <div className="flex items-center gap-3">
              <RadioGroupItem id="pdf-single" value="single-page" />
              <div className="flex flex-col gap-1">
                <span className="font-semibold flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Single long page
                </span>
                <span className="text-sm text-muted-foreground">
                  Captures the entire one-pager into a single PDF page using high-resolution rendering. Best for sharing or archival.
                </span>
              </div>
            </div>
          </Label>

          <Label className="border rounded-lg p-4 gap-3 cursor-pointer transition hover:border-[var(--mars-blue-primary)]"
            htmlFor="pdf-multi">
            <div className="flex items-center gap-3">
              <RadioGroupItem id="pdf-multi" value="multi-page" />
              <div className="flex flex-col gap-1">
                <span className="font-semibold flex items-center gap-2">
                  <Printer className="w-4 h-4" /> Multi-page (print)
                </span>
                <span className="text-sm text-muted-foreground">
                  Opens the browser print dialog and lets the PDF engine paginate automatically.
                </span>
              </div>
            </div>
          </Label>
        </RadioGroup>

        <div className="bg-muted/50 rounded-md p-3 text-xs text-muted-foreground">
          Tip: Use <span className="font-semibold">Single long page</span> to preserve layouts exactly as shown. Multi-page mode relies on your
          system print settings for pagination.
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isExporting}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? "Exporting..." : "Export"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
