'use client'

import { useEffect, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/src/features/auth/use-auth'
import { FirebaseSetupNotice } from '@/src/features/auth/components/firebase-setup-notice'
import { AppShell } from '@/src/shared/components/app-shell'
import { FullPageSpinner } from '@/src/shared/components/full-page-spinner'

export default function CrmLayout({ children }: { children: ReactNode }) {
  const { firebaseUser, loading, configError } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !firebaseUser && !configError) router.replace('/login')
  }, [configError, firebaseUser, loading, router])

  if (configError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <FirebaseSetupNotice error={configError} />
      </div>
    )
  }

  if (loading || !firebaseUser) return <FullPageSpinner />

  return <AppShell>{children}</AppShell>
}
