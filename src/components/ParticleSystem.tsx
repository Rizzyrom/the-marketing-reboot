'use client'

import { useEffect, useRef, useState } from 'react'
import { useTheme } from '@/contexts/ThemeContext'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  opacity: number
}

export default function ParticleSystem() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { theme } = useTheme()
  const [isInitialized, setIsInitialized] = useState(false)
  const particles = useRef<Particle[]>([])
  const animationFrameId = useRef<number>()

  const createParticles = (count: number, width: number, height: number): Particle[] => {
    return Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 2 + 1,
      color: theme === 'dark' ? '#ffffff' : '#000000',
      opacity: Math.random() * 0.5 + 0.1
    }))
  }

  const initialize = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.scale(dpr, dpr)
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`
    }

    resizeCanvas()
    const particleCount = Math.min(50, Math.floor(window.innerWidth / 20))
    particles.current = createParticles(particleCount, canvas.width, canvas.height)

    const animate = () => {
      if (!ctx || !canvas) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Update and draw particles
      particles.current.forEach(particle => {
        particle.x += particle.vx
        particle.y += particle.vy

        // Bounce off edges
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1

        // Draw particle
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = `${particle.color}${Math.floor(particle.opacity * 255).toString(16).padStart(2, '0')}`
        ctx.fill()

        // Draw connections
        particles.current.forEach(otherParticle => {
          if (particle === otherParticle) return

          const dx = particle.x - otherParticle.x
          const dy = particle.y - otherParticle.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 100) {
            ctx.beginPath()
            ctx.moveTo(particle.x, particle.y)
            ctx.lineTo(otherParticle.x, otherParticle.y)
            ctx.strokeStyle = `${particle.color}${Math.floor((1 - distance / 100) * 0.2 * 255).toString(16).padStart(2, '0')}`
            ctx.stroke()
          }
        })
      })

      animationFrameId.current = requestAnimationFrame(animate)
    }

    animate()
    setIsInitialized(true)
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      initialize()

      const handleResize = () => {
        if (canvasRef.current) {
          const canvas = canvasRef.current
          const ctx = canvas.getContext('2d')
          if (!ctx) return

          const dpr = window.devicePixelRatio || 1
          const rect = canvas.getBoundingClientRect()
          canvas.width = rect.width * dpr
          canvas.height = rect.height * dpr
          ctx.scale(dpr, dpr)
          canvas.style.width = `${rect.width}px`
          canvas.style.height = `${rect.height}px`

          const particleCount = Math.min(50, Math.floor(window.innerWidth / 20))
          particles.current = createParticles(particleCount, canvas.width, canvas.height)
        }
      }

      window.addEventListener('resize', handleResize)
      return () => {
        window.removeEventListener('resize', handleResize)
        if (animationFrameId.current) {
          cancelAnimationFrame(animationFrameId.current)
        }
      }
    }
  }, [theme])

  if (!isInitialized) return null

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      style={{ opacity: 0.5 }}
    />
  )
} 