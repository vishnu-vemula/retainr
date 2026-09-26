import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/src/shared/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground ring-transparent',
        secondary: 'bg-secondary text-secondary-foreground ring-transparent',
        destructive: 'bg-destructive text-destructive-foreground ring-transparent',
        outline: 'bg-card text-foreground ring-border',
        brand: 'bg-brand-50 text-brand-700 ring-brand-600/20',
        success: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
        info: 'bg-sky-50 text-sky-700 ring-sky-600/20',
        warning: 'bg-amber-50 text-amber-700 ring-amber-600/25',
        danger: 'bg-rose-50 text-rose-700 ring-rose-600/20',
        violet: 'bg-violet-50 text-violet-700 ring-violet-600/20',
        muted: 'bg-stone-100 text-stone-600 ring-stone-500/15',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
