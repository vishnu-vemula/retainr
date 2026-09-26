import type { Metadata } from 'next'
import { HomePage } from '@/src/features/marketing/components/home-page'

export const metadata: Metadata = {
  title: { absolute: 'Retainr — The CRM for teams that keep their clients' },
}

export default function HomeRoute() {
  return <HomePage />
}
