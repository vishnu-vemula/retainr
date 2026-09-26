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
    if (!loading && firebaseUser) router.replace('/dashboard')
  }, [firebaseUser, loading, router])

  if (configError) {
    return (
      <AuthLayout
        eyebrow="Get started"
        title="Sign-in isn't set up yet"
        description="This deployment is missing its Firebase configuration, so accounts can't be created or used yet."
        footer={
          <Link href="/" className="font-semibold text-primary underline-offset-4 hover:underline">
            ← Back to the website
          </Link>
        }
      >
        <FirebaseSetupNotice error={configError} />
      </AuthLayout>
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
