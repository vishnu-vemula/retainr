import { useState } from 'react'
import { toast } from 'react-toastify'
import { Button } from '../../../shared/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../shared/components/ui/card'
import { formatDate } from '../../../shared/lib/format'
import { useCreateProposal, useProposals } from '../hooks/use-proposals'

export function ProposalPanel({ dealId, hasItems }: { dealId: string; hasItems: boolean }) {
  const { data: proposals } = useProposals(dealId)
  const create = useCreateProposal(dealId)
  const [shareUrl, setShareUrl] = useState<string | null>(null)

  const createLink = async () => {
    try {
      const result = await create.mutateAsync()
      setShareUrl(`${window.location.origin}/proposal/${result.shareToken}`)
    } catch {
      setShareUrl(null)
    }
  }

  const copyLink = async () => {
    if (!shareUrl) return
    try {
      await navigator.clipboard.writeText(shareUrl)
      toast.success('Proposal link copied')
    } catch {
      toast.error('Copy failed. Select the link to copy it manually.')
    }
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div><CardTitle>Proposals</CardTitle><CardDescription>Share a quote snapshot. Anyone with the link can view and respond until it expires.</CardDescription></div>
        <Button type="button" disabled={!hasItems || create.isPending} onClick={() => void createLink()}>Create share link</Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {!hasItems ? <p className="text-sm text-muted-foreground">Add quote items before creating a proposal.</p> : null}
        {shareUrl ? (
          <div className="space-y-2 rounded-2xl border border-border p-4">
            <p className="text-sm font-medium">Copy this link now. For security, it is shown only once.</p>
            <input readOnly aria-label="Proposal share link" className="w-full rounded-lg border border-border bg-background p-2 text-sm" value={shareUrl} onFocus={(event) => event.target.select()} />
            <Button type="button" variant="outline" size="sm" onClick={() => void copyLink()}>Copy link</Button>
          </div>
        ) : null}
        {(proposals ?? []).length === 0 ? <p className="text-sm text-muted-foreground">No proposals sent yet.</p> : (
          <ul className="divide-y divide-border/60">
            {proposals?.map((proposal) => (
              <li key={proposal.id} className="flex flex-wrap justify-between gap-2 py-3 text-sm">
                <span>{proposal.snapshot.title}</span>
                <span className="text-muted-foreground">{proposal.status.toLowerCase()} · expires {formatDate(proposal.expiresAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
