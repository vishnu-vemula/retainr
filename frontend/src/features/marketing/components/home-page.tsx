import Link from 'next/link'
import {
  ArrowRight,
  ArrowUpRight,
  Bell,
  CalendarDays,
  Check,
  Handshake,
  KanbanSquare,
  ListChecks,
  Mail,
  MessagesSquare,
  Phone,
  Receipt,
  Search,
  ShieldCheck,
  Trophy,
  UsersRound,
} from 'lucide-react'
import { Button } from '../../../shared/components/ui/button'
import {
  capabilityTicker,
  coreFeatures,
  homeFaqs,
  plans,
  securityPillars,
  steps,
} from '../model/content'
import { Container, CtaBand, FaqList, Marquee, Pill, SectionHeading } from './marketing-ui'
import { DashboardPreview, PipelinePreview, SearchPreview } from './product-previews'

function HeroChip({ icon: Icon, className }: { icon: typeof Check; className: string }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-primary shadow-[0_14px_30px_-12px_rgb(80_10_0/0.6)] sm:h-14 sm:w-14 ${className}`}
    >
      <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
    </span>
  )
}

function Hero() {
  return (
    <section className="px-3 pt-3 sm:px-4 sm:pt-4">
      <div className="bg-hero relative isolate mx-auto flex min-h-[calc(100svh-1.5rem)] max-w-[1400px] flex-col overflow-hidden rounded-[32px] text-white sm:rounded-[40px]">
        <p
          aria-hidden="true"
          className="text-outline-white pointer-events-none absolute -bottom-[0.24em] left-1/2 -z-10 -translate-x-1/2 select-none whitespace-nowrap font-display text-[clamp(8rem,26vw,24rem)] font-semibold leading-none tracking-[-0.06em]"
        >
          retainr
        </p>
        <div aria-hidden="true" className="pointer-events-none absolute -right-40 -top-40 -z-10 h-[34rem] w-[34rem] rounded-full border border-white/15" />
        <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 -z-10 h-72 w-72 rounded-full border border-white/10" />

        <div className="grid flex-1 items-center gap-14 px-5 pb-12 pt-28 sm:px-10 lg:grid-cols-[1.2fr_1fr] lg:px-14 lg:pt-32">
          <div>
            <Pill tone="onRed">CRM for client-first teams</Pill>
            <h1 className="mt-7 text-[2.75rem] font-medium leading-[0.98] tracking-[-0.055em] sm:text-6xl lg:text-[3.7rem] xl:text-[4.6rem]">
              Keep every{' '}
              <HeroChip icon={Handshake} className="-rotate-6 align-middle" /> client.
              <br />
              <span className="text-white/70">Close every</span>{' '}
              <HeroChip icon={Trophy} className="rotate-6 align-middle" />
              <span className="text-white/70"> deal.</span>
            </h1>
            <p className="mt-7 max-w-md text-base leading-relaxed text-white/85 sm:text-lg">
              Retainr brings contacts, companies, your pipeline, quotes and follow-ups into one calm workspace — so no
              client relationship ever goes cold.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild variant="ink" size="lg">
                <Link href="/signup">
                  Start free
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" className="bg-white text-foreground shadow-none hover:bg-white/90">
                <Link href="#how-it-works">See how it works</Link>
              </Button>
            </div>
            <p className="mt-5 flex items-center gap-2 text-sm text-white/75">
              <Check className="h-4 w-4" />
              Free during early access · No credit card
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
            <DashboardPreview className="relative rotate-[1.5deg] shadow-[0_40px_80px_-30px_rgb(60_5_0/0.7)]" />
            <div className="absolute -left-4 top-10 hidden w-64 animate-float rounded-2xl bg-white p-3.5 text-foreground shadow-lift motion-reduce:animate-none sm:block lg:-left-10">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-white">
                  <Trophy className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-semibold">Deal won · Analytics add-on</p>
                  <p className="text-xs text-muted-foreground">$39,500 · just now</p>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-6 right-4 hidden w-60 rounded-2xl bg-white p-3.5 text-foreground shadow-lift sm:block lg:-right-6">
              <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                <Bell className="h-3.5 w-3.5 text-primary" />
                Due today
              </p>
              <p className="mt-2 text-[13px] font-semibold">Send revised proposal to Helix</p>
              <div className="mt-2 flex items-center gap-2">
                <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700 ring-1 ring-inset ring-amber-600/25">
                  High
                </span>
                <span className="text-[11px] text-muted-foreground">Jonas Weber</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/15 py-5">
          <Marquee items={capabilityTicker} />
        </div>
      </div>
    </section>
  )
}

function WhyRetainr() {
  return (
    <section className="py-20 sm:py-24">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading eyebrow="Why Retainr" title="Client-first CRM," muted="built for retention." />
          <p className="max-w-sm text-[15px] leading-relaxed text-muted-foreground">
            Most CRMs are built to log calls. Retainr is built to keep relationships moving — from the first hello to
            the renewal.
          </p>
        </div>

        <div className="mt-14 grid gap-4 lg:grid-cols-[1.35fr_1fr]">
          <div className="relative isolate overflow-hidden rounded-[32px] bg-ink p-6 text-white shadow-lift sm:p-10 lg:row-span-2">
            <div aria-hidden="true" className="absolute inset-x-6 top-6 -z-10 opacity-40 blur-[1px] sm:inset-x-10">
              <PipelinePreview />
            </div>
            <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/85 to-ink/20" />
            <div className="flex min-h-[26rem] flex-col items-center justify-end text-center sm:min-h-[30rem]">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                Six stages · drag and drop
              </span>
              <p className="mt-5 text-4xl font-medium leading-[1.02] tracking-[-0.045em] sm:text-5xl">
                Your whole pipeline,
                <br />
                <span className="text-brand-400">on one board.</span>
              </p>
              <Button asChild className="mt-7 border border-white/20 bg-white/10 text-white shadow-none backdrop-blur hover:bg-white/20">
                <Link href="/features#pipeline">
                  Explore the pipeline
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[32px] border border-border/70 bg-card p-7 shadow-soft">
            <p className="max-w-xs text-[15px] leading-relaxed text-foreground">
              Contacts, companies, deals, quotes, tasks and timelines — in one calm workspace, not twelve tabs.
            </p>
            <div className="mt-6 flex flex-wrap gap-1.5">
              {['Contacts', 'Deals', 'Quotes', 'Tasks', 'Timeline', 'Reports'].map((label) => (
                <span key={label} className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                  {label}
                </span>
              ))}
            </div>
            <p
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-6 right-4 select-none font-display text-[9rem] font-light leading-none tracking-[-0.06em] text-foreground/[0.06]"
            >
              12
            </p>
            <p className="mt-10 text-sm font-semibold text-foreground">
              12 modules <span className="font-normal text-muted-foreground">working together</span>
            </p>
          </div>

          <div className="relative overflow-hidden rounded-[32px] border border-border/70 bg-card p-7 shadow-soft">
            <div className="flex items-start gap-5">
              <div className="flex shrink-0 gap-1.5" aria-hidden="true">
                {['Ctrl', 'K'].map((key) => (
                  <kbd
                    key={key}
                    className="flex h-12 min-w-12 items-center justify-center rounded-xl border border-border bg-background px-2.5 font-sans text-sm font-semibold shadow-[inset_0_-3px_0_hsl(var(--border))]"
                  >
                    {key}
                  </kbd>
                ))}
              </div>
              <div>
                <p className="text-[15px] font-semibold text-foreground">Find any client in a keystroke.</p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  Global search across contacts, companies and deals — from anywhere in the app.
                </p>
              </div>
            </div>
            <div className="mt-6 flex items-center gap-3 rounded-2xl bg-secondary/70 px-4 py-3">
              <Search className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Helix Robotics</span>
              <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
                3 results
              </span>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}

function FeatureGrid() {
  return (
    <section className="py-16 sm:py-20">
      <Container>
        <SectionHeading
          eyebrow="Features"
          title="Everything your clients need"
          muted="to stay."
          description="The essentials of a modern CRM, designed as one system instead of a pile of add-ons."
        />
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {coreFeatures.map(({ icon: Icon, title, description }, index) => (
            <article
              key={title}
              className="group relative overflow-hidden rounded-[28px] border border-border/70 bg-card p-7 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
            >
              <div className="flex items-start justify-between">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="font-display text-sm font-semibold text-foreground/25">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>
              <h3 className="mt-10 text-xl font-semibold tracking-tight text-foreground">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
            </article>
          ))}
        </div>
        <div className="mt-10 flex justify-center">
          <Button asChild variant="outline" size="lg" className="shadow-none">
            <Link href="/features">
              Explore every feature
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </Container>
    </section>
  )
}

const stepIcons = [UsersRound, KanbanSquare, Handshake]

function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-28 py-16 sm:py-20">
      <Container>
        <div className="rounded-[40px] bg-secondary/60 px-6 py-14 sm:px-12 sm:py-20">
          <SectionHeading
            align="center"
            eyebrow="How it works"
            title="From first hello"
            muted="to long-term client."
          />
          <ol className="relative mt-16 grid gap-6 lg:grid-cols-3">
            <span aria-hidden="true" className="absolute left-[16%] right-[16%] top-8 hidden border-t-2 border-dashed border-primary/25 lg:block" />
            {steps.map((step, index) => {
              const Icon = stepIcons[index] ?? Check
              return (
                <li key={step.title} className="relative flex flex-col items-center text-center">
                  <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-glow ring-8 ring-secondary">
                    <Icon className="h-6 w-6" />
                  </span>
                  <p className="mt-6 font-display text-sm font-semibold text-primary">0{index + 1}</p>
                  <h3 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">{step.title}</h3>
                  <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">{step.description}</p>
                </li>
              )
            })}
          </ol>
        </div>
      </Container>
    </section>
  )
}

const moduleCards = [
  { title: 'Deal pipeline', tag: 'Pipeline', icon: KanbanSquare, href: '/features#pipeline', dark: true },
  { title: 'Quote builder', tag: 'Quotes', icon: Receipt, href: '/features#quotes' },
  { title: 'Follow-ups', tag: 'Tasks', icon: ListChecks, href: '/features#tasks' },
  { title: 'Client timeline', tag: 'Activity', icon: MessagesSquare, href: '/features#timeline' },
  { title: 'Smart alerts', tag: 'Notifications', icon: Bell, href: '/features#alerts' },
  { title: 'Search anything', tag: 'Ctrl K', icon: Search, href: '/features#search' },
]

function ModuleCarousel() {
  return (
    <section className="overflow-hidden py-16 sm:py-20">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading eyebrow="Modules" title="Every module," muted="built to work together." />
          <p className="max-w-sm text-[15px] leading-relaxed text-muted-foreground">
            Scroll through the building blocks. Each one links to the rest — a task knows its deal, a deal knows its
            quote, a contact knows its whole story.
          </p>
        </div>
      </Container>
      <div className="mt-14 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-6 scrollbar-thin sm:scroll-px-6 sm:px-6 lg:scroll-pl-[max(2rem,calc((100vw_-_1320px)/2_+_2rem))] lg:pl-[max(2rem,calc((100vw_-_1320px)/2_+_2rem))] lg:pr-8">
        {moduleCards.map(({ title, tag, icon: Icon, href, dark }) => (
          <Link
            key={title}
            href={href}
            className={`group relative flex h-[22rem] w-[17rem] shrink-0 snap-start flex-col justify-between overflow-hidden rounded-[28px] p-6 text-white transition-transform duration-300 hover:-translate-y-1 sm:w-[19rem] ${
              dark ? 'bg-ink' : 'bg-hero'
            }`}
          >
            <span className="w-fit rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] backdrop-blur">
              {tag}
            </span>
            <span
              aria-hidden="true"
              className="absolute right-[-2.5rem] top-1/2 flex h-48 w-48 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/20 transition-transform duration-500 group-hover:scale-110"
            >
              <Icon className="h-16 w-16 text-white/90" strokeWidth={1.4} />
            </span>
            <div className="flex items-end justify-between gap-3">
              <p className="text-3xl font-medium leading-[1.02] tracking-[-0.04em]">{title}</p>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-foreground transition-transform duration-300 group-hover:rotate-45">
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

const conversationIcons = [Phone, Mail, CalendarDays]

function InlineConversationPill() {
  return (
    <span aria-hidden="true" className="mx-1 inline-flex h-[0.9em] items-center rounded-full bg-hero px-[0.12em] align-middle sm:mx-2">
      {conversationIcons.map((Icon, index) => (
        <span
          key={index}
          className="-ml-[0.14em] flex h-[0.68em] w-[0.68em] items-center justify-center rounded-full bg-white text-primary ring-[0.05em] ring-brand-500 first:ml-0"
          style={{ zIndex: conversationIcons.length - index }}
        >
          <Icon className="h-[0.34em] w-[0.34em]" strokeWidth={2.4} />
        </span>
      ))}
    </span>
  )
}

function Statement() {
  return (
    <section className="py-20 sm:py-24">
      <Container className="text-center">
        <Pill>Our promise</Pill>
        <p className="mx-auto mt-8 max-w-6xl text-[2.6rem] font-medium leading-[1.05] tracking-[-0.05em] text-foreground sm:text-6xl lg:text-[4.6rem]">
          We turn every <span className="whitespace-nowrap">conversation<InlineConversationPill /></span>
          <br className="hidden sm:block" />
          <span className="text-foreground/35">into a relationship </span>
          <span aria-hidden="true" className="mx-1 inline-flex h-[0.85em] w-[1.6em] items-center justify-center rounded-full bg-ink align-middle sm:mx-2">
            <Check className="h-[0.45em] w-[0.45em] text-brand-400" strokeWidth={3} />
          </span>
          <br className="hidden sm:block" />
          that lasts.
        </p>
        <div className="mx-auto mt-14 grid max-w-4xl gap-6 border-t border-border/70 pt-10 text-left sm:grid-cols-3">
          {[
            ['Remember everything', 'Every call, email, meeting and note on a single timeline.'],
            ['Never drop a follow-up', 'Due dates, priorities and overdue alerts that reach you.'],
            ['See what matters', 'Pipeline, revenue and task health the moment you sign in.'],
          ].map(([title, description]) => (
            <div key={title}>
              <p className="flex items-center gap-2 text-[15px] font-semibold text-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                {title}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}

function SecurityTeaser() {
  return (
    <section className="py-16 sm:py-20">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          <div>
            <SectionHeading
              eyebrow="Security"
              title="Trust is not a"
              muted="premium feature."
              description="Verified sessions, owner-scoped data and an audit trail on every change come standard — for every account, on every plan."
            />
            <Button asChild variant="outline" size="lg" className="mt-8 shadow-none">
              <Link href="/security">
                How we protect your data
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="relative">
            <div className="grid gap-4 sm:grid-cols-2">
              {securityPillars.slice(0, 4).map(({ icon: Icon, title, description }) => (
                <div key={title} className="rounded-[24px] border border-border/70 bg-card p-6 shadow-soft">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <p className="mt-5 text-[15px] font-semibold text-foreground">{title}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{description}</p>
                </div>
              ))}
            </div>
            <span className="absolute -right-3 -top-5 hidden items-center gap-2 rounded-full bg-ink px-4 py-2 text-xs font-semibold text-white shadow-lift sm:inline-flex">
              <ShieldCheck className="h-4 w-4 text-brand-400" />
              Every query owner-scoped
            </span>
          </div>
        </div>
      </Container>
    </section>
  )
}

function PricingTeaser() {
  const plan = plans[0]
  if (!plan) return null
  return (
    <section className="py-16 sm:py-20">
      <Container>
        <div className="grid overflow-hidden rounded-[40px] border border-border/70 bg-card shadow-soft lg:grid-cols-[1.1fr_1fr]">
          <div className="p-8 sm:p-12 lg:p-14">
            <Pill>Pricing</Pill>
            <p className="mt-6 text-4xl font-medium leading-[1.02] tracking-[-0.05em] text-foreground sm:text-5xl">
              Everything included.
              <br />
              <span className="text-foreground/35">Free while in early access.</span>
            </p>
            <p className="mt-6 max-w-md text-[15px] leading-relaxed text-muted-foreground">{plan.description}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/signup">
                  Create free account
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="shadow-none">
                <Link href="/pricing">Compare plans</Link>
              </Button>
            </div>
          </div>
          <div className="bg-hero relative isolate overflow-hidden p-8 text-white sm:p-12 lg:p-14">
            <p
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-10 -right-4 -z-10 select-none font-display text-[12rem] font-light leading-none tracking-[-0.06em] text-white/10"
            >
              $0
            </p>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/75">{plan.name}</p>
            <p className="mt-3 text-7xl font-light tracking-[-0.06em]">
              $0<span className="text-2xl font-normal tracking-normal text-white/70"> / seat</span>
            </p>
            <ul className="mt-8 space-y-3">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-[15px]">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-primary">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  )
}

function Faqs() {
  return (
    <section className="py-16 sm:py-20">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <SectionHeading eyebrow="FAQ" title="Questions," muted="answered." />
            <p className="mt-6 max-w-sm text-[15px] leading-relaxed text-muted-foreground">
              Can&apos;t find what you&apos;re looking for?{' '}
              <Link href="/contact" className="font-semibold text-primary underline-offset-4 hover:underline">
                Talk to us
              </Link>
              .
            </p>
            <div className="mt-10 hidden lg:block">
              <SearchPreview className="max-w-sm -rotate-2" />
            </div>
          </div>
          <FaqList faqs={homeFaqs} />
        </div>
      </Container>
    </section>
  )
}

export function HomePage() {
  return (
    <>
      <Hero />
      <WhyRetainr />
      <FeatureGrid />
      <HowItWorks />
      <ModuleCarousel />
      <Statement />
      <SecurityTeaser />
      <PricingTeaser />
      <Faqs />
      <CtaBand />
    </>
  )
}
