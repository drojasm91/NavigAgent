'use client'

import { useRef, useEffect } from 'react'
import { ChatMessage } from './chat-message'
import type { ChatMessage as ChatMessageType } from '@/hooks/use-chat'

interface ChatMessageListProps {
  messages: ChatMessageType[]
}

export function ChatMessageList({ messages }: ChatMessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
      {messages.map((msg, i) => (
        <ChatMessage key={i} role={msg.role} content={msg.content} />
      ))}
      <div ref={bottomRef} />
    </div>
  )
}
