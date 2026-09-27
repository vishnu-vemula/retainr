import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ArrowUpRight, ChevronsUpDown, Globe, LogOut, ShieldCheck, Sparkles, X } from 'lucide-react'
import { useAuth } from '../../features/auth/use-auth'
import { GlobalSearch } from '../../features/search/components/global-search'
import { UnreadCount } from '../../features/notifications/components/unread-count'
import {
  isNavActive,
  notificationsNav,
  settingsNav,
  visibleFor,
  workspaceNav,
  type NavItem,
} from '../lib/navigation'
import { cn } from '../lib/utils'
import { BrandLogo } from './brand-logo'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'

function initials(name: string | null, email: string): string {
  const source = name?.trim() || email
  return source
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
}

function SidebarLink({ item, active, badge = false }: { item: NavItem; active: boolean; badge?: boolean }) {
  const Icon = item.icon
  return (
    <Link
      href={item.to}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'group flex items-center gap-3 rounded-2xl px-2.5 py-2 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        active
          ? 'bg-primary text-primary-foreground shadow-glow'
          : 'text-foreground/75 hover:bg-secondary hover:text-foreground',
      )}
    >
      <span
        className={cn(
          'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors',
          active ? 'bg-white/20 text-white' : 'bg-secondary/80 text-muted-foreground group-hover:bg-card group-hover:text-primary',
        )}
      >
        <Icon className="h-4 w-4" />
      </span>
      {item.label}
      {badge ? (
        <UnreadCount className={active ? 'bg-white text-primary' : 'bg-primary text-primary-foreground'} />
      ) : null}
    </Link>
  )
}

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="px-3 pb-1.5 pt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/80">
      {children}
    </p>
  )
}

interface AppSidebarProps {
  open: boolean
  onClose: () => void
}

export function AppSidebar({ open, onClose }: AppSidebarProps) {
  const { profile, firebaseUser, role, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const isAdmin = role === 'ADMIN'
  const displayName = profile?.displayName ?? firebaseUser?.displayName ?? 'Account'
  const email = firebaseUser?.email ?? ''

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  return (
    <aside
      id="app-sidebar"
      aria-label="Sidebar"
      className={cn(
        'fixed inset-y-3 left-3 z-50 flex w-[280px] flex-col rounded-[28px] border border-border/70 bg-card shadow-lift transition-transform duration-300 lg:translate-x-0',
        open ? 'translate-x-0' : '-translate-x-[calc(100%+1.5rem)]',
      )}
    >
      <div className="flex items-center justify-between px-5 pb-4 pt-5">
        <Link
          href="/dashboard"
          aria-label="Retainr dashboard"
          className="rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <BrandLogo />
        </Link>
        <Button type="button" variant="ghost" size="icon" className="h-9 w-9 lg:hidden" aria-label="Close menu" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="px-4">
        <GlobalSearch />
      </div>

      <nav aria-label="Primary" className="mt-1 flex-1 overflow-y-auto px-3 pb-3 scrollbar-thin">
        <SectionLabel>Workspace</SectionLabel>
        <div className="space-y-0.5">
          {workspaceNav.map((item) => (
            <SidebarLink key={item.to} item={item} active={isNavActive(pathname, item.to)} />
          ))}
          <SidebarLink item={notificationsNav} active={isNavActive(pathname, notificationsNav.to)} badge />
        </div>
        <SectionLabel>Settings</SectionLabel>
        <div className="space-y-0.5">
          {visibleFor(settingsNav, isAdmin).map((item) => (
            <SidebarLink key={item.to} item={item} active={isNavActive(pathname, item.to)} />
          ))}
        </div>

        <div className="bg-hero relative isolate mt-6 overflow-hidden rounded-3xl p-4 text-white">
          <div aria-hidden="true" className="absolute -right-10 -top-10 -z-10 h-28 w-28 rounded-full border border-white/20" />
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-primary">
            <Sparkles className="h-4 w-4" />
          </span>
          <p className="mt-3 text-sm font-semibold">Early access</p>
          <p className="mt-1 text-xs leading-relaxed text-white/80">Every feature is free while Retainr is in early access.</p>
          <Link
            href="/pricing"
            className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-white underline-offset-4 hover:underline"
          >
            See what&apos;s coming
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      </nav>

      <div className="border-t border-border/60 p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-2xl p-2 text-left transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[state=open]:bg-secondary"
            >
              <Avatar className="h-10 w-10">
                {firebaseUser?.photoURL ? <AvatarImage src={firebaseUser.photoURL} alt="" /> : null}
                <AvatarFallback className="text-xs">{initials(profile?.displayName ?? null, email)}</AvatarFallback>
              </Avatar>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-foreground">{displayName}</span>
                <span className="block truncate text-xs text-muted-foreground">{email}</span>
              </span>
              <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" sideOffset={8} className="w-[256px]">
            <DropdownMenuLabel className="font-normal">
              <p className="truncate text-sm font-semibold text-foreground">{displayName}</p>
              <p className="truncate text-xs text-muted-foreground">{email}</p>
              {profile ? (
                <Badge variant={isAdmin ? 'brand' : 'muted'} className="mt-2">
                  {isAdmin ? <ShieldCheck className="h-3 w-3" /> : null}
                  {isAdmin ? 'Administrator' : 'Member'}
                </Badge>
              ) : null}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {[settingsNav[0], notificationsNav].map((item) =>
              item ? (
                <DropdownMenuItem key={item.to} asChild>
                  <Link href={item.to}>
                    <item.icon className="h-4 w-4 text-muted-foreground" />
                    {item.label}
                  </Link>
                </DropdownMenuItem>
              ) : null,
            )}
            <DropdownMenuItem asChild>
              <Link href="/">
                <Globe className="h-4 w-4 text-muted-foreground" />
                Visit website
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => void handleSignOut()}
              className="text-destructive focus:bg-destructive/10 focus:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  )
}
