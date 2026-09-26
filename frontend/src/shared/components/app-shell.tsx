import { useState, type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'
import { NotificationsBell } from '../../features/notifications/components/notifications-bell'
import { AppSidebar } from './app-sidebar'
import { BrandLogo } from './brand-logo'
import { Button } from './ui/button'

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarPathname, setSidebarPathname] = useState(pathname)

  if (sidebarPathname !== pathname) {
    setSidebarPathname(pathname)
    setSidebarOpen(false)
  }

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b border-border/60 bg-card/85 px-3 backdrop-blur-xl lg:hidden">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Open menu"
          aria-expanded={sidebarOpen}
          aria-controls="app-sidebar"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <Link href="/dashboard" aria-label="Retainr dashboard">
          <BrandLogo />
        </Link>
        <div className="ml-auto">
          <NotificationsBell />
        </div>
      </div>

      {sidebarOpen ? (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 animate-fade-in bg-stone-950/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}
      <AppSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="lg:pl-[296px]">
        <div className="mx-auto w-full max-w-[1400px] animate-fade-in px-4 pb-16 pt-6 sm:px-6 lg:px-8 lg:pt-10">
          {children}
        </div>
      </main>
    </div>
  )
}
