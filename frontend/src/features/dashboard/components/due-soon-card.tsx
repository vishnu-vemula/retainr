import { useState } from 'react'
import Link from 'next/link'
import { CalendarClock, CircleCheck } from 'lucide-react'
import { useTasks } from '../../tasks/hooks/use-tasks'
import { StatusBadge } from '../../../shared/components/status-badge'
import { Card } from '../../../shared/components/ui/card'
import { Skeleton } from '../../../shared/components/ui/skeleton'
import { cn } from '../../../shared/lib/utils'
import type { Task } from '../../../shared/types'
import { SectionTitle } from './dashboard-widgets'

const DAY_MS = 86_400_000

function dueLabel(task: Task, now: number): { text: string; overdue: boolean } {
  if (!task.dueDate) return { text: 'No due date', overdue: false }
  const due = new Date(task.dueDate)
  const startOfToday = new Date(now)
  startOfToday.setHours(0, 0, 0, 0)
  const days = Math.floor((due.getTime() - startOfToday.getTime()) / DAY_MS)
  if (due.getTime() < now) return { text: days < 0 ? `${Math.abs(days)}d overdue` : 'Overdue', overdue: true }
  if (days === 0) return { text: 'Today', overdue: false }
  if (days === 1) return { text: 'Tomorrow', overdue: false }
  if (days < 7) return { text: due.toLocaleDateString(undefined, { weekday: 'short' }), overdue: false }
  return { text: due.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), overdue: false }
}

export function DueSoonCard({ className }: { className?: string }) {
  const { data, isLoading } = useTasks({ pageSize: 50 })
  const [now] = useState(() => Date.now())
  const open = (data?.items ?? [])
    .filter((task) => task.status !== 'DONE')
    .sort((a, b) => {
      if (!a.dueDate) return 1
      if (!b.dueDate) return -1
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    })
    .slice(0, 5)

  return (
    <Card className={cn('p-6', className)}>
      <SectionTitle title="Due soon" sub="Your next open follow-ups" href="/tasks" linkLabel="All tasks" />
      {isLoading ? (
        <div className="mt-6 space-y-3">
          {[0, 1, 2].map((index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </div>
      ) : open.length === 0 ? (
        <div className="mt-6 flex items-center gap-3 rounded-2xl bg-secondary/60 p-4 text-sm text-muted-foreground">
          <CircleCheck className="h-5 w-5 text-emerald-600" />
          You&apos;re all caught up — no open tasks.
        </div>
      ) : (
        <ul className="mt-5 space-y-2">
          {open.map((task) => {
            const due = dueLabel(task, now)
            return (
              <li key={task.id}>
                <Link
                  href="/tasks"
                  className="group flex items-center gap-3 rounded-2xl border border-border/60 px-3 py-3 transition-colors hover:border-primary/25 hover:bg-accent/40"
                >
                  <span
                    className={cn(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
                      due.overdue ? 'bg-rose-50 text-rose-600' : 'bg-secondary text-muted-foreground',
                    )}
                  >
                    <CalendarClock className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-foreground group-hover:text-primary">
                      {task.title}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {task.contact?.name ?? task.deal?.title ?? 'Unlinked task'}
                    </span>
                  </span>
                  {task.priority ? (
                    <span className="hidden sm:block">
                      <StatusBadge variant={task.priority} />
                    </span>
                  ) : null}
                  <span
                    className={cn(
                      'w-20 text-right text-xs font-medium',
                      due.overdue ? 'text-rose-600' : 'text-muted-foreground',
                    )}
                  >
                    {due.text}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}
