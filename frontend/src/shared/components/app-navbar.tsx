import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ChevronDown, LogOut, Menu, Settings2, ShieldCheck, X } from 'lucide-react'
import { useAuth } from '../../features/auth/use-auth'
import { GlobalSearch } from '../../features/search/components/global-search'
import { NotificationsBell } from '../../features/notifications/components/notifications-bell'
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

function NavPill({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon
  return (
    <Link
      href={item.to}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring 2xl:px-4',
        active
          ? 'bg-card text-foreground shadow-soft'
          : 'text-muted-foreground hover:bg-card/70 hover:text-foreground',
      )}
    >
      <Icon className={cn('h-4 w-4', active ? 'text-primary' : 'text-current')} />
      {item.label}
    </Link>
  )
}

function MobileNavLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon
  return (
    <Link
      href={item.to}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex items-center gap-3 rounded-2xl border px-3 py-3 text-sm font-medium transition-colors',
        active
          ? 'border-primary/30 bg-accent text-accent-foreground'
          : 'border-border/60 bg-card text-foreground hover:border-primary/30 hover:bg-accent/60',
      )}
    >
      <span
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded-xl',
          active ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground',
        )}
      >
        <Icon className="h-4 w-4" />
      </span>
      {item.label}
    </Link>
  )
}

export function AppNavbar() {
  const { profile, firebaseUser, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuPathname, setMenuPathname] = useState(pathname)
  const [scrolled, setScrolled] = useState(false)

  if (menuPathname !== pathname) {
    setMenuPathname(pathname)
    setMenuOpen(false)
  }

  const isAdmin = profile?.role === 'ADMIN'
  const settingsItems = visibleFor(settingsNav, isAdmin)
  const settingsActive = settingsItems.some((item) => isNavActive(pathname, item.to))
  const displayName = profile?.displayName ?? firebaseUser?.displayName ?? 'Account'
  const email = firebaseUser?.email ?? ''

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  return (
    <header className="sticky top-0 z-40 px-3 pt-3 sm:px-4">
      <div
        className={cn(
          'mx-auto max-w-[1400px] rounded-[22px] border backdrop-blur-xl transition-all duration-300',
          scrolled ? 'border-border/80 bg-card/85 shadow-lift' : 'border-border/60 bg-card/70 shadow-soft',
        )}
      >
        <div className="flex h-16 items-center gap-2 px-2.5 sm:gap-3 sm:px-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="xl:hidden"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <Link
            href="/dashboard"
            className="rounded-xl pr-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Retainr home"
          >
            <BrandLogo hideWordmarkOnMobile />
          </Link>

          <nav aria-label="Primary" className="ml-3 hidden items-center gap-0.5 rounded-full bg-secondary/80 p-1 xl:flex">
            {workspaceNav.map((item) => (
              <NavPill key={item.to} item={item} active={isNavActive(pathname, item.to)} />
            ))}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    'flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[state=open]:bg-card data-[state=open]:text-foreground 2xl:px-4',
                    settingsActive
                      ? 'bg-card text-foreground shadow-soft'
                      : 'text-muted-foreground hover:bg-card/70 hover:text-foreground',
                  )}
                >
                  <Settings2 className={cn('h-4 w-4', settingsActive && 'text-primary')} />
                  Settings
                  <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" sideOffset={10} className="w-56">
                {settingsItems.map(({ to, label, icon: Icon }) => (
                  <DropdownMenuItem key={to} asChild>
                    <Link href={to} className={cn(isNavActive(pathname, to) && 'bg-accent text-accent-foreground')}>
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      {label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            <GlobalSearch className="hidden md:block md:w-72 xl:w-56 2xl:w-80" />
            <NotificationsBell />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-full border border-border/70 bg-card p-1 pr-2 transition-colors hover:border-primary/30 hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label="Account menu"
                >
                  <Avatar className="h-8 w-8">
                    {firebaseUser?.photoURL ? <AvatarImage src={firebaseUser.photoURL} alt="" /> : null}
                    <AvatarFallback className="text-xs">{initials(profile?.displayName ?? null, email)}</AvatarFallback>
                  </Avatar>
                  <span className="hidden max-w-[8rem] truncate text-sm font-medium text-foreground 2xl:block">
                    {displayName.split(' ')[0]}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" sideOffset={10} className="w-64">
                <DropdownMenuLabel className="flex items-center gap-3 font-normal">
                  <Avatar className="h-10 w-10">
                    {firebaseUser?.photoURL ? <AvatarImage src={firebaseUser.photoURL} alt="" /> : null}
                    <AvatarFallback>{initials(profile?.displayName ?? null, email)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{displayName}</p>
                    <p className="truncate text-xs text-muted-foreground">{email}</p>
                  </div>
                </DropdownMenuLabel>
                {profile ? (
                  <div className="px-2.5 pb-2">
                    <Badge variant={isAdmin ? 'brand' : 'muted'}>
                      {isAdmin ? <ShieldCheck className="h-3 w-3" /> : null}
                      {isAdmin ? 'Administrator' : 'Member'}
                    </Badge>
                  </div>
                ) : null}
                <DropdownMenuSeparator />
                {[notificationsNav, ...settingsItems].map(({ to, label, icon: Icon }) => (
                  <DropdownMenuItem key={to} asChild>
                    <Link href={to}>
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      {label}
                    </Link>
                  </DropdownMenuItem>
                ))}
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
        </div>

        {menuOpen ? (
          <div
            id="mobile-nav"
            className="max-h-[calc(100dvh-6rem)] animate-slide-down overflow-y-auto border-t border-border/60 px-3 pb-4 pt-3 xl:hidden"
          >
            <GlobalSearch className="mb-4 md:hidden" />
            <p className="px-1 pb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Workspace
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {workspaceNav.map((item) => (
                <MobileNavLink key={item.to} item={item} active={isNavActive(pathname, item.to)} />
              ))}
            </div>
            <p className="px-1 pb-2 pt-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Settings
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {settingsItems.map((item) => (
                <MobileNavLink key={item.to} item={item} active={isNavActive(pathname, item.to)} />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </header>
  )
}
