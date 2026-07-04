'use client'

import { ChevronLeft, ChevronRight, Trash2, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface NavigationControlsProps {
  onPrevious: () => void
  onNext: () => void
  onRemoveImage: () => void
  canGoPrevious: boolean
  canGoNext: boolean
}

export default function NavigationControls({
  onPrevious,
  onNext,
  onRemoveImage,
  canGoPrevious,
  canGoNext,
}: NavigationControlsProps) {
  return (
    <div className="flex items-center gap-2">
      <Link href="/">
        <Button variant="outline" size="sm" title="Back to Upload">
          <Home className="w-4 h-4" />
        </Button>
      </Link>
      <Button
        onClick={onPrevious}
        disabled={!canGoPrevious}
        variant="outline"
        size="sm"
        title="Previous Image"
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>
      <Button
        onClick={onNext}
        disabled={!canGoNext}
        variant="outline"
        size="sm"
        title="Next Image"
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
      <Button
        onClick={onRemoveImage}
        variant="destructive"
        size="sm"
        title="Delete Current Image"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  )
}
