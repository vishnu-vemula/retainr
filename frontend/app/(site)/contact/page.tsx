import type { Metadata } from 'next'
import { ContactPage } from '@/src/features/marketing/components/contact-page'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Book a demo, ask about plans or get support from the Retainr team.',
}

export default function ContactRoute() {
  return <ContactPage />
}
