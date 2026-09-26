import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Proposal',
  robots: { index: false, follow: false },
}

export default function ProposalLayout({ children }: { children: ReactNode }) {
  return children
}
