import type { ReactNode } from 'react'

interface DescriptionItem {
  label: string
  value: ReactNode
}

interface DescriptionListProps {
  items: DescriptionItem[]
}

export function DescriptionList({ items }: DescriptionListProps) {
  return (
    <dl className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.label} className="min-w-0">
          <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{item.label}</dt>
          <dd className="mt-1.5 text-sm font-medium text-foreground">{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}
