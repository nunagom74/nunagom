'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProductGalleryProps {
    images: string[]
    title: string
    soldOut: boolean
    madeToOrder: boolean
    dict: any
}

export function ProductGallery({ images, title, soldOut, madeToOrder, dict }: ProductGalleryProps) {
    const [selectedIndex, setSelectedIndex] = useState(0)

    const hasMultipleImages = images.length > 1

    const handlePrevious = () => {
        setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
    }

    const handleNext = () => {
        setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
    }

    // Determine current image to show
    const currentImage = images[selectedIndex]

    return (
        <div className="space-y-4">
            <div className="aspect-square bg-muted rounded-2xl overflow-hidden relative group">
                {currentImage ? (
                    <img
                        src={currentImage}
                        alt={`${title} - Image ${selectedIndex + 1}`}
                        className="object-cover w-full h-full transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-secondary text-secondary-foreground/20">
                        No Image
                    </div>
                )}

                {/* Overlays */}
                {soldOut && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white font-bold text-xl backdrop-blur-sm">
                        {dict.product.sold_out}
                    </div>
                )}

                {/* Navigation Arrows */}
                {hasMultipleImages && (
                    <>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={handlePrevious}
                        >
                            <ChevronLeft className="h-6 w-6" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={handleNext}
                        >
                            <ChevronRight className="h-6 w-6" />
                        </Button>
                    </>
                )}
            </div>

            {/* Thumbnails */}
            {hasMultipleImages && (
                <div className="grid grid-cols-5 gap-3">
                    {images.map((img, idx) => (
                        <button
                            key={idx}
                            onClick={() => setSelectedIndex(idx)}
                            className={cn(
                                "aspect-square bg-muted rounded-lg overflow-hidden relative border-2 transition-all",
                                selectedIndex === idx ? "border-primary ring-2 ring-primary/20" : "border-transparent hover:border-primary/50"
                            )}
                        >
                            <img src={img} alt="" className="object-cover w-full h-full" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
