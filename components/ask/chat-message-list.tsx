'use client'

import { useRef, useEffect } from 'react'
import { ChatMessage } from './chat-message'
import type { ChatMessage as ChatMessageType } from '@/hooks/use-chat'

interface ChatMessageListProps {
  messages: ChatMessageType[]
}

export function ChatMessageList({ messages }: ChatMessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const prevCount = useRef(0)

  useEffect(() => {
    if (messages.length > prevCount.current) {
      // Only scroll when a new message is added, not on streaming content updates
      if (prevCount.current > 0) {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
      }
      prevCount.current = messages.length
    }
  }, [messages.length])

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
      {messages.map((msg, i) => (
        <ChatMessage key={i} role={msg.role} content={msg.content} />
      ))}
      <div ref={bottomRef} />
    </div>
  )
}
