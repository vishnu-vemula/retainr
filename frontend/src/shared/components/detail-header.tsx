import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import type { ReactNode } from 'react'

interface DetailHeaderProps {
  backTo: string
  backLabel?: string
  title: string
  subtitle?: string
  actions?: ReactNode
}

export function DetailHeader({ backTo, backLabel = 'Back', title, subtitle, actions }: DetailHeaderProps) {
  return (
    <div className="mb-8">
      <Link
        href={backTo}
        className="group mb-4 inline-flex items-center gap-2 rounded-full border border-border/70 bg-card py-1 pl-1 pr-3.5 text-sm font-medium text-muted-foreground shadow-sm transition-colors hover:border-primary/30 hover:text-foreground"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
          <ArrowLeft className="h-3.5 w-3.5" />
        </span>
        {backLabel}
      </Link>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="truncate text-3xl font-semibold tracking-[-0.035em] text-foreground sm:text-[2.5rem] sm:leading-[1.1]">
            {title}
          </h1>
          {subtitle ? <p className="mt-2 text-[15px] text-muted-foreground">{subtitle}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
    </div>
  )
}
