'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Send } from 'lucide-react'

interface AskInputProps {
  postId: string
  position: number
}

export function AskInput({ postId, position }: AskInputProps) {
  const [question, setQuestion] = useState('')
  const router = useRouter()

  function handleSubmit(e: { preventDefault: () => void }) {
    e.preventDefault()
    const trimmed = question.trim()
    if (!trimmed) return

    const encoded = encodeURIComponent(trimmed)
    router.push(`/post/${postId}/sub/${position}/chat?q=${encoded}`)
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={question}
        onChange={(e: { target: { value: string } }) => setQuestion(e.target.value)}
        placeholder="Ask about this..."
        className="flex-1 rounded-full border bg-muted/50 px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      />
      <button
        type="submit"
        disabled={!question.trim()}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-foreground text-background disabled:opacity-30 active:scale-95 transition-all"
      >
        <Send className="w-4 h-4" />
      </button>
    </form>
  )
}
