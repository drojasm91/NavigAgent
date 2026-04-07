'use client'

import { useState, useEffect, useRef } from 'react'
import { Plus, X } from 'lucide-react'
import { useChat } from '@/hooks/use-chat'
import { ChatMessageList } from './chat-message-list'
import { ChatInput } from './chat-input'
import { ConversationSummaryCard } from './conversation-summary-card'
import type { ConversationSummaryPreview } from '@/lib/types'

interface PostConversationsProps {
  postId: string
  activePosition: number
  allSubPosts: { id: string; position: number; content: string }[]
  snipperName: string
  snipperType: string
  snipperTopicTags: string[]
  summaries: ConversationSummaryPreview[]
}

export function PostConversations({
  postId,
  activePosition,
  allSubPosts,
  snipperName,
  snipperType,
  snipperTopicTags,
  summaries,
}: PostConversationsProps) {
  const [mode, setMode] = useState<'conversations' | 'chat'>('conversations')
  const [localSummaries, setLocalSummaries] = useState(summaries)
  const inputRef = useRef<HTMLInputElement>(null)

  const activeSubPost = allSubPosts.find((sp) => sp.position === activePosition)
  const subPostId = activeSubPost?.id ?? ''

  const {
    messages,
    isStreaming,
    isSaving,
    sendMessage,
    endConversation,
    reset,
  } = useChat({
    threadContext: {
      subPosts: allSubPosts.map((sp) => ({ position: sp.position, content: sp.content })),
      targetPosition: activePosition,
    },
    snipperContext: { name: snipperName, type: snipperType, topicTags: snipperTopicTags },
    postId,
    subPostId,
  })

  // Close chat when sub-post changes
  useEffect(() => {
    setMode('conversations')
  }, [activePosition])

  // Focus input when entering chat mode
  useEffect(() => {
    if (mode === 'chat') {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [mode])

  function handleStartChat() {
    setMode('chat')
  }

  function handleClose() {
    reset()
    setMode('conversations')
  }

  async function handleDone() {
    const result = await endConversation()
    if (result?.question) {
      setLocalSummaries((prev) => [
        {
          id: crypto.randomUUID(),
          question: result.question,
          key_insights: result.keyInsights,
          created_at: new Date().toISOString(),
        },
        ...prev,
      ])
    }
    reset()
    setMode('conversations')
  }

  if (mode === 'chat') {
    return (
      <div className="px-4 pt-4 pb-6 flex flex-col" style={{ minHeight: '40vh' }}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Ask
          </h3>
          <div className="flex items-center gap-2">
            {messages.length >= 2 && (
              <button
                onClick={handleDone}
                disabled={isSaving}
                className="px-3 py-1 text-xs font-medium rounded-full bg-foreground text-background disabled:opacity-50 active:scale-95 transition-all"
              >
                {isSaving ? 'Saving...' : 'Done'}
              </button>
            )}
            <button
              onClick={handleClose}
              disabled={isSaving}
              className="flex items-center justify-center w-7 h-7 rounded-full text-muted-foreground active:bg-accent transition-colors"
              aria-label="Close chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto max-h-[60vh] min-h-[200px] -mx-4 border-t border-b">
          <ChatMessageList messages={messages} />
        </div>

        <div className="pt-3 -mx-4">
          <ChatInput
            onSend={sendMessage}
            disabled={isStreaming}
            inputRef={inputRef}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 pt-4 pb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Conversations ({localSummaries.length})
        </h3>
        <button
          onClick={handleStartChat}
          className="flex items-center justify-center w-7 h-7 rounded-full text-muted-foreground active:bg-accent transition-colors"
          aria-label="Start a conversation"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {localSummaries.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">
            No conversations yet. Be the first to ask.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {localSummaries.map((summary) => (
            <ConversationSummaryCard key={summary.id} summary={summary} />
          ))}
        </div>
      )}
    </div>
  )
}
