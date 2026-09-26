import { Check, LockKeyhole } from 'lucide-react'
import { securityFaqs, securityPillars } from '../model/content'
import { Container, CtaBand, FaqList, PageHero, Pill, SectionHeading } from './marketing-ui'

const requestFlow = [
  ['Sign in', 'Firebase Authentication issues a short-lived ID token.'],
  ['Verify', 'The API verifies the token on every request.'],
  ['Authorize', 'Your role is checked for admin-only actions.'],
  ['Validate', 'The request body and query are schema-validated.'],
  ['Scope', 'The query is filtered to records you own.'],
  ['Record', 'The change is written to the audit trail.'],
]

export function SecurityPage() {
  return (
    <>
      <PageHero
        eyebrow="Security"
        title="Your clients trust you."
        muted="You can trust Retainr."
        description="Security isn't a tier. Verified sessions, owner-scoped data and a full audit trail protect every account from day one."
      />

      <section className="pb-20 sm:pb-24">
        <Container>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {securityPillars.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="group rounded-[28px] border border-border/70 bg-card p-7 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="h-5 w-5" />
                </span>
                <p className="mt-8 text-lg font-semibold tracking-tight text-foreground">{title}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-14 sm:py-20">
        <Container>
          <div className="relative isolate overflow-hidden rounded-[40px] bg-ink px-6 py-14 text-white sm:px-12 sm:py-20">
            <div aria-hidden="true" className="absolute -left-32 -top-32 -z-10 h-96 w-96 rounded-full bg-primary/30 blur-3xl" />
            <Pill tone="onRed">Every request</Pill>
            <h2 className="mt-6 max-w-3xl text-4xl font-medium leading-[1.02] tracking-[-0.05em] sm:text-6xl">
              Six checks.
              <br />
              <span className="text-white/45">Every single time.</span>
            </h2>
            <ol className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {requestFlow.map(([title, description], index) => (
                <li key={title} className="flex gap-4 rounded-[24px] border border-white/10 bg-white/[0.06] p-5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary font-display text-sm font-semibold">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-[15px] font-semibold">{title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-white/65">{description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </Container>
      </section>

      <section className="py-14 sm:py-20">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <SectionHeading eyebrow="Data ownership" title="Only you" muted="see your records." />
              <ul className="mt-8 space-y-4">
                {[
                  'Every contact, company, deal and task carries an owner',
                  'Every query is filtered by that owner',
                  'Database keys enforce ownership on updates and deletes',
                  'Nested records inherit ownership from their parent',
                ].map((point) => (
                  <li key={point} className="flex items-start gap-3 text-[15px] text-foreground">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check className="h-3.5 w-3.5" strokeWidth={3} />
                    </span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-[32px] border border-border/70 bg-card p-6 shadow-lift sm:p-8">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <LockKeyhole className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">Audit trail</p>
                  <p className="text-xs text-muted-foreground">Clinic scheduling system</p>
                </div>
              </div>
              <ul className="mt-6 divide-y divide-border/60">
                {[
                  ['Stage change', 'Proposal → Negotiation', '1d ago', 'bg-brand-50 text-brand-700 ring-brand-600/20'],
                  ['Update', 'Value set to $64,000', '2d ago', 'bg-sky-50 text-sky-700 ring-sky-600/20'],
                  ['Update', 'Expected close moved to Oct 2', '4d ago', 'bg-sky-50 text-sky-700 ring-sky-600/20'],
                  ['Create', 'Deal created', '14d ago', 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'],
                ].map(([action, summary, when, tone]) => (
                  <li key={summary} className="flex items-center gap-3 py-3 text-sm">
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ring-1 ring-inset ${tone}`}>{action}</span>
                    <span className="min-w-0 flex-1 truncate text-foreground">{summary}</span>
                    <span className="text-xs text-muted-foreground">{when}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-14 sm:py-20">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
            <SectionHeading eyebrow="Security FAQ" title="Good questions," muted="straight answers." />
            <FaqList faqs={securityFaqs} />
          </div>
        </Container>
      </section>

      <CtaBand title="Secure by default." muted="Free to start." />
    </>
  )
}
