import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { LoaderCircle } from 'lucide-react'
import { clsx } from 'clsx'

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; loading?: boolean; children: ReactNode }
const styles: Record<Variant, string> = {
  primary: 'bg-brand text-white shadow-sm hover:bg-brand-dark',
  secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200',
  outline: 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
  ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  destructive: 'bg-danger text-white hover:bg-red-700'
}
export const Button = forwardRef<HTMLButtonElement, Props>(function Button({ variant = 'primary', loading = false, disabled, className, children, ...props }, ref) {
  return <button ref={ref} disabled={disabled || loading} aria-busy={loading} className={clsx('inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/20 disabled:cursor-not-allowed disabled:opacity-50', styles[variant], className)} {...props}>
    {loading && <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" />}{children}
  </button>
})