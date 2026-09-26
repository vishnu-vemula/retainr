import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '../use-auth'
import { LoginForm } from './login-form'
import { GoogleButton } from './google-button'
import { FirebaseSetupNotice } from './firebase-setup-notice'
import { AuthDivider, AuthLayout } from './auth-layout'

export function LoginPage() {
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
      eyebrow="Sign in"
      title="Welcome back"
      description="Sign in to pick up where your pipeline left off."
      footer={
        <>
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="font-semibold text-primary underline-offset-4 hover:underline">
            Create one
          </Link>
        </>
      }
    >
      <GoogleButton />
      <AuthDivider />
      <LoginForm />
    </AuthLayout>
  )
}
