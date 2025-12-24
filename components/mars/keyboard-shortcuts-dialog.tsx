'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Keyboard } from 'lucide-react'

interface KeyboardShortcutsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const shortcuts = [
  {
    category: 'General',
    items: [
      { keys: ['?'], description: 'Show keyboard shortcuts' },
      { keys: ['Ctrl', 'S'], description: 'Save project (auto-saved)' },
      { keys: ['Ctrl', 'Z'], description: 'Undo last change' },
      { keys: ['Ctrl', 'Shift', 'Z'], description: 'Redo last undone change' },
      { keys: ['Ctrl', 'Y'], description: 'Redo (alternative)' },
    ],
  },
  {
    category: 'Gantt Chart',
    items: [
      { keys: ['↑'], description: 'Move selected bar/milestone up' },
      { keys: ['↓'], description: 'Move selected bar/milestone down' },
      { keys: ['←'], description: 'Move selected bar/milestone left' },
      { keys: ['→'], description: 'Move selected bar/milestone right' },
      { keys: ['Delete'], description: 'Remove selected bar/milestone' },
      { keys: ['Escape'], description: 'Clear selection' },
      { keys: ['Click'], description: 'Select bar or milestone' },
      { keys: ['Right Click'], description: 'Open context menu' },
    ],
  },
  {
    category: 'Editing',
    items: [
      { keys: ['Enter'], description: 'Confirm inline edit' },
      { keys: ['Escape'], description: 'Cancel inline edit' },
      { keys: ['Tab'], description: 'Move to next field' },
      { keys: ['Shift', 'Tab'], description: 'Move to previous field' },
    ],
  },
  {
    category: 'Export',
    items: [
      { keys: ['Ctrl', 'P'], description: 'Export to PDF' },
      { keys: ['Ctrl', 'Shift', 'P'], description: 'Export full page as PNG' },
    ],
  },
]

export function KeyboardShortcutsDialog({ open, onOpenChange }: KeyboardShortcutsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="w-5 h-5" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Use these shortcuts to work faster and more efficiently
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {shortcuts.map((section) => (
            <div key={section.category}>
              <h3 className="font-semibold text-sm mb-3 text-[var(--mars-blue-primary)]">
                {section.category}
              </h3>
              <div className="space-y-2">
                {section.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-gray-50"
                  >
                    <span className="text-sm text-gray-700">{item.description}</span>
                    <div className="flex items-center gap-1">
                      {item.keys.map((key, keyIndex) => (
                        <span key={keyIndex} className="flex items-center gap-1">
                          <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-md shadow-sm">
                            {key}
                          </kbd>
                          {keyIndex < item.keys.length - 1 && (
                            <span className="text-gray-400 text-xs">+</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t text-xs text-gray-500">
          <p>
            💡 Tip: Press <kbd className="px-1.5 py-0.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded">?</kbd> anytime to see this dialog
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
