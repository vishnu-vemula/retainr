import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Card } from './ui/card'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <Card className="relative overflow-hidden border-dashed border-border bg-card/60 shadow-none">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(60%_100%_at_50%_0%,hsl(var(--primary)/0.08),transparent)]"
      />
      <div className="relative flex flex-col items-center gap-3 px-6 py-14 text-center">
        {Icon ? (
          <span className="mb-1 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 text-white shadow-glow">
            <Icon className="h-6 w-6" />
          </span>
        ) : null}
        <p className="font-display text-lg font-semibold tracking-tight text-foreground">{title}</p>
        {description ? <p className="max-w-sm text-sm text-muted-foreground">{description}</p> : null}
        {action ? <div className="mt-2">{action}</div> : null}
      </div>
    </Card>
  )
}
