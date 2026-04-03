'use client'

import { useRef, useEffect } from 'react'
import { ChevronLeft, Plus, Loader2 } from 'lucide-react'
import { VIBES, TOPICS } from '@/lib/onboarding/templates'
import { TopicChip } from './topic-chip'
import type { CustomTopic } from './onboarding-flow'
import type { ClassifyOption } from '@/app/(onboarding)/onboarding/actions'

interface TopicStepProps {
  selectedVibes: Set<string>
  selectedTopics: Set<string>
  onToggleTopic: (topicId: string) => void
  onGetStarted: () => void
  onSkip: () => void
  onBack: () => void
  submitting?: boolean
  freeText: string
  onFreeTextChange: (value: string) => void
  customTopics: Map<string, CustomTopic>
  classifying: boolean
  classifyingText: string
  onAddInterest: (text: string) => void
  pendingOptions: ClassifyOption[] | null
  onPickOption: (option: ClassifyOption) => void
  onOtherOption: () => void
  scrollToVibeId: string | null
}

export function TopicStep({
  selectedVibes,
  selectedTopics,
  onToggleTopic,
  onGetStarted,
  onSkip,
  onBack,
  submitting = false,
  freeText,
  onFreeTextChange,
  customTopics,
  classifying,
  classifyingText,
  onAddInterest,
  pendingOptions,
  onPickOption,
  onOtherOption,
  scrollToVibeId,
}: TopicStepProps) {
  const canStart = selectedTopics.size > 0 && !submitting
  const vibesWithTopics = VIBES.filter((v) => selectedVibes.has(v.id))
  const pickerRef = useRef<HTMLDivElement>(null)
  const vibeSectionRefs = useRef<Map<string, HTMLDivElement>>(new Map())

  // Auto-scroll to disambiguation picker when it appears
  useEffect(() => {
    if (pendingOptions && pickerRef.current) {
      pickerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [pendingOptions])

  // Auto-scroll to the vibe section where a topic was just added
  useEffect(() => {
    if (scrollToVibeId) {
      const el = vibeSectionRefs.current.get(scrollToVibeId)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }, [scrollToVibeId])

  return (
    <>
      {/* Scrollable content */}
      <div className="flex-1 px-4 pt-4 pb-48">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-0.5 text-sm text-muted-foreground active:opacity-70 mb-6"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>

        <h1 className="text-2xl font-bold tracking-tight">
          What topics interest you?
        </h1>
        <p className="text-sm text-muted-foreground mt-1.5 mb-8">
          Pick as many as you like. We&apos;ll build your feed around them.
        </p>

        <div className="space-y-8">
          {vibesWithTopics.map((vibe) => {
            const vibeTopics = TOPICS.filter((t) => t.vibeId === vibe.id)
            return (
              <div key={vibe.id} ref={(el) => { if (el) vibeSectionRefs.current.set(vibe.id, el) }}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">{vibe.emoji}</span>
                  <span className="text-sm font-semibold">{vibe.label}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {vibeTopics.map((topic) => (
                    <TopicChip
                      key={topic.id}
                      label={topic.label}
                      selected={selectedTopics.has(topic.id)}
                      onToggle={() => onToggleTopic(topic.id)}
                    />
                  ))}
                  {Array.from(customTopics.entries())
                    .filter(([, meta]) => meta.vibeId === vibe.id)
                    .map(([id, meta]) => (
                      <TopicChip
                        key={id}
                        label={meta.label}
                        selected={selectedTopics.has(id)}
                        onToggle={() => onToggleTopic(id)}
                      />
                    ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Add interest input */}
        <div className="mt-8">
          <label htmlFor="free-text" className="text-sm font-medium">
            Anything else you&apos;re into?
          </label>
          <div className="mt-2 flex items-center gap-2">
            <input
              id="free-text"
              type="text"
              value={freeText}
              onChange={(e) => onFreeTextChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  onAddInterest(freeText)
                }
              }}
              disabled={classifying}
              placeholder="e.g. Formula 1, Japanese cooking..."
              className="flex-1 rounded-xl border border-border bg-card px-4 py-3 text-sm placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => onAddInterest(freeText)}
              disabled={!freeText.trim() || classifying}
              className="shrink-0 rounded-xl bg-primary p-3 text-primary-foreground transition-all disabled:opacity-30 active:scale-95"
            >
              {classifying ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Thinking indicator */}
          {classifying && classifyingText && (
            <p className="mt-2.5 flex items-center gap-1.5 text-xs text-muted-foreground animate-pulse">
              <Loader2 className="h-3 w-3 animate-spin" />
              Thinking about {classifyingText}...
            </p>
          )}

          {/* Disambiguation picker */}
          {pendingOptions && (
            <div ref={pickerRef} className="mt-3 rounded-xl border border-border bg-card p-3">
              <p className="text-xs text-muted-foreground mb-2">What did you mean?</p>
              <div className="flex flex-wrap gap-2">
                {pendingOptions.map((option) => (
                  <button
                    key={`${option.vibeId}-${option.label}`}
                    type="button"
                    onClick={() => onPickOption(option)}
                    className="rounded-full border border-border bg-background px-3 py-1.5 text-sm font-medium transition-all active:scale-95 active:bg-primary active:text-primary-foreground"
                  >
                    {option.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={onOtherOption}
                  className="rounded-full border border-dashed border-muted-foreground/40 px-3 py-1.5 text-sm text-muted-foreground transition-all active:scale-95"
                >
                  Other
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sticky bottom CTA */}
      <div className="fixed inset-x-0 bottom-0 z-40">
        <div className="mx-auto max-w-lg border-t bg-background/80 backdrop-blur-sm px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <p className="text-center text-xs text-muted-foreground mb-3">
            We&apos;ll create Snippers for each topic you pick.
          </p>

          <button
            type="button"
            onClick={onGetStarted}
            disabled={!canStart}
            className="w-full rounded-full bg-primary py-3.5 text-sm font-semibold text-primary-foreground transition-all disabled:opacity-30 active:scale-[0.98]"
          >
            {submitting ? 'Setting up your feed...' : 'Get started'}
          </button>

          <button
            type="button"
            onClick={onSkip}
            disabled={submitting}
            className="w-full py-3 text-xs text-muted-foreground active:opacity-70 disabled:opacity-30"
          >
            Skip for now
          </button>
        </div>
      </div>
    </>
  )
}
