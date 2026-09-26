import Link from 'next/link'
import { ArrowRight, BarChart3, Check, Handshake, ListChecks, Sparkles, UsersRound } from 'lucide-react'
import { BrandLogo } from '../../../shared/components/brand-logo'
import { Button } from '../../../shared/components/ui/button'
import { Card } from '../../../shared/components/ui/card'

const benefits = [
  {
    icon: UsersRound,
    title: 'Keep every relationship close',
    description: 'Contacts, companies, and the context behind every conversation stay together.',
  },
  {
    icon: Handshake,
    title: 'Move deals with confidence',
    description: 'Make your pipeline visible, prioritize the next action, and spot opportunities early.',
  },
  {
    icon: ListChecks,
    title: 'Turn follow-up into momentum',
    description: 'Keep tasks and activity history connected to the work that matters.',
  },
]

export function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-background">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <Link href="/" aria-label="Ultra Tasker home">
          <BrandLogo />
        </Link>
        <Button asChild variant="outline" className="bg-card">
          <Link href="/login">Sign in</Link>
        </Button>
      </nav>

      <section className="relative mx-auto max-w-6xl px-5 pb-20 pt-12 sm:px-8 sm:pb-28 sm:pt-20">
        <div aria-hidden="true" className="absolute right-[-16rem] top-[-10rem] -z-10 h-[34rem] w-[34rem] rounded-full bg-primary/10 blur-3xl" />
        <div aria-hidden="true" className="absolute bottom-0 left-[-12rem] -z-10 h-80 w-80 rounded-full bg-brand-200/50 blur-3xl" />

        <div className="grid gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-accent px-3 py-1.5 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              CRM that keeps work moving
            </span>
            <h1 className="mt-6 font-display text-5xl font-semibold leading-[0.98] tracking-[-0.055em] text-foreground sm:text-7xl">
              Every customer detail, ready for the next move.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Ultra Tasker brings your contacts, deals, tasks, and activity into one calm workspace, so your team can focus on meaningful follow-up.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <Link href="#features">
                  Explore the workspace
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <p className="text-sm text-muted-foreground">No setup is needed to explore.</p>
            </div>
          </div>

          <Card className="relative overflow-hidden border-white/80 bg-card/90 p-5 shadow-lift backdrop-blur sm:p-7">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">This week</p>
                <p className="mt-1 font-display text-2xl font-semibold tracking-tight">Your momentum</p>
              </div>
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-glow">
                <BarChart3 className="h-5 w-5" />
              </span>
            </div>
            <div className="mt-7 grid grid-cols-3 gap-3">
              {[
                ['18', 'Open deals'],
                ['7', 'Follow-ups'],
                ['94%', 'On track'],
              ].map(([value, label]) => (
                <div key={label} className="rounded-2xl bg-secondary/75 p-3 sm:p-4">
                  <p className="font-display text-2xl font-semibold tracking-tight text-foreground">{value}</p>
                  <p className="mt-1 text-xs leading-snug text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-2xl border border-border/70 bg-background/75 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-foreground">Northstar renewal</p>
                  <p className="mt-1 text-xs text-muted-foreground">Proposal · Follow up Thursday</p>
                </div>
                <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">75%</span>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-secondary">
                <div className="h-full w-3/4 rounded-full bg-primary" />
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section id="features" className="border-y border-border/70 bg-card/65 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">One shared picture</p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Less tab-switching. More progress.</h2>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {benefits.map(({ icon: Icon, title, description }) => (
              <Card key={title} className="p-6 sm:p-7">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-6 text-lg font-semibold tracking-tight text-foreground">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="flex flex-col gap-5 rounded-[2rem] bg-ink px-7 py-9 text-ink-foreground shadow-lift sm:flex-row sm:items-center sm:justify-between sm:px-10">
          <div>
            <p className="font-display text-2xl font-semibold tracking-tight">Your workspace is ready when you are.</p>
            <p className="mt-2 text-sm text-white/65">Connect your team when you&apos;re ready to start managing work.</p>
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-white/85">
            <Check className="h-4 w-4 text-brand-300" />
            Built for focused teams
          </div>
        </div>
      </section>
    </main>
  )
}
