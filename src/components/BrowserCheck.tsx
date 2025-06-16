'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, X } from 'lucide-react'

export default function BrowserCheck() {
  const [showWarning, setShowWarning] = useState(false)
  const [browserInfo, setBrowserInfo] = useState('')

  useEffect(() => {
    // Check for old browsers
    const checkBrowser = () => {
      const ua = navigator.userAgent
      
      // Check for IE
      if (ua.indexOf('MSIE') > -1 || ua.indexOf('Trident/') > -1) {
        setBrowserInfo('Internet Explorer')
        setShowWarning(true)
        return
      }

      // Check for old Edge
      if (ua.indexOf('Edge/') > -1) {
        const edgeVersion = parseInt(ua.split('Edge/')[1])
        if (edgeVersion < 79) {
          setBrowserInfo('Old Microsoft Edge')
          setShowWarning(true)
        }
      }

      // Check for old Chrome
      if (ua.indexOf('Chrome/') > -1) {
        const chromeVersion = parseInt(ua.split('Chrome/')[1])
        if (chromeVersion < 90) {
          setBrowserInfo('Outdated Chrome')
          setShowWarning(true)
        }
      }

      // Check for old Safari
      if (ua.indexOf('Safari/') > -1 && ua.indexOf('Chrome/') === -1) {
        const safariVersion = parseInt(ua.split('Version/')[1])
        if (safariVersion < 14) {
          setBrowserInfo('Outdated Safari')
          setShowWarning(true)
        }
      }
    }

    checkBrowser()
  }, [])

  if (!showWarning) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-8 md:max-w-sm z-50">
      <div className="glass-card rounded-xl p-4 border-yellow-500/50">
        <div className="flex items-start gap-3">
          <AlertTriangle className="text-2xl text-yellow-400" />
          <div className="flex-1">
            <h3 className="font-semibold text-yellow-400 mb-1">
              Browser Update Recommended
            </h3>
            <p className="text-sm text-[var(--text-secondary)] mb-2">
              You're using {browserInfo}. For the best experience, please update to a modern browser.
            </p>
            <div className="flex gap-2">
              <a
                href="https://www.google.com/chrome/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[var(--accent-primary)] hover:text-[var(--accent-secondary)]"
              >
                Chrome
              </a>
              <a
                href="https://www.mozilla.org/firefox/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[var(--accent-primary)] hover:text-[var(--accent-secondary)]"
              >
                Firefox
              </a>
              <a
                href="https://www.microsoft.com/edge"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[var(--accent-primary)] hover:text-[var(--accent-secondary)]"
              >
                Edge
              </a>
            </div>
          </div>
          <button
            onClick={() => setShowWarning(false)}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}