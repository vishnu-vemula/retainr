import Link from 'next/link'
import { AlertTriangle, BarChart3, CircleCheck, Percent, RefreshCw, Trophy, UsersRound, Wallet } from 'lucide-react'
import { useStats } from '../hooks/use-stats'
import { EmptyState } from '../../../shared/components/empty-state'
import { PageHeader } from '../../../shared/components/page-header'
import { Button } from '../../../shared/components/ui/button'
import { Card } from '../../../shared/components/ui/card'
import { Skeleton } from '../../../shared/components/ui/skeleton'
import { formatCompactCurrency, titleCase } from '../../../shared/lib/format'
import { stageDotClass } from '../../../shared/lib/stage-style'
import { cn } from '../../../shared/lib/utils'
import { CONTACT_STATUSES, DEAL_STAGES, type ContactStatus, type DashboardStats } from '../../../shared/types'
import { RevenueChart, SectionTitle, StatTile, plural } from './dashboard-widgets'

const statusColor: Record<ContactStatus, string> = {
  LEAD: 'bg-stone-400',
  QUALIFIED: 'bg-sky-500',
  CUSTOMER: 'bg-emerald-500',
  CHURNED: 'bg-rose-500',
}

function percent(part: number, total: number): number {
  return total > 0 ? Math.round((part / total) * 100) : 0
}

function StageDistribution({ stats }: { stats: DashboardStats }) {
  const total = Math.max(1, stats.deals.total)
  return (
    <ul className="mt-6 space-y-4">
      {DEAL_STAGES.map((stage) => {
        const count = stats.deals.byStage[stage] ?? 0
        const share = percent(count, total)
        return (
          <li key={stage} className="grid grid-cols-[7.5rem_1fr_4.5rem] items-center gap-3 text-sm">
            <span className="flex items-center gap-2 font-medium text-foreground">
              <span className={cn('h-2 w-2 rounded-full', stageDotClass[stage])} />
              {titleCase(stage)}
            </span>
            <span className="h-2.5 overflow-hidden rounded-full bg-secondary">
              <span
                className="block h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600"
                style={{ width: `${Math.max(count > 0 ? 3 : 0, share)}%` }}
              />
            </span>
            <span className="text-right tabular-nums text-muted-foreground">
              {count} <span className="text-xs">· {share}%</span>
            </span>
          </li>
        )
      })}
    </ul>
  )
}

