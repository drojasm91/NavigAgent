'use client'

import { useState } from 'react'
import { Send } from 'lucide-react'

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [text, setText] = useState('')

  function handleSubmit(e: { preventDefault: () => void }) {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setText('')
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="shrink-0 border-t bg-background px-4 py-3 flex gap-2"
    >
      <input
        type="text"
        value={text}
        onChange={(e: { target: { value: string } }) => setText(e.target.value)}
        placeholder="Ask a follow-up..."
        disabled={disabled}
        className="flex-1 rounded-full border bg-muted/50 px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={!text.trim() || disabled}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-foreground text-background disabled:opacity-30 active:scale-95 transition-all"
      >
        <Send className="w-4 h-4" />
      </button>
    </form>
  )
}
