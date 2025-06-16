'use client'

import { useEffect } from 'react'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[var(--bg-primary)]">
      <div className="glass-card p-8 max-w-md w-full text-center">
        <h2 className="text-2xl font-bold mb-4 gradient-text">Something went wrong!</h2>
        <p className="text-[var(--text-secondary)] mb-6">
          {error.message || 'An unexpected error occurred. Please try again.'}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="btn-primary px-6 py-2"
          >
            Try again
          </button>
          <Link
            href="/"
            className="glass-card px-6 py-2 flex items-center justify-center gap-2 hover:scale-105 transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
        </div>
      </div>
    </div>
  )
} 