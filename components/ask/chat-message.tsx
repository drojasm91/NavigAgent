export interface ChatMessageProps {
  role: 'user' | 'assistant'
  content: string
}

export function ChatMessage({ role, content }: ChatMessageProps) {
  const isUser = role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed ${
          isUser
            ? 'bg-foreground text-background rounded-br-md'
            : 'bg-muted text-foreground rounded-bl-md'
        }`}
      >
        {content || (
          <span className="inline-flex gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-40 animate-pulse" />
            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-40 animate-pulse [animation-delay:0.2s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-40 animate-pulse [animation-delay:0.4s]" />
          </span>
        )}
      </div>
    </div>
  )
}
