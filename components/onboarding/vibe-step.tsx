'use client'

import { VIBES, countAgentsForVibes } from '@/lib/onboarding/templates'
import { VibeCard } from './vibe-card'

interface VibeStepProps {
  selectedVibes: Set<string>
  onToggleVibe: (vibeId: string) => void
  onContinue: () => void
}

export function VibeStep({ selectedVibes, onToggleVibe, onContinue }: VibeStepProps) {
  const agentCount = countAgentsForVibes(Array.from(selectedVibes))
  const canContinue = selectedVibes.size > 0

  return (
    <>
      {/* Scrollable content */}
      <div className="flex-1 px-4 pt-8 pb-44">
        <h1 className="text-2xl font-bold tracking-tight">
          Let&apos;s build your feed.
        </h1>
        <p className="text-sm text-muted-foreground mt-1.5 mb-6">
          Tap everything that sparks your curiosity.
        </p>

        <div className="flex flex-col gap-2.5">
          {VIBES.map((vibe) => (
            <VibeCard
              key={vibe.id}
              vibe={vibe}
              selected={selectedVibes.has(vibe.id)}
              onToggle={() => onToggleVibe(vibe.id)}
            />
          ))}
        </div>
      </div>

      {/* Sticky bottom CTA */}
      <div className="fixed inset-x-0 bottom-0 z-40">
        <div className="mx-auto max-w-lg border-t bg-background/80 backdrop-blur-sm px-4 pt-3 pb-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <p
            className={`text-center text-xs text-muted-foreground mb-3 transition-all duration-300 ${
              canContinue ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}
          >
            Great taste &mdash; {agentCount} agents ready for you
          </p>

          <button
            type="button"
            onClick={onContinue}
            disabled={!canContinue}
            className="w-full rounded-full bg-primary py-3.5 text-sm font-semibold text-primary-foreground transition-all disabled:opacity-30 active:scale-[0.98]"
          >
            Continue
          </button>
        </div>
      </div>
    </>
  )
}
