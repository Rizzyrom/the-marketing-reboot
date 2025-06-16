'use client'

import { cn } from '@/lib/utils'

interface LogoProps {
  size?: 'small' | 'medium' | 'large'
  showText?: boolean
  animated?: boolean
  className?: string
}

const sizes = {
  small: {
    svg: 'w-6 h-6',
    text: 'text-lg'
  },
  medium: {
    svg: 'w-8 h-8',
    text: 'text-xl'
  },
  large: {
    svg: 'w-12 h-12',
    text: 'text-2xl'
  }
}

export default function Logo({ 
  size = 'medium', 
  showText = true, 
  animated = true,
  className 
}: LogoProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className={cn(
        'relative',
        sizes[size].svg,
        animated && 'animate-pulse'
      )}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <path
            d="M13 2L3 14H12L11 22L21 10H12L13 2Z"
            className="fill-[var(--accent-primary)]"
          />
          <circle
            cx="12"
            cy="12"
            r="10"
            className={cn(
              'stroke-[var(--accent-primary)]',
              'opacity-20',
              animated && 'animate-ping'
            )}
            strokeWidth="2"
          />
          <circle
            cx="12"
            cy="12"
            r="8"
            className={cn(
              'stroke-[var(--accent-secondary)]',
              'opacity-30',
              animated && 'animate-pulse'
            )}
            strokeWidth="2"
          />
        </svg>
      </div>
      {showText && (
        <span className={cn(
          'font-bold tracking-tight',
          'bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)]',
          'bg-clip-text text-transparent',
          sizes[size].text
        )}>
          The Marketing Reboot
        </span>
      )}
    </div>
  )
}