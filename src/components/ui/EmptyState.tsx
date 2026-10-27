import type { ReactNode } from 'react'
import { FileSpreadsheet } from 'lucide-react'
import { Button } from './Button'
type Props = { icon?: ReactNode; title: string; description: string; actionLabel?: string; onAction?: () => void }
export function EmptyState({ icon, title, description, actionLabel, onAction }: Props) {
  return <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/70 px-6 py-12 text-center">
    <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-light text-brand">{icon ?? <FileSpreadsheet size={25} />}</div>
    <h3 className="text-base font-semibold text-slate-900">{title}</h3>
    <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">{description}</p>
    {actionLabel && onAction && <Button className="mt-5" onClick={onAction}>{actionLabel}</Button>}
  </div>
}