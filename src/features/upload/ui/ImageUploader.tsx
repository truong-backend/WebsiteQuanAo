import { useRef, useState, useCallback } from 'react'
import { uploadImage } from '../api/uploadApi'
import { cn } from '@shared/lib'

interface ImageUploaderProps {
  /** URL hiện tại (nếu đang edit) */
  value?:       string | null
  /** Callback khi upload xong — trả về URL mới */
  onChange:     (url: string) => void
  label?:       string
  /** Subfolder trong MinIO bucket */
  folder?:      string
  className?:   string
  /** Hiển thị dạng compact (inline button) hay full card */
  variant?:     'card' | 'inline'
}

export function ImageUploader({
  value,
  onChange,
  label     = 'Ảnh',
  folder    = 'products',
  className,
  variant   = 'card',
}: ImageUploaderProps) {
  const inputRef            = useRef<HTMLInputElement>(null)
  const [dragging, setDrag] = useState(false)
  const [progress, setProg] = useState<number | null>(null)
  const [error, setError]   = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const displayImage = preview ?? value ?? null

  const handleFile = useCallback(
    async (file: File) => {
      // Client-side validation
      const MAX = 5 * 1024 * 1024
      const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
      if (!ALLOWED.includes(file.type)) {
        setError('Chỉ chấp nhận JPEG, PNG, WebP, GIF')
        return
      }
      if (file.size > MAX) {
        setError('File quá lớn. Tối đa 5MB')
        return
      }

      setError(null)
      // Show local preview immediately
      const localUrl = URL.createObjectURL(file)
      setPreview(localUrl)
      setProg(0)

      try {
        const result = await uploadImage(file, folder, (p) => setProg(p))
        onChange(result.url)
        // Keep local preview — it's still valid
      } catch (err: unknown) {
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          'Upload thất bại'
        setError(msg)
        setPreview(null)
      } finally {
        setProg(null)
      }
    },
    [folder, onChange],
  )

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    // Reset input so same file can be re-selected
    e.target.value = ''
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDrag(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  if (variant === 'inline') {
    return (
      <div className={cn('flex flex-col gap-2', className)}>
        {label && (
          <label className="block text-xs font-medium uppercase tracking-wider text-brand-charcoal">
            {label}
          </label>
        )}
        <div className="flex items-center gap-3">
          {displayImage ? (
            <div className="relative w-16 h-16 flex-shrink-0">
              <img
                src={displayImage}
                alt="preview"
                className="w-full h-full object-cover border border-brand-light"
              />
              {progress !== null && (
                <div className="absolute inset-0 bg-brand-black/50 flex items-center justify-center">
                  <span className="text-white text-xs font-mono">{progress}%</span>
                </div>
              )}
            </div>
          ) : (
            <div className="w-16 h-16 flex-shrink-0 border border-dashed border-brand-light flex items-center justify-center text-brand-mid">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          <div className="flex flex-col gap-1">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={progress !== null}
              className="text-xs uppercase tracking-wider text-brand-gold hover:text-brand-black transition-colors disabled:opacity-50"
            >
              {displayImage ? 'Thay ảnh' : 'Chọn ảnh'}
            </button>
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>
        </div>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onInputChange} />
      </div>
    )
  }

  // variant === 'card' (default)
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {label && (
        <label className="block text-xs font-medium uppercase tracking-wider text-brand-charcoal">
          {label}
        </label>
      )}

      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
        onDragLeave={() => setDrag(false)}
        onDrop={onDrop}
        onClick={() => !displayImage && inputRef.current?.click()}
        className={cn(
          'relative border-2 border-dashed transition-all duration-200',
          displayImage ? 'border-brand-light' : 'cursor-pointer',
          dragging && 'border-brand-gold bg-brand-cream/50',
          !displayImage && !dragging && 'border-brand-light hover:border-brand-mid',
        )}
      >
        {displayImage ? (
          <div className="relative">
            <img
              src={displayImage}
              alt="preview"
              className="w-full h-48 object-cover"
            />
            {/* Progress overlay */}
            {progress !== null && (
              <div className="absolute inset-0 bg-brand-black/60 flex flex-col items-center justify-center gap-2">
                <div className="w-3/4 h-1.5 bg-white/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-gold transition-all duration-200"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-white text-xs font-mono">{progress}%</span>
              </div>
            )}
            {/* Change button */}
            {progress === null && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); inputRef.current?.click() }}
                className="absolute bottom-2 right-2 bg-brand-black/70 text-white text-[10px] uppercase tracking-wider px-3 py-1.5 hover:bg-brand-black transition-colors"
              >
                Thay ảnh
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 py-10 px-4 text-brand-mid">
            <svg className="w-10 h-10 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <div className="text-center">
              <p className="text-xs font-medium text-brand-charcoal">Kéo thả ảnh vào đây</p>
              <p className="text-[10px] mt-1">hoặc click để chọn file</p>
              <p className="text-[10px] mt-0.5 text-brand-light">JPEG, PNG, WebP, GIF — tối đa 5MB</p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={onInputChange}
      />
    </div>
  )
}
