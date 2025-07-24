'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ExclusiveHeader from '@/components/ExclusiveHeader'
import ParticleSystem from '@/components/ParticleSystem'
import { Clock, Calendar, Mic, Play, ChevronRight, Filter, TrendingUp, ArrowUpDown } from 'lucide-react'

// Interview series configuration
const interviewSeries = [
  {
    id: 'cmo-playbook',
    name: "Not Your CMO's Playbook",
    description: 'CMO interviews',
    color: 'from-blue-600 to-purple-600',
    borderColor: 'border-blue-500',
    bgColor: 'bg-blue-500/10',
    textColor: 'text-blue-400'
  },
  {
    id: 'exec-unfiltered',
    name: 'Exec Unfiltered',
    description: 'Other C-suite executives',
    color: 'from-purple-600 to-pink-600',
    borderColor: 'border-purple-500',
    bgColor: 'bg-purple-500/10',
    textColor: 'text-purple-400'
  },
  {
    id: 'founders-files',
    name: "The Founder's Files",
    description: 'Successful founders',
    color: 'from-green-600 to-emerald-600',
    borderColor: 'border-green-500',
    bgColor: 'bg-green-500/10',
    textColor: 'text-green-400'
  },
  {
    id: 'rising-stars',
    name: 'Rising Stars',
    description: 'VP/Director level',
    color: 'from-orange-600 to-red-600',
    borderColor: 'border-orange-500',
    bgColor: 'bg-orange-500/10',
    textColor: 'text-orange-400'
  },
  {
    id: 'agency-confidential',
    name: 'Agency Confidential',
    description: 'Agency leaders',
    color: 'from-indigo-600 to-blue-600',
    borderColor: 'border-indigo-500',
    bgColor: 'bg-indigo-500/10',
    textColor: 'text-indigo-400'
  },
  {
    id: 'culture-code',
    name: 'Culture Code',
    description: 'Recruiters/hiring managers/culture insights',
    color: 'from-teal-600 to-cyan-600',
    borderColor: 'border-teal-500',
    bgColor: 'bg-teal-500/10',
    textColor: 'text-teal-400'
  }
]

interface Interview {
  id: string
  series: string
  title: string
  executive: {
    name: string
    title: string
    company: string
    photo?: string | null
  }
  pullQuote: string
  readTime: number
  publishedDate: string
  viewCount: number
  featured?: boolean
  hasVideo: boolean
  hasAudio: boolean
}

// Mock data - replace with Supabase fetch
const mockInterviews: Interview[] = [
  {
    id: '1',
    series: 'cmo-playbook',
    title: 'Reinventing B2B Marketing in the AI Era',
    executive: {
      name: 'Sarah Chen',
      title: 'CMO',
      company: 'TechCorp',
      photo: null
    },
    pullQuote: "The biggest shift isn't AI itself—it's how AI forces us to rethink every assumption about customer engagement.",
    readTime: 12,
    publishedDate: '2024-03-15',
    viewCount: 3420,
    featured: true,
    hasVideo: true,
    hasAudio: true
  },
  {
    id: '2',
    series: 'founders-files',
    title: 'From Bootstrap to $100M: Lessons in Scaling',
    executive: {
      name: 'Marcus Johnson',
      title: 'Founder & CEO',
      company: 'ScaleUp Inc',
      photo: null
    },
    pullQuote: "We grew 10x by doing the opposite of what every advisor told us.",
    readTime: 15,
    publishedDate: '2024-03-12',
    viewCount: 2890,
    featured: false,
    hasVideo: false,
    hasAudio: true
  },
  {
    id: '3',
    series: 'exec-unfiltered',
    title: "The CFO's Guide to Marketing ROI",
    executive: {
      name: 'Jennifer Park',
      title: 'CFO',
      company: 'FinanceFirst',
      photo: null
    },
    pullQuote: "Marketing isn't a cost center when you measure the right metrics.",
    readTime: 10,
    publishedDate: '2024-03-10',
    viewCount: 2150,
    featured: false,
    hasVideo: true,
    hasAudio: false
  },
  {
    id: '4',
    series: 'rising-stars',
    title: 'Breaking Through: From IC to VP in 3 Years',
    executive: {
      name: 'Alex Rodriguez',
      title: 'VP of Growth',
      company: 'RocketShip',
      photo: null
    },
    pullQuote: "The secret wasn't working harder—it was building systems that scaled.",
    readTime: 8,
    publishedDate: '2024-03-08',
    viewCount: 3890,
    featured: false,
    hasVideo: false,
    hasAudio: true
  },
  {
    id: '5',
    series: 'agency-confidential',
    title: 'Why We Fired Our Biggest Client',
    executive: {
      name: 'David Kim',
      title: 'CEO',
      company: 'Creative Minds Agency',
      photo: null
    },
    pullQuote: "Sometimes the best business decision is saying no to bad business.",
    readTime: 12,
    publishedDate: '2024-03-05',
    viewCount: 4230,
    featured: false,
    hasVideo: true,
    hasAudio: true
  },
  {
    id: '6',
    series: 'culture-code',
    title: 'Building a $1B Marketing Team Culture',
    executive: {
      name: 'Lisa Thompson',
      title: 'Chief People Officer',
      company: 'TalentFirst',
      photo: null
    },
    pullQuote: "Culture isn't perks and ping pong—it's psychological safety and growth.",
    readTime: 14,
    publishedDate: '2024-03-01',
    viewCount: 2980,
    featured: false,
    hasVideo: false,
    hasAudio: true
  }
]

