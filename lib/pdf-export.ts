import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export type PDFExportMode = 'multi-page' | 'single-page'

interface PDFExportOptions {
  mode: PDFExportMode
  filename?: string
  quality?: number
}

export async function exportToPDF(
  elementId: string,
  options: PDFExportOptions
): Promise<void> {
  const { mode, filename = 'mars-onepager.pdf', quality = 0.95 } = options
  const element = document.querySelector(elementId) as HTMLElement
  if (!element) throw new Error(`Element ${elementId} not found`)

  document.body.classList.add('screenshot-mode')

  try {
    if (mode === 'multi-page') {
      await exportMultiPagePDF()
    } else {
      await exportSinglePagePDF(element, filename, quality)
    }
  } finally {
    document.body.classList.remove('screenshot-mode')
  }
}

async function exportMultiPagePDF(): Promise<void> {
  return new Promise((resolve) => {
    const handleAfterPrint = () => {
      window.removeEventListener('afterprint', handleAfterPrint)
      resolve()
    }
    window.addEventListener('afterprint', handleAfterPrint)
    window.print()
  })
}

async function exportSinglePagePDF(
  element: HTMLElement,
  filename: string,
  quality: number
): Promise<void> {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: false,
    backgroundColor: '#ffffff',
    logging: false,
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight,
    foreignObjectRendering: true,
    imageTimeout: 0,
  })

  const imgWidth = 210
  const imgHeight = (canvas.height * imgWidth) / canvas.width

  const pdf = new jsPDF({
    orientation: imgHeight > imgWidth ? 'portrait' : 'landscape',
    unit: 'mm',
    format: [imgWidth, imgHeight],
    compress: true,
  })

  const imgData = canvas.toDataURL('image/jpeg', quality)
  pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight)
  pdf.save(filename)
}
