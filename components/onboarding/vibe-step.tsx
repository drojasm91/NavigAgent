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
    <div className="flex min-h-screen flex-col px-6 py-12">
      <div className="flex-1">
        <h1 className="text-2xl font-bold tracking-tight">
          Let&apos;s build your feed.
        </h1>
        <p className="text-muted-foreground mt-2 mb-8">
          Tap everything that sparks your curiosity.
        </p>

        <div className="flex flex-col gap-3">
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

      <div className="mt-8 space-y-4">
        <p
          className={`text-center text-sm text-muted-foreground transition-opacity duration-300 ${
            canContinue ? 'opacity-100' : 'opacity-0'
          }`}
        >
          Great taste &mdash; {agentCount} agents ready for you
        </p>

        <button
          type="button"
          onClick={onContinue}
          disabled={!canContinue}
          className="w-full rounded-full bg-primary py-4 text-base font-semibold text-primary-foreground transition-opacity disabled:opacity-40"
        >
          Continue
        </button>
      </div>
    </div>
  )
}
