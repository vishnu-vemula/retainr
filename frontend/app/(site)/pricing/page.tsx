import type { Metadata } from 'next'
import { PricingPage } from '@/src/features/marketing/components/pricing-page'

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Retainr is free while in early access. Studio and Agency plans with retainer tooling are coming soon.',
}

export default function PricingRoute() {
  return <PricingPage />
}
