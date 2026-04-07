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

type SavingState = null | 'saving' | 'skipped'

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
  const [savingState, setSavingState] = useState<SavingState>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const endConversationRef = useRef<(() => Promise<unknown>) | null>(null)

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

  // Keep ref to latest endConversation
  endConversationRef.current = endConversation

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
    // Capture endConversation before resetting
    const doEnd = endConversationRef.current
    reset()
    setSavingState('saving')
    setMode('conversations')

    try {
      const result = await doEnd?.()
      const data = result as { skip?: boolean; question?: string; keyInsights?: string[] } | null

      if (data?.skip) {
        setSavingState('skipped')
      } else if (data?.question) {
        setLocalSummaries((prev) => [
          {
            id: crypto.randomUUID(),
            question: data.question!,
            key_insights: data.keyInsights ?? [],
            created_at: new Date().toISOString(),
          },
          ...prev,
        ])
        setSavingState(null)
      } else {
        setSavingState(null)
      }
    } catch {
      setSavingState(null)
    }
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

      <div className="space-y-2">
        {savingState === 'saving' && (
          <div className="w-full rounded-lg border p-3 animate-pulse">
            <p className="text-sm font-medium text-muted-foreground">
              Summarizing conversation...
            </p>
          </div>
        )}

        {savingState === 'skipped' && (
          <div className="w-full rounded-lg border border-destructive/20 bg-destructive/10 p-3 flex items-center justify-between gap-2">
            <p className="text-sm text-destructive">
              This conversation won't be saved - nothing new to add.
            </p>
            <button
              onClick={() => setSavingState(null)}
              className="flex items-center justify-center w-6 h-6 shrink-0 rounded-full text-destructive/60 active:bg-destructive/10 transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {localSummaries.length === 0 && !savingState ? (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">
              No conversations yet. Be the first to ask.
            </p>
          </div>
        ) : (
          localSummaries.map((summary) => (
            <ConversationSummaryCard key={summary.id} summary={summary} />
          ))
        )}
      </div>
    </div>
  )
}
