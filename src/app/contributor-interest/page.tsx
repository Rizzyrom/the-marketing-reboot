'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import ExclusiveHeader from '@/components/ExclusiveHeader'
import ParticleSystem from '@/components/ParticleSystem'
import { ArrowRight, CheckCircle, Zap, Users, FileText, Award } from 'lucide-react'

const expertiseOptions = [
  'Brand Strategy',
  'Growth Marketing',
  'Content Marketing',
  'Performance Marketing',
  'SEO & Organic',
  'Social Media',
  'Email Marketing',
  'Product Marketing',
  'B2B Marketing',
  'B2C Marketing',
  'Marketing Analytics',
  'Creative Direction',
  'Marketing Operations',
  'Community Building',
  'Influencer Marketing',
  'AI & Marketing Tech'
]

export default function ContributorApplyPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    bio: '',
    linkedinUrl: '',
    portfolioUrl: '',
    yearsExperience: '',
    expertiseAreas: [] as string[]
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase
        .from('contributor_applications')
        .insert({
          email: formData.email,
          full_name: formData.fullName,
          bio: formData.bio,
          linkedin_url: formData.linkedinUrl || null,
          portfolio_url: formData.portfolioUrl || null,
          years_experience: parseInt(formData.yearsExperience) || 0,
          expertise_areas: formData.expertiseAreas
        })

      if (error) throw error

      setSubmitted(true)
    } catch (error) {
      console.error('Error submitting application:', error)
      alert('Failed to submit application. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const toggleExpertise = (area: string) => {
    setFormData(prev => ({
      ...prev,
      expertiseAreas: prev.expertiseAreas.includes(area)
        ? prev.expertiseAreas.filter(a => a !== area)
        : [...prev.expertiseAreas, area]
    }))
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-primary">
        <ExclusiveHeader />
        <ParticleSystem />
        
        <div className="container mx-auto px-4 py-24">
          <div className="max-w-2xl mx-auto glass-card p-12 text-center">
            <div className="mb-6">
              <CheckCircle className="w-20 h-20 mx-auto text-green-500" />
            </div>
            <h1 className="text-3xl font-bold mb-4 text-primary">Application Submitted!</h1>
            <p className="text-secondary mb-8 text-lg">
              Thank you for applying to become a contributor. We'll review your application 
              and get back to you within 3-5 business days.
            </p>
            <button
              onClick={() => router.push('/')}
              className="btn-primary inline-flex items-center gap-2"
            >
              Return Home
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-primary">
      <ExclusiveHeader />
      <ParticleSystem />
      
      <div className="container mx-auto px-4 py-24">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">
            Join The Marketing Reboot
          </h1>
          <p className="text-xl text-secondary mb-8">
            Share your expertise with a community of elite marketing professionals
          </p>
          
          {/* Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="glass-card p-6">
              <Users className="w-12 h-12 mx-auto mb-4 text-brand-primary" />
              <h3 className="font-semibold mb-2 text-primary">Exclusive Community</h3>
              <p className="text-sm text-secondary">
                Connect with top marketing leaders and innovators
              </p>
            </div>
            <div className="glass-card p-6">
              <Award className="w-12 h-12 mx-auto mb-4 text-brand-tertiary" />
              <h3 className="font-semibold mb-2 text-primary">Verified Status</h3>
              <p className="text-sm text-secondary">
                Get recognized as a verified industry expert
              </p>
            </div>
            <div className="glass-card p-6">
              <FileText className="w-12 h-12 mx-auto mb-4 text-green-500" />
              <h3 className="font-semibold mb-2 text-primary">Share Knowledge</h3>
              <p className="text-sm text-secondary">
                Publish insights that shape the future of marketing
              </p>
            </div>
          </div>
        </div>

        {/* Application Form */}
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="glass-card p-8 space-y-6">
            <h2 className="text-2xl font-bold mb-6 text-primary">Contributor Application</h2>
            
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-secondary">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  className="w-full px-4 py-2 bg-surface-secondary border border-surface-border rounded-lg focus:outline-none focus:border-brand-primary text-primary"
                  placeholder="Sarah Chen"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-secondary">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-2 bg-surface-secondary border border-surface-border rounded-lg focus:outline-none focus:border-brand-primary text-primary"
                  placeholder="sarah@company.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-secondary">
                  Professional Bio *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  className="w-full px-4 py-2 bg-surface-secondary border border-surface-border rounded-lg focus:outline-none focus:border-brand-primary text-primary"
                  placeholder="Tell us about your marketing experience and expertise..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-secondary">
                  Years of Experience *
                </label>
                <select
                  required
                  value={formData.yearsExperience}
                  onChange={(e) => setFormData(prev => ({ ...prev, yearsExperience: e.target.value }))}
                  className="w-full px-4 py-2 bg-surface-secondary border border-surface-border rounded-lg focus:outline-none focus:border-brand-primary text-primary"
                >
                  <option value="">Select experience</option>
                  <option value="1">1-3 years</option>
                  <option value="4">4-6 years</option>
                  <option value="7">7-10 years</option>
                  <option value="11">11-15 years</option>
                  <option value="16">15+ years</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-secondary">
                  LinkedIn Profile
                </label>
                <input
                  type="url"
                  value={formData.linkedinUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, linkedinUrl: e.target.value }))}
                  className="w-full px-4 py-2 bg-surface-secondary border border-surface-border rounded-lg focus:outline-none focus:border-brand-primary text-primary"
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-secondary">
                  Portfolio/Website
                </label>
                <input
                  type="url"
                  value={formData.portfolioUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, portfolioUrl: e.target.value }))}
                  className="w-full px-4 py-2 bg-surface-secondary border border-surface-border rounded-lg focus:outline-none focus:border-brand-primary text-primary"
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </div>

            {/* Expertise Areas */}
            <div>
              <label className="block text-sm font-medium mb-3 text-secondary">
                Areas of Expertise * (Select all that apply)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {expertiseOptions.map(area => (
                  <button
                    key={area}
                    type="button"
                    onClick={() => toggleExpertise(area)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      formData.expertiseAreas.includes(area)
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                        : 'bg-surface-secondary hover:bg-surface-hover text-secondary'
                    }`}
                  >
                    {area}
                  </button>
                ))}
              </div>
              {formData.expertiseAreas.length === 0 && (
                <p className="text-xs text-red-500 mt-2">Please select at least one area of expertise</p>
              )}
            </div>

            {/* Submit */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={loading || formData.expertiseAreas.length === 0}
                className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span>Submitting...</span>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    Submit Application
                  </>
                )}
              </button>
            </div>

            <p className="text-sm text-secondary text-center">
              By applying, you agree to our community guidelines and content standards.
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}