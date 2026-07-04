'use client'

import { useState, useEffect, useRef } from 'react'
import DrawingToolbar from './drawing-toolbar'
import TextExtractor from './text-extractor'
import ExportButton from './export-button'
import NavigationControls from './navigation-controls'

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
  const [tool, setTool] = useState<string>('pen')
  const [color, setColor] = useState<string>('#000000')
  const [size, setSize] = useState<number>(3)
  const [opacity, setOpacity] = useState<number>(100)
  const [isDrawing, setIsDrawing] = useState(false)
  const [showTextExtractor, setShowTextExtractor] = useState(false)
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const historyRef = useRef<ImageData[]>([])
  const isDrawingRef = useRef(false)
  const lastPointRef = useRef<DrawPoint>({ x: 0, y: 0 })

  // Load image
  useEffect(() => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      setImage(img)
    }
    img.src = imageUrl
  }, [imageUrl])

  // Initialize and draw canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !image) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const maxWidth = window.innerWidth - 80
    const maxHeight = window.innerHeight - 200
    const scale = Math.min(maxWidth / image.width, maxHeight / image.height)

    canvas.width = image.width * scale
    canvas.height = image.height * scale

    // Draw image
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
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
    historyRef.current = [ctx.getImageData(0, 0, canvas.width, canvas.height)]
  }

  return (
    <div className="w-full h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-foreground">Photo Drawer</h1>
          <span className="text-sm text-muted-foreground">
            {currentIndex + 1} / {totalImages}
          </span>
        </div>
        <NavigationControls
          onPrevious={onPrevious}
          onNext={onNext}
          onRemoveImage={onRemoveImage}
          canGoPrevious={currentIndex > 0}
          canGoNext={currentIndex < totalImages - 1}
        />
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 relative overflow-auto bg-muted/30 flex items-center justify-center p-4">
        {image ? (
          <div className="relative">
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="cursor-crosshair border border-border shadow-lg rounded-lg max-w-full max-h-full"
            />
          </div>
        ) : (
          <div className="text-center">
            <p className="text-muted-foreground">Loading image...</p>
          </div>
        )}
      </div>

      {/* Toolbar */}
      <div className="bg-card border-t border-border p-4 space-y-4">
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
        <ExportButton canvasRef={canvasRef} />
      </div>

      {/* Text Extractor Modal */}
      {showTextExtractor && (
        <TextExtractor
          imageUrl={imageUrl}
          onClose={() => setShowTextExtractor(false)}
          onHighlight={(text) => {
            setShowTextExtractor(false)
          }}
        />
      )}
    </div>
  )
}
