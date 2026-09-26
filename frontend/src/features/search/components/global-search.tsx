import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, KanbanSquare, Loader2, Search, UsersRound } from 'lucide-react'
import { Input } from '../../../shared/components/ui/input'
import { cn } from '../../../shared/lib/utils'
import { useDebouncedValue } from '../../../shared/hooks/use-debounced-value'
import { formatCurrency } from '../../../shared/lib/format'
import { DEAL_STAGE_LABELS } from '../../../shared/types'
import { useSearch } from '../hooks/use-search'

interface GlobalSearchProps {
  className?: string
}

export function GlobalSearch({ className }: GlobalSearchProps) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const debouncedQuery = useDebouncedValue(query.trim(), 300)
  const { data, isFetching } = useSearch(open ? debouncedQuery : '')

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        const input = inputRef.current
        if (input && input.offsetParent !== null) {
          event.preventDefault()
          input.focus()
          input.select()
        }
        return
      }
      if (event.key === 'Escape') {
        setQuery('')
        setOpen(false)
        inputRef.current?.blur()
      }
    }
    const handleClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleClick)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleClick)
    }
  }, [])

  const hasResults =
    data !== undefined && data.contacts.length + data.companies.length + data.deals.length > 0

  const goTo = (path: string) => {
    setQuery('')
    setOpen(false)
    router.push(path)
  }

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="search"
          placeholder="Search anything…"
          aria-label="Search contacts, companies and deals"
          className="rounded-full border-transparent bg-secondary/80 pl-10 pr-16 shadow-none hover:border-border focus-visible:bg-card [&::-webkit-search-cancel-button]:hidden"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setOpen(event.target.value.trim().length > 0)
          }}
          onFocus={() => {
            if (query.trim().length > 0) setOpen(true)
          }}
        />
        <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 items-center gap-0.5 rounded-md border border-border bg-card px-1.5 py-0.5 font-sans text-[10px] font-medium text-muted-foreground sm:flex">
          Ctrl K
        </kbd>
      </div>
      {open && debouncedQuery.length >= 1 ? (
        <div className="absolute left-0 z-50 mt-2 max-h-[26rem] w-[22rem] max-w-[calc(100vw-2.5rem)] overflow-y-auto rounded-2xl border border-border/70 bg-popover p-1.5 shadow-lift animate-fade-in-up scrollbar-thin">
          {isFetching && !data ? (
            <div className="flex items-center gap-2 px-3 py-4 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Searching…
            </div>
          ) : !hasResults ? (
            <p className="px-3 py-4 text-sm text-muted-foreground">No results for “{debouncedQuery}”.</p>
          ) : (
            <div className="space-y-3">
              {data && data.contacts.length > 0 ? (
                <div>
                  <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Contacts</p>
                  <ul>
                    {data.contacts.map((contact) => (
                      <li key={contact.id}>
                        <button
                          type="button"
                          className="group flex w-full cursor-pointer items-center gap-3 rounded-xl px-2.5 py-2 text-left text-sm transition-colors hover:bg-accent focus-visible:bg-accent focus-visible:outline-none"
                          onClick={() => goTo(`/contacts/${contact.id}`)}
                        >
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                            <UsersRound className="h-4 w-4" />
                          </span>
                          <span className="min-w-0 flex-1 truncate font-medium text-foreground">
                            {contact.name}
                          </span>
                          <span className="shrink-0 truncate text-xs text-muted-foreground/70">{contact.email ?? ''}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {data && data.companies.length > 0 ? (
                <div>
                  <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Companies</p>
                  <ul>
                    {data.companies.map((company) => (
                      <li key={company.id}>
                        <button
                          type="button"
                          className="group flex w-full cursor-pointer items-center gap-3 rounded-xl px-2.5 py-2 text-left text-sm transition-colors hover:bg-accent focus-visible:bg-accent focus-visible:outline-none"
                          onClick={() => goTo(`/companies/${company.id}`)}
                        >
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                            <Building2 className="h-4 w-4" />
                          </span>
                          <span className="min-w-0 flex-1 truncate font-medium text-foreground">
                            {company.name}
                          </span>
                          <span className="shrink-0 truncate text-xs text-muted-foreground/70">{company.domain ?? ''}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {data && data.deals.length > 0 ? (
                <div>
                  <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Deals</p>
                  <ul>
                    {data.deals.map((deal) => (
                      <li key={deal.id}>
                        <button
                          type="button"
                          className="group flex w-full cursor-pointer items-center gap-3 rounded-xl px-2.5 py-2 text-left text-sm transition-colors hover:bg-accent focus-visible:bg-accent focus-visible:outline-none"
                          onClick={() => goTo(`/deals/${deal.id}`)}
                        >
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                            <KanbanSquare className="h-4 w-4" />
                          </span>
                          <span className="min-w-0 flex-1 truncate font-medium text-foreground">
                            {deal.title}
                          </span>
                          <span className="shrink-0 text-xs text-muted-foreground/70">
                            {DEAL_STAGE_LABELS[deal.stage]} · {formatCurrency(deal.value, deal.currency)}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}
