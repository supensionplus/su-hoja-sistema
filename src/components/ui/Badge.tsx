import type { HTMLAttributes } from 'react'
import { clsx } from 'clsx'
type Tone = 'success' | 'warning' | 'danger' | 'neutral' | 'brand'
const tones: Record<Tone, string> = {
  success: 'bg-green-50 text-green-700 ring-green-600/15',
  warning: 'bg-amber-50 text-amber-800 ring-amber-600/20',
  danger: 'bg-red-50 text-red-700 ring-red-600/15',
  neutral: 'bg-slate-100 text-slate-600 ring-slate-500/10',
  brand: 'bg-emerald-50 text-emerald-700 ring-emerald-600/15'
}
export function Badge({ tone = 'neutral', className, children, ...props }: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return <span className={clsx('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset', tones[tone], className)} {...props}>{children}</span>
}