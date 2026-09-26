import type { ReactNode } from 'react'
import Link from 'next/link'
import { Bell, Building2, KanbanSquare, ListChecks, UsersRound } from 'lucide-react'
import { BrandLogo } from '../../../shared/components/brand-logo'

interface AuthLayoutProps {
  eyebrow: string
  title: string
  description: string
  children: ReactNode
  footer: ReactNode
}

const highlights = [
  { icon: KanbanSquare, label: 'Drag-and-drop deal pipeline' },
  { icon: UsersRound, label: 'Contacts & companies' },
  { icon: ListChecks, label: 'Tasks with overdue alerts' },
  { icon: Bell, label: 'Won-deal notifications' },
]

const boardColumns = [
  { name: 'Qualified', cards: [72, 48] },
  { name: 'Proposal', cards: [60, 84, 40] },
  { name: 'Won', cards: [56] },
]

function ShowcasePanel() {
  return (
    <div className="bg-hero relative isolate hidden overflow-hidden rounded-[32px] p-10 text-white lg:flex lg:flex-col">
      <p
        aria-hidden="true"
        className="text-outline-white pointer-events-none absolute -bottom-[0.18em] left-1/2 -z-10 -translate-x-1/2 select-none whitespace-nowrap font-display text-[15rem] font-semibold leading-none tracking-[-0.06em]"
      >
        ultra
      </p>
      <div aria-hidden="true" className="pointer-events-none absolute -right-32 -top-32 -z-10 h-96 w-96 rounded-full border border-white/15" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-14 -top-14 -z-10 h-56 w-56 rounded-full border border-white/10" />

      <div className="flex items-center justify-between">
        <BrandLogo inverted />
        <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium ring-1 ring-inset ring-white/25">CRM workspace</span>
      </div>

      <div className="mt-auto pt-16">
        <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-primary">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          Built for closers
        </span>
        <h2 className="mt-6 max-w-lg text-6xl font-medium leading-[0.98] tracking-[-0.05em]">
          Close more deals.
          <br />
          <span className="text-white/70">Miss nothing.</span>
        </h2>
        <p className="mt-6 max-w-md text-[15px] leading-relaxed text-white/85">
          One focused workspace for your contacts, companies, pipeline and follow-ups — so every
          opportunity keeps moving.
        </p>

        <ul className="mt-8 grid max-w-lg grid-cols-2 gap-2.5">
          {highlights.map(({ icon: Icon, label }) => (
            <li
              key={label}
              className="flex items-center gap-2.5 rounded-2xl bg-white/10 px-3 py-2.5 text-sm font-medium ring-1 ring-inset ring-white/15 backdrop-blur-sm"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-primary">
                <Icon className="h-3.5 w-3.5" />
              </span>
              {label}
            </li>
          ))}
        </ul>
      </div>

      <div
        aria-hidden="true"
        className="absolute right-10 top-28 w-64 animate-float rounded-3xl bg-white/95 p-4 text-foreground shadow-[0_30px_60px_-20px_rgb(80_10_0/0.55)] xl:w-72"
      >
        <div className="mb-3 flex items-center justify-between">
          <span className="flex items-center gap-2 text-xs font-semibold">
            <Building2 className="h-3.5 w-3.5 text-primary" />
            Pipeline
          </span>
          <span className="flex gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-border" />
            <span className="h-1.5 w-1.5 rounded-full bg-border" />
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {boardColumns.map((column) => (
            <div key={column.name} className="rounded-xl bg-secondary/80 p-1.5">
              <p className="mb-1.5 px-0.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                {column.name}
              </p>
              <div className="space-y-1.5">
                {column.cards.map((width, index) => (
                  <div key={index} className="rounded-lg bg-card p-1.5 shadow-sm">
                    <div className="h-1.5 rounded-full bg-foreground/15" style={{ width: `${width}%` }} />
                    <div
                      className={
                        column.name === 'Won'
                          ? 'mt-1.5 h-1.5 w-1/2 rounded-full bg-emerald-400'
                          : 'mt-1.5 h-1.5 w-1/3 rounded-full bg-brand-300'
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function AuthLayout({ eyebrow, title, description, children, footer }: AuthLayoutProps) {
  return (
    <div className="grid min-h-screen gap-4 p-3 sm:p-4 lg:grid-cols-[1.1fr_1fr]">
      <ShowcasePanel />
      <div className="flex flex-col rounded-[32px] border border-border/60 bg-card px-6 py-6 shadow-soft sm:px-10">
        <div className="flex items-center justify-between">
          <Link href="/" className="lg:invisible" aria-label="Ultra Tasker home">
            <BrandLogo />
          </Link>
          <span className="inline-flex items-center gap-2 rounded-full border border-border/70 px-3 py-1 text-xs font-medium text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            {eyebrow}
          </span>
        </div>
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">
          <h1 className="text-4xl font-semibold tracking-[-0.04em] text-foreground">{title}</h1>
          <p className="mt-2 text-[15px] text-muted-foreground">{description}</p>
          <div className="mt-8">{children}</div>
          <div className="mt-8 text-center text-sm text-muted-foreground">{footer}</div>
        </div>
        <p className="text-center text-xs text-muted-foreground" suppressHydrationWarning>
          © {new Date().getFullYear()} Ultra Tasker · Secured by Firebase Authentication
        </p>
      </div>
    </div>
  )
}

export function AuthDivider() {
  return (
    <div className="my-6 flex items-center gap-3">
      <span className="h-px flex-1 bg-border" />
      <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">or</span>
      <span className="h-px flex-1 bg-border" />
    </div>
  )
}
