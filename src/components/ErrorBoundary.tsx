'use client'

import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="glass-bg rounded-2xl p-8 max-w-md text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h2 className="font-orbitron text-xl font-bold mb-2">
              Something went wrong
            </h2>
            <p className="text-slate-300 mb-4">
              We're having trouble loading this page. This might be due to browser extensions or network issues.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-green-400 to-green-500 text-slate-900 px-4 py-2 rounded-full font-bold hover:from-green-500 hover:to-green-400 transition-all"
            >
              Refresh Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}