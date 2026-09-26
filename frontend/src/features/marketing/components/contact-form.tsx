'use client'

import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { MailCheck, Send } from 'lucide-react'
import { Button } from '../../../shared/components/ui/button'
import { Input } from '../../../shared/components/ui/input'
import { Label } from '../../../shared/components/ui/label'
import { Textarea } from '../../../shared/components/ui/textarea'
import { cn } from '../../../shared/lib/utils'
import { contactTopics, siteConfig } from '../model/content'
import { contactSchema, type ContactFormValues } from '../model/schema'

function buildMailto(values: ContactFormValues): string {
  const subject = `${values.topic} — ${values.name}${values.company ? ` (${values.company})` : ''}`
  const body = `${values.message}\n\n— ${values.name}\n${values.email}${values.company ? `\n${values.company}` : ''}`
  return `mailto:${siteConfig.contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

export function ContactForm() {
  const [sent, setSent] = useState(false)
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: '', email: '', company: '', topic: contactTopics[0] ?? '', message: '' },
  })

  const onSubmit = handleSubmit((values) => {
    window.location.assign(buildMailto(values))
    setSent(true)
    reset()
  })

  if (sent) {
    return (
      <div className="flex flex-col items-center rounded-[32px] border border-border/70 bg-card px-6 py-16 text-center shadow-soft">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-glow">
          <MailCheck className="h-6 w-6" />
        </span>
        <p className="mt-6 text-2xl font-semibold tracking-tight text-foreground">Your email is ready to send</p>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
          We opened your email app with the message filled in. If nothing happened, write to{' '}
          <a href={`mailto:${siteConfig.contactEmail}`} className="font-semibold text-primary">
            {siteConfig.contactEmail}
          </a>
          .
        </p>
        <Button type="button" variant="outline" className="mt-8 shadow-none" onClick={() => setSent(false)}>
          Write another message
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} noValidate className="rounded-[32px] border border-border/70 bg-card p-6 shadow-soft sm:p-10">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="contact-name">Name</Label>
          <Input id="contact-name" autoComplete="name" placeholder="Jane Cooper" aria-invalid={errors.name ? true : undefined} {...register('name')} />
          {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact-email">Work email</Label>
          <Input
            id="contact-email"
            type="email"
            autoComplete="email"
            placeholder="jane@agency.com"
            aria-invalid={errors.email ? true : undefined}
            {...register('email')}
          />
          {errors.email ? <p className="text-sm text-destructive">{errors.email.message}</p> : null}
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="contact-company">
            Company <span className="font-normal text-muted-foreground">(optional)</span>
          </Label>
          <Input id="contact-company" autoComplete="organization" placeholder="Your agency" {...register('company')} />
        </div>
        <fieldset className="space-y-3 sm:col-span-2">
          <legend className="text-sm font-medium leading-none">What can we help with?</legend>
          <Controller
            control={control}
            name="topic"
            render={({ field }) => (
              <div role="radiogroup" aria-label="Topic" className="flex flex-wrap gap-2 pt-1">
                {contactTopics.map((topic) => {
                  const selected = field.value === topic
                  return (
                    <button
                      key={topic}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => field.onChange(topic)}
                      className={cn(
                        'rounded-full border px-4 py-2 text-sm font-medium transition-colors',
                        selected
                          ? 'border-primary bg-primary text-primary-foreground shadow-glow'
                          : 'border-border/70 bg-background text-foreground/80 hover:border-primary/40 hover:text-primary',
                      )}
                    >
                      {topic}
                    </button>
                  )
                })}
              </div>
            )}
          />
          {errors.topic ? <p className="text-sm text-destructive">{errors.topic.message}</p> : null}
        </fieldset>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="contact-message">Message</Label>
          <Textarea
            id="contact-message"
            rows={6}
            placeholder="Tell us about your team and what you'd like Retainr to do for you…"
            aria-invalid={errors.message ? true : undefined}
            {...register('message')}
          />
          {errors.message ? <p className="text-sm text-destructive">{errors.message.message}</p> : null}
        </div>
      </div>
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <p className="text-xs text-muted-foreground">Sends from your own email app to {siteConfig.contactEmail}.</p>
        <Button type="submit" size="lg">
          Send message
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </form>
  )
}
