import type { DealStage } from '../types'

export const stageDotClass: Record<DealStage, string> = {
  NEW: 'bg-stone-400',
  QUALIFIED: 'bg-sky-500',
  PROPOSAL: 'bg-brand-400',
  NEGOTIATION: 'bg-amber-500',
  WON: 'bg-emerald-500',
  LOST: 'bg-rose-500',
}
