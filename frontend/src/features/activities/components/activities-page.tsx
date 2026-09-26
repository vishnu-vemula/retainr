import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Calendar, ChevronLeft, ChevronRight, FileText, KanbanSquare, Mail, MessagesSquare, Phone, Plus, UserRound } from 'lucide-react'
import { useActivities } from '../hooks/use-activities'
import { ActivityDialog } from './activity-dialog'
import { EmptyState } from '../../../shared/components/empty-state'
import { PageHeader } from '../../../shared/components/page-header'
import { SkeletonList } from '../../../shared/components/skeleton'
import { Badge } from '../../../shared/components/ui/badge'
import { Button } from '../../../shared/components/ui/button'
import { Card } from '../../../shared/components/ui/card'
import { titleCase } from '../../../shared/lib/format'
import { cn } from '../../../shared/lib/utils'
import { ACTIVITY_TYPES, type Activity, type ActivityType } from '../../../shared/types'

const PAGE_SIZE = 50

const typeIcons: Record<ActivityType, typeof FileText> = {
  NOTE: FileText,
  CALL: Phone,
  EMAIL: Mail,
  MEETING: Calendar,
}

function dayKey(iso: string): string {
  const date = new Date(iso)
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
}

function dayLabel(iso: string): string {
  const date = new Date(iso)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)
  if (dayKey(iso) === dayKey(today.toISOString())) return 'Today'
  if (dayKey(iso) === dayKey(yesterday.toISOString())) return 'Yesterday'
  return date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })
}

function groupByDay(activities: Activity[]): { key: string; label: string; items: Activity[] }[] {
  const groups = new Map<string, { key: string; label: string; items: Activity[] }>()
  for (const activity of activities) {
    const key = dayKey(activity.occurredAt)
    const group = groups.get(key) ?? { key, label: dayLabel(activity.occurredAt), items: [] }
    group.items.push(activity)
    groups.set(key, group)
  }
  return Array.from(groups.values())
}

export function ActivitiesPage() {
  const [page, setPage] = useState(1)
  const [type, setType] = useState<ActivityType | 'ALL'>('ALL')
  const [dialogOpen, setDialogOpen] = useState(false)
  const { data, isLoading } = useActivities({ page, pageSize: PAGE_SIZE })

  const items = useMemo(() => data?.items ?? [], [data])
  const filtered = type === 'ALL' ? items : items.filter((activity) => activity.type === type)
  const groups = groupByDay(filtered)
  const total = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / (data?.pageSize ?? PAGE_SIZE)))

  const countFor = (value: ActivityType | 'ALL') =>
    value === 'ALL' ? items.length : items.filter((activity) => activity.type === value).length

  return (
    <div>
      <PageHeader
        eyebrow="Timeline"
        title="Activities"
        description="Every call, email, meeting and note across your workspace, newest first."
        action={
          <Button type="button" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Log activity
          </Button>
        }
      />

      <div className="mb-6 flex flex-wrap gap-2" role="radiogroup" aria-label="Filter by type">
        {(['ALL', ...ACTIVITY_TYPES] as const).map((value) => {
          const Icon = value === 'ALL' ? MessagesSquare : typeIcons[value]
          const selected = type === value
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => setType(value)}
              className={cn(
                'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors',
                selected
                  ? 'border-primary bg-primary text-primary-foreground shadow-glow'
                  : 'border-border/70 bg-card text-foreground/80 hover:border-primary/40 hover:text-primary',
              )}
            >
              <Icon className="h-4 w-4" />
              {value === 'ALL' ? 'All' : titleCase(value)}
              <span
                className={cn(
                  'rounded-full px-1.5 text-[11px] tabular-nums',
                  selected ? 'bg-white/20' : 'bg-secondary text-muted-foreground',
                )}
              >
                {countFor(value)}
              </span>
            </button>
          )
        })}
      </div>

      {isLoading ? (
        <SkeletonList count={5} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={MessagesSquare}
          title={items.length === 0 ? 'No activities yet' : `No ${titleCase(type).toLowerCase()} activities here`}
          description={
            items.length === 0
              ? 'Log a call, email, meeting or note and it will show up on this timeline.'
              : 'Try another filter or log a new activity.'
          }
          action={
            <Button type="button" onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4" />
              Log activity
            </Button>
          }
        />
      ) : (
        <div className="space-y-8">
          {groups.map((group) => (
            <section key={group.key}>
              <h2 className="mb-3 flex items-center gap-3 text-sm font-semibold text-foreground">
                {group.label}
                <span className="h-px flex-1 bg-border/70" />
                <span className="text-xs font-medium text-muted-foreground">{group.items.length}</span>
              </h2>
              <Card className="divide-y divide-border/60 overflow-hidden">
                {group.items.map((activity) => {
                  const Icon = typeIcons[activity.type]
                  return (
                    <article key={activity.id} className="flex gap-4 p-5 transition-colors hover:bg-accent/30">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-accent text-primary">
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-foreground">{activity.title}</p>
                          <Badge variant="muted">{titleCase(activity.type)}</Badge>
                          <span className="ml-auto text-xs text-muted-foreground">
                            {new Date(activity.occurredAt).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
                            {activity.durationMin !== null ? ` · ${activity.durationMin} min` : ''}
                          </span>
                        </div>
                        {activity.body ? (
                          <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{activity.body}</p>
                        ) : null}
                        {activity.contact || activity.deal ? (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {activity.contact ? (
                              <Link
                                href={`/contacts/${activity.contact.id}`}
                                className="inline-flex items-center gap-1.5 rounded-full border border-border/70 px-2.5 py-1 text-xs font-medium text-foreground/80 transition-colors hover:border-primary/40 hover:text-primary"
                              >
                                <UserRound className="h-3 w-3" />
                                {activity.contact.name}
                              </Link>
                            ) : null}
                            {activity.deal ? (
                              <Link
                                href={`/deals/${activity.deal.id}`}
                                className="inline-flex items-center gap-1.5 rounded-full border border-border/70 px-2.5 py-1 text-xs font-medium text-foreground/80 transition-colors hover:border-primary/40 hover:text-primary"
                              >
                                <KanbanSquare className="h-3 w-3" />
                                {activity.deal.title}
                              </Link>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    </article>
                  )
                })}
              </Card>
            </section>
          ))}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {total} activit{total === 1 ? 'y' : 'ies'} in total
            </p>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((current) => current + 1)}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
      {dialogOpen ? <ActivityDialog onClose={() => setDialogOpen(false)} /> : null}
    </div>
  )
}
