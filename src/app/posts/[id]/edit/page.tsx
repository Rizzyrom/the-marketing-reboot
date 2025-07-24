'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRole } from '@/hooks/useRole'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Editor } from '@tinymce/tinymce-react'
import { Upload, Save, Send, Trash2 } from 'lucide-react'
import ExclusiveHeader from '@/components/ExclusiveHeader'
import ParticleSystem from '@/components/brand/ParticleSystem'

interface Topic {
  id: string
  name: string
  slug: string
}

interface Post {
  id: string
  title: string
  content: string
  excerpt: string
  featured_image: string
  topic_id: string
  status: 'draft' | 'pending_review' | 'approved' | 'published' | 'rejected'
}

export default function EditPost({ params }: { params: { id: string } }) {
  const { user } = useAuth()
  const { isContributor } = useRole()
  const router = useRouter()
  const supabase = createClientComponentClient()
  
  const [post, setPost] = useState<Post | null>(null)
  const [title, setTitle] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [topicId, setTopicId] = useState('')
  const [topics, setTopics] = useState<Topic[]>([])
  const [featuredImage, setFeaturedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    if (!isContributor) {
      router.push('/')
      return
    }

    fetchPost()
    fetchTopics()
  }, [user, params.id])

  const fetchPost = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error) throw error

      // Check if user is author or admin
      if (data.author_id !== user?.id) {
        router.push('/')
        return
      }

      setPost(data)
      setTitle(data.title)
      setExcerpt(data.excerpt)
      setContent(data.content)
      setTopicId(data.topic_id)
      setImagePreview(data.featured_image)
    } catch (error) {
      console.error('Error fetching post:', error)
      setError('Failed to load post. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const fetchTopics = async () => {
    try {
      const { data, error } = await supabase
        .from('topics')
        .select('*')
        .order('name')

      if (error) throw error
      setTopics(data || [])
    } catch (error) {
      console.error('Error fetching topics:', error)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFeaturedImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadImage = async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `post-images/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath)

      return publicUrl
    } catch (error) {
      console.error('Error uploading image:', error)
      throw error
    }
  }

  const handleSubmit = async (status: 'draft' | 'pending_review' | 'published') => {
    try {
      setLoading(true)
      setError('')

      let featuredImageUrl = post?.featured_image || ''
      if (featuredImage) {
        featuredImageUrl = await uploadImage(featuredImage)
      }

      const { error } = await supabase
        .from('posts')
        .update({
          title,
          content,
          excerpt,
          featured_image: featuredImageUrl,
          topic_id: topicId,
          status,
          submitted_at: status !== 'draft' ? new Date().toISOString() : null
        })
        .eq('id', params.id)

      if (error) throw error

      router.push('/dashboard/posts')
    } catch (error) {
      console.error('Error updating post:', error)
      setError('Failed to update post. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post?')) {
      return
    }

    try {
      setLoading(true)
      setError('')

      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', params.id)

      if (error) throw error

      router.push('/dashboard/posts')
    } catch (error) {
      console.error('Error deleting post:', error)
      setError('Failed to delete post. Please try again.')
    } finally {
      setLoading(false)
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
      
      <section className="relative pt-32 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold gradient-text mb-8">Edit Post</h1>
          
          <div className="glass-card p-6 space-y-6">
            {error && (
              <div className="bg-red-500/20 text-red-500 p-4 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 rounded-lg glass-card"
                placeholder="Enter post title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Excerpt</label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                className="w-full px-4 py-2 rounded-lg glass-card"
                rows={3}
                placeholder="Enter post excerpt"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Topic</label>
              <select
                value={topicId}
                onChange={(e) => setTopicId(e.target.value)}
                className="w-full px-4 py-2 rounded-lg glass-card"
              >
                <option value="">Select a topic</option>
                {topics.map(topic => (
                  <option key={topic.id} value={topic.id}>
                    {topic.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Featured Image</label>
              <div className="flex items-center gap-4">
                <label className="glass-card px-4 py-2 cursor-pointer">
                  <Upload className="w-4 h-4 inline mr-2" />
                  Upload Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Content</label>
              <Editor
                apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
                init={{
                  height: 500,
                  menubar: false,
                  plugins: [
                    'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                    'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                    'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                  ],
                  toolbar: 'undo redo | blocks | ' +
                    'bold italic forecolor | alignleft aligncenter ' +
                    'alignright alignjustify | bullist numlist outdent indent | ' +
                    'removeformat | help',
                  content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
                }}
                onEditorChange={(content: string) => setContent(content)}
                value={content}
              />
            </div>

            <div className="flex justify-between">
              <button
                onClick={handleDelete}
                disabled={loading}
                className="glass-card px-4 py-2 text-red-500 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Post
              </button>
              <div className="flex gap-4">
                <button
                  onClick={() => handleSubmit('draft')}
                  disabled={loading}
                  className="glass-card px-4 py-2 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save as Draft
                </button>
                <button
                  onClick={() => handleSubmit('pending_review')}
                  disabled={loading}
                  className="btn-primary flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Submit for Review
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
} 