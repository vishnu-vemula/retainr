import { milestones, principles, productFacts, stack } from '../model/content'
import { Container, CtaBand, PageHero, Pill, SectionHeading } from './marketing-ui'
import { PipelinePreview } from './product-previews'

export function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About Retainr"
        title="We build for the teams"
        muted="who build relationships."
        description="Retainr exists for agencies and client-first teams whose business runs on trust, follow-through and repeat work — not on cold lists."
      />

      <section className="pb-20 sm:pb-24">
        <Container>
          <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
            <div className="bg-hero relative isolate overflow-hidden rounded-[36px] p-8 text-white sm:p-12">
              <p
                aria-hidden="true"
                className="text-outline-white pointer-events-none absolute -bottom-[0.22em] left-6 -z-10 select-none font-display text-[12rem] font-semibold leading-none tracking-[-0.06em]"
              >
                story
              </p>
              <Pill tone="onRed">Our story</Pill>
              <p className="mt-6 max-w-xl text-3xl font-medium leading-[1.1] tracking-[-0.04em] sm:text-4xl">
                Great client work is mostly remembering what you promised — and doing it on time.
              </p>
              <p className="mt-6 max-w-lg text-[15px] leading-relaxed text-white/85">
                Retainr started as a task board for keeping follow-ups on track. Every team that used it wanted the
                same things next: who the client is, what the deal is worth, and what happened last time. So we rebuilt
                it from the ground up as a CRM — typed, tested and designed around the relationship.
              </p>
            </div>
            <div className="flex flex-col justify-between gap-6 rounded-[36px] border border-border/70 bg-card p-8 shadow-soft sm:p-10">
              <p className="text-[15px] leading-relaxed text-muted-foreground">
                Today Retainr covers the whole loop — contacts and companies, a drag-and-drop pipeline, quotes, tasks,
                activity timelines, notifications and an audit trail. Next, we&apos;re building the tools agencies on
                retainers have always stitched together themselves.
              </p>
              <PipelinePreview compact />
            </div>
          </div>
        </Container>
      </section>

      <section className="py-14 sm:py-20">
        <Container>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {productFacts.map((fact) => (
              <div key={fact.label} className="rounded-[28px] border border-border/70 bg-card p-7 shadow-soft">
                <p className="text-6xl font-light tracking-[-0.06em] text-foreground">
                  {fact.value.replace('%', '')}
                  {fact.value.endsWith('%') ? <span className="text-primary">%</span> : null}
                </p>
                <p className="mt-4 text-sm text-muted-foreground">{fact.label}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-14 sm:py-20">
        <Container>
          <SectionHeading eyebrow="Principles" title="What we believe," muted="and build by." />
          <div className="mt-14 grid gap-4 md:grid-cols-2">
            {principles.map(({ icon: Icon, title, description }, index) => (
              <div
                key={title}
                className="group flex gap-6 rounded-[28px] border border-border/70 bg-card p-7 shadow-soft transition-shadow hover:shadow-lift"
              >
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-accent text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="h-6 w-6" />
                </span>
                <div>
                  <p className="font-display text-sm font-semibold text-primary">0{index + 1}</p>
                  <p className="mt-1 text-xl font-semibold tracking-tight text-foreground">{title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-14 sm:py-20">
        <Container>
          <div className="rounded-[40px] bg-secondary/60 px-6 py-14 sm:px-12 sm:py-16">
            <SectionHeading eyebrow="The journey" title="From task board" muted="to client platform." />
            <ol className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {milestones.map((milestone, index) => (
                <li key={milestone.title} className="relative">
                  <div className="flex items-center gap-3">
                    <span
                      className={
                        index === milestones.length - 1
                          ? 'flex h-10 w-10 items-center justify-center rounded-full border-2 border-dashed border-primary text-sm font-semibold text-primary'
                          : 'flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground shadow-glow'
                      }
                    >
                      {index + 1}
                    </span>
                    <span className="h-px flex-1 bg-border" />
                  </div>
                  <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    {milestone.phase}
                  </p>
                  <p className="mt-1 text-xl font-semibold tracking-tight text-foreground">{milestone.title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{milestone.description}</p>
                </li>
              ))}
            </ol>
          </div>
        </Container>
      </section>

      <section className="py-14 sm:py-20">
        <Container className="text-center">
          <Pill>Under the hood</Pill>
          <p className="mx-auto mt-6 max-w-3xl text-4xl font-medium leading-[1.05] tracking-[-0.045em] text-foreground sm:text-5xl">
            Built on a stack <span className="text-foreground/35">you can trust.</span>
          </p>
          <ul className="mx-auto mt-10 flex max-w-3xl flex-wrap justify-center gap-2.5">
            {stack.map((item) => (
              <li
                key={item}
                className="rounded-full border border-border/70 bg-card px-5 py-2.5 text-sm font-medium text-foreground shadow-sm"
              >
                {item}
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <CtaBand title="Come build" muted="better relationships." />
    </>
  )
}
