'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/supabase'
import ExclusiveHeader from '@/components/ExclusiveHeader'
import ParticleSystem from '@/components/ParticleSystem'
import { Palette, TrendingUp, PenTool, Search, Cpu, Globe, Users, Target, Rocket, CheckCircle, ArrowRight } from 'lucide-react'

// YOUR EXACT TOPICS FROM HOMEPAGE
const topicsData = [
  {
    id: 'brand-creative',
    icon: Palette,
    title: 'Brand & Creative',
    description: 'Building and evolving brand identity in the digital age',
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    id: 'growth-performance',
    icon: TrendingUp,
    title: 'Growth & Performance',
    description: 'Data-driven strategies for scaling businesses',
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'content-communications',
    icon: PenTool,
    title: 'Content & Communications',
    description: 'Creating content that converts and builds authority',
    gradient: 'from-green-500 to-emerald-500'
  },
  {
    id: 'seo-organic',
    icon: Search,
    title: 'SEO & Organic Discovery',
    description: 'Search engine optimization and marketing tactics',
    gradient: 'from-orange-500 to-red-500'
  },
  {
    id: 'ai-automation',
    icon: Cpu,
    title: 'AI & Automation',
    description: 'Leveraging artificial intelligence for marketing',
    gradient: 'from-indigo-500 to-purple-500'
  },
  {
    id: 'web-tech',
    icon: Globe,
    title: 'Web & Tech',
    description: 'Technical solutions for modern marketing',
    gradient: 'from-teal-500 to-blue-500'
  },
  {
    id: 'social-community',
    icon: Users,
    title: 'Social & Community',
    description: 'Building and engaging communities at scale',
    gradient: 'from-pink-500 to-rose-500'
  },
  {
    id: 'sales-strategy',
    icon: Target,
    title: 'Sales & Strategy',
    description: 'Aligning sales and marketing for growth',
    gradient: 'from-violet-500 to-purple-500'
  },
  {
    id: 'careers-culture',
    icon: Rocket,
    title: 'Careers & Culture',
    description: 'Building high-performing marketing teams',
    gradient: 'from-cyan-500 to-blue-500'
  }
]

export default function TopicsPage() {
  const { user } = useAuth()
  const [followedTopics, setFollowedTopics] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    const fetchFollowedTopics = async () => {
      if (!user) {
        setIsLoading(false)
        return
      }

      try {
        const { data: follows } = await supabase
          .from('topic_follows')
          .select('topic_id')
          .eq('user_id', user.id)
        
        if (follows) {
          setFollowedTopics(new Set(follows.map(f => f.topic_id)))
        }
      } catch (error) {
        console.error('Error fetching followed topics:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchFollowedTopics()
  }, [supabase, user])

  const handleFollowTopic = async (topicId: string) => {
    if (!user) {
      window.location.href = '/auth/login'
      return
    }

    try {
      const isFollowing = followedTopics.has(topicId)

      if (isFollowing) {
        await supabase
          .from('topic_follows')
          .delete()
          .eq('user_id', user.id)
          .eq('topic_id', topicId)

        setFollowedTopics(prev => {
          const newSet = new Set(prev)
          newSet.delete(topicId)
          return newSet
        })
      } else {
        await supabase
          .from('topic_follows')
          .insert([{ user_id: user.id, topic_id: topicId }])

        setFollowedTopics(prev => new Set([...prev, topicId]))
      }
    } catch (error) {
      console.error('Error updating topic follow:', error)
    }
  }

  return (
    <div className="min-h-screen bg-primary">
      <ExclusiveHeader />
      <ParticleSystem />
      
      {/* Fixed padding-top to account for header */}
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
            Marketing Topics
          </h1>
          <p className="text-xl text-secondary max-w-2xl mx-auto">
            {user 
              ? "Follow topics that interest you to personalize your feed"
              : "Explore our curated marketing topics and insights"
            }
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topicsData.map((topic) => {
            const Icon = topic.icon
            const isFollowing = followedTopics.has(topic.id)
            
            return (
              <div 
                key={topic.id} 
                className={`glass-card p-6 transition-all duration-300 hover:scale-105 ${
                  isFollowing ? 'border-brand-primary' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${topic.gradient} flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  {isFollowing && (
                    <CheckCircle className="w-6 h-6 text-brand-tertiary" />
                  )}
                </div>
                
                <h3 className="text-xl font-semibold mb-2 text-primary">
                  {topic.title}
                </h3>
                <p className="text-secondary mb-4 line-clamp-2">
                  {topic.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => window.location.href = `/topics/${topic.id}`}
                    className="text-sm text-brand-primary hover:text-brand-secondary flex items-center gap-1"
                  >
                    Explore Topic
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  {user && (
                    <button
                      onClick={() => handleFollowTopic(topic.id)}
                      disabled={isLoading}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        isFollowing 
                          ? 'bg-surface-secondary text-primary hover:bg-red-500/20 hover:text-red-400' 
                          : 'bg-brand-primary text-white hover:bg-brand-secondary'
                      }`}
                    >
                      {isFollowing ? 'Following' : 'Follow'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}