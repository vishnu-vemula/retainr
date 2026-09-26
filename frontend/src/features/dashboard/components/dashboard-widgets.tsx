import Link from 'next/link'
import { AlertTriangle, ArrowUpRight, type LucideIcon } from 'lucide-react'
import { Button } from '../../../shared/components/ui/button'
import { Card } from '../../../shared/components/ui/card'
import { formatCompactCurrency, formatCurrency, formatMonthLabel } from '../../../shared/lib/format'
import { cn } from '../../../shared/lib/utils'
import type { DashboardStats, DealStage } from '../../../shared/types'

export const OPEN_STAGES: DealStage[] = ['NEW', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION']

export function plural(count: number, noun: string): string {
  return `${count} ${noun}${count === 1 ? '' : 's'}`
}

export interface StatTileProps {
  label: string
  value: string
  sub?: string
  alert?: string
  icon: LucideIcon
}

export function StatTile({ label, value, sub, alert, icon: Icon }: StatTileProps) {
  return (
    <Card className="group relative overflow-hidden p-5 transition-shadow duration-300 hover:shadow-lift sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-6 font-display text-4xl font-semibold tracking-[-0.04em] text-foreground">{value}</p>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        {sub ? <span>{sub}</span> : null}
        {alert ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 font-medium text-rose-700 ring-1 ring-inset ring-rose-600/20">
            <AlertTriangle className="h-3 w-3" />
            {alert}
          </span>
        ) : null}
      </div>
    </Card>
  )
}

export function SectionTitle({ title, sub, href, linkLabel }: { title: string; sub?: string; href?: string; linkLabel?: string }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-foreground">{title}</h2>
        {sub ? <p className="mt-0.5 text-sm text-muted-foreground">{sub}</p> : null}
      </div>
      {href ? (
        <Button asChild variant="outline" size="sm" className="shadow-none">
          <Link href={href}>
            {linkLabel ?? 'View all'}
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      ) : null}
    </div>
  )
}

export function RevenueChart({ revenue }: { revenue: DashboardStats['revenueByMonth'] }) {
  if (revenue.length === 0) {
    return <p className="mt-6 text-sm text-muted-foreground">No won revenue recorded yet.</p>
  }
  const maxRevenue = Math.max(1, ...revenue.map((entry) => entry.total))
  const lastIndex = revenue.length - 1

  return (
    <div className="mt-2">
      <div className="relative h-64 pt-10">
        <div className="relative h-full">
          {[1, 0.5].map((ratio) => (
            <div
              key={ratio}
              className="absolute inset-x-0 border-t border-dashed border-border"
              style={{ bottom: `${ratio * 100}%` }}
            >
              <span className="absolute -top-2.5 left-0 bg-card pr-2 text-[11px] text-muted-foreground">
                {formatCompactCurrency(maxRevenue * ratio, 'USD')}
              </span>
            </div>
          ))}
          <div className="absolute inset-0 flex items-end gap-2 border-b border-border pl-14 sm:gap-4">
            {revenue.map((entry, index) => {
              const height = Math.max(2, Math.round((entry.total / maxRevenue) * 100))
              const isLatest = index === lastIndex
              return (
                <div
                  key={entry.month}
                  role="img"
                  aria-label={`${formatMonthLabel(entry.month)}: ${formatCurrency(entry.total, 'USD')}`}
                  className="group relative flex h-full flex-1 items-end justify-center"
                >
                  <div
                    className={cn(
                      'relative w-full max-w-14 rounded-t-[6px] transition-colors duration-200',
                      isLatest ? 'bg-primary' : 'bg-brand-200 group-hover:bg-brand-300',
                    )}
                    style={{ height: `${height}%` }}
                  >
                    <span
                      className={cn(
                        'absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg px-2 py-1 text-xs font-medium',
                        isLatest
                          ? 'bg-ink text-white'
                          : 'pointer-events-none bg-ink text-white opacity-0 transition-opacity group-hover:opacity-100',
                      )}
                    >
                      {formatCompactCurrency(entry.total, 'USD')}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
      <div className="mt-2 flex gap-2 pl-14 sm:gap-4">
        {revenue.map((entry, index) => (
          <p
            key={entry.month}
            className={cn(
              'flex-1 truncate text-center text-xs',
              index === lastIndex ? 'font-semibold text-foreground' : 'text-muted-foreground',
            )}
          >
            <span className="sm:hidden">{formatMonthLabel(entry.month).split(' ')[0]}</span>
            <span className="hidden sm:inline">{formatMonthLabel(entry.month)}</span>
          </p>
        ))}
      </div>
    </div>
  )
}
