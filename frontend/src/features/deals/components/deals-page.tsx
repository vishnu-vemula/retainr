import { useState } from 'react'
import { Search } from 'lucide-react'
import { PageHeader } from '../../../shared/components/page-header'
import { Input } from '../../../shared/components/ui/input'
import { useDebouncedValue } from '../../../shared/hooks/use-debounced-value'
import { DealBoard } from './deal-board'

export function DealsPage() {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search)

  return (
    <div>
      <PageHeader eyebrow="Pipeline" title="Engagements" description="Move scopes from lead to client review and renewal." />
      <div className="mb-4">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search engagements…"
            className="pl-9"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </div>
      <DealBoard search={debouncedSearch || undefined} />
    </div>
  )
}
