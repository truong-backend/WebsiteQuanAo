import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Merge Tailwind class names safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Format VND currency */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style:    'currency',
    currency: 'VND',
  }).format(amount)
}

/** Format ISO date string → dd/MM/yyyy HH:mm */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('vi-VN', {
    day:    '2-digit',
    month:  '2-digit',
    year:   'numeric',
    hour:   '2-digit',
    minute: '2-digit',
  })
}

/** Short date only */
export function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString('vi-VN')
}

// ─── Simple imperative toast ──────────────────────────────────────────────────
type ToastType = 'success' | 'error' | 'info'

export function toast(message: string, type: ToastType = 'success', duration = 3000) {
  const container = document.getElementById('toast-root')
  if (!container) return

  const el = document.createElement('div')
  el.className = [
    'flex items-center gap-2 px-4 py-3 rounded-brand text-sm font-medium shadow-lg',
    'animate-slide-in min-w-[240px] max-w-[360px]',
    type === 'success' ? 'bg-brand-black text-brand-white' : '',
    type === 'error'   ? 'bg-red-600 text-white'           : '',
    type === 'info'    ? 'bg-brand-gold text-brand-black'   : '',
  ].join(' ')

  const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'
  el.innerHTML = `<span>${icon}</span><span>${message}</span>`
  container.appendChild(el)

  setTimeout(() => {
    el.style.opacity = '0'
    el.style.transition = 'opacity 0.3s'
    setTimeout(() => el.remove(), 300)
  }, duration)
}

// ─── Rewrite MinIO internal URL → public URL ──────────────────────────────────
/**
 * Nếu VITE_MINIO_PUBLIC_URL được set, rewrite phần host của imageUrl
 * từ internal MinIO URL (VD: http://minio:9000) → public URL (VD: https://cdn.example.com).
 * Nếu không set thì trả về nguyên URL.
 */
export function resolveImageUrl(url: string | null | undefined): string | null {
  if (!url) return null
  const publicBase = import.meta.env.VITE_MINIO_PUBLIC_URL as string | undefined
  if (!publicBase) return url
  // Thay thế phần origin của URL (http://minio:9000 → publicBase)
  try {
    const parsed = new URL(url)
    const pub    = new URL(publicBase)
    parsed.protocol = pub.protocol
    parsed.hostname  = pub.hostname
    parsed.port      = pub.port
    return parsed.toString()
  } catch {
    return url
  }
}