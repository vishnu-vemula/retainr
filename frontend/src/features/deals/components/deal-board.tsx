import { useMemo, useState } from 'react'
import { DragDropContext, Droppable, type DropResult } from '@hello-pangea/dnd'
import { Plus } from 'lucide-react'
import { DEAL_STAGES, type Deal, type DealStage, type ReorderUpdate } from '../../../shared/types'
import { titleCase, formatCurrency } from '../../../shared/lib/format'
import { stageDotClass } from '../../../shared/lib/stage-style'
import { cn } from '../../../shared/lib/utils'
import { Badge } from '../../../shared/components/ui/badge'
import { Button } from '../../../shared/components/ui/button'
import { Card } from '../../../shared/components/ui/card'
import { useDeals } from '../hooks/use-deals'
import { useReorderDeals } from '../hooks/use-deal-mutations'
import { DealCard } from './deal-card'
import { DealDialog } from './deal-dialog'

const OPEN_STAGES: DealStage[] = ['NEW', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION']

interface DealBoardProps {
  search?: string
}

export function DealBoard({ search }: DealBoardProps) {
  const { data, isLoading } = useDeals({ sort: 'position', search })
  const reorderMutation = useReorderDeals()
  const [editing, setEditing] = useState<Deal | null>(null)
  const [defaultStage, setDefaultStage] = useState<DealStage>('NEW')
  const [dialogOpen, setDialogOpen] = useState(false)

  const deals = useMemo(() => data?.items ?? [], [data])

  const columns = useMemo(
    () =>
      DEAL_STAGES.map((stage) => {
        const items = deals.filter((deal) => deal.stage === stage)
        const totalsByCurrency = new Map<string, number>()
        for (const deal of items) {
          totalsByCurrency.set(deal.currency, (totalsByCurrency.get(deal.currency) ?? 0) + deal.value)
        }
        return {
          stage,
          items,
          totals: Array.from(totalsByCurrency.entries()).map(([currency, value]) =>
            formatCurrency(value, currency),
          ),
        }
      }),
    [deals],
  )

  const handleDragEnd = (result: DropResult) => {
    const { destination } = result
    if (!destination) return
    const stage = destination.droppableId as DealStage
    const update: ReorderUpdate = {
      id: result.draggableId,
      stage,
      position: destination.index,
    }
    if (result.source.droppableId === destination.droppableId && result.source.index === destination.index) {
      return
    }
    reorderMutation.mutate([update])
  }

  const openCreate = (stage: DealStage) => {
    setEditing(null)
    setDefaultStage(stage)
    setDialogOpen(true)
  }

  const openEdit = (deal: Deal) => {
    setEditing(deal)
    setDialogOpen(true)
  }

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-hidden pb-4">
        {DEAL_STAGES.map((stage) => (
          <Card key={stage} className="h-80 w-[19rem] shrink-0 animate-pulse border-transparent bg-secondary/70 shadow-none" />
        ))}
      </div>
    )
  }

  return (
    <div>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-4 scrollbar-thin sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          {columns.map(({ stage, items, totals }) => (
            <Card
              key={stage}
              className="flex w-[19rem] shrink-0 flex-col border-border/50 bg-secondary/60 shadow-none"
            >
              <div className="flex items-start justify-between gap-2 px-4 pb-3 pt-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn('h-2.5 w-2.5 rounded-full', stageDotClass[stage])} />
                    <p className="font-display text-[15px] font-semibold tracking-tight text-foreground">
                      {titleCase(stage)}
                    </p>
                    <Badge variant="outline" className="px-2 tabular-nums">
                      {items.length}
                    </Badge>
                  </div>
                  <p className="mt-1 truncate text-xs font-medium text-muted-foreground">
                    {totals.length > 0 ? totals.join(' / ') : formatCurrency(0, 'USD')}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 shrink-0 border-border/70 shadow-none"
                  onClick={() => openCreate(stage)}
                  aria-label={`New deal in ${stage}`}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <Droppable droppableId={stage}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={cn(
                      'mx-2 mb-2 flex min-h-32 flex-1 flex-col gap-2.5 rounded-2xl p-1 transition-colors',
                      snapshot.isDraggingOver && 'bg-accent ring-2 ring-inset ring-primary/25',
                    )}
                  >
                    {items.map((deal, index) => (
                      <DealCard key={deal.id} deal={deal} index={index} onEdit={openEdit} />
                    ))}
                    {provided.placeholder}
                    {items.length === 0 && !snapshot.isDraggingOver ? (
                      <button
                        type="button"
                        className="flex w-full items-center justify-center gap-1.5 rounded-2xl border border-dashed border-border bg-card/40 px-3 py-6 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:bg-accent/60 hover:text-primary"
                        onClick={() => openCreate(stage)}
                      >
                        <Plus className="h-3.5 w-3.5" />
                        New deal
                      </button>
                    ) : null}
                  </div>
                )}
              </Droppable>
            </Card>
          ))}
        </div>
      </DragDropContext>
      <p className="mt-2 inline-flex items-center gap-2 rounded-full border border-border/70 bg-card px-3 py-1.5 text-xs text-muted-foreground shadow-sm">
        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
        <span className="font-semibold text-foreground">
          {columns
          .filter((column) => OPEN_STAGES.includes(column.stage))
          .flatMap((column) => column.totals)
          .join(' / ') || formatCurrency(0, 'USD')}
        </span>
        in open pipeline
      </p>
      {dialogOpen ? (
        <DealDialog deal={editing} defaultStage={defaultStage} onClose={() => setDialogOpen(false)} />
      ) : null}
    </div>
  )
}
