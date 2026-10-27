import { LoaderCircle } from 'lucide-react'
export function Skeleton({ className = '' }: { className?: string }) { return <div aria-hidden="true" className={`animate-pulse rounded-lg bg-slate-200/80 ${className}`} /> }
export function Loader({ label = 'Cargando' }: { label?: string }) {
  return <div role="status" className="flex items-center justify-center gap-2 py-8 text-sm text-slate-500"><LoaderCircle className="h-4 w-4 animate-spin text-brand" />{label}<span className="sr-only">, por favor espera</span></div>
}
export function TableSkeleton({ rows = 4 }: { rows?: number }) {
  return <div aria-label="Cargando tabla" className="space-y-3">{Array.from({ length: rows }, (_, i) => <div key={i} className="flex gap-4"><Skeleton className="h-9 w-1/3" /><Skeleton className="h-9 flex-1" /><Skeleton className="h-9 w-20" /></div>)}</div>
}