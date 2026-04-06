'use client'

interface ChatHeaderProps {
  snipperName: string
  subPostSnippet: string
  onDone: () => void
  isSaving: boolean
}

export function ChatHeader({ snipperName, subPostSnippet, onDone, isSaving }: ChatHeaderProps) {
  return (
    <header className="shrink-0 z-40 bg-background border-b">
      <div className="px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{snipperName}</p>
          <p className="text-xs text-muted-foreground truncate">{subPostSnippet}</p>
        </div>
        <button
          onClick={onDone}
          disabled={isSaving}
          className="shrink-0 px-3 py-1.5 text-sm font-medium rounded-full bg-foreground text-background disabled:opacity-50 active:scale-95 transition-all"
        >
          {isSaving ? 'Saving...' : 'Done'}
        </button>
      </div>
    </header>
  )
}
