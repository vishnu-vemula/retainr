import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '../../../shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/components/ui/card'
import { formatCurrency, formatDate } from '../../../shared/lib/format'
import { BrandLogo } from '../../../shared/components/brand-logo'
import { usePublicProposal, useRespondToProposal } from '../hooks/use-proposals'

export function PublicProposalPage() {
  const { token } = useParams<{ token: string }>()
  const { data: proposal, isLoading, error } = usePublicProposal(token ?? '')
  const respond = useRespondToProposal(token ?? '')
  const [packageId, setPackageId] = useState<string | null>(null)
  const [addonIds, setAddonIds] = useState<string[] | null>(null)

  if (isLoading) return <main className="mx-auto max-w-3xl p-8 text-sm text-muted-foreground">Loading proposal…</main>
  if (error || !proposal) return <main className="mx-auto max-w-3xl p-8 text-sm text-destructive">{error instanceof Error ? error.message : 'Proposal not found'}</main>

  const packages = proposal.snapshot.items.filter((item) => item.kind === 'PACKAGE')
  const addons = proposal.snapshot.items.filter((item) => item.kind === 'ADD_ON')
  const base = proposal.snapshot.items.filter((item) => item.kind === 'BASE')
  const selectedPackage = packageId ?? proposal.selectedPackageId ?? (packages.length === 1 ? packages[0].id : null)
  const selectedAddons = addonIds ?? proposal.selectedAddonIds
  const lineTotal = (item: typeof base[number]) => item.quantity * item.unitPrice
  const total = base.reduce((sum, item) => sum + lineTotal(item), 0) +
    packages.filter((item) => item.id === selectedPackage).reduce((sum, item) => sum + lineTotal(item), 0) +
    addons.filter((item) => selectedAddons.includes(item.id)).reduce((sum, item) => sum + lineTotal(item), 0)
  const decided = proposal.status === 'ACCEPTED' || proposal.status === 'DECLINED'

  const toggleAddon = (id: string) => setAddonIds((current) => {
    const selected = current ?? proposal.selectedAddonIds
    return selected.includes(id) ? selected.filter((entry) => entry !== id) : [...selected, id]
  })
  const submit = (decision: 'ACCEPTED' | 'DECLINED') => {
    if (decision === 'DECLINED') respond.mutate({ decision })
    else respond.mutate({ decision, selectedPackageId: selectedPackage, selectedAddonIds: selectedAddons })
  }

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-12 sm:px-8">
      <BrandLogo />
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Retainr proposal</p>
        <h1 className="font-display text-4xl font-semibold text-foreground">{proposal.snapshot.title}</h1>
        <p className="text-sm text-muted-foreground">Valid until {formatDate(proposal.expiresAt)} · {proposal.snapshot.engagementType === 'RETAINER' ? 'Monthly retainer' : 'Project'}</p>
      </header>
      <Card><CardHeader><CardTitle>Scope and pricing</CardTitle></CardHeader><CardContent className="space-y-4">
        {base.map((item) => <div key={item.id} className="flex justify-between gap-4 text-sm"><span>{item.description} × {item.quantity}</span><span>{formatCurrency(lineTotal(item), proposal.snapshot.currency)}</span></div>)}
        {packages.length > 0 ? <fieldset className="space-y-2 border-t border-border pt-4"><legend className="font-medium">Choose a package</legend>{packages.map((item) => (
          <label key={item.id} className="flex cursor-pointer justify-between gap-4 rounded-xl border border-border p-3 text-sm"><span><input type="radio" name="package" checked={selectedPackage === item.id} disabled={decided} onChange={() => setPackageId(item.id)} className="mr-2" />{item.description}</span><span>{formatCurrency(lineTotal(item), proposal.snapshot.currency)}</span></label>
        ))}</fieldset> : null}
        {addons.length > 0 ? <fieldset className="space-y-2 border-t border-border pt-4"><legend className="font-medium">Optional add-ons</legend>{addons.map((item) => (
          <label key={item.id} className="flex cursor-pointer justify-between gap-4 rounded-xl border border-border p-3 text-sm"><span><input type="checkbox" checked={selectedAddons.includes(item.id)} disabled={decided} onChange={() => toggleAddon(item.id)} className="mr-2" />{item.description}</span><span>{formatCurrency(lineTotal(item), proposal.snapshot.currency)}</span></label>
        ))}</fieldset> : null}
        <div className="flex justify-between border-t border-border pt-4 font-semibold"><span>Selected total</span><span>{formatCurrency(total, proposal.snapshot.currency)}</span></div>
      </CardContent></Card>
      <Card><CardContent className="space-y-3 pt-6 text-sm">
        <p>One-time project value: {formatCurrency(proposal.snapshot.oneTimeValue, proposal.snapshot.currency)}</p>
        <p>Monthly recurring value: {formatCurrency(proposal.snapshot.monthlyRecurringValue, proposal.snapshot.currency)}</p>
        {proposal.snapshot.serviceStartDate ? <p>Service starts {formatDate(proposal.snapshot.serviceStartDate)}</p> : null}
        {proposal.snapshot.renewalDate ? <p>Renewal date {formatDate(proposal.snapshot.renewalDate)}</p> : null}
      </CardContent></Card>
      {decided ? <p className="rounded-xl border border-border p-4 text-sm font-medium">Proposal {proposal.status.toLowerCase()}.</p> : (
        <div className="space-y-2">
          <div className="flex gap-3"><Button type="button" disabled={respond.isPending || (packages.length > 0 && !selectedPackage)} onClick={() => submit('ACCEPTED')}>Accept proposal</Button><Button type="button" variant="outline" disabled={respond.isPending} onClick={() => submit('DECLINED')}>Decline</Button></div>
          {respond.error ? <p className="text-sm text-destructive">{respond.error.message}</p> : null}
          <p className="text-xs text-muted-foreground">Acceptance records your choice. It is not an electronic signature or payment.</p>
        </div>
      )}
    </main>
  )
}
