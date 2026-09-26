'use client'

import { DealDetailPage } from '@/src/features/deals/components/deal-detail-page'
import { ProposalPanel } from '@/src/features/proposals/components/proposal-panel'

export default function DealDetailRoute() {
  return <DealDetailPage renderProposalPanel={(dealId, hasItems) => <ProposalPanel dealId={dealId} hasItems={hasItems} />} />
}
