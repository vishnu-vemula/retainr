import { useActivities } from '../../activities/hooks/use-activities'
import { ActivityTimeline } from '../../activities/components/activity-timeline'
import { Card } from '../../../shared/components/ui/card'
import { Skeleton } from '../../../shared/components/ui/skeleton'
import { cn } from '../../../shared/lib/utils'
import { SectionTitle } from './dashboard-widgets'

export function RecentActivityCard({ className }: { className?: string }) {
  const { data, isLoading } = useActivities({ pageSize: 5 })

  return (
    <Card className={cn('p-6', className)}>
      <SectionTitle title="Recent activity" sub="Latest calls, emails and notes" href="/activities" />
      <div className="mt-6">
        {isLoading ? (
          <div className="space-y-4">
            {[0, 1, 2].map((index) => (
              <Skeleton key={index} className="h-10 w-full" />
            ))}
          </div>
        ) : (
          <ActivityTimeline activities={data?.items ?? []} />
        )}
      </div>
    </Card>
  )
}
