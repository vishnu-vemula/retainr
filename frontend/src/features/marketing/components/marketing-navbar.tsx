'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowUpRight, Menu, X } from 'lucide-react'
import { useAuth } from '../../auth/use-auth'
import { BrandLogo } from '../../../shared/components/brand-logo'
import { Button } from '../../../shared/components/ui/button'
import { cn } from '../../../shared/lib/utils'
import { marketingNav } from '../model/content'

export function MarketingNavbar() {
  const pathname = usePathname()
  const { firebaseUser } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuPathname, setMenuPathname] = useState(pathname)

  if (menuPathname !== pathname) {
    setMenuPathname(pathname)
    setMenuOpen(false)
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const overHero = pathname === '/' && !scrolled && !menuOpen
  const signedIn = firebaseUser !== null

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-4 sm:pt-4">
      <div
        className={cn(
          'mx-auto max-w-[1400px] rounded-[22px] border transition-all duration-300',
          overHero
            ? 'border-transparent bg-transparent'
            : 'border-border/70 bg-card/85 shadow-lift backdrop-blur-xl',
        )}
      >
        <div className="flex h-16 items-center gap-3 px-3 sm:px-5">
          <Link href="/" aria-label="Retainr home" className="rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <BrandLogo inverted={overHero} />
          </Link>

          <nav aria-label="Main" className="ml-6 hidden items-center gap-1 lg:flex">
            {marketingNav.map(({ href, label }) => {
              const active = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'rounded-full px-4 py-2 text-sm font-medium transition-colors',
                    overHero
                      ? 'text-white/85 hover:bg-white/15 hover:text-white'
                      : active
                        ? 'bg-secondary text-foreground'
                        : 'text-muted-foreground hover:bg-secondary/70 hover:text-foreground',
                  )}
                >
                  {label}
                </Link>
              )
            })}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            {signedIn ? null : (
              <Link
                href="/login"
                className={cn(
                  'hidden rounded-full px-4 py-2 text-sm font-medium transition-colors sm:inline-flex',
                  overHero ? 'text-white hover:bg-white/15' : 'text-foreground hover:bg-secondary',
                )}
              >
                Sign in
              </Link>
            )}
            <Button asChild variant="ink" className="hidden sm:inline-flex">
              <Link href={signedIn ? '/dashboard' : '/signup'}>
                {signedIn ? 'Open dashboard' : 'Start free'}
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn('lg:hidden', overHero && 'text-white hover:bg-white/15 hover:text-white')}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              aria-controls="site-menu"
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {menuOpen ? (
          <div id="site-menu" className="animate-slide-down border-t border-border/60 px-3 pb-4 pt-2 lg:hidden">
            <nav aria-label="Mobile" className="grid gap-1">
              {marketingNav.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center justify-between rounded-2xl px-4 py-3 text-base font-medium transition-colors',
                    pathname === href ? 'bg-accent text-accent-foreground' : 'text-foreground hover:bg-secondary',
                  )}
                >
                  {label}
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              ))}
            </nav>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {signedIn ? (
                <Button asChild variant="ink" className="col-span-2">
                  <Link href="/dashboard">Open dashboard</Link>
                </Button>
              ) : (
                <>
                  <Button asChild variant="outline">
                    <Link href="/login">Sign in</Link>
                  </Button>
                  <Button asChild variant="ink">
                    <Link href="/signup">Start free</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </header>
  )
}
