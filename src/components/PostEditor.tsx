'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import { Bold, Italic, List, ListOrdered, Quote, Heading2, Link as LinkIcon, Image as ImageIcon, Code } from 'lucide-react'

interface PostEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
}

export default function PostEditor({ content, onChange, placeholder = 'Start writing your post...' }: PostEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3]
        }
      }),
      Placeholder.configure({
        placeholder
      }),
      Image,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-brand-primary hover:text-brand-secondary underline'
        }
      })
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[400px] px-6 py-4'
      }
    }
  })

  if (!editor) {
    return null
  }

  const addImage = () => {
    const url = window.prompt('Enter image URL:')
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('Enter URL:', previousUrl)

    if (url === null) {
      return
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  return (
    <div className="glass-card">
      {/* Toolbar */}
      <div className="border-b border-surface-border p-4 flex flex-wrap gap-2">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-surface-hover transition-colors ${
            editor.isActive('bold') ? 'bg-surface-hover text-brand-primary' : ''
          }`}
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-surface-hover transition-colors ${
            editor.isActive('italic') ? 'bg-surface-hover text-brand-primary' : ''
          }`}
        >
          <Italic className="w-4 h-4" />
        </button>
        <div className="w-px h-8 bg-surface-border" />
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded hover:bg-surface-hover transition-colors ${
            editor.isActive('heading', { level: 2 }) ? 'bg-surface-hover text-brand-primary' : ''
          }`}
        >
          <Heading2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-surface-hover transition-colors ${
            editor.isActive('bulletList') ? 'bg-surface-hover text-brand-primary' : ''
          }`}
        >
          <List className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-surface-hover transition-colors ${
            editor.isActive('orderedList') ? 'bg-surface-hover text-brand-primary' : ''
          }`}
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded hover:bg-surface-hover transition-colors ${
            editor.isActive('blockquote') ? 'bg-surface-hover text-brand-primary' : ''
          }`}
        >
          <Quote className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`p-2 rounded hover:bg-surface-hover transition-colors ${
            editor.isActive('codeBlock') ? 'bg-surface-hover text-brand-primary' : ''
          }`}
        >
          <Code className="w-4 h-4" />
        </button>
        <div className="w-px h-8 bg-surface-border" />
        <button
          onClick={setLink}
          className={`p-2 rounded hover:bg-surface-hover transition-colors ${
            editor.isActive('link') ? 'bg-surface-hover text-brand-primary' : ''
          }`}
        >
          <LinkIcon className="w-4 h-4" />
        </button>
        <button
          onClick={addImage}
          className="p-2 rounded hover:bg-surface-hover transition-colors"
        >
          <ImageIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  )
}