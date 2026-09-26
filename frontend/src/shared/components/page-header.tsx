import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  description?: string
  eyebrow?: string
  action?: ReactNode
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
      {children}
    </span>
  )
}

export function PageHeader({ title, description, eyebrow, action }: PageHeaderProps) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
      <div className="min-w-0">
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-foreground sm:text-[2.5rem] sm:leading-[1.1]">
          {title}
        </h1>
        {description ? <p className="mt-2 max-w-2xl text-[15px] text-muted-foreground">{description}</p> : null}
      </div>
      {action ? <div className="flex flex-wrap items-center gap-2">{action}</div> : null}
    </div>
  )
}
