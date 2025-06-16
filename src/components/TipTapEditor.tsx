'use client'

import { useEditor, EditorContent, Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useEffect } from 'react'

interface TipTapEditorProps {
  content: string
  onChange: (content: string) => void
}

export default function TipTapEditor({ content, onChange }: TipTapEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[200px] p-4',
      },
    },
    onUpdate: ({ editor }: { editor: Editor }) => {
      onChange(editor.getHTML())
    },
  })

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  return (
    <div className="glass-card rounded-lg">
      <div className="border-b border-[var(--border-primary)] p-2 flex gap-2">
        <button
          onClick={() => editor?.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-[var(--bg-secondary)] ${
            editor?.isActive('bold') ? 'bg-[var(--bg-secondary)]' : ''
          }`}
        >
          Bold
        </button>
        <button
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-[var(--bg-secondary)] ${
            editor?.isActive('italic') ? 'bg-[var(--bg-secondary)]' : ''
          }`}
        >
          Italic
        </button>
        <button
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded hover:bg-[var(--bg-secondary)] ${
            editor?.isActive('heading', { level: 2 }) ? 'bg-[var(--bg-secondary)]' : ''
          }`}
        >
          H2
        </button>
        <button
          onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-2 rounded hover:bg-[var(--bg-secondary)] ${
            editor?.isActive('heading', { level: 3 }) ? 'bg-[var(--bg-secondary)]' : ''
          }`}
        >
          H3
        </button>
        <button
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-[var(--bg-secondary)] ${
            editor?.isActive('bulletList') ? 'bg-[var(--bg-secondary)]' : ''
          }`}
        >
          Bullet List
        </button>
        <button
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-[var(--bg-secondary)] ${
            editor?.isActive('orderedList') ? 'bg-[var(--bg-secondary)]' : ''
          }`}
        >
          Numbered List
        </button>
        <button
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded hover:bg-[var(--bg-secondary)] ${
            editor?.isActive('blockquote') ? 'bg-[var(--bg-secondary)]' : ''
          }`}
        >
          Quote
        </button>
        <button
          onClick={() => editor?.chain().focus().setHorizontalRule().run()}
          className="p-2 rounded hover:bg-[var(--bg-secondary)]"
        >
          Divider
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  )
} 