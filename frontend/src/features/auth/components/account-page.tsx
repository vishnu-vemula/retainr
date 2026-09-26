import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { sendPasswordResetEmail } from 'firebase/auth'
import { FirebaseError } from 'firebase/app'
import { toast } from 'react-toastify'
import { ArrowUpRight, Copy, KeyRound, LogOut, ShieldCheck } from 'lucide-react'
import { useAuth } from '../use-auth'
import { PageHeader } from '../../../shared/components/page-header'
import { Avatar, AvatarFallback, AvatarImage } from '../../../shared/components/ui/avatar'
import { Badge } from '../../../shared/components/ui/badge'
import { Button } from '../../../shared/components/ui/button'
import { Card } from '../../../shared/components/ui/card'
import { getFirebaseAuth } from '../../../shared/lib/firebase'
import { notificationsNav, settingsNav, visibleFor } from '../../../shared/lib/navigation'

const providerLabels: Record<string, string> = {
  password: 'Email & password',
  'google.com': 'Google',
}

function initials(name: string | null, email: string): string {
  const source = name?.trim() || email
  return source
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
}

function formatTimestamp(value: string | undefined | null): string {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

export function AccountPage() {
  const { firebaseUser, profile, signOut } = useAuth()
  const router = useRouter()
  const [sendingReset, setSendingReset] = useState(false)

  const email = firebaseUser?.email ?? profile?.email ?? ''
  const displayName = profile?.displayName ?? firebaseUser?.displayName ?? 'Your account'
  const isAdmin = profile?.role === 'ADMIN'
  const providerId = firebaseUser?.providerData[0]?.providerId ?? 'password'
  const usesPassword = firebaseUser?.providerData.some((provider) => provider.providerId === 'password') ?? false
  const uid = firebaseUser?.uid ?? profile?.id ?? ''

  const copyUid = async () => {
    try {
      await navigator.clipboard.writeText(uid)
      toast.success('User ID copied')
    } catch {
      toast.error('Could not copy to the clipboard')
    }
  }

  const sendReset = async () => {
    if (!email) return
    setSendingReset(true)
    try {
      await sendPasswordResetEmail(getFirebaseAuth(), email)
      toast.success(`Password reset email sent to ${email}`)
    } catch (error) {
      toast.error(error instanceof FirebaseError ? error.message : 'Could not send the reset email')
    } finally {
      setSendingReset(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  const details = [
    { label: 'Display name', value: displayName },
    { label: 'Email', value: email || '—' },
    { label: 'Role', value: isAdmin ? 'Administrator' : 'Member' },
    { label: 'Sign-in method', value: providerLabels[providerId] ?? providerId },
    { label: 'Member since', value: formatTimestamp(profile?.createdAt ?? firebaseUser?.metadata.creationTime) },
    { label: 'Last sign-in', value: formatTimestamp(firebaseUser?.metadata.lastSignInTime) },
  ]

  return (
    <div>
      <PageHeader eyebrow="Settings" title="Account" description="Your profile, role and session in one place." />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="overflow-hidden lg:col-span-2">
          <div className="bg-hero relative h-32">
            <p
              aria-hidden="true"
              className="text-outline-white pointer-events-none absolute -bottom-6 right-4 select-none font-display text-8xl font-semibold leading-none tracking-[-0.06em]"
            >
              retainr
            </p>
          </div>
          <div className="px-6 pb-6 sm:px-8">
            <div className="-mt-12 flex flex-wrap items-end justify-between gap-4">
              <Avatar className="h-24 w-24 ring-4 ring-card">
                {firebaseUser?.photoURL ? <AvatarImage src={firebaseUser.photoURL} alt="" /> : null}
                <AvatarFallback className="text-2xl">{initials(profile?.displayName ?? null, email)}</AvatarFallback>
              </Avatar>
              <Badge variant={isAdmin ? 'brand' : 'muted'} className="mb-2">
                {isAdmin ? <ShieldCheck className="h-3 w-3" /> : null}
                {isAdmin ? 'Administrator' : 'Member'}
              </Badge>
            </div>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-foreground">{displayName}</h2>
            <p className="text-sm text-muted-foreground">{email}</p>

            <dl className="mt-8 grid gap-x-8 gap-y-5 sm:grid-cols-2">
              {details.map((item) => (
                <div key={item.label} className="min-w-0 rounded-2xl border border-border/60 p-4">
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{item.label}</dt>
                  <dd className="mt-1.5 truncate text-sm font-medium text-foreground">{item.value}</dd>
                </div>
              ))}
              <div className="min-w-0 rounded-2xl border border-border/60 p-4 sm:col-span-2">
                <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">User ID</dt>
                <dd className="mt-1.5 flex items-center gap-3">
                  <code className="min-w-0 flex-1 truncate font-mono text-xs text-foreground">{uid || '—'}</code>
                  <Button type="button" variant="outline" size="sm" className="shadow-none" disabled={!uid} onClick={() => void copyUid()}>
                    <Copy className="h-3.5 w-3.5" />
                    Copy
                  </Button>
                </dd>
              </div>
            </dl>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">Security</h2>
            <p className="mt-1 text-sm text-muted-foreground">Manage how you sign in to Retainr.</p>
            <div className="mt-5 space-y-3">
              {usesPassword ? (
                <Button type="button" variant="outline" className="w-full justify-start shadow-none" disabled={sendingReset} onClick={() => void sendReset()}>
                  <KeyRound className="h-4 w-4" />
                  {sendingReset ? 'Sending…' : 'Send password reset email'}
                </Button>
              ) : null}
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start text-destructive shadow-none hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                onClick={() => void handleSignOut()}
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </Button>
            </div>
            <p className="mt-5 rounded-2xl bg-secondary/70 p-4 text-xs leading-relaxed text-muted-foreground">
              Role changes made by an administrator take effect after your next sign-in. Sign out and back in to apply
              them right away.
            </p>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">Keyboard shortcuts</h2>
            <ul className="mt-4 space-y-3 text-sm">
              {[
                ['Search everything', ['Ctrl', 'K']],
                ['Close search', ['Esc']],
              ].map(([label, keys]) => (
                <li key={label as string} className="flex items-center justify-between gap-3 text-foreground">
                  {label as string}
                  <span className="flex gap-1">
                    {(keys as string[]).map((key) => (
                      <kbd
                        key={key}
                        className="inline-flex h-6 min-w-6 items-center justify-center rounded-md border border-border bg-background px-1.5 font-sans text-[11px] font-medium shadow-[inset_0_-1px_0_hsl(var(--border))]"
                      >
                        {key}
                      </kbd>
                    ))}
                  </span>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">Workspace settings</h2>
            <ul className="mt-3 divide-y divide-border/60">
              {[notificationsNav, ...visibleFor(settingsNav, isAdmin).filter((item) => item.to !== '/settings/account')].map(
                ({ to, label, icon: Icon }) => (
                  <li key={to}>
                    <Link href={to} className="group flex items-center gap-3 py-3 text-sm font-medium text-foreground">
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-secondary text-muted-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="flex-1 group-hover:text-primary">{label}</span>
                      <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                    </Link>
                  </li>
                ),
              )}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  )
}
