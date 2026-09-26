import type { ReactNode } from 'react'
import { MarketingFooter } from './marketing-footer'
import { MarketingNavbar } from './marketing-navbar'

export function MarketingShell({ children }: { children: ReactNode }) {
  return (
    <div id="top" className="flex min-h-screen flex-col">
      <MarketingNavbar />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
    </div>
  )
}
