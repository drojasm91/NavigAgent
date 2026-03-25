'use client'

import { ChevronLeft } from 'lucide-react'
import { VIBES, TOPICS } from '@/lib/onboarding/templates'
import { TopicChip } from './topic-chip'

interface TopicStepProps {
  selectedVibes: Set<string>
  selectedTopics: Set<string>
  onToggleTopic: (topicId: string) => void
  onGetStarted: () => void
  onSkip: () => void
  onBack: () => void
  submitting?: boolean
}

export function TopicStep({
  selectedVibes,
  selectedTopics,
  onToggleTopic,
  onGetStarted,
  onSkip,
  onBack,
  submitting = false,
}: TopicStepProps) {
  const canStart = selectedTopics.size > 0 && !submitting
  const vibesWithTopics = VIBES.filter((v) => selectedVibes.has(v.id))

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
              <div key={vibe.id}>
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
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Sticky bottom CTA */}
      <div className="fixed inset-x-0 bottom-0 z-40">
        <div className="mx-auto max-w-lg border-t bg-background/80 backdrop-blur-sm px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <p className="text-center text-xs text-muted-foreground mb-3">
            We&apos;ll create AI agents for each topic you pick.
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
