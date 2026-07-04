'use client'

import { useState } from 'react'
import ImageUpload from '@/components/image-upload'
import Canvas from '@/components/canvas'

export default function Home() {
  const [images, setImages] = useState<string[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)

  const handleImagesAdded = (newImages: string[]) => {
    setImages((prev) => [...prev, ...newImages])
    if (currentIndex === 0 && images.length === 0) {
      setCurrentIndex(0)
    }
  }

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    setImages(newImages)
    if (currentIndex >= newImages.length && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))
  }

  if (images.length === 0) {
    return <ImageUpload onImagesAdded={handleImagesAdded} />
  }

  return (
    <div className="min-h-screen bg-background">
      <Canvas
        imageUrl={images[currentIndex]}
        currentIndex={currentIndex}
        totalImages={images.length}
        onPrevious={goToPrevious}
        onNext={goToNext}
        onRemoveImage={() => handleRemoveImage(currentIndex)}
      />
    </div>
  )
}
