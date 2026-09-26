import { BrandMark } from './brand-logo'

export function FullPageSpinner() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-background" role="status">
      <div className="relative flex h-16 w-16 items-center justify-center">
        <span className="absolute inset-0 animate-spin rounded-full border-[3px] border-primary/15 border-t-primary" />
        <BrandMark className="h-9 w-9" />
      </div>
      <p className="text-sm font-medium text-muted-foreground">Loading your workspace…</p>
    </div>
  )
}
