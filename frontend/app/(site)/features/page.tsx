import type { Metadata } from 'next'
import { FeaturesPage } from '@/src/features/marketing/components/features-page'

export const metadata: Metadata = {
  title: 'Features',
  description: 'Contacts, companies, a drag-and-drop pipeline, quotes, tasks, timelines, notifications and an audit trail in one CRM.',
}

export default function FeaturesRoute() {
  return <FeaturesPage />
}
