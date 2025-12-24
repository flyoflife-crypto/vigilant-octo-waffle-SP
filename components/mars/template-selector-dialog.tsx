'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { PROJECT_TEMPLATES, type ProjectTemplate } from '@/lib/templates'
import { Briefcase, Code, Megaphone, Package, Building2, FileText } from 'lucide-react'

interface TemplateSelectorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectTemplate: (template: ProjectTemplate) => void
}

const categoryIcons = {
  general: FileText,
  software: Code,
  marketing: Megaphone,
  product: Package,
  construction: Building2,
}

export function TemplateSelectorDialog({
  open,
  onOpenChange,
  onSelectTemplate,
}: TemplateSelectorDialogProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null)

  const handleSelect = (template: ProjectTemplate) => {
    setSelectedTemplate(template)
  }

  const handleCreate = () => {
    if (selectedTemplate) {
      onSelectTemplate(selectedTemplate)
      onOpenChange(false)
      setSelectedTemplate(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Choose a Project Template</DialogTitle>
          <DialogDescription>
            Start with a template to quickly set up your project structure
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {PROJECT_TEMPLATES.map((template) => {
            const Icon = categoryIcons[template.category] || Briefcase
            const isSelected = selectedTemplate?.id === template.id

            return (
              <button
                key={template.id}
                onClick={() => handleSelect(template)}
                className={`
                  text-left p-4 rounded-lg border-2 transition-all
                  hover:border-[var(--mars-blue-primary)] hover:bg-blue-50/50
                  ${isSelected ? 'border-[var(--mars-blue-primary)] bg-blue-50/50' : 'border-gray-200'}
                `}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-[var(--mars-blue-primary)]/10">
                    <Icon className="w-5 h-5 text-[var(--mars-blue-primary)]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm mb-1">{template.name}</h3>
                    <p className="text-xs text-gray-600">{template.description}</p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false)
              setSelectedTemplate(null)
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!selectedTemplate}
            className="bg-[var(--mars-blue-primary)] hover:bg-[var(--mars-blue-primary)]/90"
          >
            Create Project
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
