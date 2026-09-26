import Link from 'next/link'
import { ArrowUp } from 'lucide-react'
import { useAuth } from '../../features/auth/use-auth'
import { notificationsNav, settingsNav, visibleFor, workspaceNav, type NavItem } from '../lib/navigation'
import { BrandLogo } from './brand-logo'

function FooterColumn({ title, items }: { title: string; items: NavItem[] }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{title}</p>
      <ul className="mt-4 space-y-2.5">
        {items.map(({ to, label }) => (
          <li key={to}>
            <Link
              href={to}
              className="group inline-flex items-center gap-2 text-sm text-foreground/80 transition-colors hover:text-primary"
            >
              <span className="h-1 w-1 rounded-full bg-border transition-colors group-hover:bg-primary" />
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Kbd({ children }: { children: string }) {
  return (
    <kbd className="inline-flex h-6 min-w-6 items-center justify-center rounded-md border border-border bg-background px-1.5 font-sans text-[11px] font-medium text-foreground shadow-[inset_0_-1px_0_hsl(var(--border))]">
      {children}
    </kbd>
  )
}

export function AppFooter() {
  const { profile, firebaseUser } = useAuth()
  const isAdmin = profile?.role === 'ADMIN'
  const year = new Date().getFullYear()

  return (
    <footer className="px-3 pb-3 sm:px-4 sm:pb-4">
      <div className="relative mx-auto max-w-[1400px] overflow-hidden rounded-[28px] border border-border/60 bg-card shadow-soft">
        <div className="relative grid gap-10 px-6 pb-8 pt-10 sm:grid-cols-2 sm:px-10 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr]">
          <div className="max-w-sm">
            <BrandLogo />
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Contacts, companies, deals and follow-ups in one focused workspace — built to keep every
              pipeline moving.
            </p>
            {firebaseUser?.email ? (
              <p className="mt-5 inline-flex max-w-full items-center gap-2 rounded-full border border-border/70 bg-background px-3 py-1.5 text-xs text-muted-foreground">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <span className="truncate">
                  Signed in as <span className="font-medium text-foreground">{firebaseUser.email}</span>
                </span>
              </p>
            ) : null}
          </div>
          <FooterColumn title="Workspace" items={workspaceNav} />
          <FooterColumn title="Manage" items={[notificationsNav, ...visibleFor(settingsNav, isAdmin)]} />
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Shortcuts</p>
            <ul className="mt-4 space-y-3 text-sm text-foreground/80">
              <li className="flex items-center justify-between gap-3">
                Search everything
                <span className="flex gap-1">
                  <Kbd>⌘</Kbd>
                  <Kbd>K</Kbd>
                </span>
              </li>
              <li className="flex items-center justify-between gap-3">
                Close search
                <Kbd>Esc</Kbd>
              </li>
              <li className="flex items-center justify-between gap-3">
                Move a deal
                <span className="text-xs text-muted-foreground">Drag &amp; drop</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="relative flex flex-col-reverse gap-4 border-t border-border/60 px-6 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-10">
          <p>© {year} Ultra Tasker. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline">Built with Next.js · Firebase · Prisma</span>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="group inline-flex items-center gap-2 rounded-full border border-border/70 bg-background py-1 pl-3 pr-1 font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary"
            >
              Back to top
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ink text-white transition-colors group-hover:bg-primary">
                <ArrowUp className="h-3.5 w-3.5" />
              </span>
            </button>
          </div>
        </div>

        <p
          aria-hidden="true"
          className="pointer-events-none -mb-[0.2em] -mt-4 select-none sm:-mt-10 whitespace-nowrap bg-gradient-to-b from-brand-500/[0.14] to-brand-500/0 bg-clip-text px-4 text-center font-display text-[clamp(4.5rem,17vw,15rem)] font-semibold leading-none tracking-[-0.06em] text-transparent"
        >
          ultratasker
        </p>
      </div>
    </footer>
  )
}
