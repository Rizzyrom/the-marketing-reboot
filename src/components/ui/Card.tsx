'use client'

import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass'
}

const Card = forwardRef<HTMLDivElement, CardProps>(({
  className,
  variant = 'default',
  ...props
}, ref) => {
  const variants = {
    default: 'bg-[var(--bg-secondary)] border border-[var(--border-primary)]',
    glass: 'glass-card backdrop-blur-lg bg-opacity-10 border border-[var(--border-primary)]'
  }

  return (
    <div
      ref={ref}
      className={cn(
        'rounded-xl p-4 shadow-lg transition-all duration-300',
        variants[variant],
        className
      )}
      {...props}
    />
  )
})

Card.displayName = 'Card'

export default Card