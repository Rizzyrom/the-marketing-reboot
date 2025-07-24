import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Bookmark, Share2 } from 'lucide-react'

const mockPosts = [
  {
    id: '1',
    title: 'The Future of Content Marketing',
    excerpt: 'AI is changing how we create and distribute content...',
    author: { name: 'Sarah Chen', avatar: 'SC' },
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  },
  {
    id: '2',
    title: 'Growth Hacking in 2024',
    excerpt: 'What actually works for B2B SaaS growth this year...',
    author: { name: 'Marcus Lee', avatar: 'ML' },
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
  },
  {
    id: '3',
    title: 'Brand Building in a Noisy World',
    excerpt: 'How to stand out and build trust in 2024...',
    author: { name: 'Elena Rodriguez', avatar: 'ER' },
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
  },
  {
    id: '4',
    title: 'Community-Led Growth: Real Results',
    excerpt: 'Case studies from top SaaS brands...',
    author: { name: 'David Kim', avatar: 'DK' },
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
  },
]

function timeAgo(date: Date) {
  const now = new Date()
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000)
  if (diff < 60) return `${diff} seconds ago`
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`
  return `${Math.floor(diff / 86400)} days ago`
}

export default function PersonalizedFeed() {
  const [loading, setLoading] = useState(true)
  const [posts, setPosts] = useState<typeof mockPosts>([])

  useEffect(() => {
    setLoading(true)
    // Simulate loading delay
    setTimeout(() => {
      setPosts(mockPosts)
      setLoading(false)
    }, 1200)
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-secondary">Loading your feed...</p>
      </div>
    )
  }

  if (!posts.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <h3 className="font-bold text-xl gradient-text mb-2">Your feed is empty</h3>
        <p className="text-secondary mb-4">Follow contributors to see their latest content here.</p>
        <Link href="/contributors">
          <button className="btn-primary">Explore Contributors</button>
        </Link>
      </div>
    )
  }

  return (
    <section className="max-w-2xl mx-auto py-10 px-4">
      <h2 className="text-3xl font-bold gradient-text mb-8">The Algorithm</h2>
      <div className="flex flex-col gap-6">
        {posts.map(post => (
          <div key={post.id} className="glass-card p-6 flex flex-col gap-2">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center font-bold text-white text-lg">
                {post.author.avatar}
              </div>
              <span className="font-semibold text-primary">{post.author.name}</span>
              <span className="text-xs text-secondary ml-2">{timeAgo(post.createdAt)}</span>
            </div>
            <h3 className="font-semibold text-lg mb-1">{post.title}</h3>
            <p className="text-secondary mb-2">{post.excerpt}</p>
            <div className="flex items-center gap-4 mt-2">
              <Link href={`/posts/${post.id}`} className="btn-primary px-4 py-1 text-sm">View Full Post</Link>
              <button className="p-2 rounded-lg hover:bg-secondary/20 transition" title="Save post">
                <Bookmark className="w-5 h-5 text-secondary" />
              </button>
              <button className="p-2 rounded-lg hover:bg-secondary/20 transition" title="Share">
                <Share2 className="w-5 h-5 text-secondary" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
} 