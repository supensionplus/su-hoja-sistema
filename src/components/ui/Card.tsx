import type { HTMLAttributes, ReactNode } from 'react'
import { clsx } from 'clsx'
type Props = HTMLAttributes<HTMLDivElement> & { title?: string; description?: string; headerAction?: ReactNode; footer?: ReactNode }
export function Card({ title, description, headerAction, footer, children, className, ...props }: Props) {
  return <section className={clsx('overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-soft', className)} {...props}>
    {(title || description || headerAction) && <header className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
      <div>{title && <h3 className="text-sm font-semibold text-slate-900">{title}</h3>}{description && <p className="mt-1 text-sm text-slate-500">{description}</p>}</div>{headerAction}
    </header>}
    <div className="p-5 sm:p-6">{children}</div>
    {footer && <footer className="border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:px-6">{footer}</footer>}
  </section>
}