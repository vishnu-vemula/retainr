import { useId } from 'react'
import { cn } from '../lib/utils'

interface BrandMarkProps {
  className?: string
  inverted?: boolean
}

export function BrandMark({ className, inverted = false }: BrandMarkProps) {
  // The check mark cuts through the document outline; a mask keeps that gap transparent on any background.
  const maskId = `brand-cut-${useId().replace(/:/g, '')}`

  return (
    <svg
      viewBox="112 255 1036 716"
      fill="currentColor"
      aria-hidden="true"
      className={cn('h-8 w-auto shrink-0', inverted ? 'text-white' : 'text-primary', className)}
    >
      <defs>
        <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="1240" height="1240">
          <rect width="1240" height="1240" fill="white" />
          <path d="M608 768 744 904 1200 474" fill="none" stroke="black" strokeWidth="224" strokeLinejoin="round" />
        </mask>
      </defs>
      <path
        mask={`url(#${maskId})`}
        d="M559 301H979Q1039 301 1021.3 358.3L863.7 867.7Q846 925 786 925H361Q296 925 315.2 862.9L468.3 367.9Q489 301 559 301Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="80"
        strokeLinejoin="round"
      />
      <path
        d="M249 409H455M154 541H410M209 658H380M664 480H872M635 615H834"
        fill="none"
        stroke="currentColor"
        strokeWidth="68"
        strokeLinecap="round"
      />
      <circle cx="560" cy="480" r="42" />
      <circle cx="535" cy="615" r="42" />
      <path
        d="M608 768 744 904 1088 578"
        fill="none"
        stroke="currentColor"
        strokeWidth="110"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

interface BrandLogoProps {
  className?: string
  inverted?: boolean
  hideWordmarkOnMobile?: boolean
}

export function BrandLogo({ className, inverted = false, hideWordmarkOnMobile = false }: BrandLogoProps) {
  return (
    <span className={cn('flex items-center gap-2.5', className)}>
      <BrandMark inverted={inverted} />
      <span
        className={cn(
          'font-display text-[17px] font-semibold tracking-tight',
          inverted ? 'text-white' : 'text-foreground',
          hideWordmarkOnMobile && 'hidden sm:inline',
        )}
      >
        Ultra<span className={inverted ? 'text-white/75' : 'text-primary'}>Tasker</span>
      </span>
    </span>
  )
}
