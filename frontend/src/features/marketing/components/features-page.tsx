import Link from 'next/link'
import { ArrowUpRight, Check } from 'lucide-react'
import { Button } from '../../../shared/components/ui/button'
import { cn } from '../../../shared/lib/utils'
import { extraFeatures, featureDeepDives, roadmap } from '../model/content'
import { Container, CtaBand, PageHero, Pill, SectionHeading } from './marketing-ui'
import { FeaturePreview } from './product-previews'

export function FeaturesPage() {
  return (
    <>
      <PageHero
        eyebrow="Features"
        title="Everything a client-first team needs."
        muted="Nothing it doesn't."
        description="Twelve modules that share one data model — so the context you capture in one place shows up everywhere else."
      >
        <nav aria-label="Feature sections" className="flex flex-wrap gap-2">
          {featureDeepDives.map((feature) => (
            <a
              key={feature.id}
              href={`#${feature.id}`}
              className="rounded-full border border-border/70 bg-card px-4 py-2 text-sm font-medium text-foreground/80 shadow-sm transition-colors hover:border-primary/40 hover:text-primary"
            >
              {feature.eyebrow}
            </a>
          ))}
        </nav>
      </PageHero>

      <div className="space-y-6 pb-12 sm:space-y-10">
        {featureDeepDives.map((feature, index) => {
          const reversed = index % 2 === 1
          return (
            <section key={feature.id} id={feature.id} className="scroll-mt-28">
              <Container>
                <div
                  className={cn(
                    'grid items-center gap-10 overflow-hidden rounded-[36px] border border-border/60 p-6 sm:p-10 lg:grid-cols-2 lg:gap-16 lg:p-14',
                    reversed ? 'bg-secondary/50' : 'bg-card shadow-soft',
                  )}
                >
                  <div className={cn(reversed && 'lg:order-2')}>
                    <div className="flex items-center gap-3">
                      <span className="font-display text-sm font-semibold text-primary">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="h-px w-8 bg-primary/40" />
                      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        {feature.eyebrow}
                      </span>
                    </div>
                    <h2 className="mt-5 text-4xl font-medium leading-[1.04] tracking-[-0.045em] text-foreground sm:text-5xl">
                      {feature.title}
                    </h2>
                    <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-muted-foreground sm:text-base">
                      {feature.description}
                    </p>
                    <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                      {feature.points.map((point) => (
                        <li key={point} className="flex items-start gap-3 text-sm text-foreground">
                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                            <Check className="h-3 w-3" strokeWidth={3} />
                          </span>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className={cn('relative', reversed && 'lg:order-1')}>
                    <div
                      aria-hidden="true"
                      className="absolute -inset-6 -z-0 rounded-[40px] bg-[radial-gradient(closest-side,hsl(var(--primary)/0.14),transparent)]"
                    />
                    <div className="relative">
                      <FeaturePreview preview={feature.preview} />
                    </div>
                  </div>
                </div>
              </Container>
            </section>
          )
        })}
      </div>

      <section className="py-16 sm:py-20">
        <Container>
          <SectionHeading
            eyebrow="Also included"
            title="The details that"
            muted="make it feel fast."
            description="Small things, done properly, on every account."
          />
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {extraFeatures.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="group rounded-[24px] border border-border/70 bg-card p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="h-5 w-5" />
                </span>
                <p className="mt-6 text-[15px] font-semibold text-foreground">{title}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section id="roadmap" className="scroll-mt-28 py-16 sm:py-20">
        <Container>
          <div className="relative isolate overflow-hidden rounded-[40px] bg-ink px-6 py-14 text-white sm:px-12 sm:py-20">
            <div aria-hidden="true" className="absolute -right-32 -top-32 -z-10 h-96 w-96 rounded-full bg-primary/30 blur-3xl" />
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <Pill tone="onRed">On the roadmap</Pill>
                <h2 className="mt-6 text-4xl font-medium leading-[1.02] tracking-[-0.05em] sm:text-6xl">
                  Built for retainers.
                  <br />
                  <span className="text-white/45">Coming next.</span>
                </h2>
              </div>
              <Button asChild className="bg-white text-foreground shadow-none hover:bg-white/90">
                <Link href="/contact">
                  Get notified
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {roadmap.map(({ icon: Icon, title, description }) => (
                <div key={title} className="rounded-[24px] border border-white/10 bg-white/[0.06] p-5 backdrop-blur">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                    <Icon className="h-5 w-5" />
                  </span>
                  <p className="mt-5 text-[15px] font-semibold">{title}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-white/65">{description}</p>
                  <span className="mt-4 inline-block rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-300">
                    Coming soon
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <CtaBand title="See it on" muted="your own clients." />
    </>
  )
}
