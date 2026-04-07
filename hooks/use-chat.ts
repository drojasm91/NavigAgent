import { useState, useCallback, useRef, useEffect } from 'react'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface ThreadContext {
  subPosts: { position: number; content: string }[]
  targetPosition: number
}

interface SnipperContext {
  name: string
  type: string
  topicTags: string[]
}

interface UseChatOptions {
  threadContext: ThreadContext
  snipperContext: SnipperContext
  postId: string
  subPostId: string
}

export function useChat({ threadContext, snipperContext, postId, subPostId }: UseChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [routedModel, setRoutedModel] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const messagesRef = useRef(messages)

  // Keep ref in sync with state
  useEffect(() => {
    messagesRef.current = messages
  }, [messages])

  const sendMessage = useCallback(
    async (content: string) => {
      const userMessage: ChatMessage = { role: 'user', content }
      const updatedMessages = [...messagesRef.current, userMessage]
      setMessages(updatedMessages)
      setIsStreaming(true)
      setRoutedModel(null)

      abortRef.current = new AbortController()

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: updatedMessages,
            threadContext,
            snipperContext,
          }),
          signal: abortRef.current.signal,
        })

        if (!response.ok || !response.body) {
          throw new Error('Failed to get response')
        }

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let assistantContent = ''

        // Add placeholder assistant message
        setMessages((prev: ChatMessage[]) => [...prev, { role: 'assistant' as const, content: '' }])

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue
            const data = line.slice(6)

            if (data === '[DONE]') continue

            try {
              const parsed = JSON.parse(data)
              if (parsed.type === 'model') {
                setRoutedModel(parsed.model)
              } else if (parsed.type === 'text') {
                assistantContent += parsed.text
                setMessages((prev: ChatMessage[]) => {
                  const updated = [...prev]
                  updated[updated.length - 1] = {
                    role: 'assistant',
                    content: assistantContent,
                  }
                  return updated
                })
              }
            } catch {
              // Skip malformed chunks
            }
          }
        }
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          // Remove the empty assistant message on error
          setMessages((prev: ChatMessage[]) => {
            if (prev.length > 0 && prev[prev.length - 1].content === '') {
              return prev.slice(0, -1)
            }
            return prev
          })
        }
      } finally {
        setIsStreaming(false)
        abortRef.current = null
      }
    },
    [threadContext, snipperContext]
  )

  const endConversation = useCallback(async () => {
    const currentMessages = messagesRef.current
    if (currentMessages.length < 2) return null

    setIsSaving(true)
    try {
      const response = await fetch('/api/chat/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: currentMessages,
          subPostId,
          postId,
          position: threadContext.targetPosition,
        }),
      })

      if (!response.ok) return null
      return await response.json()
    } catch {
      return null
    } finally {
      setIsSaving(false)
    }
  }, [subPostId, postId, threadContext.targetPosition])

  const reset = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
    setMessages([])
    setIsStreaming(false)
    setIsSaving(false)
    setRoutedModel(null)
  }, [])

  return {
    messages,
    isStreaming,
    isSaving,
    routedModel,
    sendMessage,
    endConversation,
    reset,
  }
}
