import type { ReactNode } from 'react'
import { MarketingShell } from '@/src/features/marketing/components/marketing-shell'

export default function SiteLayout({ children }: { children: ReactNode }) {
  return <MarketingShell>{children}</MarketingShell>
}
