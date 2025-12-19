import { toPng } from 'html-to-image'
import { jsPDF } from 'jspdf'

export async function exportFullPagePDF(
  elementId: string,
  filename = 'onepager-full.pdf'
): Promise<void> {
  const element = document.getElementById(elementId)
  if (!element) {
    throw new Error(`Element with id "${elementId}" not found`) 
  }

  try {
    const dataUrl = await toPng(element as HTMLElement, {
      quality: 1.0,
      pixelRatio: 2,
      cacheBust: true,
      filter: (node: any) => {
        if (node?.classList?.contains('export-hidden')) {
          return false
        }
        return true
      }
    })

    const img = new Image()
    img.src = dataUrl
    await img.decode()

    const imgWidth = img.width
    const imgHeight = img.height

    const pdf = new jsPDF({
      orientation: imgWidth > imgHeight ? 'landscape' : 'portrait',
      unit: 'px',
      format: [imgWidth, imgHeight],
      compress: true
    })

    pdf.addImage(dataUrl, 'PNG', 0, 0, imgWidth, imgHeight, undefined, 'FAST')

    pdf.save(filename)
  } catch (error) {
    console.error('Full-page PDF export failed:', error)
    throw error
  }
}

export async function exportPagedPDF(): Promise<void> {
  window.print()
}
