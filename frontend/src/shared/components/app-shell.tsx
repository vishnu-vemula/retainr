import type { ReactNode } from 'react'
import { AppFooter } from './app-footer'
import { AppNavbar } from './app-navbar'

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <AppNavbar />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-[1400px] animate-fade-in px-4 pb-16 pt-8 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
      <AppFooter />
    </div>
  )
}
