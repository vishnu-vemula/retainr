import Link from 'next/link'
import { AlertTriangle, CalendarClock, RefreshCw, Wallet } from 'lucide-react'
import { useStats } from '../hooks/use-stats'
import { EmptyState } from '../../../shared/components/empty-state'
import { PageHeader } from '../../../shared/components/page-header'
import { Button } from '../../../shared/components/ui/button'
import { Card } from '../../../shared/components/ui/card'
import { formatCurrency, formatDate } from '../../../shared/lib/format'

export function RenewalsPage() {
  const { data: stats, isLoading, isError, refetch, isRefetching } = useStats()
  if (isError) return <EmptyState icon={AlertTriangle} title="Renewals are unavailable" description="Check the API connection and try again." action={<Button onClick={() => void refetch()}>Retry</Button>} />

  const renewals = stats?.renewals
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Account health" title="Renewals" description="Keep retainers, client reviews, and onboarding handoffs on track." action={<Button type="button" variant="outline" disabled={isRefetching} onClick={() => void refetch()}><RefreshCw className="h-4 w-4" />Refresh</Button>} />
      {isLoading || !renewals ? <p className="text-sm text-muted-foreground">Loading renewals…</p> : <>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[['Due in 30 days', renewals.within30], ['Due in 60 days', renewals.within60], ['Due in 90 days', renewals.within90], ['Missed renewals', renewals.missed]].map(([label, count]) => (
            <Card key={label} className="p-5"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-3 font-display text-3xl font-semibold">{count}</p></Card>
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card className="p-5"><p className="flex items-center gap-2 text-sm text-muted-foreground"><AlertTriangle className="h-4 w-4" />At risk</p><p className="mt-3 font-display text-3xl font-semibold">{renewals.atRisk}</p></Card>
          <Card className="p-5"><p className="text-sm text-muted-foreground">No activity, 14–29 days</p><p className="mt-3 font-display text-3xl font-semibold">{renewals.stale14to30}</p></Card>
          <Card className="p-5"><p className="text-sm text-muted-foreground">No activity, 30+ days</p><p className="mt-3 font-display text-3xl font-semibold">{renewals.stale30plus}</p></Card>
          <Card className="p-5"><p className="text-sm text-muted-foreground">Overdue onboarding tasks</p><p className="mt-3 font-display text-3xl font-semibold">{renewals.overdueOnboardingCount}</p></Card>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="p-6"><h2 className="flex items-center gap-2 font-display text-xl font-semibold"><Wallet className="h-5 w-5" />Recurring revenue</h2>
            {renewals.byCurrency.length === 0 ? <p className="mt-4 text-sm text-muted-foreground">No won retainers yet.</p> : <ul className="mt-4 divide-y divide-border/60">{renewals.byCurrency.map((entry) => (
              <li key={entry.currency} className="flex justify-between py-3 text-sm"><span>{entry.currency}</span><span className="text-right"><strong className="block">{formatCurrency(entry.monthlyRecurringRevenue, entry.currency)} / month</strong><span className="text-muted-foreground">90-day weighted renewal forecast {formatCurrency(entry.forecast90, entry.currency)}</span></span></li>
            ))}</ul>}
          </Card>
          <Card className="p-6"><h2 className="flex items-center gap-2 font-display text-xl font-semibold"><CalendarClock className="h-5 w-5" />Overdue onboarding</h2>
            {renewals.overdueOnboarding.length === 0 ? <p className="mt-4 text-sm text-muted-foreground">No overdue handoffs.</p> : <ul className="mt-4 divide-y divide-border/60">{renewals.overdueOnboarding.map((task) => (
              <li key={task.id} className="py-3 text-sm"><Link href="/tasks" className="font-medium text-primary hover:underline">{task.title}</Link><span className="ml-2 text-muted-foreground">due {formatDate(task.dueDate)}</span></li>
            ))}</ul>}
          </Card>
        </div>
        <Card className="p-6"><h2 className="font-display text-xl font-semibold">Retainer accounts</h2>
          {renewals.items.length === 0 ? <p className="mt-4 text-sm text-muted-foreground">Mark an engagement as a won retainer to track it here.</p> : <div className="mt-4 overflow-x-auto"><table className="w-full text-left text-sm"><thead className="text-muted-foreground"><tr><th className="pb-3">Account</th><th className="pb-3">Health</th><th className="pb-3">Last touch</th><th className="pb-3">Renewal</th><th className="pb-3 text-right">Monthly</th></tr></thead><tbody className="divide-y divide-border/60">{renewals.items.map((deal) => (
            <tr key={deal.id}><td className="py-3"><Link href={`/deals/${deal.id}`} className="font-medium text-primary hover:underline">{deal.companyName ?? deal.title}</Link><span className="block text-xs text-muted-foreground">{deal.title}</span></td><td className="py-3">{deal.accountHealth.toLowerCase()} · {deal.renewalHealth.toLowerCase().replace('_', ' ')}</td><td className="py-3">{deal.daysSinceActivity} days ago</td><td className="py-3">{formatDate(deal.renewalDate)}</td><td className="py-3 text-right">{formatCurrency(deal.monthlyRecurringValue, deal.currency)}</td></tr>
          ))}</tbody></table></div>}
        </Card>
        <Card className="p-6"><h2 className="font-display text-xl font-semibold">Operating metrics</h2><div className="mt-4 grid gap-4 text-sm sm:grid-cols-3"><p>Lead to accepted proposal <strong className="block text-lg">{stats.operations.averageLeadToAcceptedDays === null ? '—' : `${stats.operations.averageLeadToAcceptedDays.toFixed(1)} days`}</strong></p><p>Onboarding completion <strong className="block text-lg">{stats.operations.averageOnboardingDays === null ? '—' : `${stats.operations.averageOnboardingDays.toFixed(1)} days`}</strong></p><p>Owner active this week <strong className="block text-lg">{stats.operations.activeThisWeek ? 'Yes' : 'No'}</strong></p></div></Card>
      </>}
    </div>
  )
}
