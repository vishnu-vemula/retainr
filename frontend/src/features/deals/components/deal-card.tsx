import { Draggable } from '@hello-pangea/dnd'
import { Building2, CalendarClock, User } from 'lucide-react'
import clsx from 'clsx'
import type { Deal } from '../../../shared/types'
import { formatCurrency, formatDate } from '../../../shared/lib/format'
import { Badge } from '../../../shared/components/ui/badge'
import { Card } from '../../../shared/components/ui/card'

interface DealCardProps {
  deal: Deal
  index: number
  onEdit: (deal: Deal) => void
}

export function DealCard({ deal, index, onEdit }: DealCardProps) {
  const overdue =
    deal.expectedCloseDate !== null &&
    deal.stage !== 'WON' &&
    deal.stage !== 'LOST' &&
    new Date(deal.expectedCloseDate) < new Date()

  return (
    <Draggable draggableId={deal.id} index={index}>
      {(provided, snapshot) => (
        <Card
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={clsx(
            'group cursor-grab rounded-2xl border-border/60 p-4 transition-shadow duration-200 hover:border-primary/25 hover:shadow-lift active:cursor-grabbing',
            snapshot.isDragging && 'rotate-[1.5deg] shadow-lift ring-2 ring-primary',
          )}
          onClick={() => onEdit(deal)}
        >
          <p className="text-sm font-semibold leading-snug text-foreground group-hover:text-primary">{deal.title}</p>
          <p className="mt-1.5 font-display text-xl font-semibold tracking-tight text-foreground">
            {formatCurrency(deal.value, deal.currency)}
          </p>
          <div className="mt-3">
            <div className="mb-1 flex items-center justify-between text-[11px] font-medium text-muted-foreground">
              <span>Win probability</span>
              <span className="tabular-nums text-foreground">{deal.probability}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600"
                style={{ width: `${Math.min(100, Math.max(0, deal.probability))}%` }}
              />
            </div>
          </div>
          {deal.contact || deal.company || deal.expectedCloseDate ? (
            <div className="mt-3 space-y-1.5 border-t border-border/60 pt-3 text-xs text-muted-foreground">
              {deal.contact ? (
                <p className="flex items-center gap-1.5 truncate">
                  <User className="h-3.5 w-3.5 shrink-0" />
                  {deal.contact.name}
                </p>
              ) : null}
              {deal.company ? (
                <p className="flex items-center gap-1.5 truncate">
                  <Building2 className="h-3.5 w-3.5 shrink-0" />
                  {deal.company.name}
                </p>
              ) : null}
              {deal.expectedCloseDate ? (
                <Badge variant={overdue ? 'danger' : 'muted'} className="mt-1">
                  <CalendarClock className="h-3 w-3" />
                  {overdue ? 'Overdue · ' : ''}
                  {formatDate(deal.expectedCloseDate)}
                </Badge>
              ) : null}
            </div>
          ) : null}
        </Card>
      )}
    </Draggable>
  )
}
