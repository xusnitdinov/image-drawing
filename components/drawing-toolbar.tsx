'use client'

import { Pen, Eraser, Highlighter, Paintbrush, Square, Circle, Minus, Type, Undo2, Trash2, Wand2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DrawingToolbarProps {
  tool: string
  color: string
  size: number
  opacity: number
  onToolChange: (tool: string) => void
  onColorChange: (color: string) => void
  onSizeChange: (size: number) => void
  onOpacityChange: (opacity: number) => void
  onAddShape: (shape: 'rectangle' | 'circle' | 'line') => void
  onAddText: () => void
  onUndo: () => void
  onClear: () => void
  onShowTextExtractor: () => void
}

export default function DrawingToolbar({
  tool,
  color,
  size,
  opacity,
  onToolChange,
  onColorChange,
  onSizeChange,
  onOpacityChange,
  onAddShape,
  onAddText,
  onUndo,
  onClear,
  onShowTextExtractor,
}: DrawingToolbarProps) {
  return (
    <div className="flex flex-col gap-3 max-w-full overflow-x-auto">
      {/* Tool Selection */}
      <div className="flex gap-1 flex-wrap overflow-x-auto pb-2">
        <ToolButton
          icon={Pen}
          label="Pen"
          active={tool === 'pen'}
          onClick={() => onToolChange('pen')}
        />
        <ToolButton
          icon={Eraser}
          label="Eraser"
          active={tool === 'eraser'}
          onClick={() => onToolChange('eraser')}
        />
        <ToolButton
          icon={Highlighter}
          label="Highlight"
          active={tool === 'highlighter'}
          onClick={() => onToolChange('highlighter')}
        />
        <ToolButton
          icon={Paintbrush}
          label="Marker"
          active={tool === 'marker'}
          onClick={() => onToolChange('marker')}
        />
        <ToolButton
          icon={Square}
          label="Rectangle"
          onClick={() => onAddShape('rectangle')}
        />
        <ToolButton
          icon={Circle}
          label="Circle"
          onClick={() => onAddShape('circle')}
        />
        <ToolButton
          icon={Minus}
          label="Line"
          onClick={() => onAddShape('line')}
        />
        <ToolButton
          icon={Type}
          label="Text"
          onClick={() => onAddText()}
        />
        <ToolButton
          icon={Wand2}
          label="Extract Text"
          onClick={() => onShowTextExtractor()}
        />
        <ToolButton
          icon={Undo2}
          label="Undo"
          onClick={() => onUndo()}
          variant="secondary"
        />
        <ToolButton
          icon={Trash2}
          label="Clear All"
          onClick={() => onClear()}
          variant="destructive"
        />
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 flex-wrap items-start sm:items-center">
        {/* Color Picker */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-foreground">Color:</label>
          <input
            type="color"
            value={color}
            onChange={(e) => onColorChange(e.target.value)}
            className="w-12 h-10 rounded cursor-pointer border border-border"
          />
        </div>

        {/* Size Slider */}
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <label className="text-sm font-medium text-foreground whitespace-nowrap">Size:</label>
          <input
            type="range"
            min="1"
            max="50"
            value={size}
            onChange={(e) => onSizeChange(Number(e.target.value))}
            className="flex-1"
          />
          <span className="text-sm text-muted-foreground w-8">{size}px</span>
        </div>

        {/* Opacity Slider */}
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <label className="text-sm font-medium text-foreground whitespace-nowrap">Opacity:</label>
          <input
            type="range"
            min="0"
            max="100"
            value={opacity}
            onChange={(e) => onOpacityChange(Number(e.target.value))}
            className="flex-1"
          />
          <span className="text-sm text-muted-foreground w-8">{opacity}%</span>
        </div>
      </div>
    </div>
  )
}

interface ToolButtonProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  active?: boolean
  onClick: () => void
  variant?: 'default' | 'secondary' | 'destructive'
}

function ToolButton({ icon: Icon, label, active, onClick, variant = 'default' }: ToolButtonProps) {
  let bgClass = 'bg-card hover:bg-muted border-border'
  let textClass = 'text-foreground'

  if (active) {
    bgClass = 'bg-accent'
    textClass = 'text-accent-foreground'
  } else if (variant === 'secondary') {
    bgClass = 'bg-muted hover:bg-muted/80 border-border'
    textClass = 'text-foreground'
  } else if (variant === 'destructive') {
    bgClass = 'bg-destructive/10 hover:bg-destructive/20 border-destructive'
    textClass = 'text-destructive'
  }

  return (
    <button
      onClick={onClick}
      title={label}
      className={`p-2 rounded border flex items-center gap-2 transition-colors ${bgClass} ${textClass}`}
    >
      <Icon className="w-5 h-5" />
      <span className="text-sm hidden sm:inline">{label}</span>
    </button>
  )
}
