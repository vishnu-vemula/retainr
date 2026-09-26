import {
  AlarmClock,
  Building2,
  Calendar,
  Check,
  FileText,
  History,
  Mail,
  Phone,
  Search,
  Trophy,
  UsersRound,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '../../../shared/lib/utils'
import type { FeatureDeepDive } from '../model/content'
import { BrowserFrame } from './marketing-ui'

function Dot({ className }: { className: string }) {
  return <span className={cn('h-2 w-2 shrink-0 rounded-full', className)} />
}

function MiniBadge({ children, tone }: { children: string; tone: 'stone' | 'sky' | 'emerald' | 'rose' | 'amber' | 'brand' }) {
  const tones = {
    stone: 'bg-stone-100 text-stone-600 ring-stone-500/15',
    sky: 'bg-sky-50 text-sky-700 ring-sky-600/20',
    emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    rose: 'bg-rose-50 text-rose-700 ring-rose-600/20',
    amber: 'bg-amber-50 text-amber-700 ring-amber-600/25',
    brand: 'bg-brand-50 text-brand-700 ring-brand-600/20',
  }
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ring-inset', tones[tone])}>
      <span className="h-1 w-1 rounded-full bg-current opacity-70" />
      {children}
    </span>
  )
}

const revenueBars = [38, 52, 33, 72, 60, 100]

