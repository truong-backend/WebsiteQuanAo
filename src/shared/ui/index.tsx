import { forwardRef, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@shared/lib'

// ─── Button ──────────────────────────────────────────────────────────────────
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?:    'sm' | 'md' | 'lg'
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, className, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-body font-medium tracking-wider uppercase transition-all duration-300',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          size === 'sm' && 'text-xs px-4 py-2',
          size === 'md' && 'text-xs px-6 py-3',
          size === 'lg' && 'text-sm px-8 py-4',
          variant === 'primary'   && 'bg-brand-black text-brand-white hover:bg-brand-charcoal',
          variant === 'secondary' && 'border border-brand-black text-brand-black hover:bg-brand-black hover:text-brand-white',
          variant === 'ghost'     && 'text-brand-mid hover:text-brand-black underline-offset-4 hover:underline',
          variant === 'danger'    && 'bg-red-600 text-white hover:bg-red-700',
          className,
        )}
        {...props}
      >
        {loading ? <Spinner size="sm" /> : children}
      </button>
    )
  },
)
Button.displayName = 'Button'

// ─── Input ───────────────────────────────────────────────────────────────────
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?:   string
  error?:   string
  leading?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leading, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label className="text-xs font-medium uppercase tracking-wider text-brand-charcoal">
            {label}
          </label>
        )}
        <div className="relative">
          {leading && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-mid">
              {leading}
            </span>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full border border-brand-light bg-transparent px-4 py-3 text-sm font-body',
              'focus:outline-none focus:border-brand-black transition-colors duration-200',
              'placeholder:text-brand-mid',
              error && 'border-red-500',
              leading && 'pl-10',
              className,
            )}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    )
  },
)
Input.displayName = 'Input'

// ─── Select ──────────────────────────────────────────────────────────────────
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?:   string
  options:  { value: string; label: string }[]
}
export function Select({ label, options, className, ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-xs font-medium uppercase tracking-wider text-brand-charcoal">
          {label}
        </label>
      )}
      <select
        className={cn(
          'w-full border border-brand-light bg-brand-white px-4 py-3 text-sm font-body',
          'focus:outline-none focus:border-brand-black transition-colors',
          className,
        )}
        {...props}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}

// ─── Spinner ─────────────────────────────────────────────────────────────────
export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  return (
    <span
      className={cn(
        'inline-block rounded-full border-2 border-current border-t-transparent animate-spin',
        size === 'sm' && 'w-4 h-4',
        size === 'md' && 'w-6 h-6',
        size === 'lg' && 'w-10 h-10',
      )}
    />
  )
}

// ─── Badge ───────────────────────────────────────────────────────────────────
interface BadgeProps {
  children: ReactNode
  variant?: 'default' | 'gold' | 'success' | 'error' | 'warning'
}
export function Badge({ children, variant = 'default' }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider rounded-brand',
        variant === 'default' && 'bg-brand-cream text-brand-charcoal',
        variant === 'gold'    && 'bg-brand-gold text-brand-black',
        variant === 'success' && 'bg-green-100 text-green-800',
        variant === 'error'   && 'bg-red-100 text-red-700',
        variant === 'warning' && 'bg-amber-100 text-amber-800',
      )}
    >
      {children}
    </span>
  )
}

// ─── Skeleton ────────────────────────────────────────────────────────────────
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'rounded-brand bg-gradient-to-r from-brand-cream via-brand-light/50 to-brand-cream',
        'bg-[length:200%_100%] animate-shimmer',
        className,
      )}
    />
  )
}

// ─── Modal ───────────────────────────────────────────────────────────────────
interface ModalProps {
  open:       boolean
  onClose:    () => void
  title?:     string
  children:   ReactNode
  className?: string
}
export function Modal({ open, onClose, title, children, className }: ModalProps) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-brand-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={cn(
          'relative bg-brand-white z-10 shadow-2xl w-full max-h-[90vh] overflow-y-auto',
          'animate-fade-up',
          className ?? 'max-w-lg mx-4 p-8',
        )}
      >
        {title && (
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl">{title}</h2>
            <button
              onClick={onClose}
              className="text-brand-mid hover:text-brand-black transition-colors text-xl"
            >
              ✕
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}

// ─── Divider ─────────────────────────────────────────────────────────────────
export function Divider({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex-1 h-px bg-brand-light" />
      {label && <span className="text-xs text-brand-mid uppercase tracking-wider">{label}</span>}
      <div className="flex-1 h-px bg-brand-light" />
    </div>
  )
}

// ─── EmptyState ──────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, description, action }: {
  icon?:        string
  title:        string
  description?: string
  action?:      ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
      {icon && <span className="text-5xl">{icon}</span>}
      <h3 className="font-display text-2xl text-brand-charcoal">{title}</h3>
      {description && <p className="text-sm text-brand-mid max-w-xs">{description}</p>}
      {action}
    </div>
  )
}
