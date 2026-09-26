import { cn } from '../../../shared/lib/utils'
import { useNotifications } from '../hooks/use-notifications'

export function UnreadCount({ className }: { className?: string }) {
  const { data } = useNotifications()
  const unread = data?.unread ?? 0
  if (unread === 0) return null

  return (
    <span
      className={cn(
        'ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-semibold tabular-nums',
        className,
      )}
      aria-label={`${unread} unread`}
    >
      {unread > 99 ? '99+' : unread}
    </span>
  )
}
