import { Badge } from './ui/badge'
import { DEAL_STAGE_LABELS, type ContactStatus, type DealStage, type TaskPriority, type TaskStatus } from '../types'
import { titleCase } from '../lib/format'

export type BadgeVariant = ContactStatus | DealStage | TaskStatus | TaskPriority | string

type BadgeStyle =
  | 'default'
  | 'brand'
  | 'secondary'
  | 'destructive'
  | 'outline'
  | 'success'
  | 'info'
  | 'warning'
  | 'danger'
  | 'violet'
  | 'muted'

const variantStyles: Record<string, BadgeStyle> = {
  LEAD: 'muted',
  QUALIFIED: 'info',
  CUSTOMER: 'success',
  CHURNED: 'danger',
  NEW: 'muted',
  PROPOSAL: 'brand',
  NEGOTIATION: 'warning',
  WON: 'success',
  LOST: 'danger',
  TODO: 'muted',
  IN_PROGRESS: 'info',
  DONE: 'success',
  LOW: 'muted',
  MEDIUM: 'info',
  HIGH: 'warning',
  URGENT: 'danger',
}

interface StatusBadgeProps {
  variant: BadgeVariant
}

export function StatusBadge({ variant }: StatusBadgeProps) {
  return (
    <Badge variant={variant ? variantStyles[variant] ?? 'muted' : 'muted'}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" aria-hidden="true" />
      {variant ? DEAL_STAGE_LABELS[variant as DealStage] ?? titleCase(variant) : '—'}
    </Badge>
  )
}
