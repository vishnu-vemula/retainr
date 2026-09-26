import type { Metadata } from 'next'
import { PricingPage } from '@/src/features/marketing/components/pricing-page'

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Retainr includes proposals, onboarding and renewal tools in early access. Team plans will be announced later.',
}

export default function PricingRoute() {
  return <PricingPage />
}
