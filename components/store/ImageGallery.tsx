'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Package } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function ImageGallery({
  images,
  name,
}: {
  images: string[]
  name: string
}) {
  const [active, setActive] = useState(0)

  if (!images || images.length === 0) {
    return (
      <div className="flex aspect-4/3 items-center justify-center rounded-xl bg-muted">
        <Package className="h-24 w-24 text-muted-foreground/20" />
      </div>
    )
  }

  return (
    <div>
      {/* Image principale */}
      <div className="relative aspect-4/3 overflow-hidden rounded-xl bg-muted">
        <Image
          key={images[active]}
          src={images[active]}
          alt={name}
          fill
          className="object-contain p-6 transition-opacity duration-200"
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-5 gap-2">
          {images.slice(0, 5).map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={cn(
                'relative aspect-square overflow-hidden rounded-lg bg-muted ring-2 transition-all',
                i === active
                  ? 'ring-primary'
                  : 'ring-transparent opacity-60 hover:opacity-100 hover:ring-border'
              )}
            >
              <Image
                src={img}
                alt={`${name} — vue ${i + 1}`}
                fill
                className="object-contain p-1"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
