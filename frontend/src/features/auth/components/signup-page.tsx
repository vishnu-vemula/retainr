import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '../use-auth'
import { SignupForm } from './signup-form'
import { GoogleButton } from './google-button'
import { FirebaseSetupNotice } from './firebase-setup-notice'
import { AuthDivider, AuthLayout } from './auth-layout'

export function SignupPage() {
  const { firebaseUser, loading, configError } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && firebaseUser) router.replace('/')
  }, [firebaseUser, loading, router])

  if (configError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <FirebaseSetupNotice error={configError} />
      </div>
    )
  }

  return (
    <AuthLayout
      eyebrow="Get started"
      title="Create your account"
      description="Set up your workspace in under a minute."
      footer={
        <>
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-primary underline-offset-4 hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <GoogleButton />
      <AuthDivider />
      <SignupForm />
    </AuthLayout>
  )
}
