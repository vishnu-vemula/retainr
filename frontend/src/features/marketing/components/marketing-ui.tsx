import type { ReactNode } from 'react'
import Link from 'next/link'
import { ArrowUpRight, Plus } from 'lucide-react'
import { Button } from '../../../shared/components/ui/button'
import { cn } from '../../../shared/lib/utils'
import type { Faq } from '../model/content'

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8', className)}>{children}</div>
}

export function Pill({ children, tone = 'light', className }: { children: ReactNode; tone?: 'light' | 'onRed'; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold',
        tone === 'light'
          ? 'border border-border/70 bg-card text-muted-foreground shadow-sm'
          : 'bg-white text-primary shadow-sm',
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
      {children}
    </span>
  )
}

interface SectionHeadingProps {
  eyebrow?: string
  title: string
  muted?: string
  description?: string
  align?: 'left' | 'center'
  as?: 'h1' | 'h2'
  className?: string
}

export function SectionHeading({
  eyebrow,
  title,
  muted,
  description,
  align = 'left',
  as: Tag = 'h2',
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn(align === 'center' && 'mx-auto text-center', 'max-w-4xl', className)}>
      {eyebrow ? <Pill>{eyebrow}</Pill> : null}
      <Tag
        className={cn(
          'mt-5 font-medium leading-[1.02] tracking-[-0.05em] text-foreground',
          Tag === 'h1' ? 'text-5xl sm:text-6xl lg:text-7xl xl:text-[5.25rem]' : 'text-4xl sm:text-5xl lg:text-6xl',
        )}
      >
        {title}
        {muted ? (
          <>
            <br />
            <span className="text-foreground/35">{muted}</span>
          </>
        ) : null}
      </Tag>
      {description ? (
        <p
          className={cn(
            'mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg',
            align === 'center' && 'mx-auto',
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  )
}

export function PageHero({
  eyebrow,
  title,
  muted,
  description,
  children,
}: {
  eyebrow: string
  title: string
  muted?: string
  description: string
  children?: ReactNode
}) {
  return (
    <section className="relative overflow-hidden pb-16 pt-36 sm:pb-20 sm:pt-44">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[34rem] w-[64rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,hsl(var(--primary)/0.14),transparent)]"
      />
      <Container>
        <SectionHeading as="h1" eyebrow={eyebrow} title={title} muted={muted} description={description} />
        {children ? <div className="mt-10">{children}</div> : null}
      </Container>
    </section>
  )
}

export function CtaBand({
  title = 'Ready to keep',
  muted = 'every client?',
  description = 'Create your free workspace in under a minute. Everything is included during early access.',
}: {
  title?: string
  muted?: string
  description?: string
}) {
  return (
    <section className="px-3 py-16 sm:px-4 sm:py-20">
      <div className="bg-hero relative isolate mx-auto max-w-[1400px] overflow-hidden rounded-[32px] px-6 py-16 text-white sm:rounded-[40px] sm:px-12 sm:py-20 lg:px-16">
        <p
          aria-hidden="true"
          className="text-outline-white pointer-events-none absolute -bottom-[0.22em] right-[-0.05em] -z-10 select-none font-display text-[clamp(7rem,22vw,20rem)] font-semibold leading-none tracking-[-0.06em]"
        >
          retainr
        </p>
        <div aria-hidden="true" className="pointer-events-none absolute -left-24 -top-24 -z-10 h-80 w-80 rounded-full border border-white/15" />
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-end">
          <div>
            <Pill tone="onRed">Free during early access</Pill>
            <h2 className="mt-6 text-5xl font-medium leading-[0.98] tracking-[-0.05em] sm:text-6xl lg:text-7xl">
              {title}
              <br />
              <span className="text-white/70">{muted}</span>
            </h2>
          </div>
          <div>
            <p className="max-w-md text-[15px] leading-relaxed text-white/85">{description}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="ink" size="lg">
                <Link href="/signup">
                  Start free
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" className="bg-white text-foreground shadow-none hover:bg-white/90">
                <Link href="/contact#demo">Book a demo</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export function FaqList({ faqs }: { faqs: Faq[] }) {
  return (
    <div className="divide-y divide-border/70 rounded-3xl border border-border/70 bg-card shadow-soft">
      {faqs.map((faq) => (
        <details key={faq.question} className="group px-6 py-5 [&_summary::-webkit-details-marker]:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-left text-[15px] font-semibold text-foreground">
            {faq.question}
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-muted-foreground transition-all duration-300 group-open:rotate-45 group-open:bg-primary group-open:text-primary-foreground">
              <Plus className="h-4 w-4" />
            </span>
          </summary>
          <p className="mt-3 max-w-2xl pr-12 text-sm leading-relaxed text-muted-foreground">{faq.answer}</p>
        </details>
      ))}
    </div>
  )
}

export function BrowserFrame({
  url,
  children,
  className,
}: {
  url: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('overflow-hidden rounded-[22px] border border-border/70 bg-card text-foreground shadow-lift', className)}>
      <div className="flex items-center gap-3 border-b border-border/60 bg-secondary/60 px-4 py-2.5">
        <span className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        </span>
        <span className="mx-auto truncate rounded-full bg-card px-4 py-1 text-[11px] font-medium text-muted-foreground">
          {url}
        </span>
        <span className="w-10" />
      </div>
      {children}
    </div>
  )
}

export function Marquee({ items, tone = 'dark' }: { items: string[]; tone?: 'dark' | 'light' }) {
  const row = (hidden: boolean) => (
    <ul
      aria-hidden={hidden || undefined}
      className="flex shrink-0 animate-marquee items-center gap-8 pr-8 motion-reduce:animate-none"
    >
      {items.map((item) => (
        <li key={item} className="flex items-center gap-8 whitespace-nowrap">
          <span className={cn('text-sm font-medium', tone === 'dark' ? 'text-white/85' : 'text-foreground/70')}>
            {item}
          </span>
          <span className={cn('text-xs', tone === 'dark' ? 'text-white/50' : 'text-primary')}>✦</span>
        </li>
      ))}
    </ul>
  )
  return (
    <div className="flex overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
      {row(false)}
      {row(true)}
    </div>
  )
}
