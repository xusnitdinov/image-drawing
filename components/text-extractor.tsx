'use client'

import { useState, useEffect } from 'react'
import { X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TextExtractorProps {
  imageUrl: string
  isAutoRunning?: boolean
  onClose: () => void
  onHighlight: (text: string) => void
}

export default function TextExtractor({ imageUrl, isAutoRunning = false, onClose, onHighlight }: TextExtractorProps) {
  const [extractedText, setExtractedText] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [selectedText, setSelectedText] = useState<string>('')
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const extractText = async () => {
      try {
        setIsLoading(true)
        setError('')

        // Dynamically import Tesseract to avoid SSR issues
        const Tesseract = (await import('tesseract.js')).default

        const result = await Tesseract.recognize(imageUrl, 'eng', {
          logger: (m: any) => {
            console.log('[v0] OCR progress:', m.status, Math.round(m.progress * 100) + '%')
          },
        })

        if (result && result.data && result.data.text) {
          setExtractedText(result.data.text)
        } else {
          setError('No text found in the image.')
        }
      } catch (err: any) {
        console.error('[v0] OCR error:', err?.message || err)
        setError('Failed to extract text. The image quality might be too low or format unsupported.')
      } finally {
        setIsLoading(false)
      }
    }

    extractText()
  }, [imageUrl])

  const handleTextSelection = (e: React.MouseEvent<HTMLDivElement>) => {
    const selection = window.getSelection()
    if (selection && selection.toString()) {
      setSelectedText(selection.toString())
    }
  }

  const handleHighlight = () => {
    if (selectedText) {
      onHighlight(selectedText)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg max-w-2xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Extract Text from Image</h2>
            {isAutoRunning && <p className="text-xs text-muted-foreground mt-1">Auto-extracting text...</p>}
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
              <p className="text-muted-foreground">Extracting text from image...</p>
            </div>
          ) : error ? (
            <div className="text-center">
              <p className="text-destructive">{error}</p>
              <p className="text-sm text-muted-foreground mt-2">Please try again or use manual annotations.</p>
            </div>
          ) : (
            <div
              onClick={handleTextSelection}
              className="text-foreground leading-relaxed whitespace-pre-wrap bg-muted/30 p-4 rounded border border-border cursor-text select-text"
            >
              {extractedText || 'No text found in image'}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border p-6 flex gap-3 justify-end">
          {!isLoading && !error && selectedText && (
            <div className="flex-1 text-sm text-muted-foreground">
              Selected: {selectedText.substring(0, 50)}
              {selectedText.length > 50 ? '...' : ''}
            </div>
          )}
          <Button onClick={onClose} variant="outline">
            Cancel
          </Button>
          {!isLoading && !error && selectedText && (
            <Button onClick={handleHighlight} className="bg-accent hover:bg-accent/90">
              Highlight Text
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
