import Link from 'next/link'
import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  Building2,
  ListChecks,
  RefreshCw,
  Sparkles,
  Trophy,
  UsersRound,
} from 'lucide-react'
import { useStats } from '../hooks/use-stats'
import { OPEN_STAGES, RevenueChart, SectionTitle, StatTile, plural } from './dashboard-widgets'
import { DueSoonCard } from './due-soon-card'
import { RecentActivityCard } from './recent-activity-card'
import { useDeals } from '../../deals/hooks/use-deals'
import { useAuth } from '../../auth/use-auth'
import { EmptyState } from '../../../shared/components/empty-state'
import { Eyebrow } from '../../../shared/components/page-header'
import { StatusBadge } from '../../../shared/components/status-badge'
import { Button } from '../../../shared/components/ui/button'
import { Card } from '../../../shared/components/ui/card'
import { Skeleton } from '../../../shared/components/ui/skeleton'
import {
  formatCompactCurrency,
  formatCompactCurrencyParts,
  formatCurrency,
  formatDate,
} from '../../../shared/lib/format'
import { stageDotClass } from '../../../shared/lib/stage-style'
import { cn } from '../../../shared/lib/utils'
import { DEAL_STAGES, DEAL_STAGE_LABELS, type DashboardStats } from '../../../shared/types'

