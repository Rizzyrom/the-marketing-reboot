'use client'

import { useEffect, useState } from 'react'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Create subtle floating particles
    const createParticle = () => {
      const particle = document.createElement('div')
      particle.className = 'particle'
      
      // Random properties
      const size = Math.random() * 4 + 2
      const startX = Math.random() * window.innerWidth
      const duration = Math.random() * 20 + 20
      
      particle.style.width = `${size}px`
      particle.style.height = `${size}px`
      particle.style.left = `${startX}px`
      particle.style.background = `rgba(0, 102, 255, ${Math.random() * 0.5 + 0.3})`
      particle.style.borderRadius = '50%'
      particle.style.animationDuration = `${duration}s`
      particle.style.animationDelay = `${Math.random() * 5}s`
      
      // Add glow effect
      particle.style.boxShadow = `0 0 ${size * 2}px rgba(0, 102, 255, 0.3)`
      
      document.getElementById('particles-container')?.appendChild(particle)
      
      // Remove particle after animation
      setTimeout(() => {
        particle.remove()
      }, duration * 1000)
    }
    
    // Create initial particles
    if (mounted) {
      for (let i = 0; i < 5; i++) {
        setTimeout(() => createParticle(), i * 1000)
      }
      
      // Continue creating particles
      const interval = setInterval(createParticle, 4000)
      
      return () => clearInterval(interval)
    }
  }, [mounted])

  return (
    <>
      <div id="particles-container" className="fixed inset-0 pointer-events-none z-0" />
      <div className="relative z-10">
        {children}
      </div>
    </>
  )
}