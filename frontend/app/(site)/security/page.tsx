import type { Metadata } from 'next'
import { SecurityPage } from '@/src/features/marketing/components/security-page'

export const metadata: Metadata = {
  title: 'Security',
  description: 'Verified sessions, owner-scoped data, role-based access and a full audit trail on every Retainr account.',
}

export default function SecurityRoute() {
  return <SecurityPage />
}
