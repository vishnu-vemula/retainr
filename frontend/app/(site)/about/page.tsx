import type { Metadata } from 'next'
import { AboutPage } from '@/src/features/marketing/components/about-page'

export const metadata: Metadata = {
  title: 'About',
  description: 'Retainr is the CRM for agencies and client-first teams whose business runs on relationships.',
}

export default function AboutRoute() {
  return <AboutPage />
}
