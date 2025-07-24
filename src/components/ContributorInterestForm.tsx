'use client'

import { useState } from 'react'
import { Sparkles, X } from 'lucide-react'
import { useRole } from '@/hooks/useRole'
import { useAuth } from '@/hooks/useAuth'

export default function ContributorInterestForm() {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { isReader } = useRole()
  const { user } = useAuth()
  
  // Only show for logged-in readers
  if (!user || !isReader) return null
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      linkedin: formData.get('linkedin'),
      portfolio: formData.get('portfolio'),
      why_contribute: formData.get('why_contribute'),
    }
    
    // TODO: Submit to Supabase contributor_applications table
    console.log('Form submission:', data)
    
    setTimeout(() => {
      setIsSubmitting(false)
      setIsOpen(false)
      alert('Application submitted! We\'ll review and get back to you.')
    }, 1000)
  }
  
  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 flex items-center gap-2 group"
      >
        <Sparkles className="w-5 h-5" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap">
          Become a Contributor
        </span>
      </button>
      
      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Form */}
          <div className="relative w-full max-w-md glass-card p-6">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h2 className="text-2xl font-bold mb-2 gradient-text">Become a Contributor</h2>
            <p className="text-secondary mb-6">Join our exclusive community of marketing leaders</p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full px-4 py-2 rounded-lg bg-primary border surface-border focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  required
                  defaultValue={user?.email}
                  className="w-full px-4 py-2 rounded-lg bg-primary border surface-border focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">LinkedIn Profile</label>
                <input
                  type="url"
                  name="linkedin"
                  placeholder="https://linkedin.com/in/yourprofile"
                  className="w-full px-4 py-2 rounded-lg bg-primary border surface-border focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Portfolio/Website</label>
                <input
                  type="url"
                  name="portfolio"
                  placeholder="https://yourwebsite.com"
                  className="w-full px-4 py-2 rounded-lg bg-primary border surface-border focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Why do you want to contribute?</label>
                <textarea
                  name="why_contribute"
                  required
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg bg-primary border surface-border focus:outline-none focus:ring-2 focus:ring-brand-primary resize-none"
                  placeholder="Tell us about your experience and what you'd like to share..."
                />
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
} 