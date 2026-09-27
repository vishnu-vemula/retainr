import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  onAuthStateChanged,
  signOut as firebaseSignOut,
  type User as FirebaseUser,
} from 'firebase/auth'
import { getFirebaseAuth } from '../../shared/lib/firebase'
import { postSession } from './api/auth-api'
import { AuthContext, type AuthContextValue } from './auth-context'
import type { User } from '../../shared/types'
import { clearQueriesOnIdentityChange } from './model/auth-cache'

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null)
  const [profile, setProfile] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [configError, setConfigError] = useState<string | null>(null)

  useEffect(() => {
    let previousUid: string | null | undefined
    let authSequence = 0
    let auth
    try {
      auth = getFirebaseAuth()
    } catch (error) {
      // Firebase only initializes in the browser, so a config failure can only surface after mount;
      // resolving it during render would diverge from the server HTML and break hydration.
      /* eslint-disable react-hooks/set-state-in-effect */
      setConfigError(error instanceof Error ? error.message : 'Firebase failed to initialize')
      setLoading(false)
      /* eslint-enable react-hooks/set-state-in-effect */
      return
    }
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      const uid = user?.uid ?? null
      clearQueriesOnIdentityChange(queryClient, previousUid, uid)
      previousUid = uid
      const sequence = ++authSequence
      setLoading(true)
      setProfile(null)
      setFirebaseUser(user)
      if (user) {
        try {
          const synced = await postSession()
          if (sequence === authSequence) setProfile(synced)
        } catch {
          if (sequence === authSequence) setProfile(null)
        }
      }
      if (sequence === authSequence) setLoading(false)
    })
    return () => {
      authSequence += 1
      unsubscribe()
    }
  }, [queryClient])

  const value = useMemo<AuthContextValue>(
    () => ({
      firebaseUser,
      profile,
      role: profile?.role === 'ADMIN' && !firebaseUser?.emailVerified ? 'MEMBER' : profile?.role ?? null,
      loading,
      configError,
      signOut: async () => {
        await firebaseSignOut(getFirebaseAuth())
        queryClient.clear()
      },
    }),
    [firebaseUser, profile, loading, configError, queryClient],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
