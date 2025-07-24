'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRole } from '@/hooks/useRole'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Heart, Bookmark, Share2, Clock, Calendar } from 'lucide-react'
import ExclusiveHeader from '@/components/ExclusiveHeader'
import ParticleSystem from '@/components/brand/ParticleSystem'
import FollowButton from '@/components/FollowButton'

interface Post {
  id: string
  title: string
  content: string
  excerpt: string
  featured_image: string
  created_at: string
  reading_time: number
  views: number
  author: {
    id: string
    name: string
    avatar_url: string
    title: string
  }
  topic: {
    id: string
    name: string
    slug: string
  }
}

interface RelatedPost {
  id: string
  title: string
  excerpt: string
  featured_image: string
  created_at: string
  author: {
    name: string
    avatar_url: string
  }
}

export default function PostPage({ params }: { params: { id: string } }) {
  const { user } = useAuth()
  const { isReader } = useRole()
  const router = useRouter()
  const supabase = createClientComponentClient()
  
  const [post, setPost] = useState<Post | null>(null)
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([])
  const [isLiked, setIsLiked] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchPost()
  }, [params.id])

  const fetchPost = async () => {
    try {
      setLoading(true)
      setError('')

      // Fetch post
      const { data: postData, error: postError } = await supabase
        .from('posts')
        .select(`
          *,
          author:profiles (
            id,
            name,
            avatar_url,
            title
          ),
          topic:topics (
            id,
            name,
            slug
          )
        `)
        .eq('id', params.id)
        .single()

      if (postError) throw postError

      // Fetch related posts
      const { data: relatedData, error: relatedError } = await supabase
        .from('posts')
        .select(`
          id,
          title,
          excerpt,
          featured_image,
          created_at,
          author:profiles (
            name,
            avatar_url
          )
        `)
        .eq('topic_id', postData.topic.id)
        .neq('id', params.id)
        .limit(3)

      if (relatedError) throw relatedError

      // Check if post is liked
      if (user) {
        const { data: likeData } = await supabase
          .from('post_likes')
          .select('id')
          .eq('post_id', params.id)
          .eq('user_id', user.id)
          .single()

        setIsLiked(!!likeData)
      }

      // Check if post is saved
      if (user) {
        const { data: saveData } = await supabase
          .from('saved_posts')
          .select('id')
          .eq('post_id', params.id)
          .eq('user_id', user.id)
          .single()

        setIsSaved(!!saveData)
      }

      // Increment view count
      await supabase
        .from('posts')
        .update({ views: postData.views + 1 })
        .eq('id', params.id)

      setPost(postData)
      setRelatedPosts((relatedData || []).map(post => ({
        ...post,
        author: post.author[0]
      })))
    } catch (error) {
      console.error('Error fetching post:', error)
      setError('Failed to load post. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async () => {
    if (!user) {
      router.push('/login')
      return
    }

    try {
      if (isLiked) {
        await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', params.id)
          .eq('user_id', user.id)
      } else {
        await supabase
          .from('post_likes')
          .insert({
            post_id: params.id,
            user_id: user.id
          })
      }

      setIsLiked(!isLiked)
    } catch (error) {
      console.error('Error toggling like:', error)
    }
  }

  const handleSave = async () => {
    if (!user) {
      router.push('/login')
      return
    }

    try {
      if (isSaved) {
        await supabase
          .from('saved_posts')
          .delete()
          .eq('post_id', params.id)
          .eq('user_id', user.id)
      } else {
        await supabase
          .from('saved_posts')
          .insert({
            post_id: params.id,
            user_id: user.id
          })
      }

      setIsSaved(!isSaved)
    } catch (error) {
      console.error('Error toggling save:', error)
    }
  }

  const handleShare = async () => {
    try {
      await navigator.share({
        title: post?.title,
        text: post?.excerpt,
        url: window.location.href
      })
    } catch (error) {
      console.error('Error sharing:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-primary border-t-transparent"></div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="text-red-500">{error || 'Post not found'}</div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-primary">
      <ParticleSystem />
      <ExclusiveHeader />
      
      <article className="relative pt-32 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Featured Image */}
          {post.featured_image && (
            <div className="mb-8 rounded-lg overflow-hidden">
              <img
                src={post.featured_image}
                alt={post.title}
                className="w-full h-[400px] object-cover"
              />
            </div>
          )}

          {/* Post Header */}
          <header className="mb-8">
            <h1 className="text-4xl font-bold gradient-text mb-4">{post.title}</h1>
            <p className="text-xl text-secondary mb-6">{post.excerpt}</p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img
                  src={post.author.avatar_url}
                  alt={post.author.name}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <h2 className="font-semibold">{post.author.name}</h2>
                  <p className="text-secondary text-sm">{post.author.title}</p>
                </div>
                {isReader && (
                  <FollowButton
                    contributorId={post.author.id}
                    size="sm"
                    showText={false}
                  />
                )}
              </div>
              <div className="flex items-center gap-4 text-secondary">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{post.reading_time} min read</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(post.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </header>

          {/* Post Content */}
          <div 
            className="prose prose-lg max-w-none glass-card p-8 mb-8"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Engagement Buttons */}
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-4">
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  isLiked ? 'text-red-500' : 'text-secondary'
                }`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                <span>Like</span>
              </button>
              <button
                onClick={handleSave}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  isSaved ? 'text-yellow-500' : 'text-secondary'
                }`}
              >
                <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
                <span>Save</span>
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-secondary"
              >
                <Share2 className="w-5 h-5" />
                <span>Share</span>
              </button>
            </div>
            <div className="text-secondary">
              {post.views} views
            </div>
          </div>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold gradient-text mb-6">Related Posts</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPosts.map(relatedPost => (
                  <div
                    key={relatedPost.id}
                    className="glass-card p-6 cursor-pointer"
                    onClick={() => router.push(`/posts/${relatedPost.id}`)}
                  >
                    {relatedPost.featured_image && (
                      <img
                        src={relatedPost.featured_image}
                        alt={relatedPost.title}
                        className="w-full h-48 object-cover rounded-lg mb-4"
                      />
                    )}
                    <h3 className="font-semibold mb-2">{relatedPost.title}</h3>
                    <p className="text-secondary text-sm mb-4">{relatedPost.excerpt}</p>
                    <div className="flex items-center gap-2">
                      <img
                        src={relatedPost.author.avatar_url}
                        alt={relatedPost.author.name}
                        className="w-6 h-6 rounded-full"
                      />
                      <span className="text-sm">{relatedPost.author.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </article>
    </main>
  )
} 