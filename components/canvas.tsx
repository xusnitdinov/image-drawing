'use client'

import { useState, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight, Home, Trash2, Loader } from 'lucide-react'
import DrawingToolbar from './drawing-toolbar'
import TextExtractor from './text-extractor'
import ExportButton from './export-button'

interface CanvasProps {
  imageUrl: string
  currentIndex: number
  totalImages: number
  onPrevious: () => void
  onNext: () => void
  onRemoveImage: () => void
}

interface DrawPoint {
  x: number
  y: number
}

export default function Canvas({
  imageUrl,
  currentIndex,
  totalImages,
  onPrevious,
  onNext,
  onRemoveImage,
}: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [tool, setTool] = useState<string>('pen')
  const [color, setColor] = useState<string>('#3b82f6')
  const [size, setSize] = useState<number>(4)
  const [opacity, setOpacity] = useState<number>(100)
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [showTextExtractor, setShowTextExtractor] = useState(false)
  const [isOCRRunning, setIsOCRRunning] = useState(false)
  const [scale, setScale] = useState<number>(1)
  const historyRef = useRef<ImageData[]>([])
  const isDrawingRef = useRef(false)
  const lastPointRef = useRef<DrawPoint>({ x: 0, y: 0 })

  // Load image
  useEffect(() => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      setImage(img)
      // Don't auto-run OCR - let user trigger it manually
    }
    img.onerror = () => {
      console.error('[v0] Failed to load image')
    }
    img.src = imageUrl
  }, [imageUrl])

  // Initialize and draw canvas to fill screen
  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !image || !container) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Get container dimensions
    const containerWidth = container.clientWidth
    const containerHeight = container.clientHeight

    // Calculate scale to fit image in container while maintaining aspect ratio
    const scaleX = containerWidth / image.width
    const scaleY = containerHeight / image.height
    const calculatedScale = Math.min(scaleX, scaleY) // Allow slight upscaling if needed

    setScale(calculatedScale)

    // Set canvas size
    canvas.width = image.width * calculatedScale
    canvas.height = image.height * calculatedScale

    // Draw image with high quality
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height)

    // Save initial state
    historyRef.current = [ctx.getImageData(0, 0, canvas.width, canvas.height)]
  }, [image])

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    isDrawingRef.current = true
    lastPointRef.current = { x, y }

    if (tool === 'text') {
      addText(x, y)
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !canvasRef.current || tool === 'text') return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (tool === 'pen' || tool === 'highlighter' || tool === 'marker') {
      drawLine(ctx, lastPointRef.current.x, lastPointRef.current.y, x, y)
    }

    lastPointRef.current = { x, y }
  }

  const handleMouseUp = () => {
    isDrawingRef.current = false
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')
      if (ctx) {
        historyRef.current.push(ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height))
      }
    }
  }

  const drawLine = (ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) => {
    ctx.strokeStyle = color
    ctx.lineWidth = size
    ctx.globalAlpha = opacity / 100
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out'
      ctx.lineWidth = size * 2
    } else if (tool === 'highlighter') {
      ctx.globalCompositeOperation = 'multiply'
      ctx.lineWidth = size * 3
      ctx.globalAlpha = 0.3
    } else if (tool === 'marker') {
      ctx.globalCompositeOperation = 'source-over'
      ctx.lineWidth = size * 2
    } else {
      ctx.globalCompositeOperation = 'source-over'
    }

    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()

    ctx.globalCompositeOperation = 'source-over'
    ctx.globalAlpha = 1
  }

  const addShape = (shapeType: 'rectangle' | 'circle' | 'line') => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.strokeStyle = color
    ctx.lineWidth = size
    ctx.globalAlpha = opacity / 100

    switch (shapeType) {
      case 'rectangle':
        ctx.strokeRect(100, 100, 200, 100)
        break
      case 'circle':
        ctx.beginPath()
        ctx.arc(150, 150, 50, 0, Math.PI * 2)
        ctx.stroke()
        break
      case 'line':
        ctx.beginPath()
        ctx.moveTo(100, 100)
        ctx.lineTo(300, 100)
        ctx.stroke()
        break
    }

    ctx.globalAlpha = 1
    historyRef.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height))
  }

  const addText = (x: number, y: number) => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const text = prompt('Enter text:')
    if (!text) return

    ctx.fillStyle = color
    ctx.font = `${size * 8}px Arial`
    ctx.globalAlpha = opacity / 100
    ctx.fillText(text, x, y)
    ctx.globalAlpha = 1

    historyRef.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height))
  }

  const undo = () => {
    if (!canvasRef.current || historyRef.current.length <= 1) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    historyRef.current.pop()
    const previousState = historyRef.current[historyRef.current.length - 1]
    ctx.putImageData(previousState, 0, 0)
  }

  const clear = () => {
    if (!canvasRef.current || !image) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
    historyRef.current = [ctx.getImageData(0, 0, canvas.width, canvas.height)]
  }

  return (
    <div ref={containerRef} className="w-screen h-screen bg-background overflow-hidden relative flex items-center justify-center">
      {/* Full-screen Canvas */}
      {image ? (
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="cursor-crosshair max-w-full max-h-full object-contain"
        />
      ) : (
        <div className="text-center">
          <p className="text-muted-foreground">Loading image...</p>
        </div>
      )}

      {/* Top Header */}
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-background/80 to-transparent px-6 py-4 backdrop-blur-sm border-b border-border/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">Photo Drawer</h1>
            <span className="px-3 py-1 rounded-full bg-accent/20 text-accent text-sm font-medium">
              {currentIndex + 1} / {totalImages}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.location.href = '/'}
              className="p-2 rounded-lg hover:bg-card/50 text-muted-foreground hover:text-foreground transition-colors"
              title="Back to upload"
            >
              <Home className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Floating Toolbar at Bottom */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/95 to-transparent backdrop-blur-sm border-t border-border/20 px-3 py-2">
        <div className="max-w-7xl mx-auto space-y-1.5">
          <DrawingToolbar
            tool={tool}
            color={color}
            size={size}
            opacity={opacity}
            onToolChange={setTool}
            onColorChange={setColor}
            onSizeChange={setSize}
            onOpacityChange={setOpacity}
            onAddShape={addShape}
            onAddText={() => addText(50, 50)}
            onUndo={undo}
            onClear={clear}
            onShowTextExtractor={() => setShowTextExtractor(true)}
          />
          <div className="flex items-center justify-between gap-1.5">
            <button
              onClick={onPrevious}
              disabled={currentIndex === 0}
              className="p-1 rounded-md hover:bg-card/50 disabled:opacity-50 disabled:cursor-not-allowed text-foreground transition-colors"
              title="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <ExportButton canvasRef={canvasRef} />
            <button
              onClick={onNext}
              disabled={currentIndex === totalImages - 1}
              className="p-1 rounded-md hover:bg-card/50 disabled:opacity-50 disabled:cursor-not-allowed text-foreground transition-colors"
              title="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={onRemoveImage}
              className="p-1 rounded-md hover:bg-destructive/20 text-destructive transition-colors ml-auto"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Text Extractor Modal */}
      {showTextExtractor && (
        <TextExtractor
          imageUrl={imageUrl}
          isAutoRunning={isOCRRunning}
          onClose={() => {
            setShowTextExtractor(false)
            setIsOCRRunning(false)
          }}
          onHighlight={(text) => {
            setShowTextExtractor(false)
            setIsOCRRunning(false)
          }}
        />
      )}
    </div>
  )
}
