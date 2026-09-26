import Link from 'next/link'
import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import { MarketingShell } from '@/src/features/marketing/components/marketing-shell'
import { Container, Pill } from '@/src/features/marketing/components/marketing-ui'
import { Button } from '@/src/shared/components/ui/button'

export default function NotFound() {
  return (
    <MarketingShell>
      <section className="relative overflow-hidden pb-24 pt-40 sm:pt-48">
        <Container className="text-center">
          <Pill>Error 404</Pill>
          <p className="mt-6 font-display text-[9rem] font-light leading-none tracking-[-0.08em] text-foreground sm:text-[14rem]">
            4<span className="text-primary">0</span>4
          </p>
          <h1 className="mx-auto mt-4 max-w-xl text-3xl font-medium tracking-[-0.04em] text-foreground sm:text-4xl">
            This page slipped through the pipeline.
          </h1>
          <p className="mx-auto mt-4 max-w-md text-[15px] text-muted-foreground">
            The link may be broken or the page may have moved. Let&apos;s get you back to something useful.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Button asChild variant="ink" size="lg">
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
                Back to home
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="shadow-none">
              <Link href="/dashboard">
                Open dashboard
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </Container>
      </section>
    </MarketingShell>
  )
}
