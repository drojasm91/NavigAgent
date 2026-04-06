'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useChat } from '@/hooks/use-chat'
import { ChatHeader } from '@/components/ask/chat-header'
import { ChatMessageList } from '@/components/ask/chat-message-list'
import { ChatInput } from '@/components/ask/chat-input'

interface ChatShellProps {
  postId: string
  subPostId: string
  position: number
  initialQuestion: string
  snipperName: string
  snipperType: string
  snipperTopicTags: string[]
  subPosts: { position: number; content: string }[]
  targetContent: string
}

export function ChatShell({
  postId,
  subPostId,
  position,
  initialQuestion,
  snipperName,
  snipperType,
  snipperTopicTags,
  subPosts,
  targetContent,
}: ChatShellProps) {
  const router = useRouter()
  const sentInitial = useRef(false)

  const {
    messages,
    isStreaming,
    isSaving,
    sendMessage,
    endConversation,
  } = useChat({
    threadContext: { subPosts, targetPosition: position },
    snipperContext: { name: snipperName, type: snipperType, topicTags: snipperTopicTags },
    postId,
    subPostId,
  })

  // Send initial question from URL param
  useEffect(() => {
    if (initialQuestion && !sentInitial.current) {
      sentInitial.current = true
      sendMessage(initialQuestion)
    }
  }, [initialQuestion, sendMessage])

  async function handleDone() {
    await endConversation()
    router.push(`/post/${postId}/sub/${position}`)
  }

  const subPostSnippet =
    targetContent.length > 60
      ? targetContent.slice(0, 60) + '...'
      : targetContent

  return (
    <div className="flex flex-col h-screen max-w-lg mx-auto">
      <ChatHeader
        snipperName={snipperName}
        subPostSnippet={subPostSnippet}
        onDone={handleDone}
        isSaving={isSaving}
      />
      <ChatMessageList messages={messages} />
      <ChatInput onSend={sendMessage} disabled={isStreaming} />
    </div>
  )
}
