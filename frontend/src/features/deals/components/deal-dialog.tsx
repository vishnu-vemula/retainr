import { useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { Dialog } from '../../../shared/components/dialog'
import { ConfirmButton } from '../../../shared/components/confirm-button'
import { Button } from '../../../shared/components/ui/button'
import { Input } from '../../../shared/components/ui/input'
import { Label } from '../../../shared/components/ui/label'
import { Textarea } from '../../../shared/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../shared/components/ui/select'
import { CURRENCIES, DEAL_SOURCES, DEAL_STAGES, DEAL_STAGE_LABELS, type Deal, type DealStage } from '../../../shared/types'
import { dealFormSchema, type DealFormValues } from '../model/schema'
import {
  useCreateDeal,
  useDeleteDeal,
  useSetDealTags,
  useUpdateDeal,
} from '../hooks/use-deal-mutations'
import { useContacts } from '../../contacts/hooks/use-contacts'
import { useCompanies } from '../../companies/hooks/use-companies'
import { TagSelect } from '../../tags/components/tag-select'

interface DealDialogProps {
  deal: Deal | null
  defaultStage?: DealStage
  onClose: () => void
}

function toFormValues(deal: Deal | null): DealFormValues {
  if (!deal) {
    return {
      title: '',
      value: 0,
      stage: 'NEW',
      currency: 'USD',
      probability: 0,
      source: '',
      nextStep: '',
      lostReason: '',
      churnReason: '',
      engagementType: 'PROJECT',
      oneTimeValue: 0,
      monthlyRecurringValue: 0,
      serviceStartDate: '',
      renewalDate: '',
      renewalHealth: 'UNKNOWN',
      renewalProbability: '',
      nextReviewDate: '',
      contactId: '',
      companyId: '',
      expectedCloseDate: '',
      notes: '',
    }
  }
  return {
    title: deal.title,
    value: deal.value,
    stage: deal.stage,
    currency: (CURRENCIES.includes(deal.currency) ? deal.currency : 'USD') as DealFormValues['currency'],
    probability: deal.probability,
    source: deal.source ?? '',
    nextStep: deal.nextStep ?? '',
    lostReason: deal.lostReason ?? '',
    churnReason: deal.churnReason ?? '',
    engagementType: deal.engagementType,
    oneTimeValue: deal.oneTimeValue,
    monthlyRecurringValue: deal.monthlyRecurringValue,
    serviceStartDate: deal.serviceStartDate?.slice(0, 10) ?? '',
    renewalDate: deal.renewalDate?.slice(0, 10) ?? '',
    renewalHealth: deal.renewalHealth,
    renewalProbability: deal.renewalProbability ?? '',
    nextReviewDate: deal.nextReviewDate?.slice(0, 10) ?? '',
    contactId: deal.contactId ?? '',
    companyId: deal.companyId ?? '',
    expectedCloseDate: deal.expectedCloseDate ? deal.expectedCloseDate.slice(0, 10) : '',
    notes: deal.notes ?? '',
  }
}

function sameTagIds(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((id) => b.includes(id))
}

const stageProbability: Record<DealStage, number> = {
  NEW: 10, QUALIFIED: 25, PROPOSAL: 50, NEGOTIATION: 75, WON: 100, LOST: 0,
}

export function DealDialog({ deal, defaultStage, onClose }: DealDialogProps) {
  const createMutation = useCreateDeal()
  const updateMutation = useUpdateDeal()
  const deleteMutation = useDeleteDeal()
  const setTagsMutation = useSetDealTags()
  const { data: contactPage } = useContacts({ page: 1, pageSize: 100 })
  const { data: companyPage } = useCompanies({ page: 1, pageSize: 100 })
  const [tagIds, setTagIds] = useState<string[]>(deal?.tags.map((tag) => tag.id) ?? [])

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, dirtyFields },
  } = useForm<DealFormValues>({
    resolver: zodResolver(dealFormSchema),
    values: deal ? toFormValues(deal) : { ...toFormValues(null), stage: defaultStage ?? 'NEW', probability: stageProbability[defaultStage ?? 'NEW'] },
  })

  const stage = useWatch({ control, name: 'stage' })
  const engagementType = useWatch({ control, name: 'engagementType' })

  const onSubmit = handleSubmit(async (values) => {
    const input = {
      title: values.title,
      value: values.value,
      stage: values.stage,
      currency: values.currency,
      probability: dirtyFields.probability ? values.probability : undefined,
      source: values.source || null,
      nextStep: values.nextStep || undefined,
      lostReason: values.lostReason || undefined,
      churnReason: values.churnReason || undefined,
      engagementType: values.engagementType,
      oneTimeValue: values.oneTimeValue,
      monthlyRecurringValue: values.monthlyRecurringValue,
      serviceStartDate: values.serviceStartDate || null,
      renewalDate: values.renewalDate || null,
      renewalHealth: values.renewalHealth,
      renewalProbability: values.renewalProbability === '' ? null : values.renewalProbability,
      nextReviewDate: values.nextReviewDate || null,
      contactId: values.contactId || null,
      companyId: values.companyId || null,
      expectedCloseDate: values.expectedCloseDate || null,
      notes: values.notes || undefined,
    }
    if (deal) {
      const updated = await updateMutation.mutateAsync({ id: deal.id, input })
      if (!sameTagIds(tagIds, updated.tags.map((tag) => tag.id))) {
        await setTagsMutation.mutateAsync({ id: deal.id, tagIds })
      }
    } else {
      const created = await createMutation.mutateAsync(input)
      if (tagIds.length > 0) {
        await setTagsMutation.mutateAsync({ id: created.id, tagIds })
      }
    }
    onClose()
  })

  const submitting =
    createMutation.isPending || updateMutation.isPending || setTagsMutation.isPending

  return (
    <Dialog title={deal ? 'Edit engagement' : 'New engagement'} onClose={onClose}>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="deal-title">Title</Label>
          <Input id="deal-title" type="text" {...register('title')} />
          {errors.title ? <p className="text-sm text-destructive">{errors.title.message}</p> : null}
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="deal-value">Value</Label>
            <Input id="deal-value" type="number" min="0" step="any" {...register('value')} />
            {errors.value ? <p className="text-sm text-destructive">{errors.value.message}</p> : null}
          </div>
          <div className="space-y-2">
            <Label>Currency</Label>
            <Controller
              control={control}
              name="currency"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((currency) => (
                      <SelectItem key={currency} value={currency}>
                        {currency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Stage</Label>
            <Controller
              control={control}
              name="stage"
              render={({ field }) => (
                <Select value={field.value} onValueChange={(value) => {
                  field.onChange(value)
                  if (!dirtyFields.probability) setValue('probability', stageProbability[value as DealStage], { shouldDirty: false })
                }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DEAL_STAGES.map((value) => (
                      <SelectItem key={value} value={value}>
                        {DEAL_STAGE_LABELS[value]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="deal-probability">Probability (%)</Label>
            <Input
              id="deal-probability"
              type="number"
              min="0"
              max="100"
              step="1"
              {...register('probability')}
            />
            {errors.probability ? (
              <p className="text-sm text-destructive">{errors.probability.message}</p>
            ) : null}
          </div>
        </div>
        {stage === 'LOST' ? (
          <div className="space-y-2">
            <Label htmlFor="deal-lost-reason">Lost reason</Label>
            <Textarea id="deal-lost-reason" rows={2} {...register('lostReason')} />
          </div>
        ) : null}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Engagement type</Label>
            <Controller control={control} name="engagementType" render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PROJECT">Project</SelectItem>
                  <SelectItem value="RETAINER">Retainer</SelectItem>
                </SelectContent>
              </Select>
            )} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="deal-one-time">One-time project value</Label>
            <Input id="deal-one-time" type="number" min="0" step="any" {...register('oneTimeValue')} />
          </div>
        </div>
        {engagementType === 'RETAINER' ? (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="deal-monthly">Monthly recurring value</Label>
                <Input id="deal-monthly" type="number" min="0" step="any" {...register('monthlyRecurringValue')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deal-renewal-probability">Renewal probability (%)</Label>
                <Input id="deal-renewal-probability" type="number" min="0" max="100" step="1" {...register('renewalProbability')} />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="deal-service-start">Service start</Label><Input id="deal-service-start" type="date" {...register('serviceStartDate')} /></div>
              <div className="space-y-2"><Label htmlFor="deal-renewal-date">Renewal date</Label><Input id="deal-renewal-date" type="date" {...register('renewalDate')} /></div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="deal-next-review">Next client review</Label><Input id="deal-next-review" type="date" {...register('nextReviewDate')} /></div>
              <div className="space-y-2">
                <Label>Renewal health</Label>
                <Controller control={control} name="renewalHealth" render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UNKNOWN">Unknown</SelectItem>
                      <SelectItem value="HEALTHY">Healthy</SelectItem>
                      <SelectItem value="AT_RISK">At risk</SelectItem>
                    </SelectContent>
                  </Select>
                )} />
              </div>
            </div>
            <div className="space-y-2"><Label htmlFor="deal-churn-reason">Churn reason</Label><Textarea id="deal-churn-reason" rows={2} {...register('churnReason')} /></div>
          </>
        ) : null}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Source</Label>
            <Controller
              control={control}
              name="source"
              render={({ field }) => (
                <Select
                  value={field.value || 'NONE'}
                  onValueChange={(value) => field.onChange(value === 'NONE' ? '' : value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">No source</SelectItem>
                    {DEAL_SOURCES.map((source) => (
                      <SelectItem key={source} value={source}>
                        {source.charAt(0) + source.slice(1).toLowerCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="deal-next-step">Next step</Label>
            <Input id="deal-next-step" type="text" {...register('nextStep')} />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Contact</Label>
            <Controller
              control={control}
              name="contactId"
              render={({ field }) => (
                <Select
                  value={field.value || 'NONE'}
                  onValueChange={(value) => field.onChange(value === 'NONE' ? '' : value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">No contact</SelectItem>
                    {(contactPage?.items ?? []).map((contact) => (
                      <SelectItem key={contact.id} value={contact.id}>
                        {contact.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="space-y-2">
            <Label>Company</Label>
            <Controller
              control={control}
              name="companyId"
              render={({ field }) => (
                <Select
                  value={field.value || 'NONE'}
                  onValueChange={(value) => field.onChange(value === 'NONE' ? '' : value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">No company</SelectItem>
                    {(companyPage?.items ?? []).map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="deal-close-date">Expected close date</Label>
          <Input id="deal-close-date" type="date" {...register('expectedCloseDate')} />
          {errors.expectedCloseDate ? (
            <p className="text-sm text-destructive">{errors.expectedCloseDate.message}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label>Tags</Label>
          <TagSelect value={tagIds} onChange={setTagIds} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="deal-notes">Notes</Label>
          <Textarea id="deal-notes" rows={3} {...register('notes')} />
        </div>
        <div className="flex items-center justify-between gap-2 pt-2">
          {deal ? (
            <ConfirmButton
              label="Delete engagement"
              onConfirm={() => {
                deleteMutation.mutate(deal.id)
                onClose()
              }}
            />
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {submitting ? 'Saving…' : 'Save engagement'}
            </Button>
          </div>
        </div>
      </form>
    </Dialog>
  )
}
