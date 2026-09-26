import type { Metadata } from 'next'
import { HomePage } from '@/src/features/marketing/components/home-page'

export const metadata: Metadata = {
  title: { absolute: 'Retainr — From agency proposal to renewal' },
}

export default function HomeRoute() {
  return <HomePage />
}
