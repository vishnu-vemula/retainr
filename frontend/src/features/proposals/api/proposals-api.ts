import { apiFetch, ApiError } from '../../../shared/lib/api-client'
import type { Proposal, PublicProposal } from '../../../shared/types'

export async function listProposals(dealId: string): Promise<Proposal[]> {
  const result = await apiFetch<Proposal[]>(`/proposals?dealId=${encodeURIComponent(dealId)}`)
  if (result === null) throw new Error('Unexpected empty response from /proposals')
  return result
}

export async function createProposal(dealId: string, expiresInDays = 14): Promise<{ proposal: Proposal; shareToken: string }> {
  const result = await apiFetch<{ proposal: Proposal; shareToken: string }>('/proposals', {
    method: 'POST', body: JSON.stringify({ dealId, expiresInDays }),
  })
  if (result === null) throw new Error('Unexpected empty response from POST /proposals')
  return result
}

async function publicFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers)
  headers.set('Accept', 'application/json')
  if (init?.body) headers.set('Content-Type', 'application/json')
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}${path}`, { ...init, headers, cache: 'no-store' })
  const body = await response.json() as { data?: T; error?: { code: string; message: string } }
  if (!response.ok) throw new ApiError(response.status, body.error?.code ?? 'UNKNOWN', body.error?.message ?? 'Request failed')
  if (body.data === undefined) throw new Error('Unexpected empty proposal response')
  return body.data
}

export function getPublicProposal(token: string): Promise<PublicProposal> {
  return publicFetch<PublicProposal>(`/proposals/public/${encodeURIComponent(token)}`)
}

export function respondToProposal(token: string, input: { decision: 'DECLINED' } | { decision: 'ACCEPTED'; selectedPackageId: string | null; selectedAddonIds: string[] }): Promise<PublicProposal> {
  return publicFetch<PublicProposal>(`/proposals/public/${encodeURIComponent(token)}/respond`, {
    method: 'POST', body: JSON.stringify(input),
  })
}
