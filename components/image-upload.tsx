'use client'

import { useState, useRef } from 'react'
import { Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ImageUploadProps {
  onImagesAdded: (images: string[]) => void
}

export default function ImageUpload({ onImagesAdded }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string[]>([])

  const allowedFormats = ['image/png', 'image/jpeg', 'image/webp']

  const processFiles = (files: FileList) => {
    const imageUrls: string[] = []

    Array.from(files).forEach((file) => {
      if (!allowedFormats.includes(file.type)) return

      const reader = new FileReader()
      reader.onload = (e) => {
        const url = e.target?.result as string
        imageUrls.push(url)
        setPreview((prev) => [...prev, url])

        if (imageUrls.length === Array.from(files).filter((f) => allowedFormats.includes(f.type)).length) {
          onImagesAdded(imageUrls)
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files) {
      processFiles(e.dataTransfer.files)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files)
    }
  }

  const removePreview = (index: number) => {
    setPreview((prev) => prev.filter((_, i) => i !== index))
  }

  const handleStartDrawing = () => {
    onImagesAdded(preview)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl sm:text-6xl font-bold text-foreground mb-4">Photo Drawer</h1>
          <p className="text-lg text-muted-foreground">Upload your images and annotate them with professional drawing tools</p>
        </div>

        {/* Upload Area */}
        {preview.length === 0 ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all ${
              isDragging ? 'border-accent bg-accent/5' : 'border-border bg-card/50 hover:bg-card'
            }`}
          >
            <Upload className="mx-auto mb-4 h-12 w-12 text-accent" />
            <h2 className="text-2xl font-semibold text-foreground mb-2">Drop images here</h2>
            <p className="text-muted-foreground mb-4">or click to select files</p>
            <p className="text-sm text-muted-foreground">Supports PNG, JPG, and WebP formats</p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/png,image/jpeg,image/webp"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        ) : (
          <div>
            {/* Preview Grid */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-foreground mb-4">Selected Images ({preview.length})</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {preview.map((url, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                      <img src={url} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                    </div>
                    <button
                      onClick={() => removePreview(index)}
                      className="absolute top-2 right-2 bg-destructive text-destructive-foreground p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center sm:justify-start">
              <Button
                onClick={handleStartDrawing}
                className="px-8 py-3 text-lg bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                Start Drawing
              </Button>
              <Button
                onClick={() => {
                  fileInputRef.current?.click()
                }}
                variant="outline"
                className="px-8 py-3 text-lg"
              >
                Add More Images
              </Button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/png,image/jpeg,image/webp"
              onChange={(e) => {
                if (e.target.files) {
                  const newImages: string[] = []
                  Array.from(e.target.files).forEach((file) => {
                    if (!allowedFormats.includes(file.type)) return
                    const reader = new FileReader()
                    reader.onload = (event) => {
                      const url = event.target?.result as string
                      newImages.push(url)
                      setPreview((prev) => [...prev, url])
                    }
                    reader.readAsDataURL(file)
                  })
                }
              }}
              className="hidden"
            />
          </div>
        )}
      </div>
    </div>
  )
}
