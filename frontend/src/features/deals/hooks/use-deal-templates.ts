import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { applyDealTemplate, getDealTemplates, type DealTemplateId } from '../api/deals-api'

export function useDealTemplates() {
  return useQuery({ queryKey: ['deal-templates'], queryFn: getDealTemplates })
}

export function useApplyDealTemplate(dealId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (templateId: DealTemplateId) => applyDealTemplate(dealId, templateId),
    onSuccess: () => {
      toast.success('Template items added')
      void queryClient.invalidateQueries({ queryKey: ['deal', dealId] })
      void queryClient.invalidateQueries({ queryKey: ['deals'] })
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
    onError: (error: Error) => toast.error(error.message),
  })
}
