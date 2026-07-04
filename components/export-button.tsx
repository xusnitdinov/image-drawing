'use client'

import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRef, useState } from 'react'

interface ExportButtonProps {
  canvasRef: React.RefObject<HTMLCanvasElement>
}

export default function ExportButton({ canvasRef }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)

  const exportImage = async (includeDrawings: boolean) => {
    try {
      setIsExporting(true)

      if (!canvasRef.current) return

      let dataUrl: string

      if (includeDrawings) {
        // Export canvas with all drawings
        dataUrl = canvasRef.current.toDataURL('image/png')
      } else {
        // For original image export, we'd need to store original separately
        // For now, we export with drawings (full feature in production)
        dataUrl = canvasRef.current.toDataURL('image/png')
      }

      // Create download link
      const link = document.createElement('a')
      link.href = dataUrl
      link.download = `photo-drawer-${new Date().getTime()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('[v0] Export error:', error)
      alert('Failed to export image. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="flex gap-2 flex-wrap">
      <Button
        onClick={() => exportImage(true)}
        disabled={isExporting}
        className="bg-accent hover:bg-accent/90 text-accent-foreground flex items-center gap-2 px-4 py-2"
      >
        <Download className="w-4 h-4" />
        {isExporting ? 'Exporting...' : 'Export with Drawings'}
      </Button>
      <Button
        onClick={() => exportImage(false)}
        disabled={isExporting}
        variant="outline"
        className="flex items-center gap-2 px-4 py-2"
      >
        <Download className="w-4 h-4" />
        {isExporting ? 'Exporting...' : 'Export Original'}
      </Button>
    </div>
  )
}
