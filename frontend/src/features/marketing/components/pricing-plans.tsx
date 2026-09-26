'use client'
import Link from 'next/link'
import { ArrowUpRight, Check } from 'lucide-react'
import { Button } from '../../../shared/components/ui/button'
import { cn } from '../../../shared/lib/utils'
import { plans } from '../model/content'

export function PricingPlans() {
  return (
    <div>
      <div className="mt-12 grid gap-4 lg:grid-cols-3">
        {plans.map((plan) => {
          return (
            <article
              key={plan.name}
              className={cn(
                'relative flex flex-col overflow-hidden rounded-[32px] p-7 sm:p-8',
                plan.highlighted
                  ? 'bg-hero isolate text-white shadow-[0_40px_80px_-40px_rgb(200_40_10/0.7)]'
                  : 'border border-border/70 bg-card shadow-soft',
              )}
            >
              {plan.highlighted ? (
                <p
                  aria-hidden="true"
                  className="pointer-events-none absolute -bottom-8 -right-2 -z-10 select-none font-display text-[10rem] font-light leading-none tracking-[-0.06em] text-white/10"
                >
                  $0
                </p>
              ) : null}
              <div className="flex items-center justify-between gap-3">
                <p className={cn('text-lg font-semibold tracking-tight', plan.highlighted ? 'text-white' : 'text-foreground')}>
                  {plan.name}
                </p>
                <span
                  className={cn(
                    'rounded-full px-2.5 py-1 text-[11px] font-semibold',
                    plan.status === 'available'
                      ? 'bg-white text-primary'
                      : 'bg-secondary text-muted-foreground',
                  )}
                >
                  {plan.status === 'available' ? 'Available now' : 'Coming soon'}
                </span>
              </div>
              <p className={cn('mt-3 text-sm leading-relaxed', plan.highlighted ? 'text-white/85' : 'text-muted-foreground')}>
                {plan.description}
              </p>
              <p className={cn('mt-8 flex items-end gap-2', plan.highlighted ? 'text-white' : 'text-foreground')}>
                <span className="text-6xl font-light tracking-[-0.06em]">{plan.monthly === null ? 'TBD' : `$${plan.monthly}`}</span>
                <span className={cn('pb-2 text-sm', plan.highlighted ? 'text-white/75' : 'text-muted-foreground')}>
                  {plan.monthly === null ? 'team pricing' : 'during early access'}
                </span>
              </p>
              <p className={cn('mt-1 h-5 text-xs', plan.highlighted ? 'text-white/75' : 'text-muted-foreground')}>
                {plan.status === 'soon' ? 'No billing enabled yet' : 'No credit card required'}
              </p>
              <Button
                asChild
                size="lg"
                variant={plan.highlighted ? 'ink' : 'outline'}
                className={cn('mt-8 w-full', !plan.highlighted && 'shadow-none')}
              >
                <Link href={plan.cta.href}>
                  {plan.cta.label}
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
              <ul className={cn('mt-8 space-y-3 border-t pt-8', plan.highlighted ? 'border-white/20' : 'border-border/70')}>
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <span
                      className={cn(
                        'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full',
                        plan.highlighted ? 'bg-white text-primary' : 'bg-accent text-primary',
                      )}
                    >
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </span>
                    <span className={plan.highlighted ? 'text-white' : 'text-foreground'}>{feature}</span>
                  </li>
                ))}
              </ul>
            </article>
          )
        })}
      </div>
    </div>
  )
}