export function DashboardPreview({ className }: { className?: string }) {
  return (
    <BrowserFrame url="app.retainr.io/dashboard" className={className}>
      <div className="space-y-3 bg-background p-3 sm:p-4">
        <div className="bg-hero relative overflow-hidden rounded-2xl p-4 text-white">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/75">Open pipeline value</p>
          <div className="mt-1 flex items-end justify-between gap-3">
            <p className="text-4xl font-light tracking-[-0.05em]">
              $399.9<span className="text-brand-950/60">K</span>
            </p>
            <span className="mb-1 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-medium ring-1 ring-inset ring-white/20">
              7 open deals
            </span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            ['Contacts', '128'],
            ['Won revenue', '$111.5K'],
            ['Open tasks', '9'],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl border border-border/70 bg-card p-2.5">
              <p className="text-[10px] text-muted-foreground">{label}</p>
              <p className="mt-1 text-base font-semibold tracking-tight">{value}</p>
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-border/70 bg-card p-3">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold">Revenue</p>
            <p className="text-[10px] text-muted-foreground">last 6 months</p>
          </div>
          <div className="mt-3 flex h-20 items-end gap-2 border-b border-border">
            {revenueBars.map((height, index) => (
              <div
                key={index}
                className={cn('flex-1 rounded-t-[4px]', index === revenueBars.length - 1 ? 'bg-primary' : 'bg-brand-200')}
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
        </div>
      </div>
    </BrowserFrame>
  )
}

const pipelineColumns = [
  { name: 'Qualified', dot: 'bg-sky-500', cards: [['Robotics pilot', '$86,000', 30], ['Support renewal', '$18,400', 30]] },
  { name: 'Proposal', dot: 'bg-brand-400', cards: [['Solar monitoring', '$124,000', 50], ['Brand retainer', '$27,000', 50]] },
  { name: 'Negotiation', dot: 'bg-amber-500', cards: [['Clinic scheduling', '$64,000', 75]] },
  { name: 'Won', dot: 'bg-emerald-500', cards: [['Analytics add-on', '$39,500', 100]] },
] as const

export function PipelinePreview({ className, compact = false }: { className?: string; compact?: boolean }) {
  const columns = compact ? pipelineColumns.slice(0, 3) : pipelineColumns
  return (
    <div className={cn('grid gap-2.5', compact ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-4', className)}>
      {columns.map((column) => (
        <div key={column.name} className="rounded-2xl bg-secondary/70 p-2">
          <p className="flex items-center gap-1.5 px-1 pb-2 text-[11px] font-semibold text-foreground">
            <Dot className={column.dot} />
            {column.name}
            <span className="ml-auto rounded-full bg-card px-1.5 text-[10px] text-muted-foreground ring-1 ring-border">
              {column.cards.length}
            </span>
          </p>
          <div className="space-y-2">
            {column.cards.map(([title, value, probability]) => (
              <div key={title} className="rounded-xl bg-card p-2.5 shadow-sm ring-1 ring-border/60">
                <p className="truncate text-[11px] font-semibold text-foreground">{title}</p>
                <p className="mt-0.5 text-sm font-semibold tracking-tight">{value}</p>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-secondary">
                  <div
                    className={cn('h-full rounded-full', probability === 100 ? 'bg-emerald-500' : 'bg-primary')}
                    style={{ width: `${probability}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

const contactRows = [
  ['Maya Chen', 'Northwind Labs', 'Customer', 'emerald'],
  ['Jonas Weber', 'Helix Robotics', 'Qualified', 'sky'],
  ['Priya Nair', 'Bluepeak Energy', 'Lead', 'stone'],
  ['Leo Martins', 'Cobalt Studio', 'Customer', 'emerald'],
  ['Sara Okafor', 'Lumen Health', 'Qualified', 'sky'],
] as const

function ContactsPreview() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 bg-card">
      <div className="flex items-center gap-2 border-b border-border/60 p-3">
        <div className="flex flex-1 items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-[11px] text-muted-foreground">
          <Search className="h-3 w-3" />
          Search contacts…
        </div>
        <span className="rounded-full bg-primary px-3 py-1.5 text-[11px] font-medium text-primary-foreground">+ New</span>
      </div>
      <ul className="divide-y divide-border/60">
        {contactRows.map(([name, company, status, tone]) => (
          <li key={name} className="flex items-center gap-3 px-3 py-2.5">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-100 to-brand-200 text-[10px] font-semibold text-brand-800">
              {name
                .split(' ')
                .map((part) => part[0])
                .join('')}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] font-semibold">{name}</p>
              <p className="truncate text-[10px] text-muted-foreground">{company}</p>
            </div>
            <MiniBadge tone={tone}>{status}</MiniBadge>
          </li>
        ))}
      </ul>
    </div>
  )
}

function QuotePreview() {
  const items = [
    ['Platform seat (annual)', '200 × $192', '$38,400'],
    ['Premium support', '1 × $4,800', '$4,800'],
    ['Onboarding package', '6 × $3,500', '$21,000'],
  ]
  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 bg-card">
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
        <p className="text-[12px] font-semibold">Line items</p>
        <MiniBadge tone="brand">Negotiation</MiniBadge>
      </div>
      <ul className="divide-y divide-border/60">
        {items.map(([name, qty, total]) => (
          <li key={name} className="flex items-center gap-3 px-4 py-3 text-[12px]">
            <span className="min-w-0 flex-1 truncate font-medium">{name}</span>
            <span className="rounded-lg border border-border/70 px-2 py-0.5 text-[11px] text-muted-foreground">{qty}</span>
            <span className="w-16 text-right font-semibold tabular-nums">{total}</span>
          </li>
        ))}
      </ul>
      <div className="flex items-center justify-between bg-secondary/60 px-4 py-3">
        <p className="text-[12px] font-semibold">Deal value</p>
        <p className="text-lg font-semibold tracking-tight text-primary">$64,200</p>
      </div>
    </div>
  )
}

function TasksPreview() {
  const tasks = [
    ['Send revised proposal to Helix', 'High', 'amber', 'Overdue', true, false],
    ['Prep demo for Lumen Health', 'Urgent', 'rose', 'Tomorrow', false, false],
    ['Follow up on renewal pricing', 'Medium', 'sky', 'Tue', false, false],
    ['Share case study with Northwind', 'Medium', 'sky', 'Done', false, true],
  ] as const
  return (
    <div className="space-y-2">
      {tasks.map(([title, priority, tone, due, overdue, done]) => (
        <div key={title} className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card px-3 py-3">
          <span
            className={cn(
              'flex h-5 w-5 shrink-0 items-center justify-center rounded-md border',
              done ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-border',
            )}
          >
            {done ? <Check className="h-3 w-3" /> : null}
          </span>
          <p className={cn('min-w-0 flex-1 truncate text-[12px] font-medium', done && 'text-muted-foreground line-through')}>
            {title}
          </p>
          <MiniBadge tone={tone}>{priority}</MiniBadge>
          <span className={cn('w-14 text-right text-[11px]', overdue ? 'font-semibold text-rose-600' : 'text-muted-foreground')}>
            {due}
          </span>
        </div>
      ))}
    </div>
  )
}

function TimelinePreview() {
  const entries = [
    [Phone, 'Discovery call', 'Call · 30 min', '1d ago'],
    [Mail, 'Sent pricing overview', 'Email', '3d ago'],
    [Calendar, 'Onsite workshop', 'Meeting · 90 min', '7d ago'],
    [FileText, 'Decision makers mapped', 'Note', '9d ago'],
  ] as const
  return (
    <ol className="relative space-y-4 rounded-2xl border border-border/70 bg-card p-4 before:absolute before:bottom-8 before:left-[2.1rem] before:top-8 before:w-px before:bg-border">
      {entries.map(([Icon, title, meta, when]) => (
        <li key={title} className="relative flex items-center gap-3">
          <span className="z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-primary ring-4 ring-card">
            <Icon className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12px] font-semibold">{title}</p>
            <p className="text-[10px] text-muted-foreground">{meta}</p>
          </div>
          <span className="text-[10px] text-muted-foreground">{when}</span>
        </li>
      ))}
    </ol>
  )
}

const alerts: { icon: LucideIcon; title: string; when: string }[] = [
  { icon: AlarmClock, title: 'Task overdue: Send revised proposal', when: '2h ago' },
  { icon: Trophy, title: 'Deal won: Enterprise analytics add-on', when: '1d ago' },
]

function AlertsPreview() {
  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-2xl border border-border/70 bg-card">
        <p className="border-b border-border/60 px-4 py-2.5 text-[12px] font-semibold">Notifications</p>
        {alerts.map(({ icon: Icon, title, when }) => (
          <div key={title} className="flex items-center gap-3 bg-accent/50 px-4 py-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Icon className="h-4 w-4" />
            </span>
            <p className="min-w-0 flex-1 truncate text-[12px] font-semibold">{title}</p>
            <span className="text-[10px] text-muted-foreground">{when}</span>
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-border/70 bg-card p-4">
        <p className="flex items-center gap-2 text-[12px] font-semibold">
          <History className="h-3.5 w-3.5 text-primary" />
          History
        </p>
        <ul className="mt-3 space-y-2 text-[11px]">
          <li className="flex items-center gap-2">
            <MiniBadge tone="brand">Stage change</MiniBadge>
            <span className="truncate text-muted-foreground">Proposal → Negotiation</span>
          </li>
          <li className="flex items-center gap-2">
            <MiniBadge tone="sky">Update</MiniBadge>
            <span className="truncate text-muted-foreground">Value set to $64,000</span>
          </li>
          <li className="flex items-center gap-2">
            <MiniBadge tone="emerald">Create</MiniBadge>
            <span className="truncate text-muted-foreground">Deal created</span>
          </li>
        </ul>
      </div>
    </div>
  )
}

const searchResults: { group: string; icon: LucideIcon; title: string; meta: string }[] = [
  { group: 'Contacts', icon: UsersRound, title: 'Jonas Weber', meta: 'jonas@helix.ai' },
  { group: 'Companies', icon: Building2, title: 'Helix Robotics', meta: 'helix.ai' },
  { group: 'Deals', icon: Trophy, title: 'Robotics pilot program', meta: 'Qualified · $86,000' },
]

export function SearchPreview({ className }: { className?: string }) {
  return (
    <div className={cn('overflow-hidden rounded-2xl border border-border/70 bg-card shadow-lift', className)}>
      <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3">
        <Search className="h-4 w-4 text-muted-foreground" />
        <span className="text-[13px] text-foreground">he</span>
        <span className="h-4 w-px animate-pulse bg-primary" />
        <span className="ml-auto rounded-md border border-border px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
          Ctrl K
        </span>
      </div>
      <div className="p-2">
        {searchResults.map(({ group, icon: Icon, title, meta }, index) => (
          <div key={group}>
            <p className="px-2 pb-1 pt-2 text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {group}
            </p>
            <div className={cn('flex items-center gap-2.5 rounded-xl px-2 py-2', index === 0 && 'bg-accent')}>
              <span
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-lg',
                  index === 0 ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground',
                )}
              >
                <Icon className="h-3.5 w-3.5" />
              </span>
              <span className="flex-1 truncate text-[12px] font-medium">{title}</span>
              <span className="truncate text-[10px] text-muted-foreground">{meta}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function FeaturePreview({ preview }: { preview: FeatureDeepDive['preview'] }) {
  switch (preview) {
    case 'contacts':
      return <ContactsPreview />
    case 'pipeline':
      return <PipelinePreview />
    case 'quote':
      return <QuotePreview />
    case 'tasks':
      return <TasksPreview />
    case 'timeline':
      return <TimelinePreview />
    case 'alerts':
      return <AlertsPreview />
    case 'dashboard':
      return <DashboardPreview />
    case 'search':
      return <SearchPreview />
  }
}
