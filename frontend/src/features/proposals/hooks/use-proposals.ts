import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { createProposal, getPublicProposal, listProposals, respondToProposal } from '../api/proposals-api'

export function useProposals(dealId: string) {
  return useQuery({ queryKey: ['proposals', dealId], queryFn: () => listProposals(dealId), enabled: Boolean(dealId) })
}

export function useCreateProposal(dealId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => createProposal(dealId),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ['proposals', dealId] }); toast.success('Proposal link created') },
    onError: (error: Error) => toast.error(error.message),
  })
}

export function usePublicProposal(token: string) {
  return useQuery({ queryKey: ['public-proposal', token], queryFn: () => getPublicProposal(token), enabled: Boolean(token), retry: false })
}

export function useRespondToProposal(token: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: { decision: 'DECLINED' } | { decision: 'ACCEPTED'; selectedPackageId: string | null; selectedAddonIds: string[] }) => respondToProposal(token, input),
    onSuccess: (proposal) => { queryClient.setQueryData(['public-proposal', token], proposal) },
  })
}
