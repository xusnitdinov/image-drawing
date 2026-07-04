'use client'

import { Pen, Eraser, Highlighter, Paintbrush, Square, Circle, Minus, Type, Undo2, Trash2, Wand2 } from 'lucide-react'

interface ToolButtonProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  active: boolean
  onClick: () => void
}

function ToolButton({ icon: Icon, label, active, onClick }: ToolButtonProps) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={`p-1.5 rounded-md transition-all ${
        active
          ? 'bg-accent text-accent-foreground shadow-lg'
          : 'text-foreground hover:bg-white/10'
      }`}
    >
      <Icon className="w-4 h-4" />
    </button>
  )
}

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
    <div className="flex flex-col gap-2">
      {/* Main Tool Icons - Floating Pill */}
      <div className="flex gap-1 items-center bg-background/40 backdrop-blur-lg rounded-full px-2 py-1.5 border border-white/10 w-fit">
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
          label="Highlighter"
          active={tool === 'highlighter'}
          onClick={() => onToolChange('highlighter')}
        />
        <ToolButton
          icon={Paintbrush}
          label="Marker"
          active={tool === 'marker'}
          onClick={() => onToolChange('marker')}
        />
        
        <div className="w-px h-5 bg-white/10"></div>
        
        <ToolButton
          icon={Square}
          label="Rectangle"
          active={tool === 'rectangle'}
          onClick={() => {
            onToolChange('rectangle')
            onAddShape('rectangle')
          }}
        />
        <ToolButton
          icon={Circle}
          label="Circle"
          active={tool === 'circle'}
          onClick={() => {
            onToolChange('circle')
            onAddShape('circle')
          }}
        />
        <ToolButton
          icon={Minus}
          label="Line"
          active={tool === 'line'}
          onClick={() => {
            onToolChange('line')
            onAddShape('line')
          }}
        />
        <ToolButton
          icon={Type}
          label="Text"
          active={tool === 'text'}
          onClick={() => onToolChange('text')}
        />
        
        <div className="w-px h-5 bg-white/10"></div>
        
        <ToolButton
          icon={Wand2}
          label="Extract Text"
          active={false}
          onClick={onShowTextExtractor}
        />
        <ToolButton
          icon={Undo2}
          label="Undo"
          active={false}
          onClick={onUndo}
        />
        <ToolButton
          icon={Trash2}
          label="Clear All"
          active={false}
          onClick={onClear}
        />
      </div>

      {/* Controls - Color, Size, Opacity */}
      <div className="flex gap-1.5 flex-wrap items-center bg-background/40 backdrop-blur-lg rounded-full px-3 py-1.5 border border-white/10 w-fit">
        {/* Color Picker */}
        <div className="flex items-center gap-1.5">
          <label className="text-xs font-medium text-foreground/70">Color:</label>
          <input
            type="color"
            value={color}
            onChange={(e) => onColorChange(e.target.value)}
            className="w-6 h-6 rounded-md cursor-pointer border border-white/20"
          />
        </div>

        <div className="w-px h-3 bg-white/10"></div>

        {/* Size Slider */}
        <div className="flex items-center gap-1.5">
          <label className="text-xs font-medium text-foreground/70">Size:</label>
          <input
            type="range"
            min="1"
            max="50"
            value={size}
            onChange={(e) => onSizeChange(Number(e.target.value))}
            className="w-20"
            style={{
              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(size / 50) * 100}%, rgba(255,255,255,0.2) ${(size / 50) * 100}%, rgba(255,255,255,0.2) 100%)`
            } as React.CSSProperties}
          />
          <span className="text-xs text-foreground/60 w-5">{size}</span>
        </div>

        <div className="w-px h-3 bg-white/10"></div>

        {/* Opacity Slider */}
        <div className="flex items-center gap-1.5">
          <label className="text-xs font-medium text-foreground/70">Opacity:</label>
          <input
            type="range"
            min="0"
            max="100"
            value={opacity}
            onChange={(e) => onOpacityChange(Number(e.target.value))}
            className="w-20"
            style={{
              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${opacity}%, rgba(255,255,255,0.2) ${opacity}%, rgba(255,255,255,0.2) 100%)`
            } as React.CSSProperties}
          />
          <span className="text-xs text-foreground/60 w-5">{opacity}%</span>
        </div>
      </div>
    </div>
  )
}
