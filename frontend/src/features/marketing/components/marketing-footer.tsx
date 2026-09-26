import Link from 'next/link'
import { ArrowUp, ArrowUpRight, Mail } from 'lucide-react'
import { BrandLogo } from '../../../shared/components/brand-logo'
import { Button } from '../../../shared/components/ui/button'
import { footerColumns, siteConfig } from '../model/content'

export function MarketingFooter() {
  return (
    <footer className="px-3 pb-3 sm:px-4 sm:pb-4">
      <div className="relative mx-auto max-w-[1400px] overflow-hidden rounded-[32px] border border-border/60 bg-card shadow-soft">
        <div className="grid gap-12 px-6 pb-10 pt-12 sm:px-10 lg:grid-cols-[1.6fr_1fr_1fr_1fr] lg:px-14 lg:pt-16">
          <div className="max-w-sm">
            <BrandLogo />
            <p className="mt-5 text-[15px] leading-relaxed text-muted-foreground">{siteConfig.tagline} {siteConfig.description.split(' — ')[0]}.</p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Button asChild variant="ink">
                <Link href="/signup">
                  Start free
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="shadow-none">
                <a href={`mailto:${siteConfig.contactEmail}`}>
                  <Mail className="h-4 w-4" />
                  {siteConfig.contactEmail}
                </a>
              </Button>
            </div>
          </div>
          {footerColumns.map((column) => (
            <div key={column.title}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{column.title}</p>
              <ul className="mt-5 space-y-3">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group inline-flex items-center gap-2 text-[15px] text-foreground/80 transition-colors hover:text-primary"
                    >
                      <span className="h-1 w-1 rounded-full bg-border transition-colors group-hover:bg-primary" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col-reverse gap-4 border-t border-border/60 px-6 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-10 lg:px-14">
          <p>© {new Date().getFullYear()} Retainr. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline">Made for client-first teams</span>
            <a
              href="#top"
              className="group inline-flex items-center gap-2 rounded-full border border-border/70 bg-background py-1 pl-3 pr-1 font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary"
            >
              Back to top
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ink text-white transition-colors group-hover:bg-primary">
                <ArrowUp className="h-3.5 w-3.5" />
              </span>
            </a>
          </div>
        </div>

        <p
          aria-hidden="true"
          className="pointer-events-none -mb-[0.2em] -mt-6 select-none whitespace-nowrap bg-gradient-to-b from-brand-500/[0.16] to-brand-500/0 bg-clip-text px-4 text-center font-display text-[clamp(6rem,24vw,22rem)] font-semibold leading-none tracking-[-0.06em] text-transparent sm:-mt-12"
        >
          retainr
        </p>
      </div>
    </footer>
  )
}
