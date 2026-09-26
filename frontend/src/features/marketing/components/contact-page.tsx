import { ArrowUpRight, Clock, Mail } from 'lucide-react'
import { contactChannels, siteConfig } from '../model/content'
import { ContactForm } from './contact-form'
import { Container, CtaBand, PageHero, Pill } from './marketing-ui'

export function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Let's talk about"
        muted="your clients."
        description="Book a demo, ask about plans, or tell us what's slowing your team down. A real person reads every message."
      />

      <section className="pb-20 sm:pb-24">
        <Container>
          <div className="grid gap-4 md:grid-cols-3">
            {contactChannels.map(({ icon: Icon, title, description, anchor }) => (
              <a
                key={title}
                id={anchor}
                href="#message"
                className="group scroll-mt-28 rounded-[28px] border border-border/70 bg-card p-7 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
              >
                <div className="flex items-start justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="flex h-9 w-9 items-center justify-center rounded-full border border-border/70 text-muted-foreground transition-all group-hover:rotate-45 group-hover:border-primary group-hover:text-primary">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </div>
                <p className="mt-8 text-xl font-semibold tracking-tight text-foreground">{title}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
              </a>
            ))}
          </div>
        </Container>
      </section>

      <section id="message" className="scroll-mt-28 py-12 sm:py-16">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[1fr_1.5fr]">
            <div className="bg-hero relative isolate flex flex-col justify-between overflow-hidden rounded-[32px] p-8 text-white sm:p-10">
              <p
                aria-hidden="true"
                className="text-outline-white pointer-events-none absolute -bottom-[0.2em] -right-4 -z-10 select-none font-display text-[10rem] font-semibold leading-none tracking-[-0.06em]"
              >
                hello
              </p>
              <div>
                <Pill tone="onRed">Write to us</Pill>
                <p className="mt-6 text-4xl font-medium leading-[1.02] tracking-[-0.045em]">
                  We&apos;d love
                  <br />
                  <span className="text-white/70">to hear from you.</span>
                </p>
              </div>
              <div className="mt-12 space-y-4">
                <a
                  href={`mailto:${siteConfig.contactEmail}`}
                  className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-inset ring-white/20 transition-colors hover:bg-white/20"
                >
                  <Mail className="h-5 w-5" />
                  <span className="text-[15px] font-medium">{siteConfig.contactEmail}</span>
                </a>
                <p className="flex items-center gap-3 px-1 text-sm text-white/80">
                  <Clock className="h-4 w-4" />
                  We usually reply within one business day.
                </p>
              </div>
            </div>
            <ContactForm />
          </div>
        </Container>
      </section>

      <CtaBand title="Rather just" muted="try it yourself?" />
    </>
  )
}
