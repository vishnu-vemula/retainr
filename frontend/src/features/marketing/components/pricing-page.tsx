import { Check, Minus } from 'lucide-react'
import { planComparison, plans, pricingFaqs } from '../model/content'
import { Container, CtaBand, FaqList, PageHero, SectionHeading } from './marketing-ui'
import { PricingPlans } from './pricing-plans'

function ComparisonValue({ value, highlighted }: { value: string; highlighted: boolean }) {
  if (value === '✓') {
    return (
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground" aria-label="Included">
        <Check className="h-3.5 w-3.5" strokeWidth={3} />
      </span>
    )
  }
  if (value === '—') {
    return (
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-muted-foreground" aria-label="Not included">
        <Minus className="h-3.5 w-3.5" />
      </span>
    )
  }
  return <span className={highlighted ? 'font-semibold text-foreground' : 'text-muted-foreground'}>{value}</span>
}

export function PricingPage() {
  return (
    <>
      <PageHero
        eyebrow="Pricing"
        title="Simple pricing."
        muted="Free while in early access."
        description="Proposals, onboarding and renewals are included in early access. Studio and Agency are planned team plans, with no billing enabled yet."
      >
        <PricingPlans />
      </PageHero>

      <section className="py-14 sm:py-20">
        <Container>
          <SectionHeading eyebrow="Compare" title="What's in" muted="each plan." />
          <div className="mt-12 overflow-x-auto rounded-[32px] border border-border/70 bg-card shadow-soft">
            <table className="w-full min-w-[40rem] text-sm">
              <thead>
                <tr className="border-b border-border/70">
                  <th className="px-6 py-5 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Feature
                  </th>
                  {plans.map((plan) => (
                    <th key={plan.name} className="px-6 py-5 text-center">
                      <span className="block text-[15px] font-semibold text-foreground">{plan.name}</span>
                      <span className="text-xs font-normal text-muted-foreground">
                        {plan.status === 'available' ? 'Available now' : 'Coming soon'}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {planComparison.map((row) => (
                  <tr key={row.label} className="border-b border-border/50 last:border-0 hover:bg-accent/30">
                    <td className="px-6 py-4 font-medium text-foreground">{row.label}</td>
                    {row.values.map((value, index) => (
                      <td key={index} className={index === 0 ? 'bg-accent/40 px-6 py-4 text-center' : 'px-6 py-4 text-center'}>
                        <ComparisonValue value={value} highlighted={index === 0} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Container>
      </section>

      <section className="py-14 sm:py-20">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
            <SectionHeading eyebrow="Billing FAQ" title="The fine print," muted="in plain words." />
            <FaqList faqs={pricingFaqs} />
          </div>
        </Container>
      </section>

      <CtaBand title="Start today." muted="Pay nothing." />
    </>
  )
}