function ContactMix({ stats }: { stats: DashboardStats }) {
  const total = stats.contacts.total
  return (
    <div className="mt-6">
      <div className="flex h-4 gap-0.5 overflow-hidden rounded-full bg-secondary" role="img" aria-label="Contacts by status">
        {CONTACT_STATUSES.map((status) => {
          const count = stats.contacts.byStatus[status] ?? 0
          return count > 0 ? (
            <span key={status} className={statusColor[status]} style={{ width: `${percent(count, total)}%` }} />
          ) : null
        })}
      </div>
      <ul className="mt-6 grid grid-cols-2 gap-3">
        {CONTACT_STATUSES.map((status) => {
          const count = stats.contacts.byStatus[status] ?? 0
          return (
            <li key={status} className="rounded-2xl border border-border/60 p-3">
              <p className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <span className={cn('h-2 w-2 rounded-full', statusColor[status])} />
                {titleCase(status)}
              </p>
              <p className="mt-1.5 font-display text-2xl font-semibold tracking-tight text-foreground">
                {count}
                <span className="ml-1.5 text-xs font-medium text-muted-foreground">{percent(count, total)}%</span>
              </p>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function TaskHealth({ stats }: { stats: DashboardStats }) {
  const { total, open, overdue } = stats.tasks
  const done = Math.max(0, total - open)
  const onTime = Math.max(0, open - overdue)
  const segments = [
    { label: 'Done', value: done, className: 'bg-emerald-500' },
    { label: 'Open, on time', value: onTime, className: 'bg-brand-300' },
    { label: 'Overdue', value: overdue, className: 'bg-rose-500' },
  ]
  return (
    <div className="mt-6">
      <p className="font-display text-5xl font-semibold tracking-[-0.04em] text-foreground">
        {percent(done, total)}
        <span className="text-2xl text-muted-foreground">%</span>
      </p>
      <p className="mt-1 text-sm text-muted-foreground">of all tasks completed</p>
      <div className="mt-6 flex h-3 gap-0.5 overflow-hidden rounded-full bg-secondary" role="img" aria-label="Task health">
        {segments.map((segment) =>
          segment.value > 0 ? (
            <span key={segment.label} className={segment.className} style={{ width: `${percent(segment.value, total)}%` }} />
          ) : null,
        )}
      </div>
      <ul className="mt-5 space-y-2.5 text-sm">
        {segments.map((segment) => (
          <li key={segment.label} className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-foreground">
              <span className={cn('h-2 w-2 rounded-full', segment.className)} />
              {segment.label}
              {segment.label === 'Overdue' && segment.value > 0 ? <AlertTriangle className="h-3.5 w-3.5 text-rose-600" /> : null}
            </span>
            <span className="tabular-nums text-muted-foreground">{segment.value}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function ReportsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <Card key={index} className="p-6">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-8 h-9 w-32" />
          </Card>
        ))}
      </div>
      <Card className="h-80 p-6">
        <Skeleton className="h-full w-full" />
      </Card>
    </div>
  )
}

export function ReportsPage() {
  const { data: stats, isLoading, isError, refetch, isRefetching } = useStats()

  return (
    <div>
      <PageHeader
        eyebrow="Insights"
        title="Reports"
        description="How your pipeline, revenue, contacts and follow-ups are performing right now."
        action={
          <Button type="button" variant="outline" onClick={() => void refetch()} disabled={isRefetching}>
            <RefreshCw className={cn('h-4 w-4', isRefetching && 'animate-spin')} />
            Refresh
          </Button>
        }
      />
      {isError ? (
        <EmptyState
          icon={AlertTriangle}
          title="We couldn't load your reports"
          description="The API didn't respond. Check that the backend is running, then try again."
        />
      ) : isLoading || !stats ? (
        <ReportsSkeleton />
      ) : (
        <ReportsContent stats={stats} />
      )}
    </div>
  )
}

function ReportsContent({ stats }: { stats: DashboardStats }) {
  const won = stats.deals.byStage.WON ?? 0
  const lost = stats.deals.byStage.LOST ?? 0
  const closed = won + lost
  const revenue = stats.revenueByMonth.slice(-12)
  const revenueTotal = revenue.reduce((sum, entry) => sum + entry.total, 0)
  const pipelineTotal = Math.max(1, ...stats.topCompanies.map((company) => company.pipelineValue))
  const completion = percent(Math.max(0, stats.tasks.total - stats.tasks.open), stats.tasks.total)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatTile
          label="Win rate"
          value={closed > 0 ? `${percent(won, closed)}%` : '—'}
          sub={closed > 0 ? `${won} won · ${lost} lost` : 'No closed deals yet'}
          icon={Percent}
        />
        <StatTile
          label="Open pipeline"
          value={formatCompactCurrency(stats.deals.pipelineValue, 'USD')}
          sub={plural(stats.deals.total - closed, 'open deal')}
          icon={Wallet}
        />
        <StatTile label="Won revenue" value={formatCompactCurrency(stats.deals.wonValue, 'USD')} sub={plural(won, 'deal')} icon={Trophy} />
        <StatTile
          label="Avg deal size"
          value={formatCompactCurrency(stats.deals.avgDealSize, 'USD')}
          sub={`across ${plural(stats.deals.total, 'deal')}`}
          icon={BarChart3}
        />
        <StatTile
          label="Task completion"
          value={`${completion}%`}
          sub={`${stats.tasks.open} open of ${stats.tasks.total}`}
          alert={stats.tasks.overdue > 0 ? `${stats.tasks.overdue} overdue` : undefined}
          icon={CircleCheck}
        />
        <StatTile
          label="Contacts"
          value={stats.contacts.total.toLocaleString()}
          sub={`${stats.contacts.byStatus.CUSTOMER ?? 0} customers`}
          icon={UsersRound}
        />
      </div>

      <Card className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <SectionTitle title="Revenue trend" sub={`Won deal value, last ${plural(revenue.length, 'month')}`} />
          {revenue.length > 0 ? (
            <div className="text-right">
              <p className="font-display text-2xl font-semibold tracking-tight text-foreground">
                {formatCompactCurrency(revenueTotal, 'USD')}
              </p>
              <p className="text-xs text-muted-foreground">total in period</p>
            </div>
          ) : null}
        </div>
        <RevenueChart revenue={revenue} />
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <SectionTitle title="Pipeline by stage" sub="Share of all deals in each stage" href="/deals" linkLabel="Board" />
          <StageDistribution stats={stats} />
        </Card>
        <Card className="p-6">
          <SectionTitle title="Task health" sub="Done, on time and overdue" href="/tasks" />
          <TaskHealth stats={stats} />
        </Card>
        <Card className="p-6">
          <SectionTitle title="Contact mix" sub={`${stats.contacts.total} contacts by status`} href="/contacts" />
          <ContactMix stats={stats} />
        </Card>
        <Card className="p-6 lg:col-span-2">
          <SectionTitle title="Top companies" sub="Ranked by open pipeline value" href="/companies" />
          {stats.topCompanies.length === 0 ? (
            <p className="mt-6 text-sm text-muted-foreground">No pipeline data yet.</p>
          ) : (
            <ol className="mt-5 divide-y divide-border/60">
              {stats.topCompanies.map((company, index) => (
                <li key={company.companyId ?? company.name} className="grid grid-cols-[2rem_1fr_auto] items-center gap-3 py-3 sm:grid-cols-[2rem_1fr_10rem_6rem]">
                  <span className="text-xs font-semibold tabular-nums text-muted-foreground">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="min-w-0">
                    {company.companyId ? (
                      <Link href={`/companies/${company.companyId}`} className="block truncate text-sm font-medium text-foreground hover:text-primary">
                        {company.name}
                      </Link>
                    ) : (
                      <span className="block truncate text-sm font-medium text-foreground">{company.name}</span>
                    )}
                    <span className="block text-xs text-muted-foreground">{plural(company.dealCount, 'deal')}</span>
                  </span>
                  <span className="hidden h-2 overflow-hidden rounded-full bg-secondary sm:block">
                    <span
                      className="block h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600"
                      style={{ width: `${percent(company.pipelineValue, pipelineTotal)}%` }}
                    />
                  </span>
                  <span className="text-right text-sm font-semibold tabular-nums text-foreground">
                    {formatCompactCurrency(company.pipelineValue, 'USD')}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </Card>
      </div>
    </div>
  )
}