function greetingFor(date: Date): string {
  const hour = date.getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

function HeroFigure({ value }: { value: number }) {
  return (
    <>
      {formatCompactCurrencyParts(value, 'USD').map((part, index) =>
        part.type === 'compact' ? (
          <span key={index} className="text-brand-950/60">
            {part.value}
          </span>
        ) : (
          <span key={index}>{part.value}</span>
        ),
      )}
    </>
  )
}

function DashboardHero({ stats, firstName }: { stats: DashboardStats; firstName: string | null }) {
  const now = new Date()
  const openDeals = OPEN_STAGES.reduce((sum, stage) => sum + (stats.deals.byStage[stage] ?? 0), 0)
  const wonDeals = stats.deals.byStage.WON ?? 0

  return (
    <section className="bg-hero relative isolate overflow-hidden rounded-[32px] px-6 pb-10 pt-6 text-white shadow-[0_40px_80px_-40px_rgb(200_40_10/0.7)] sm:px-10 sm:pt-8">
      <p
        aria-hidden="true"
        className="text-outline-white pointer-events-none absolute -bottom-[0.2em] left-1/2 -z-10 -translate-x-1/2 select-none whitespace-nowrap font-display text-[clamp(6rem,21vw,18rem)] font-semibold leading-none tracking-[-0.06em]"
      >
        pipeline
      </p>
      <div aria-hidden="true" className="pointer-events-none absolute -right-28 -top-28 -z-10 h-80 w-80 rounded-full border border-white/15" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-12 -z-10 h-48 w-48 rounded-full border border-white/10" />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-primary shadow-sm">
          <Sparkles className="h-3.5 w-3.5" />
          Live overview
        </span>
        <p className="text-sm text-white/80">
          <span className="font-medium text-white">{now.toLocaleDateString(undefined, { weekday: 'long' })}</span>
          {' · '}
          {now.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      <div className="mt-10 grid gap-10 lg:mt-14 lg:grid-cols-[1.3fr_1fr] lg:items-end">
        <div>
          <h1 className="max-w-xl text-[2.6rem] font-medium leading-[1.02] tracking-[-0.045em] sm:text-6xl">
            {greetingFor(now)},
            <br />
            <span className="text-white/75">{firstName ?? 'there'}.</span>
          </h1>
          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-white/85">
            You have {plural(openDeals, 'open deal')} and {plural(stats.tasks.open, 'open task')}
            {stats.tasks.overdue > 0 ? ` — ${stats.tasks.overdue} overdue` : ''}. Here&apos;s what&apos;s moving across
            your pipeline.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild variant="ink" size="lg">
              <Link href="/deals">
                Open pipeline
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" className="bg-white text-foreground shadow-none hover:bg-white/90">
              <Link href="/tasks">Review tasks</Link>
            </Button>
          </div>
        </div>

        <div className="lg:text-right">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/75">Open pipeline value</p>
          <p className="mt-3 text-7xl font-light leading-none tracking-[-0.06em] sm:text-8xl">
            <HeroFigure value={stats.deals.pipelineValue} />
          </p>
          <div className="mt-5 flex flex-wrap gap-2 lg:justify-end">
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium ring-1 ring-inset ring-white/20">
              {plural(openDeals, 'open deal')}
            </span>
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium ring-1 ring-inset ring-white/20">
              {wonDeals} won · {formatCompactCurrency(stats.deals.wonValue, 'USD')}
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="bg-hero h-[380px] animate-pulse rounded-[32px] opacity-40" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((index) => (
          <Card key={index} className="p-6">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-8 h-9 w-32" />
            <Skeleton className="mt-3 h-3 w-20" />
          </Card>
        ))}
      </div>
    </div>
  )
}

export function DashboardPage() {
  const { data: stats, isLoading, isError, refetch, isRefetching } = useStats()
  const { data: recentDeals } = useDeals({ sort: 'recent', pageSize: 5 })
  const { profile, firebaseUser } = useAuth()

  if (isError) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="We couldn't load your dashboard"
        description="The API didn't respond. Check that the backend is running, then try again."
        action={
          <Button type="button" onClick={() => void refetch()} disabled={isRefetching}>
            <RefreshCw className={cn('h-4 w-4', isRefetching && 'animate-spin')} />
            Try again
          </Button>
        }
      />
    )
  }

  if (isLoading || !stats) return <DashboardSkeleton />

  const firstName = (profile?.displayName ?? firebaseUser?.displayName ?? '').trim().split(/\s+/)[0] || null
  const maxStageCount = Math.max(1, ...DEAL_STAGES.map((stage) => stats.deals.byStage[stage] ?? 0))
  const revenue = stats.revenueByMonth.slice(-6)
  const revenueTotal = revenue.reduce((sum, entry) => sum + entry.total, 0)
  const deals = recentDeals?.items ?? []

  return (
    <div className="space-y-6">
      <DashboardHero stats={stats} firstName={firstName} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Contacts"
          value={stats.contacts.total.toLocaleString()}
          sub={`${stats.contacts.byStatus.LEAD ?? 0} leads · ${stats.contacts.byStatus.CUSTOMER ?? 0} customers`}
          icon={UsersRound}
        />
        <StatTile
          label="Won revenue"
          value={formatCompactCurrency(stats.deals.wonValue, 'USD')}
          sub={`${plural(stats.deals.byStage.WON ?? 0, 'deal')} closed`}
          icon={Trophy}
        />
        <StatTile
          label="Avg deal size"
          value={formatCompactCurrency(stats.deals.avgDealSize, 'USD')}
          sub={`across ${plural(stats.deals.total, 'deal')}`}
          icon={BarChart3}
        />
        <StatTile
          label="Open tasks"
          value={stats.tasks.open.toLocaleString()}
          sub={`${stats.tasks.total} total`}
          alert={stats.tasks.overdue > 0 ? `${stats.tasks.overdue} overdue` : undefined}
          icon={ListChecks}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="p-6 lg:col-span-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <SectionTitle title="Revenue" sub="Won deal value, last 6 months" />
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

        <Card className="p-6 lg:col-span-2">
          <SectionTitle title="Deals by stage" sub={`${plural(stats.deals.total, 'deal')} in total`} href="/deals" linkLabel="Board" />
          <ul className="mt-6 space-y-4">
            {DEAL_STAGES.map((stage) => {
              const count = stats.deals.byStage[stage] ?? 0
              return (
                <li key={stage}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 font-medium text-foreground">
                      <span className={cn('h-2 w-2 rounded-full', stageDotClass[stage])} />
                      {DEAL_STAGE_LABELS[stage]}
                    </span>
                    <span className="tabular-nums text-muted-foreground">{count}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600 transition-[width] duration-500"
                      style={{ width: `${Math.round((count / maxStageCount) * 100)}%` }}
                    />
                  </div>
                </li>
              )
            })}
          </ul>
        </Card>

        <Card className="p-6 lg:col-span-2">
          <SectionTitle title="Top companies" sub="Ranked by open pipeline" href="/companies" />
          {stats.topCompanies.length === 0 ? (
            <p className="mt-6 text-sm text-muted-foreground">No pipeline data yet.</p>
          ) : (
            <ol className="mt-5 space-y-1">
              {stats.topCompanies.map((company, index) => {
                const content = (
                  <>
                    <span className="w-5 text-xs font-semibold tabular-nums text-muted-foreground">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-muted-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <Building2 className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-foreground">{company.name}</span>
                      <span className="block text-xs text-muted-foreground">{plural(company.dealCount, 'deal')}</span>
                    </span>
                    <span className="text-sm font-semibold tabular-nums text-foreground">
                      {formatCompactCurrency(company.pipelineValue, 'USD')}
                    </span>
                  </>
                )
                return (
                  <li key={company.companyId ?? company.name}>
                    {company.companyId ? (
                      <Link
                        href={`/companies/${company.companyId}`}
                        className="group flex items-center gap-3 rounded-2xl px-2 py-2 transition-colors hover:bg-accent/60"
                      >
                        {content}
                      </Link>
                    ) : (
                      <div className="group flex items-center gap-3 rounded-2xl px-2 py-2">{content}</div>
                    )}
                  </li>
                )
              })}
            </ol>
          )}
        </Card>

        <Card className="p-6 lg:col-span-3">
          <SectionTitle title="Recent deals" sub="The latest opportunities you created" href="/deals" />
          {deals.length === 0 ? (
            <div className="mt-6 flex flex-col items-start gap-3">
              <Eyebrow>Nothing here yet</Eyebrow>
              <p className="text-sm text-muted-foreground">Create your first deal on the Deals board.</p>
            </div>
          ) : (
            <ul className="mt-5 divide-y divide-border/60">
              {deals.map((deal) => (
                <li key={deal.id}>
                  <Link
                    href={`/deals/${deal.id}`}
                    className="group -mx-2 flex items-center gap-4 rounded-2xl px-2 py-3 transition-colors hover:bg-accent/50"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground group-hover:text-primary">{deal.title}</p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {deal.company?.name ?? deal.contact?.name ?? 'No account'} · created {formatDate(deal.createdAt)}
                      </p>
                    </div>
                    <div className="hidden sm:block">
                      <StatusBadge variant={deal.stage} />
                    </div>
                    <p className="w-24 text-right text-sm font-semibold tabular-nums text-foreground">
                      {formatCurrency(deal.value, deal.currency)}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <DueSoonCard className="lg:col-span-3" />
        <RecentActivityCard className="lg:col-span-2" />
      </div>
    </div>
  )
}
