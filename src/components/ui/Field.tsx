import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, ReactNode } from 'react'
import { clsx } from 'clsx'

type Common = { label?: string; error?: string; hint?: string; id?: string }
function FieldFrame({ label, error, hint, id, children }: Common & { children: ReactNode }) {
  return <div className="w-full space-y-1.5">
    {label && <label htmlFor={id} className="block text-sm font-medium text-slate-700">{label}</label>}
    {children}
    {error ? <p role="alert" className="text-xs font-medium text-danger">{error}</p> : hint ? <p className="text-xs text-slate-500">{hint}</p> : null}
  </div>
}
const fieldClass = 'block w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 border-slate-200 transition-shadow focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/10 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500'
export function Input({ label, error, hint, id, className, ...props }: InputHTMLAttributes<HTMLInputElement> & Common) {
  return <FieldFrame label={label} error={error} hint={hint} id={id}><input id={id} aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined} className={clsx(fieldClass, error && 'border-danger focus:border-danger focus:ring-danger/10', className)} {...props} /></FieldFrame>
}
export function Select({ label, error, hint, id, className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement> & Common) {
  return <FieldFrame label={label} error={error} hint={hint} id={id}><select id={id} aria-invalid={!!error} className={clsx(fieldClass, error && 'border-danger focus:border-danger', className)} {...props}>{children}</select></FieldFrame>
}
export function Textarea({ label, error, hint, id, className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & Common) {
  return <FieldFrame label={label} error={error} hint={hint} id={id}><textarea id={id} aria-invalid={!!error} className={clsx(fieldClass, 'min-h-28 resize-y', error && 'border-danger focus:border-danger', className)} {...props} /></FieldFrame>
}