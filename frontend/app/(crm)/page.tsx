'use client'

import { DashboardPage } from '@/src/features/dashboard/components/dashboard-page'
import { LandingPage } from '@/src/features/landing/components/landing-page'
import { useAuth } from '@/src/features/auth/use-auth'

export default function DashboardRoute() {
  const { configError } = useAuth()

  if (configError) return <LandingPage />

  return <DashboardPage />
}
