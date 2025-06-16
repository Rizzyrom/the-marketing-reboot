'use client'
import { useEffect } from 'react'

export default function ParticleSystem() {
  useEffect(() => {
    const createParticle = () => {
      const particle = document.createElement('div')
      particle.style.position = 'absolute'
      particle.style.pointerEvents = 'none'
      particle.style.borderRadius = '50%'
      particle.style.left = Math.random() * 100 + '%'
      particle.style.animationDelay = Math.random() * 6 + 's'
      particle.style.animationDuration = (Math.random() * 4 + 6) + 's'
      particle.style.animationName = 'floatUp'
      particle.style.animationTimingFunction = 'linear'
      particle.style.animationIterationCount = '1'
      
      const particleTypes = [
        { bg: '#1E40AF', size: '3px', opacity: '0.7', shadow: '0 0 8px #1E40AF' },
        { bg: '#3B82F6', size: '2px', opacity: '0.6', shadow: '0 0 6px #3B82F6' },
        { bg: '#10B981', size: '4px', opacity: '0.8', shadow: '0 0 10px #10B981' },
        { bg: '#32D74B', size: '2px', opacity: '0.7', shadow: '0 0 6px #32D74B' },
        { bg: '#6366F1', size: '3px', opacity: '0.6', shadow: '0 0 8px #6366F1' },
        { bg: '#8B5CF6', size: '2px', opacity: '0.7', shadow: '0 0 6px #8B5CF6' }
      ]
      
      const type = particleTypes[Math.floor(Math.random() * particleTypes.length)]
      particle.style.background = type.bg
      particle.style.width = type.size
      particle.style.height = type.size
      particle.style.opacity = type.opacity
      particle.style.boxShadow = type.shadow
      
      const particlesContainer = document.querySelector('.particles-container')
      if (particlesContainer) {
        particlesContainer.appendChild(particle)
        
        setTimeout(() => {
          if (particle.parentNode) {
            particle.parentNode.removeChild(particle)
          }
        }, 10000)
      }
    }

    const particlesInterval = setInterval(createParticle, 400)
    
    // Initialize with particles
    for (let i = 0; i < 25; i++) {
      setTimeout(createParticle, i * 80)
    }

    return () => {
      clearInterval(particlesInterval)
    }
  }, [])

  return <div className="particles-container fixed inset-0 pointer-events-none z-10" />
}