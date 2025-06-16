import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[var(--bg-primary)]">
      <div className="glass-card p-8 max-w-md w-full text-center">
        <h2 className="text-2xl font-bold mb-4 gradient-text">Page Not Found</h2>
        <p className="text-[var(--text-secondary)] mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          href="/"
          className="btn-primary px-6 py-2 inline-flex items-center justify-center gap-2 hover:scale-105 transition-all duration-300"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>
      </div>
    </div>
  )
} 