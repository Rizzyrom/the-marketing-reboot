'use client'

import { useState } from 'react'
import Link from 'next/link'
import ExclusiveHeader from '@/components/ExclusiveHeader'
import ParticleSystem from '@/components/brand/ParticleSystem'
import { ArrowLeft, CheckCircle, Sparkles, Users, TrendingUp, Award, Zap } from 'lucide-react'

export default function ApplyPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    company: '',
    jobTitle: '',
    linkedin: '',
    website: '',
    experience: '',
    whyJoin: '',
    contribution: ''
  })
  
  const [submitted, setSubmitted] = useState(false)
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would submit to your backend
    setSubmitted(true)
  }
  
  if (submitted) {
    return (
      <main className="min-h-screen bg-primary">
        <ParticleSystem />
        <ExclusiveHeader />
        <div className="pt-32 flex items-center justify-center min-h-[80vh]">
          <div className="text-center max-w-2xl mx-auto px-4 relative z-10">
            <CheckCircle className="w-20 h-20 text-brand-tertiary mx-auto mb-6 animate-bounce" />
            <h1 className="font-orbitron text-4xl font-bold mb-4 gradient-text">Application Received!</h1>
            <p className="text-xl text-secondary mb-8">
              Thank you for applying to The Marketing Reboot. We'll review your application and get back to you within 48 hours.
            </p>
            <Link href="/" className="btn-primary">
              Return Home
            </Link>
          </div>
        </div>
      </main>
    )
  }
  
  return (
    <main className="min-h-screen bg-primary">
      <ParticleSystem />
      <ExclusiveHeader />
      
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Link */}
          <Link href="/" className="inline-flex items-center gap-2 text-secondary hover:text-primary mb-8 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
          
          {/* Page Header */}
          <div className="mb-12">
            <h1 className="font-orbitron text-4xl sm:text-5xl font-bold mb-4">
              Apply for <span className="gradient-text">Exclusive Access</span>
            </h1>
            <p className="text-xl text-secondary">
              Join the community of marketing leaders who are redefining the industry. 
              We carefully review each application to maintain our high standards.
            </p>
          </div>
          
          {/* Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div className="glass-card hover:border-brand-primary/30 transition-all duration-300 transform hover:scale-105">
              <Users className="w-8 h-8 text-brand-primary mb-3" />
              <h3 className="font-semibold text-lg mb-2 text-primary">Connect with Leaders</h3>
              <p className="text-secondary text-sm">
                Network with CMOs, VPs, and senior marketers from top companies.
              </p>
            </div>
            <div className="glass-card hover:border-brand-tertiary/30 transition-all duration-300 transform hover:scale-105">
              <TrendingUp className="w-8 h-8 text-brand-tertiary mb-3" />
              <h3 className="font-semibold text-lg mb-2 text-primary">Share Real Strategies</h3>
              <p className="text-secondary text-sm">
                Contribute case studies and tactics that actually drive results.
              </p>
            </div>
            <div className="glass-card hover:border-brand-secondary/30 transition-all duration-300 transform hover:scale-105">
              <Award className="w-8 h-8 text-brand-secondary mb-3" />
              <h3 className="font-semibold text-lg mb-2 text-primary">Build Your Reputation</h3>
              <p className="text-secondary text-sm">
                Establish yourself as a thought leader in modern marketing.
              </p>
            </div>
            <div className="glass-card hover:border-green-500/30 transition-all duration-300 transform hover:scale-105">
              <Zap className="w-8 h-8 text-green-500 mb-3" />
              <h3 className="font-semibold text-lg mb-2 text-primary">Early Access</h3>
              <p className="text-secondary text-sm">
                Get first look at new strategies and exclusive community features.
              </p>
            </div>
          </div>
          
          {/* Application Form */}
          <form onSubmit={handleSubmit} className="glass-card">
            <h2 className="font-orbitron text-2xl font-bold mb-6 text-primary">Application Form</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-semibold mb-2 text-primary">Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full p-3 bg-secondary border surface-border rounded-lg text-primary focus:border-brand-primary focus:outline-none transition-colors placeholder-muted"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-primary">Email *</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-3 bg-secondary border surface-border rounded-lg text-primary focus:border-brand-primary focus:outline-none transition-colors placeholder-muted"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-semibold mb-2 text-primary">Company *</label>
                <input
                  type="text"
                  name="company"
                  required
                  value={formData.company}
                  onChange={handleChange}
                  className="w-full p-3 bg-secondary border surface-border rounded-lg text-primary focus:border-brand-primary focus:outline-none transition-colors placeholder-muted"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-primary">Job Title *</label>
                <input
                  type="text"
                  name="jobTitle"
                  required
                  value={formData.jobTitle}
                  onChange={handleChange}
                  className="w-full p-3 bg-secondary border surface-border rounded-lg text-primary focus:border-brand-primary focus:outline-none transition-colors placeholder-muted"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-semibold mb-2 text-primary">LinkedIn Profile</label>
                <input
                  type="url"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/..."
                  className="w-full p-3 bg-secondary border surface-border rounded-lg text-primary focus:border-brand-primary focus:outline-none transition-colors placeholder-muted"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-primary">Personal Website</label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://..."
                  className="w-full p-3 bg-secondary border surface-border rounded-lg text-primary focus:border-brand-primary focus:outline-none transition-colors placeholder-muted"
                />
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2 text-primary">Marketing Experience *</label>
              <textarea
                name="experience"
                required
                rows={4}
                value={formData.experience}
                onChange={handleChange}
                placeholder="Tell us about your marketing background and key achievements..."
                className="w-full p-3 bg-secondary border surface-border rounded-lg text-primary focus:border-brand-primary focus:outline-none transition-colors placeholder-muted"
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2 text-primary">Why do you want to join The Marketing Reboot? *</label>
              <textarea
                name="whyJoin"
                required
                rows={4}
                value={formData.whyJoin}
                onChange={handleChange}
                placeholder="What excites you about our community?"
                className="w-full p-3 bg-secondary border surface-border rounded-lg text-primary focus:border-brand-primary focus:outline-none transition-colors placeholder-muted"
              />
            </div>
            
            <div className="mb-8">
              <label className="block text-sm font-semibold mb-2 text-primary">How will you contribute to the community? *</label>
              <textarea
                name="contribution"
                required
                rows={4}
                value={formData.contribution}
                onChange={handleChange}
                placeholder="What unique insights or strategies can you share?"
                className="w-full p-3 bg-secondary border surface-border rounded-lg text-primary focus:border-brand-primary focus:outline-none transition-colors placeholder-muted"
              />
            </div>
            
            <button type="submit" className="w-full btn-primary">
              Submit Application
            </button>
          </form>
          
          {/* Note */}
          <div className="mt-8 text-center text-secondary text-sm">
            <p>
              We review applications within 48 hours. Only qualified marketing professionals 
              with proven experience will be accepted to maintain community quality.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}