export default function InterviewsPage() {
  const router = useRouter()
  const [selectedSeries, setSelectedSeries] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'readTime'>('newest')
  const [interviews, setInterviews] = useState<Interview[]>(mockInterviews)
  const [filteredInterviews, setFilteredInterviews] = useState<Interview[]>(mockInterviews)

  // Filter and sort interviews
  useEffect(() => {
    let filtered = [...interviews]
    
    // Filter by series
    if (selectedSeries !== 'all') {
      filtered = filtered.filter(i => i.series === selectedSeries)
    }
    
    // Sort
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime())
        break
      case 'popular':
        filtered.sort((a, b) => b.viewCount - a.viewCount)
        break
      case 'readTime':
        filtered.sort((a, b) => a.readTime - b.readTime)
        break
    }
    
    setFilteredInterviews(filtered)
  }, [selectedSeries, sortBy, interviews])

  const getSeriesInfo = (seriesId: string) => {
    return interviewSeries.find(s => s.id === seriesId) || interviewSeries[0]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getSeriesButtonClass = (series: any) => {
    if (selectedSeries === series.id) {
      return `px-4 py-2 rounded-lg font-medium transition-all bg-gradient-to-r ${series.color} text-white`
    }
    return 'px-4 py-2 rounded-lg font-medium transition-all glass-card hover:bg-surface-hover'
  }

  const featuredInterview = filteredInterviews.find(i => i.featured)
  const regularInterviews = filteredInterviews.filter(i => !i.featured)

  return (
    <div className="min-h-screen bg-primary">
      <ExclusiveHeader />
      <ParticleSystem />
      
      {/* Main Content */}
      <div className="container mx-auto px-4 pt-24 pb-12">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
            Interactive Interviews
          </h1>
          <p className="text-xl text-secondary max-w-3xl mx-auto">
            Deep conversations with marketing leaders. Featuring embedded media, data visualizations, and interactive insights.
          </p>
        </div>

        {/* Filters and Sort */}
        <div className="mb-8 space-y-6">
          {/* Series Filter */}
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => setSelectedSeries('all')}
              className={selectedSeries === 'all' 
                ? 'px-4 py-2 rounded-lg font-medium transition-all bg-gradient-to-r from-brand-primary to-brand-tertiary text-white'
                : 'px-4 py-2 rounded-lg font-medium transition-all glass-card hover:bg-surface-hover'
              }
            >
              All Series
            </button>
            {interviewSeries.map(series => (
              <button
                key={series.id}
                onClick={() => setSelectedSeries(series.id)}
                className={getSeriesButtonClass(series)}
              >
                {series.name}
              </button>
            ))}
          </div>

          {/* Sort Options */}
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setSortBy('newest')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                sortBy === 'newest' ? 'text-brand-primary' : 'text-secondary'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Newest
            </button>
            <button
              onClick={() => setSortBy('popular')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                sortBy === 'popular' ? 'text-brand-primary' : 'text-secondary'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Most Popular
            </button>
            <button
              onClick={() => setSortBy('readTime')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                sortBy === 'readTime' ? 'text-brand-primary' : 'text-secondary'
              }`}
            >
              <Clock className="w-4 h-4" />
              Read Time
            </button>
          </div>
        </div>

        {/* Featured Interview */}
        {featuredInterview && (
          <div className="mb-12">
            <div 
              className="glass-card p-8 hover:border-brand-primary transition-all duration-300 cursor-pointer"
              onClick={() => router.push(`/interviews/${featuredInterview.id}`)}
            >
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Left: Content */}
                <div className="flex-1">
                  {/* Series Badge */}
                  <div className="mb-4">
                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${getSeriesInfo(featuredInterview.series).bgColor} ${getSeriesInfo(featuredInterview.series).textColor}`}>
                      <span className="w-2 h-2 rounded-full bg-current animate-pulse"></span>
                      {getSeriesInfo(featuredInterview.series).name}
                    </span>
                    <span className="ml-3 text-xs text-brand-tertiary font-semibold">
                      FEATURED INTERVIEW
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="text-3xl font-bold mb-4 text-primary">
                    {featuredInterview.title}
                  </h2>

                  {/* Executive Info */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-primary to-brand-tertiary flex items-center justify-center text-white text-2xl font-bold">
                      {featuredInterview.executive.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-primary">{featuredInterview.executive.name}</p>
                      <p className="text-secondary">{featuredInterview.executive.title} at {featuredInterview.executive.company}</p>
                    </div>
                  </div>

                  {/* Pull Quote */}
                  <blockquote className="border-l-4 border-brand-primary pl-6 mb-6">
                    <p className="text-xl text-primary italic">
                      {`"${featuredInterview.pullQuote}"`}
                    </p>
                  </blockquote>

                  {/* Meta Info */}
                  <div className="flex flex-wrap items-center gap-6 text-sm text-secondary">
                    <span className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {formatDate(featuredInterview.publishedDate)}
                    </span>
                    <span className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {featuredInterview.readTime} min read
                    </span>
                    <span className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      {featuredInterview.viewCount.toLocaleString()} views
                    </span>
                    {(featuredInterview.hasVideo || featuredInterview.hasAudio) && (
                      <div className="flex items-center gap-3">
                        {featuredInterview.hasVideo && (
                          <span className="flex items-center gap-1 text-brand-primary">
                            <Play className="w-4 h-4" />
                            Video
                          </span>
                        )}
                        {featuredInterview.hasAudio && (
                          <span className="flex items-center gap-1 text-brand-tertiary">
                            <Mic className="w-4 h-4" />
                            Audio
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: CTA */}
                <div className="flex items-center">
                  <ChevronRight className="w-8 h-8 text-brand-primary" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Regular Interviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {regularInterviews.map(interview => {
            const series = getSeriesInfo(interview.series)
            
            return (
              <div
                key={interview.id}
                className={`glass-card p-6 hover:scale-105 transition-all duration-300 cursor-pointer ${series.borderColor} border-opacity-0 hover:border-opacity-100`}
                onClick={() => router.push(`/interviews/${interview.id}`)}
              >
                {/* Series Badge */}
                <div className="mb-4">
                  <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${series.bgColor} ${series.textColor}`}>
                    <span className="w-2 h-2 rounded-full bg-current"></span>
                    {series.name}
                  </span>
                </div>

                {/* Executive Info */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-primary to-brand-tertiary flex items-center justify-center text-white font-bold">
                    {interview.executive.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-primary truncate">{interview.executive.name}</p>
                    <p className="text-sm text-secondary truncate">{interview.executive.title}</p>
                    <p className="text-xs text-secondary truncate">{interview.executive.company}</p>
                  </div>
                </div>

                {/* Title */}
                <h3 className="font-semibold text-lg mb-3 text-primary line-clamp-2">
                  {interview.title}
                </h3>

                {/* Pull Quote */}
                <p className="text-secondary text-sm mb-4 line-clamp-3 italic">
                  {`"${interview.pullQuote}"`}
                </p>

                {/* Meta Info */}
                <div className="flex items-center justify-between text-xs text-secondary">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {interview.readTime} min
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(interview.publishedDate)}
                    </span>
                  </div>
                  {(interview.hasVideo || interview.hasAudio) && (
                    <div className="flex items-center gap-2">
                      {interview.hasVideo && <Play className="w-3 h-3 text-brand-primary" />}
                      {interview.hasAudio && <Mic className="w-3 h-3 text-brand-tertiary" />}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Empty State */}
        {filteredInterviews.length === 0 && (
          <div className="glass-card p-12 text-center">
            <p className="text-secondary text-lg mb-4">No interviews found for this filter.</p>
            <button
              onClick={() => setSelectedSeries('all')}
              className="btn-primary"
            >
              View All Interviews
            </button>
          </div>
        )}
      </div>
    </div>
  )
}