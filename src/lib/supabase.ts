import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export const supabase = createClientComponentClient()

export type Profile = {
  id: string
  username: string | null
  full_name: string | null
  bio: string | null
  job_title: string | null
  company: string | null
  location: string | null
  avatar_url: string | null
  linkedin_url: string | null
  twitter_url: string | null
  website_url: string | null
  email_contact: string | null
  profile_public: boolean
  show_social_feeds: boolean
  email_notifications: boolean
  online_status: boolean
  member_since: string
  created_at: string
  updated_at: string
  theme: string | null
  custom_css: string | null
  profile_views: number | null
  link_clicks: number | null
  // NEW FIELDS FOR TWO-TIER SYSTEM
  user_role: 'contributor' | 'reader'
  is_verified: boolean | null
  verified_date: string | null
  contributor_status: string | null
  contributor_tier: string | null
  cyberpunk: string | null
}

export type Post = {
  id: string
  author_id: string | null
  title: string
  slug: string | null
  excerpt: string | null
  content: string | null
  post_type: string | null
  topic_category: string | null
  tags: string[] | null
  featured: boolean
  published: boolean
  likes_count: number
  comments_count: number
  views_count: number
  created_at: string
  updated_at: string
  profiles?: Profile
}

export type Project = {
  id: string
  profile_id: string | null
  title: string
  description: string | null
  status: string | null
  url: string | null
  created_at: string
}

export type SavedPost = {
  id: string
  user_id: string
  post_id: string
  saved_at: string
}