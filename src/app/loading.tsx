export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
      <div className="glass-card p-8 max-w-md w-full text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[var(--accent-primary)] border-t-transparent mx-auto mb-4"></div>
        <h2 className="text-2xl font-bold mb-2 gradient-text">Loading...</h2>
        <p className="text-[var(--text-secondary)]">
          Please wait while we prepare your content.
        </p>
      </div>
    </div>
  )
} 