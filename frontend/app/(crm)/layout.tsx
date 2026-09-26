'use client'

import { useEffect, type ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/src/features/auth/use-auth'
import { FirebaseSetupNotice } from '@/src/features/auth/components/firebase-setup-notice'
import { AppShell } from '@/src/shared/components/app-shell'
import { FullPageSpinner } from '@/src/shared/components/full-page-spinner'

export default function CrmLayout({ children }: { children: ReactNode }) {
  const { firebaseUser, loading, configError } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading && !firebaseUser && pathname !== '/') router.replace('/login')
  }, [firebaseUser, loading, pathname, router])

  if (configError && pathname !== '/') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <FirebaseSetupNotice error={configError} />
      </div>
    )
  }

  if (pathname === '/' && !firebaseUser) return children

  if (loading || !firebaseUser) return <FullPageSpinner />

  return <AppShell>{children}</AppShell>
}
