'use client'
import { useEffect } from 'react'

export default function ParticleSystem() {
  useEffect(() => {
    const createParticle = () => {
      const particle = document.createElement('div')
      particle.className = 'floating-particle'
      particle.style.left = Math.random() * 100 + '%'
      particle.style.animationDelay = Math.random() * 5 + 's'
      particle.style.animationDuration = (Math.random() * 3 + 5) + 's'
      
      const types = [
        { size: 3, color: '#3B82F6' },
        { size: 2, color: '#10B981' },
        { size: 4, color: '#8B5CF6' },
        { size: 2, color: '#32D74B' }
      ]
      
      const type = types[Math.floor(Math.random() * types.length)]
      particle.style.width = type.size + 'px'
      particle.style.height = type.size + 'px'
      particle.style.backgroundColor = type.color
      particle.style.boxShadow = `0 0 ${type.size * 2}px ${type.color}`
      
      const container = document.getElementById('particles-container')
      if (container) {
        container.appendChild(particle)
        
        setTimeout(() => {
          particle.remove()
        }, parseFloat(particle.style.animationDuration) * 1000)
      }
    }

    const interval = setInterval(createParticle, 300)
    
    // Create initial particles
    for (let i = 0; i < 20; i++) {
      setTimeout(createParticle, i * 100)
    }

    return () => clearInterval(interval)
  }, [])

  return <div id="particles-container" className="particles-container" />
}