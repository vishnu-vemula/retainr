import type { Metadata } from 'next'
import { AboutPage } from '@/src/features/marketing/components/about-page'

export const metadata: Metadata = {
  title: 'About',
  description: 'Retainr helps performance-marketing agencies turn proposals into onboarding and healthy retainers.',
}

export default function AboutRoute() {
  return <AboutPage />
}
