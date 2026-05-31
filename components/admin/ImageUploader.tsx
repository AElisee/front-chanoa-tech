'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Upload, X, Loader2 } from 'lucide-react'
import { mediaApi } from '@/lib/api/media'
import { toast } from 'sonner'

interface Props {
  initialImages: string[]
  inputName?: string
  maxImages?: number
  targetSize?: number
  productId?: string
  /** Token JWT passé depuis le server component pour éviter le 401 après refresh de page */
  token?: string
}

/**
 * Auto-crop image to square and resize.
 * - Crops centered on the image (largest square that fits)
 * - Resizes to targetSize x targetSize
 * - Outputs WebP at 90% quality for optimal file size
 */
async function processImage(file: File, targetSize: number): Promise<File> {
  const img = document.createElement('img')
  const url = URL.createObjectURL(file)
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve()
    img.onerror = reject
    img.src = url
  })

  // Crop square: take smallest side, center crop
  const side = Math.min(img.naturalWidth, img.naturalHeight)
  const sx = (img.naturalWidth - side) / 2
  const sy = (img.naturalHeight - side) / 2

  const canvas = document.createElement('canvas')
  canvas.width = targetSize
  canvas.height = targetSize
  const ctx = canvas.getContext('2d')!

  // White background (for transparent PNGs)
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, targetSize, targetSize)

  // High-quality scaling
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'

  ctx.drawImage(img, sx, sy, side, side, 0, 0, targetSize, targetSize)
  URL.revokeObjectURL(url)

  return new Promise<File>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Canvas toBlob failed'))
          return
        }
        resolve(new File([blob], `image-${Date.now()}.webp`, { type: 'image/webp' }))
      },
      'image/webp',
      0.9
    )
  })
}

export default function ImageUploader({
  initialImages,
  inputName = 'images',
  maxImages = 5,
  targetSize = 800,
  productId,
  token,
}: Props) {
  const [images, setImages] = useState<string[]>(initialImages)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return

    const remaining = maxImages - images.length
    if (remaining <= 0) {
      toast.error(`Maximum ${maxImages} images`)
      return
    }

    setUploading(true)
    const newUrls: string[] = []

    for (let i = 0; i < Math.min(files.length, remaining); i++) {
      const file = files[i]
      let processedFile: File
      try {
        processedFile = await processImage(file, targetSize)
      } catch (err) {
        console.error('Image processing error:', err)
        toast.error(`Image invalide : ${file.name}`)
        continue
      }

      try {
        let result: { url: string }
        if (productId) {
          result = await mediaApi.uploadProductImage(productId, processedFile, token)
        } else {
          result = await mediaApi.uploadTemporary(processedFile, token)
        }

        const fullUrl = result.url.startsWith('http')
          ? result.url
          : `${process.env.NEXT_PUBLIC_API_URL}${result.url}`

        newUrls.push(fullUrl)
      } catch (err) {
        console.error('Upload error:', err)
        toast.error(`Erreur upload : ${file.name}`)
      }
    }

    setImages((prev) => [...prev, ...newUrls])
    setUploading(false)
    if (fileRef.current) fileRef.current.value = ''
    if (newUrls.length > 0) toast.success(`${newUrls.length} image(s) uploadée(s)`)
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div>
      {/* Hidden input for form submission */}
      <input type="hidden" name={inputName} value={images.join('\n')} />

      {/* Preview grid */}
      {images.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {images.map((url, i) => (
            <div key={i} className="group relative h-20 w-20 overflow-hidden rounded-lg border bg-muted">
              <Image src={url} alt={`Image ${i + 1}`} fill className="object-contain p-1" sizes="80px" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                aria-label={`Supprimer l'image ${i + 1}`}
                className="absolute right-0.5 top-0.5 hidden rounded-full bg-destructive p-0.5 text-white group-hover:block"
              >
                <X className="h-3 w-3" />
              </button>
              {i === 0 && (
                <span className="absolute bottom-0 left-0 right-0 bg-black/60 px-1 py-0.5 text-center text-[9px] font-bold text-white">
                  Principale
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      {images.length < maxImages && (
        <label className="flex cursor-pointer items-center gap-2 rounded-md border-2 border-dashed px-4 py-3 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary">
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Upload en cours…
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              Ajouter des images ({images.length}/{maxImages})
            </>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      )}

      <p className="mt-1 text-xs text-muted-foreground">
        JPG, PNG, WebP. Max {maxImages} images. Rognées automatiquement en carré {targetSize}×{targetSize}. La première est l&apos;image principale.
      </p>
    </div>
  )
}
